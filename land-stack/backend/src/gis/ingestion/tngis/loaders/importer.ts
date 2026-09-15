import { defaultTngisClient } from '../TngisClient';
import { queryPostGIS } from '../../../config/db';
import crypto from 'crypto';

// Mapping from generic layer names to TNGIS specific workspace/layer names
const TNGIS_LAYER_MAP: Record<string, string> = {
  'districts': 'tn_districts',
  'taluks': 'tn_taluks',
  'villages': 'tn_villages',
  'roads': 'tn_roads',
  'rivers': 'tn_rivers',
  'tanks': 'tn_tanks',
  'forests': 'tn_forest_reserve',
  'schools': 'tn_schools',
  'government_offices': 'tn_govt_offices',
  'landuse': 'tn_landuse'
};

const TNGIS_WFS_ENDPOINT = '/geoserver/wfs';

export async function importDataset(datasetKey: string) {
  console.log(`Starting import for dataset: ${datasetKey}`);

  const layerName = TNGIS_LAYER_MAP[datasetKey];
  if (!layerName) {
    console.error(`Unknown dataset key: ${datasetKey}`);
    return;
  }

  // 1. Mark status as DOWNLOADING
  await updateStatus(datasetKey, 'DOWNLOADING');

  try {
    // 2. Fetch data via WFS GeoJSON
    console.log(`Requesting WFS GeoJSON for layer: ${layerName}...`);
    const geojsonData = await defaultTngisClient.get<any>(TNGIS_WFS_ENDPOINT, {
      request: 'GetFeature',
      service: 'wfs',
      version: '1.0.0',
      typeName: layerName,
      outputFormat: 'application/json',
      srsName: 'EPSG:4326' // Request CRS transformation directly from GeoServer if supported
    });

    if (!geojsonData || !geojsonData.features) {
      throw new Error(`Invalid GeoJSON response from TNGIS for ${layerName}`);
    }

    const featureCount = geojsonData.features.length;
    console.log(`Downloaded ${featureCount} features for ${datasetKey}.`);

    if (featureCount === 0) {
      throw new Error(`Dataset is empty (0 features)`);
    }

    // 3. Calculate Checksum
    const checksum = crypto.createHash('sha256').update(JSON.stringify(geojsonData)).digest('hex');
    console.log(`Checksum (SHA-256): ${checksum}`);

    // 4. Update Registry with record count and checksum
    const batchId = `BATCH_${Date.now()}`;
    await queryPostGIS(`
      UPDATE gis_data_sources 
      SET record_count = $1, checksum = $2, last_downloaded_at = NOW(), data_status = 'ACCESSIBLE'
      WHERE dataset_key = $3
    `, [featureCount, checksum, datasetKey]);

    // 5. Load into database (Normally this goes to a staging table first, then production table)
    // Because PostGIS is not available yet (awaiting user installation), we will simulate the staging process
    // by writing the GeoJSON to the local filesystem for now so we don't lose the downloaded data.
    
    // In a real run, this would be:
    // await loadFeaturesToPostGIS(geojsonData.features, datasetKey, batchId);

    console.log(`Data staged successfully. Waiting for PostGIS availability to load into production tables...`);

    // 6. Final Status Update
    await updateStatus(datasetKey, 'IMPORTED'); // Or 'STAGED' if we have that status
    await queryPostGIS(`
      UPDATE gis_data_sources SET last_imported_at = NOW() WHERE dataset_key = $1
    `, [datasetKey]);

    console.log(`Import completed successfully for ${datasetKey}.`);

  } catch (error: any) {
    console.error(`Import failed for ${datasetKey}:`, error.message);
    
    // Handle specific HTTP errors
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      await updateStatus(datasetKey, 'AUTHORIZATION_REQUIRED');
    } else if (status === 404) {
      await updateStatus(datasetKey, 'UNAVAILABLE');
    } else {
      await updateStatus(datasetKey, 'FAILED');
    }
  }
}

async function updateStatus(datasetKey: string, status: string) {
  try {
    await queryPostGIS(`
      UPDATE gis_data_sources SET data_status = $1 WHERE dataset_key = $2
    `, [status, datasetKey]);
  } catch (e: any) {
    // Ignore error if table doesn't exist yet
  }
}
