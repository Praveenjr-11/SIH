/**
 * Multi-State Adapter Engine
 *
 * Reads a state-specific config JSON and a source data file, maps source fields
 * to the canonical `parcels` schema, applies unit conversions, generates ULPINs,
 * and inserts into PostGIS.
 *
 * Usage:
 *   npm run gis:import-chandigarh
 * or directly:
 *   tsx adapterEngine.ts <configPath> <sourceDataPath>
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { queryPostGIS, testPostGISConnection } from '../../config/db.js';

interface AdapterConfig {
  state: string;
  state_code: string;
  source_format: string;
  field_mapping: Record<string, string>;
  unit_conversions?: Record<string, {
    multiply_by: number;
    target_unit: string;
    comment?: string;
  }>;
  defaults?: Record<string, string>;
}

interface CanonicalParcel {
  ulpin: string;
  survey_number: string;
  village_name: string;
  taluk_name: string;
  district_name: string;
  state_name: string;
  area_acres: number;
  land_classification: string;
  owner_name: string;
  registration_doc_no: string;
  encumbrance_status: string;
  verification_status: string;
  source: string;
  geom_json: string | null;
}

/**
 * Generate a ULPIN following the standard 14-digit format:
 * {2-char state code}{2-char district seq}{3-char taluk seq}{7-digit parcel seq}
 */
function generateULPIN(stateCode: string, sequence: number): string {
  const stateStr = stateCode.toUpperCase().padEnd(2, 'X').slice(0, 2);
  const seq = String(sequence).padStart(10, '0');
  return `${stateStr}${seq}`;
}

function applyFieldMapping(sourceRow: Record<string, any>, config: AdapterConfig): Partial<CanonicalParcel> {
  const mapped: Record<string, any> = {};

  // Apply field_mapping: source field → canonical field
  for (const [sourceField, canonicalField] of Object.entries(config.field_mapping)) {
    if (sourceRow[sourceField] !== undefined && sourceRow[sourceField] !== null) {
      let value = sourceRow[sourceField];

      // Apply unit conversion if this field needs it
      if (config.unit_conversions?.[sourceField]) {
        const conv = config.unit_conversions[sourceField];
        value = parseFloat(value) * conv.multiply_by;
        console.log(`    [unit_convert] ${sourceField}: ${sourceRow[sourceField]} sqm → ${value.toFixed(4)} acres`);
      }

      mapped[canonicalField] = value;
    }
  }

  // Apply defaults for any fields not yet mapped
  if (config.defaults) {
    for (const [field, defaultValue] of Object.entries(config.defaults)) {
      if (!mapped[field]) {
        mapped[field] = defaultValue;
      }
    }
  }

  return mapped as Partial<CanonicalParcel>;
}

