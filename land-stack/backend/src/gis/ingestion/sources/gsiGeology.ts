/**
 * GSI Geology Data Importer
 * 
 * Imports real geological data from the Geological Survey of India (GSI).
 * 
 * IMPORTANT: GSI data must be downloaded manually from the NGDR portal.
 * This importer does NOT fabricate API endpoints or bypass authentication.
 * 
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  HOW TO OBTAIN GSI DATA                                      ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  1. Visit: https://geodataindia.gov.in/                      ║
 * ║  2. Register for an account (free)                            ║
 * ║  3. Navigate to: Map Services → Geological Map of India      ║
 * ║  4. Download the dataset in GeoJSON or Shapefile format       ║
 * ║  5. Place the file in: gis-data/raw/gsi/                     ║
 * ║  6. Run: npm run gis:import-gsi                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { importGeoJsonFile } from '../importers/geojsonImporter.js';
import { GSI_GEOLOGY_MAP } from './sourceRegistry.js';
import { datasetRepository } from '../../repositories/datasetRepository.js';
import { generateBatchId } from '../importReport.js';

const DATA_DIR = path.resolve(process.cwd(), 'gis-data');
const GSI_RAW_DIR = path.join(DATA_DIR, 'raw', 'gsi');

/**
 * Known property mappings for common GSI dataset formats
 * These map source GeoJSON/Shapefile property names to our geology table columns
 */
const GSI_PROPERTY_MAPPINGS: Record<string, Record<string, string>> = {
  // Standard NGDR geological map attributes
  default: {
    'GLG_CODE': 'geology_code',
    'UNIT_NAME': 'unit_name',
    'ROCK_TYPE': 'rock_type',
    'ROCK_FORM': 'rock_formation',
    'LITHOLOGY': 'lithology',
    'AGE': 'age',
    'FORMATION': 'formation',
    'DESCRIPTIO': 'description',
    'GEO_UNIT': 'geomorphology_unit',
    // Alternative property names found in various GSI exports
    'geology_code': 'geology_code',
    'unit_name': 'unit_name',
    'rock_type': 'rock_type',
    'rock_formation': 'rock_formation',
    'lithology': 'lithology',
    'age': 'age',
    'formation': 'formation',
    'description': 'description',
    'geomorphology_unit': 'geomorphology_unit',
    'LITHO': 'lithology',
    'ROCK_FORMATION': 'rock_formation',
    'MAP_SYMBOL': 'geology_code',
    'MAP_UNIT': 'unit_name',
    'GEO_AGE': 'age',
  },
};

/**
 * Scan the gis-data/raw/gsi/ directory for downloadable GSI files
 */
