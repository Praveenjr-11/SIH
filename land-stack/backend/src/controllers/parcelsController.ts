import { Request, Response } from 'express';
import { queryPostGIS } from '../gis/config/db.js';
import { parcelsData } from '../data/db.js';

/**
 * Transforms a raw DB row from the `parcels` table back into the
 * Parcel-shaped object the frontend expects.
 */
function rowToParcel(row: any) {
  return {
    id: String(row.id),
    ulpin: row.ulpin,
    surveyNumber: row.survey_number,
    village: row.village_name,
    taluk: row.taluk_name,
    district: row.district_name,
    state: row.state_name,
    areaAcres: parseFloat(row.area_acres) || 0,
    areaSqMeters: parseFloat(row.area_sq_meters) || 0,
    landClassification: row.land_classification || 'Government Poramboke',
    currentUse: row.current_use || '',
    ownerName: row.owner_name || '',
    ownerAadhaarHash: row.owner_aadhaar_hash || '',
    registrationDocNo: row.registration_doc_no || '',
    registrationDate: row.registration_date ? String(row.registration_date).slice(0, 10) : '',
    encumbranceStatus: row.encumbrance_status || 'Clear',
    verificationStatus: row.verification_status || 'Pending',
    provenanceHash: row.provenance_hash || null,
    coordinates: row.geom_json ? (JSON.parse(row.geom_json)?.coordinates || []) : [],
    center: [0, 0] as [number, number],
    zoningDetails: row.zoning_details_json || undefined,
    propertyTaxDetails: row.property_tax_details_json || undefined,
    courtCaseDetails: row.court_case_details_json || undefined,
    gsiGeology: row.gsi_geology_json || {
      rockFormation: 'Peninsular Gneiss',
      lithology: 'Granite',
      geomorphologyUnit: 'Pediment',
      soilBearingCapacityKPa: 250,
      landslideRiskLevel: 'Low',
      seismicZone: 'Zone II',
      floodHazardIndex: 'Low',
      groundwaterDepthMeters: 8,
      gsiReportId: 'GSI-DEFAULT',
      lastSurveyYear: 2024
    },
    digitalFacets: row.digital_facets_json || {
      ulpinCadastralId: row.ulpin,
      rorOwnership: 'Patta Available',
      encumbranceCertificate: 'Available',
      registrationHistory: 'Linked',
      taxAssessment: 'Linked',
      soilAndAgriculture: 'Linked',
      gisSpatialPolygon: 'PostGIS EPSG:4326',
      gsiGeoscientificRisk: 'Available',
      isroSatelliteLandUse: 'Bhuvan',
      utilityInfrastructure: 'Linked'
    }
  };
}

const SELECT_PARCELS_SQL = `
  SELECT 
    id, ulpin, survey_number, village_name, taluk_name, district_name, state_name,
    area_acres, area_sq_meters, land_classification, current_use,
    owner_name, owner_aadhaar_hash, registration_doc_no, registration_date,
    encumbrance_status, verification_status, provenance_hash,
    zoning_details_json, property_tax_details_json, court_case_details_json,
    gsi_geology_json, digital_facets_json,
    geom_text as geom_json
  FROM parcels
`;

export const getAllParcels = async (req: Request, res: Response) => {
  const { status, classification, district, search } = req.query;

  let parcelsFromDb: any[] = [];
  try {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (status) {
      conditions.push(`LOWER(verification_status) = LOWER($${paramIdx++})`);
      values.push(status as string);
    }

    if (classification) {
      conditions.push(`LOWER(land_classification) LIKE LOWER($${paramIdx++})`);
      values.push(`%${classification}%`);
    }

    if (district) {
      conditions.push(`LOWER(district_name) = LOWER($${paramIdx++})`);
      values.push(district as string);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      conditions.push(`(
        LOWER(ulpin) LIKE $${paramIdx} OR
        LOWER(survey_number) LIKE $${paramIdx} OR
        LOWER(owner_name) LIKE $${paramIdx} OR
        LOWER(village_name) LIKE $${paramIdx}
      )`);
      values.push(`%${q}%`);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `${SELECT_PARCELS_SQL} ${whereClause} ORDER BY id LIMIT 500`;

    const result = await queryPostGIS(sql, values);
    if (result && result.rows && result.rows.length > 0) {
      parcelsFromDb = result.rows.map(rowToParcel);
    }
  } catch {
    // PostGIS offline or empty
  }

  if (parcelsFromDb.length > 0) {
    return res.json({ success: true, total: parcelsFromDb.length, parcels: parcelsFromDb });
  }

  // Fallback to rich parcelsData
  let filtered = parcelsData;
  if (status) {
    filtered = filtered.filter(p => p.verificationStatus.toLowerCase() === (status as string).toLowerCase());
  }
  if (classification) {
    filtered = filtered.filter(p => p.landClassification.toLowerCase().includes((classification as string).toLowerCase()));
  }
  if (district) {
    filtered = filtered.filter(p => p.district.toLowerCase() === (district as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(p =>
      p.ulpin.toLowerCase().includes(q) ||
      p.surveyNumber.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, total: filtered.length, parcels: filtered });
};

export const getParcelByUlpin = async (req: Request, res: Response) => {
  const { ulpin } = req.params;

  try {
    const result = await queryPostGIS(
      `${SELECT_PARCELS_SQL} WHERE ulpin = $1`,
      [ulpin]
    );

    if (result && result.rows && result.rows.length > 0) {
      return res.json({ success: true, parcel: rowToParcel(result.rows[0]) });
    }
  } catch {
    // Fallback
  }

  const found = parcelsData.find(p => p.ulpin.toLowerCase() === ulpin.toLowerCase());
  if (found) {
    return res.json({ success: true, parcel: found });
  }

  return res.status(404).json({
    success: false,
    error: `Parcel with ULPIN '${ulpin}' not found.`
  });
};

export const getParcelGeoJSON = async (req: Request, res: Response) => {
  try {
    const result = await queryPostGIS(`
      SELECT 
        id, ulpin, survey_number, owner_name, land_classification,
        verification_status, area_acres,
        gsi_geology_json,
        geom_text as geometry
      FROM parcels
      WHERE geom_text IS NOT NULL
      LIMIT 500
    `);

    if (result && result.rows && result.rows.length > 0) {
      const features = result.rows.map(row => ({
        type: 'Feature',
        id: row.id,
        properties: {
          ulpin: row.ulpin,
          surveyNumber: row.survey_number,
          ownerName: row.owner_name,
          landClassification: row.land_classification,
          verificationStatus: row.verification_status,
          gsiRiskLevel: row.gsi_geology_json?.landslideRiskLevel || 'Low',
          areaAcres: parseFloat(row.area_acres) || 0
        },
        geometry: row.geometry ? JSON.parse(row.geometry) : null
      }));

      return res.json({ type: 'FeatureCollection', features });
    }
  } catch {
    // Fallback
  }

  // Fallback GeoJSON from parcelsData
  const features = parcelsData.map(p => ({
    type: 'Feature',
    id: p.id,
    properties: {
      ulpin: p.ulpin,
      surveyNumber: p.surveyNumber,
      ownerName: p.ownerName,
      district: p.district,
      taluk: p.taluk,
      village: p.village,
      landClassification: p.landClassification,
      verificationStatus: p.verificationStatus,
      gsiRiskLevel: (p as any).riskAssessment?.riskLevel || p.gsiGeology?.landslideRiskLevel || 'LOW',
      areaAcres: p.areaAcres
    },
    geometry: {
      type: 'Polygon',
      coordinates: p.coordinates
    }
  }));

  res.json({ type: 'FeatureCollection', features });
};