async function runAdapter(configPath: string, sourceFilePath: string) {
  console.log('==========================================================');
  console.log(`🗺️  Multi-State Adapter Engine`);
  console.log(`   Config:  ${configPath}`);
  console.log(`   Source:  ${sourceFilePath}`);
  console.log('==========================================================');

  // Load config
  const absConfigPath = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(absConfigPath)) {
    console.error(`❌ Config file not found: ${absConfigPath}`);
    process.exit(1);
  }
  const config: AdapterConfig = JSON.parse(fs.readFileSync(absConfigPath, 'utf8'));
  console.log(`📋 State: ${config.state} | Format: ${config.source_format}`);
  console.log(`📐 Field mappings: ${Object.keys(config.field_mapping).length} fields`);
  if (config.unit_conversions) {
    console.log(`🔄 Unit conversions: ${Object.keys(config.unit_conversions).join(', ')}`);
  }

  // Load source data
  const absSourcePath = path.resolve(process.cwd(), sourceFilePath);
  if (!fs.existsSync(absSourcePath)) {
    console.error(`❌ Source file not found: ${absSourcePath}`);
    process.exit(1);
  }
  const sourceData: Record<string, any>[] = JSON.parse(fs.readFileSync(absSourcePath, 'utf8'));
  console.log(`📦 Source rows: ${sourceData.length}`);

  // Check DB
  const connected = await testPostGISConnection();
  if (!connected) {
    console.error('❌ PostGIS not connected. Cannot insert. Exiting.');
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;
  let sequenceStart = 3000 + Math.floor(Math.random() * 1000); // Avoid ULPIN collision with TN data

  for (let i = 0; i < sourceData.length; i++) {
    const sourceRow = sourceData[i];
    console.log(`\n[Row ${i + 1}/${sourceData.length}] Mapping source fields...`);

    const canonical = applyFieldMapping(sourceRow, config);

    // Generate ULPIN
    const ulpin = generateULPIN(config.state_code, sequenceStart + i);
    canonical.ulpin = ulpin;
    canonical.state_name = config.state;
    canonical.verification_status = 'UNVERIFIED';
    canonical.source = `ADAPTER_${config.state_code}_${config.source_format.toUpperCase()}`;

    // Fallbacks for mandatory fields
    if (!canonical.survey_number) canonical.survey_number = `UNKNOWN-${i + 1}`;
    if (!canonical.owner_name) canonical.owner_name = 'Unknown Owner';
    if (!canonical.land_classification) canonical.land_classification = 'Unknown';
    if (!canonical.village_name) canonical.village_name = canonical.district_name || config.state;
    if (!canonical.taluk_name) canonical.taluk_name = canonical.district_name || config.state;
    if (!canonical.district_name) canonical.district_name = config.defaults?.district_name || config.state;
    if (!canonical.area_acres || isNaN(canonical.area_acres as number)) canonical.area_acres = 0;
    if (!canonical.registration_doc_no) canonical.registration_doc_no = `${config.state_code}-DOC-${ulpin}`;
    if (!canonical.encumbrance_status) {
      canonical.encumbrance_status = sourceRow.encumbrance || 'Clear';
    }

    // Build geometry from source coordinates field
    let geomJson: string | null = null;
    if (sourceRow.coordinates && Array.isArray(sourceRow.coordinates)) {
      geomJson = JSON.stringify({
        type: 'Polygon',
        coordinates: sourceRow.coordinates
      });
    }

    console.log(`    ulpin=${ulpin}, survey=${canonical.survey_number}, owner="${canonical.owner_name}", area=${Number(canonical.area_acres).toFixed(4)} acres`);

    try {
      await queryPostGIS(`
        INSERT INTO parcels (
          ulpin, survey_number, village_name, taluk_name, district_name, state_name,
          area_acres, land_classification, owner_name, registration_doc_no,
          encumbrance_status, verification_status, source,
          geom_text
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14
        )
        ON CONFLICT (ulpin) DO NOTHING
      `, [
        canonical.ulpin,
        canonical.survey_number,
        canonical.village_name,
        canonical.taluk_name,
        canonical.district_name,
        canonical.state_name,
        canonical.area_acres,
        canonical.land_classification,
        canonical.owner_name,
        canonical.registration_doc_no,
        canonical.encumbrance_status,
        canonical.verification_status,
        canonical.source,
        geomJson
      ]);
      console.log(`    ✅ Inserted ${ulpin}`);
      inserted++;
    } catch (err: any) {
      console.error(`    ❌ Insert failed for row ${i + 1}: ${err.message}`);
      skipped++;
    }
  }

  console.log('\n==========================================================');
  console.log(`📊 Adapter Engine Complete — ${config.state}`);
  console.log(`   Total:    ${sourceData.length}`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log('==========================================================');

  // Show final state breakdown
  try {
    const breakdown = await queryPostGIS('SELECT state_name, COUNT(*) as count FROM parcels GROUP BY state_name ORDER BY count DESC');
    console.log('\n📋 State breakdown in parcels table:');
    for (const row of breakdown.rows) {
      console.log(`   ${row.state_name}: ${row.count} parcels`);
    }
  } catch {
    console.warn('Could not fetch state breakdown.');
  }

  process.exit(0);
}

// CLI entry point
const [,, configArg, sourceArg] = process.argv;
if (!configArg || !sourceArg) {
  console.error('Usage: tsx adapterEngine.ts <configPath> <sourceDataPath>');
  process.exit(1);
}

runAdapter(configArg, sourceArg).catch(err => {
  console.error('Adapter engine failed:', err);
  process.exit(1);
});
