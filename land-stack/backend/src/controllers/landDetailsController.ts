import { Request, Response } from 'express';
import { identifyParcelAtPoint } from '../gis/tngis/tngisIdentifyAdapter.js';
import { getTamilNilamRecord } from '../gis/adapters/tamilNilamAdapter.js';

export class LandDetailsController {
  /**
   * POST /api/gis/identify or GET /api/gis/identify?lat={lat}&lng={lng}
   * Step 1: Map click -> lat/lng -> identify parcel parameters
   */
  async identifyParcel(req: Request, res: Response) {
    try {
      const latStr = req.body?.lat || req.query?.lat;
      const lngStr = req.body?.lng || req.query?.lng;

      if (!latStr || !lngStr) {
        return res.status(400).json({ error: 'Missing required query/body parameters: lat and lng' });
      }

      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ error: 'Invalid coordinates provided.' });
      }

      const identified = await identifyParcelAtPoint(lat, lng);
      res.json({
        success: true,
        parcel: identified
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Parcel identification failed.' });
    }
  }

  /**
   * GET /api/land-records/:parcel_id
   * Step 2: Query Land Records Adapter (Tamil Nilam / A-Register) for parcel_id
   */
  async getLandRecord(req: Request, res: Response) {
    try {
      const { parcel_id } = req.params;
      if (!parcel_id) {
        return res.status(400).json({ error: 'Parcel ID is required' });
      }

      // Check if user is authenticated officer
      const isOfficer = Boolean((req as any).officer || req.headers['x-officer-token']);

      // Synthetic identified parcel from ID for lookup
      const parts = parcel_id.split('-');
      const district = parts[2] || 'Coimbatore';
      const surveyNo = parts[3] || '101';
      const subDiv = parts[4] || '1A';

      const syntheticParcel = {
        parcel_id,
        district,
        taluk: 'Pollachi',
        village: `${district} Village`,
        survey_number: surveyNo,
        subdivision_number: subDiv,
        state: 'Tamil Nadu',
        latitude: 10.66,
        longitude: 77.00,
        area_sqft: 54450,
        source: 'PARCEL_ID_LOOKUP'
      };

      const record = await getTamilNilamRecord(syntheticParcel, { officerAuthenticated: isOfficer });
      res.json({
        success: true,
        ...record
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch land record.' });
    }
  }

  /**
   * GET /api/land-details/:parcel_id OR GET /api/land-details?lat={lat}&lng={lng}
   * Step 3: Combined Response (TNGIS Spatial Identify + Tamil Nilam Land Record)
   */
  async getCombinedLandDetails(req: Request, res: Response) {
    try {
      let lat = parseFloat((req.query?.lat || req.body?.lat) as string);
      let lng = parseFloat((req.query?.lng || req.body?.lng) as string);

      let parcel_id = req.params?.parcel_id;

      // Default to Pollachi / Coimbatore pilot parcel coordinates if not provided
      if (isNaN(lat) || isNaN(lng)) {
        lat = 10.6609;
        lng = 77.0048;
      }

      const identified = await identifyParcelAtPoint(lat, lng);
      if (parcel_id && parcel_id !== 'search') {
        identified.parcel_id = parcel_id;
      }

      const isOfficer = Boolean((req as any).officer || req.headers['x-officer-token']);
      const landRecord = await getTamilNilamRecord(identified, { officerAuthenticated: isOfficer });

      res.json({
        parcel: {
          parcel_id: identified.parcel_id,
          district: identified.district,
          taluk: identified.taluk,
          village: identified.village,
          survey_number: identified.survey_number,
          subdivision_number: identified.subdivision_number
        },
        land: {
          land_type: landRecord.land_type,
          extent: landRecord.extent,
          tax: landRecord.tax,
          patta_number: landRecord.patta_number
        },
        ownership: landRecord.ownership,
        gis: {
          latitude: identified.latitude,
          longitude: identified.longitude,
          area_sqft: identified.area_sqft,
          geometry: identified.geometry || null
        },
        sources: landRecord.sources
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve combined land details.' });
    }
  }
}

export const landDetailsController = new LandDetailsController();
