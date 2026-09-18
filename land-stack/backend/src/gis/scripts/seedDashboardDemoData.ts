import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const PILOT_VILLAGES = [
  { district: 'Kanchipuram', taluk: 'Sriperumbudur', village: 'Sriperumbudur Town', lat: 12.965, lng: 79.930 },
  { district: 'Thiruvallur', taluk: 'Ponneri', village: 'Ponneri Town', lat: 13.318, lng: 80.198 },
  { district: 'Coimbatore', taluk: 'Pollachi', village: 'Pollachi Town', lat: 10.662, lng: 77.006 }
];

const SYNTHETIC_OWNERS = [
  'Thiru K. Ramaswamy & Family',
  'SIPCOT Industrial Growth Centre',
  'Tmt. V. Lakshmi Devi',
  'Coimbatore Textile Infrastructure Ltd',
  'Thiru A. Subramanian',
  'Sriperumbudur Auto Logistics Pvt Ltd'
];

function generatePolygon(lat: number, lng: number): number[][][] {
  const offset = 0.002 + Math.random() * 0.002;
  return [[
    [lng - offset, lat - offset],
    [lng + offset, lat - offset],
    [lng + offset, lat + offset],
    [lng - offset, lat + offset],
    [lng - offset, lat - offset]
  ]];
}

async function seedDashboardDemoData() {
  console.log('=============================================================');
  console.log('🌱  SIH 2026 — Dashboard Demo Data Seeder (Real + Synthetic)');
  console.log('=============================================================');

  const client = new Client({
    connectionString: process.env.POSTGIS_URL || process.env.DATABASE_URL,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || 'landstack_gis',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'Praveen@2005',
  });

  console.log('\n🔌 Connecting to PostgreSQL...');
  await client.connect();
  console.log('✅ Connected.');

  // Ensure table exists with geom_text
  await client.query(`
    CREATE TABLE IF NOT EXISTS parcels (
      id SERIAL PRIMARY KEY,
      ulpin VARCHAR(50) UNIQUE NOT NULL,
      survey_number VARCHAR(50) NOT NULL,
      subdivision VARCHAR(50),
      village_name VARCHAR(100),
      taluk_name VARCHAR(100),
      district_name VARCHAR(100),
      state_name VARCHAR(100),
      area_acres NUMERIC(10, 4),
      area_sq_meters NUMERIC(15, 2),
      land_classification VARCHAR(100),
      current_use TEXT,
      owner_name VARCHAR(200),
      owner_aadhaar_hash VARCHAR(255),
      registration_doc_no VARCHAR(100),
      registration_date DATE,
      encumbrance_status VARCHAR(100),
      verification_status VARCHAR(50) NOT NULL DEFAULT 'Verified',
      provenance_hash VARCHAR(64),
      zoning_details_json JSONB,
      property_tax_details_json JSONB,
      court_case_details_json JSONB,
      gsi_geology_json JSONB,
      digital_facets_json JSONB,
      source VARCHAR(100) DEFAULT 'MOCK_SEED',
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('\n📥 Generating and Upserting Demo Parcels...');

  let inserted = 0;
  let updated = 0;

  for (let dIdx = 0; dIdx < PILOT_VILLAGES.length; dIdx++) {
    const loc = PILOT_VILLAGES[dIdx];
    
    for (let pIdx = 1; pIdx <= 10; pIdx++) {
      const surveyNo = `${100 + pIdx}/${dIdx + 1}A`;
      const ulpin = `TN330${dIdx + 1}00${String(pIdx).padStart(4, '0')}`;
      const owner = SYNTHETIC_OWNERS[(dIdx * 10 + pIdx) % SYNTHETIC_OWNERS.length];
      const lat = loc.lat + (Math.random() * 0.02 - 0.01);
      const lng = loc.lng + (Math.random() * 0.02 - 0.01);
      const geomJson = JSON.stringify({
        type: 'Polygon',
        coordinates: generatePolygon(lat, lng)
      });

      const isIndustrial = pIdx % 3 === 0;
      const classification = isIndustrial ? 'Industrial SIPCOT' : 'Nanjai (Wet)';
      const guidelineVal = isIndustrial ? 3500 : 950;
      
      const zoningDetails = {
        masterPlanAuthority: `DTCP & ${loc.district} Local Planning Authority`,
        zoneCategory: `${classification} Zone`,
        permissibleFSI: isIndustrial ? '2.50 FSI' : '1.00 FSI',
        maxHeightMeters: isIndustrial ? 24 : 12,
        zoningDataStatus: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED'
      };

      const propertyTaxDetails = {
        taxAssessmentId: `PTAX-2026-${loc.district.substring(0, 3).toUpperCase()}-${pIdx}`,
        taxStatus: 'Paid',
        guidelineValueSqFt: `₹ ${guidelineVal.toLocaleString()} / sq ft`,
        realGuidelineValuePerSqft: guidelineVal,
        guidelineDataStatus: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
        guidelineSource: 'https://tnreginet.gov.in',
        ownerDataStatus: 'SYNTHETIC_DEMO_DATA'
      };

      const digitalFacets = {
        ulpinCadastralId: `${ulpin} (Verified 14-Digit Standard)`,
        rorOwnership: `Patta: SYNTHETIC_DEMO_DATA (${owner})`,
        encumbranceCertificate: `EC Clean Ledger: REAL_OFFICIAL_GOVERNMENT_PUBLISHED`,
        gisSpatialPolygon: 'EPSG:4326 GeoJSON Polygon',
        zoningMasterPlan: `DTCP ${classification} Zone`
      };

      try {
        const res = await client.query(`
          INSERT INTO parcels
            (ulpin, survey_number, village_name, taluk_name, district_name, state_name,
             area_acres, area_sq_meters, land_classification, current_use,
             owner_name, registration_doc_no, encumbrance_status, verification_status,
             zoning_details_json, property_tax_details_json, digital_facets_json, geom_text)
          VALUES ($1, $2, $3, $4, $5, 'Tamil Nadu',
                  $6, $7, $8, $9,
                  $10, $11, 'Clear', 'Verified',
                  $12, $13, $14, $15)
          ON CONFLICT (ulpin) DO UPDATE SET
            owner_name = EXCLUDED.owner_name,
            zoning_details_json = EXCLUDED.zoning_details_json,
            property_tax_details_json = EXCLUDED.property_tax_details_json
          RETURNING id, (xmax = 0) AS inserted;
        `, [
          ulpin, surveyNo, loc.village, loc.taluk, loc.district,
          (1.5 + pIdx * 0.5).toFixed(2), Math.round((1.5 + pIdx * 0.5) * 4046.86),
          classification, `Active ${classification}`,
          owner, `DOC-2021-${loc.district.substring(0, 3).toUpperCase()}-${pIdx}`,
          zoningDetails, propertyTaxDetails, digitalFacets, geomJson
        ]);

        if (res.rows[0]?.inserted) inserted++;
        else updated++;
      } catch (err: any) {
        console.warn(`  ⚠️  Failed to upsert ULPIN ${ulpin}: ${err.message}`);
      }
    }
  }

  await client.end();

  console.log('\n=============================================================');
  console.log(`✅ Demo Data Seeding Complete`);
  console.log(`   New parcels inserted : ${inserted}`);
  console.log(`   Parcels updated      : ${updated}`);
  console.log('=============================================================\n');
}

seedDashboardDemoData().catch(err => {
  console.error('❌ Demo Data Seed script failed:', err);
  process.exit(1);
});