export function scanForGsiFiles(): string[] {
  if (!fs.existsSync(GSI_RAW_DIR)) {
    fs.mkdirSync(GSI_RAW_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(GSI_RAW_DIR);
  return files.filter(f =>
    f.endsWith('.geojson') || f.endsWith('.json') || f.endsWith('.geojson.json'),
  );
}

/**
 * Auto-detect property mapping from a GeoJSON file
 * Reads the first feature's properties and matches against known GSI field names
 */
function autoDetectPropertyMapping(geojson: any): Record<string, string> {
  const mapping: Record<string, string> = {};

  if (!geojson.features || geojson.features.length === 0) return mapping;

  const props = geojson.features[0].properties || {};
  const propKeys = Object.keys(props);

  // Check against all known mappings
  const allMappings = GSI_PROPERTY_MAPPINGS.default;

  for (const key of propKeys) {
    const upperKey = key.toUpperCase();

    // Direct match
    if (allMappings[key]) {
      mapping[key] = allMappings[key];
      continue;
    }

    // Upper-case match
    if (allMappings[upperKey]) {
      mapping[key] = allMappings[upperKey];
      continue;
    }

    // Partial match heuristics
    if (upperKey.includes('LITH')) mapping[key] = 'lithology';
    else if (upperKey.includes('ROCK') && upperKey.includes('TYPE')) mapping[key] = 'rock_type';
    else if (upperKey.includes('ROCK') && upperKey.includes('FORM')) mapping[key] = 'rock_formation';
    else if (upperKey.includes('AGE') || upperKey.includes('ERA') || upperKey.includes('PERIOD')) mapping[key] = 'age';
    else if (upperKey.includes('FORM') && !upperKey.includes('ROCK')) mapping[key] = 'formation';
    else if (upperKey.includes('UNIT')) mapping[key] = 'unit_name';
    else if (upperKey.includes('CODE') || upperKey.includes('SYMBOL')) mapping[key] = 'geology_code';
    else if (upperKey.includes('DESC')) mapping[key] = 'description';
  }

  return mapping;
}

/**
 * Import a GSI geology file from the raw data directory
 */
export async function importGsiGeologyFile(fileName: string): Promise<boolean> {
  const batchId = generateBatchId();
  const filePath = path.join(GSI_RAW_DIR, fileName);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  GSI Geology Import Pipeline`);
  console.log(`  File: ${fileName}`);
  console.log(`  Batch: ${batchId}`);
  console.log(`${'='.repeat(60)}\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log(`\nPlease download GSI data from https://geodataindia.gov.in/`);
    console.log(`and place the file in: ${GSI_RAW_DIR}`);
    return false;
  }

  // Read and auto-detect property mapping
  let geojson: any;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    geojson = JSON.parse(content);
  } catch (err) {
    console.error(`❌ Failed to parse file: ${(err as Error).message}`);
    return false;
  }

  const propertyMapping = autoDetectPropertyMapping(geojson);

  console.log(`🔍 Auto-detected property mapping:`);
  for (const [src, dst] of Object.entries(propertyMapping)) {
    console.log(`   ${src} → ${dst}`);
  }

  // Register dataset
  await datasetRepository.registerDataset({
    ...GSI_GEOLOGY_MAP,
    download_date: new Date().toISOString().split('T')[0],
    status: 'staging',
    notes: `Imported from file: ${fileName}`,
  });

  // Import via pipeline
  const report = await importGeoJsonFile({
    filePath,
    tableName: 'geology',
    datasetId: GSI_GEOLOGY_MAP.dataset_id,
    datasetName: GSI_GEOLOGY_MAP.name,
    sourceOrganization: GSI_GEOLOGY_MAP.organization!,
    useStaging: true,
    propertyMapping,
    fixedColumns: {
      source: 'REAL_GSI',
      source_url: GSI_GEOLOGY_MAP.source_url,
      dataset_id: GSI_GEOLOGY_MAP.dataset_id,
      dataset_version: GSI_GEOLOGY_MAP.version,
    },
    batchId,
  });

  if (report.status === 'completed' || report.status === 'partial') {
    await datasetRepository.updateDatasetStatus(
      GSI_GEOLOGY_MAP.dataset_id,
      'active',
      report.records.accepted,
    );
    console.log(`\n✅ GSI geology import completed: ${report.records.accepted} features imported.`);
    return true;
  }

  console.error(`\n❌ GSI geology import failed.`);
  return false;
}

/**
 * Import all GSI files found in the raw data directory
 */
export async function importAllGsiData(): Promise<void> {
  const files = scanForGsiFiles();

  if (files.length === 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  GSI Data Import — No Files Found`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n  No GSI GeoJSON files found in: ${GSI_RAW_DIR}`);
    console.log(`\n  To import real GSI data:`);
    console.log(`  1. Visit https://geodataindia.gov.in/`);
    console.log(`  2. Register and download geological datasets`);
    console.log(`  3. Place .geojson files in: ${GSI_RAW_DIR}`);
    console.log(`  4. Run: npm run gis:import-gsi\n`);
    return;
  }

  console.log(`\n🗂️  Found ${files.length} GSI file(s): ${files.join(', ')}`);

  for (const file of files) {
    await importGsiGeologyFile(file);
  }
}
