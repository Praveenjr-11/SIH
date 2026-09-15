/**
 * One-time seed script: migrates all parcels from the in-memory mock array
 * (src/data/db.ts) into the real PostGIS `parcels` table.
 *
 * Usage: npm run gis:migrate-parcels
 */

import 'dotenv/config';
import { queryPostGIS, testPostGISConnection } from '../config/db.js';
import { parcelsData } from '../../data/db.js';

async function migrateMockParcels() {
  console.log('==========================================================');
  console.log('🏗️  Migrating mock parcels → PostGIS parcels table');
  console.log('==========================================================');

  const connected = await testPostGISConnection();
  if (!connected) {
    console.error('❌ PostGIS is not connected. Cannot migrate. Exiting.');
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;

  for (const p of parcelsData) {
    try {
      // Convert coordinates array to a valid GeoJSON Polygon for ST_GeomFromGeoJSON
      const geomJson = JSON.stringify({
        type: 'Polygon',
        coordinates: p.coordinates[0] ? p.coordinates : [p.coordinates]
      });

      await queryPostGIS(`
        INSERT INTO parcels (
          ulpin, survey_number, village_name, taluk_name, district_name, state_name,
          area_acres, area_sq_meters, land_classification, current_use,
          owner_name, owner_aadhaar_hash, registration_doc_no, registration_date,
          encumbrance_status, verification_status,
          zoning_details_json, property_tax_details_json, court_case_details_json,
          gsi_geology_json, digital_facets_json,
          source, geom_text
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16,
          $17, $18, $19,
          $20, $21,
          $22, $23
        )
        ON CONFLICT (ulpin) DO NOTHING
      `, [
        p.ulpin,
        p.surveyNumber,
        p.village,
        p.taluk,
        p.district,
        p.state,
        p.areaAcres,
        p.areaSqMeters,
        p.landClassification,
        p.currentUse,
        p.ownerName,
        p.ownerAadhaarHash,
        p.registrationDocNo,
        p.registrationDate || null,
        p.encumbranceStatus,
        p.verificationStatus === 'Verified' ? 'Verified' : p.verificationStatus === 'Disputed' ? 'Disputed' : 'Pending',
        p.zoningDetails ? JSON.stringify(p.zoningDetails) : null,
        p.propertyTaxDetails ? JSON.stringify(p.propertyTaxDetails) : null,
        p.courtCaseDetails ? JSON.stringify(p.courtCaseDetails) : null,
        p.gsiGeology ? JSON.stringify(p.gsiGeology) : null,
        p.digitalFacets ? JSON.stringify(p.digitalFacets) : null,
        'MOCK_TN_SEED',
        p.coordinates && p.coordinates.length > 0
          ? JSON.stringify({ type: 'Polygon', coordinates: p.coordinates })
          : null
      ]);

      console.log(`  ✅ Inserted: ${p.ulpin} (${p.ownerName}, ${p.village})`);
      inserted++;
    } catch (err: any) {
      console.error(`  ❌ Failed to insert ${p.ulpin}: ${err.message}`);
      skipped++;
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total mock parcels: ${parcelsData.length}`);
  console.log(`Inserted:          ${inserted}`);
  console.log(`Skipped/Errors:    ${skipped}`);
  console.log('-------------------------');
  console.log('✅ Migration complete.\n');

  // Verify
  try {
    const res = await queryPostGIS('SELECT COUNT(*) as count FROM parcels');
    console.log(`📊 Total rows in parcels table now: ${res.rows[0].count}`);
  } catch {
    console.warn('Could not query final count.');
  }

  process.exit(0);
}

migrateMockParcels().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
