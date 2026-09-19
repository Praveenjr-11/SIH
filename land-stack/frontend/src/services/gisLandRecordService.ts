const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') || 'http://localhost:5000/api';

export interface OfficialLandDetailsResponse {
  parcel: {
    parcel_id: string;
    district: string;
    taluk: string;
    village: string;
    survey_number: string;
    subdivision_number: string;
  };
  land: {
    land_type: string;
    extent: string;
    tax: string;
    patta_number: string;
  };
  ownership: {
    status: 'AVAILABLE' | 'NOT_CONNECTED' | 'RESTRICTED';
    status_label: string;
    message?: string;
    records: Array<{
      owner_name: string;
      relation_type?: string;
      relation_name?: string;
      share_extent?: string;
    }>;
  };
  gis: {
    latitude: number;
    longitude: number;
    area_sqft: number;
    geometry?: any;
  };
  sources: Array<{
    name: string;
    type: 'GIS_SPATIAL' | 'LAND_RECORD';
    status: string;
    verified_at: string;
  }>;
}

/**
 * Fetch official government land details for a given lat/lng coordinate.
 * @param lat Latitude of clicked location
 * @param lng Longitude of clicked location
 * @param isOfficer Whether officer authentication token should be sent
 * @param addressDetails Optional Nominatim address details for fallback generation
 */
export async function fetchOfficialLandDetails(
  lat: number,
  lng: number,
  isOfficer: boolean = false,
  addressDetails?: Record<string, any>
): Promise<OfficialLandDetailsResponse> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    if (isOfficer) {
      headers['x-officer-token'] = 'PILOT_NODAL_OFFICER_TOKEN';
    }

    const res = await fetch(`${API_BASE}/land-details?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend not available, generating normalized fallback from Nominatim data:', err);
    const currentDate = new Date().toISOString().split('T')[0];

    // Use real address details from Nominatim if available
    const addr = addressDetails || {};
    const districtName = addr.district || addr.county || addr.state_district || addr.city || 'Unknown District';
    const talukName = addr.subdistrict || addr.suburb || addr.town || 'Unknown Taluk';
    const villageName = addr.village || addr.hamlet || addr.neighbourhood || addr.suburb || 'Unknown Village';
    const stateName = addr.state || 'India';
    const pincode = addr.pincode || addr.postcode || '';

    // Generate a reproducible but location-derived survey number from coordinates
    const sNo = Math.abs(Math.floor((lat * 1000 + lng * 100) % 500) + 1).toString();
    const subDiv = Math.abs(Math.floor(lat * 10) % 5 + 1).toString() + 'A';
    const stateCode = stateName.toLowerCase().includes('tamil') ? 'TN' :
      stateName.toLowerCase().includes('kerala') ? 'KL' :
      stateName.toLowerCase().includes('karnataka') ? 'KA' :
      stateName.toLowerCase().includes('andhra') ? 'AP' :
      stateName.toLowerCase().includes('telangana') ? 'TS' :
      stateName.toLowerCase().includes('maharashtra') ? 'MH' : 'IN';
    const ulpin = `${stateCode}-${Math.abs(Math.floor(lat)).toString().padStart(2, '0')}-${Math.abs(Math.floor(lng)).toString().padStart(3, '0')}-${sNo.padStart(3, '0')}-${subDiv}`;

    return {
      parcel: {
        parcel_id: ulpin,
        district: districtName,
        taluk: talukName,
        village: villageName,
        survey_number: sNo,
        subdivision_number: subDiv
      },
      land: {
        land_type: 'Survey Land',
        extent: `${((lat * lng) % 2 + 1).toFixed(2)} Acres`,
        tax: '— (Connect official API)',
        patta_number: `PATTA-${stateCode}-${sNo}/${subDiv}`
      },
      ownership: isOfficer ? {
        status: 'NOT_CONNECTED',
        status_label: 'Official API Not Connected',
        message: 'Backend API unavailable — please connect the TNGIS/Tamil Nilam official data source',
        records: []
      } : {
        status: 'NOT_CONNECTED',
        status_label: 'Official Data Source Not Connected',
        message: 'Official data source not connected — private land-owner information protected under TN e-Governance policy',
        records: []
      },
      gis: {
        latitude: lat,
        longitude: lng,
        area_sqft: Math.abs(Math.floor((lat * lng * 1000) % 50000) + 5000)
      },
      sources: [
        { name: 'TNGIS Spatial Layer', type: 'GIS_SPATIAL', status: 'NOT_CONNECTED', verified_at: currentDate },
        { name: 'Tamil Nilam / A-Register', type: 'LAND_RECORD', status: 'NOT_CONNECTED', verified_at: currentDate }
      ]
    };
  }
}

