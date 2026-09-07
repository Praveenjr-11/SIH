/**
 * geoBoundaries Data Source — download and import India administrative boundaries
 * 
 * Source: https://www.geoboundaries.org/
 * License: CC BY 4.0 / Open Database License
 * 
 * This module downloads real administrative boundary GeoJSON files from the
 * geoBoundaries API and imports them through the ingestion pipeline.
 */

import fs from 'fs';
import path from 'path';
import { importGeoJsonFile } from '../importers/geojsonImporter.js';
import { GEOBOUNDARIES_STATES, GEOBOUNDARIES_DISTRICTS } from './sourceRegistry.js';
import { datasetRepository } from '../../repositories/datasetRepository.js';
import { generateBatchId } from '../importReport.js';

const DATA_DIR = path.resolve(process.cwd(), 'gis-data');
const RAW_DIR = path.join(DATA_DIR, 'raw', 'administrative');

/**
 * geoBoundaries API response structure
 */
interface GeoBoundariesApiResponse {
  boundaryISO: string;
  boundaryName: string;
  boundaryType: string;
  gjDownloadURL: string;
  simplifiedGeometryGeoJSON?: string;
}

/**
 * Download a geoBoundaries dataset via their API
 * The API returns metadata including the GeoJSON download URL
 */
async function downloadGeoBoundaries(
  apiUrl: string,
  outputFileName: string,
): Promise<string | null> {
  try {
    // Ensure directories exist
    fs.mkdirSync(RAW_DIR, { recursive: true });

    const outputPath = path.join(RAW_DIR, outputFileName);

    // Check if already downloaded
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`📂 Found existing file: ${outputFileName} (${(stats.size / 1024).toFixed(1)} KB)`);
      return outputPath;
    }

    console.log(`🌐 Fetching geoBoundaries metadata from: ${apiUrl}`);

    // Step 1: Get metadata (contains download URL)
    const metaRes = await fetch(apiUrl, {
      headers: { 'User-Agent': 'LAND-STACK-GIS/1.0 (Educational Research Project)' },
    });

    if (!metaRes.ok) {
      console.error(`❌ geoBoundaries API returned HTTP ${metaRes.status}`);
      return null;
    }

    const meta: GeoBoundariesApiResponse = await metaRes.json();

    if (!meta.gjDownloadURL) {
      console.error(`❌ No GeoJSON download URL in geoBoundaries response`);
      return null;
    }

    console.log(`📥 Downloading GeoJSON from: ${meta.gjDownloadURL}`);

    // Step 2: Download the actual GeoJSON
    const dataRes = await fetch(meta.gjDownloadURL, {
      headers: { 'User-Agent': 'LAND-STACK-GIS/1.0 (Educational Research Project)' },
    });

    if (!dataRes.ok) {
      console.error(`❌ GeoJSON download failed: HTTP ${dataRes.status}`);
      return null;
    }

    const geojsonText = await dataRes.text();
    fs.writeFileSync(outputPath, geojsonText, 'utf8');

    const sizeMB = (Buffer.byteLength(geojsonText) / (1024 * 1024)).toFixed(2);
    console.log(`✅ Downloaded: ${outputFileName} (${sizeMB} MB)`);

    return outputPath;

  } catch (err) {
    console.error(`❌ Download error: ${(err as Error).message}`);
    return null;
  }
}

/**
 * Import India state boundaries from geoBoundaries
 */
export async function importGeoBoundariesStates(batchId?: string): Promise<boolean> {
  const batch = batchId || generateBatchId();

  console.log('\n🗺️  Importing geoBoundaries India States (ADM1)...');

  // Download
  const filePath = await downloadGeoBoundaries(
    GEOBOUNDARIES_STATES.source_url!,
    'geoBoundaries-IND-ADM1.geojson',
  );

  if (!filePath) {
    console.error('❌ Failed to download states data. Skipping.');
    return false;
  }

  // Register dataset in catalog
  await datasetRepository.registerDataset({
    ...GEOBOUNDARIES_STATES,
    download_date: new Date().toISOString().split('T')[0],
    status: 'staging',
  });

  // Import via pipeline
  const report = await importGeoJsonFile({
    filePath,
    tableName: 'states',
    datasetId: GEOBOUNDARIES_STATES.dataset_id,
    datasetName: GEOBOUNDARIES_STATES.name,
    sourceOrganization: GEOBOUNDARIES_STATES.organization!,
    useStaging: true,
    propertyMapping: {
      'shapeName': 'name',
      'shapeISO': 'code',
    },
    fixedColumns: {
      source: 'geoBoundaries',
      source_url: GEOBOUNDARIES_STATES.source_url,
      dataset_id: GEOBOUNDARIES_STATES.dataset_id,
    },
    batchId: batch,
  });

  if (report.status === 'completed' || report.status === 'partial') {
    await datasetRepository.updateDatasetStatus(
      GEOBOUNDARIES_STATES.dataset_id,
      'active',
      report.records.accepted,
    );
    return true;
  }

  return false;
}

/**
 * Import India district boundaries from geoBoundaries
 */
export async function importGeoBoundariesDistricts(batchId?: string): Promise<boolean> {
  const batch = batchId || generateBatchId();

  console.log('\n🗺️  Importing geoBoundaries India Districts (ADM2)...');

  // Download
  const filePath = await downloadGeoBoundaries(
    GEOBOUNDARIES_DISTRICTS.source_url!,
    'geoBoundaries-IND-ADM2.geojson',
  );

  if (!filePath) {
    console.error('❌ Failed to download districts data. Skipping.');
    return false;
  }

  // Register dataset in catalog
  await datasetRepository.registerDataset({
    ...GEOBOUNDARIES_DISTRICTS,
    download_date: new Date().toISOString().split('T')[0],
    status: 'staging',
  });

  // Import via pipeline
  const report = await importGeoJsonFile({
    filePath,
    tableName: 'districts',
    datasetId: GEOBOUNDARIES_DISTRICTS.dataset_id,
    datasetName: GEOBOUNDARIES_DISTRICTS.name,
    sourceOrganization: GEOBOUNDARIES_DISTRICTS.organization!,
    useStaging: true,
    propertyMapping: {
      'shapeName': 'name',
      'shapeGroup': 'state_name',
    },
    fixedColumns: {
      source: 'geoBoundaries',
      source_url: GEOBOUNDARIES_DISTRICTS.source_url,
      dataset_id: GEOBOUNDARIES_DISTRICTS.dataset_id,
    },
    batchId: batch,
  });

  if (report.status === 'completed' || report.status === 'partial') {
    await datasetRepository.updateDatasetStatus(
      GEOBOUNDARIES_DISTRICTS.dataset_id,
      'active',
      report.records.accepted,
    );
    return true;
  }

  return false;
}

/**
 * Import all geoBoundaries datasets
 */
export async function importAllGeoBoundaries(): Promise<void> {
  const batchId = generateBatchId();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  geoBoundaries India Import Pipeline`);
  console.log(`  Batch: ${batchId}`);
  console.log(`${'='.repeat(60)}\n`);

  const statesOk = await importGeoBoundariesStates(batchId);
  const districtsOk = await importGeoBoundariesDistricts(batchId);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Import Summary`);
  console.log(`  States:    ${statesOk ? '✅ Success' : '❌ Failed'}`);
  console.log(`  Districts: ${districtsOk ? '✅ Success' : '❌ Failed'}`);
  console.log(`${'='.repeat(60)}\n`);
}
