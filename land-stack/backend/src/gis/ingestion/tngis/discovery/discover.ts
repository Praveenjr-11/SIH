import { defaultTngisClient } from '../TngisClient';
import { queryPostGIS } from '../../../config/db';

const TNGIS_WFS_ENDPOINT = '/geoserver/wfs';

export async function discoverDatasets() {
  console.log('Discovering TNGIS datasets via WFS GetCapabilities...');

  try {
    // This is a common pattern for Geoserver discovery
    const response = await defaultTngisClient.get<string>(TNGIS_WFS_ENDPOINT, {
      request: 'GetCapabilities',
      service: 'wfs',
      version: '1.0.0'
    }, {
      responseType: 'text' // WFS GetCapabilities returns XML
    });

    console.log(`Received WFS Capabilities (${response.length} bytes).`);
    // Note: In a full implementation, we would parse the XML using fast-xml-parser or similar,
    // extract all <FeatureType> blocks, and insert them into gis_data_sources.

    // For the scope of this implementation, we will pre-register the known target layers.
    await registerKnownDatasets();

  } catch (error: any) {
    console.error('Failed to discover datasets:', error.message);
    console.log('Registering fallback known datasets...');
    await registerKnownDatasets();
  }
}

async function registerKnownDatasets() {
  const knownDatasets = [
    { key: 'districts', name: 'Districts Boundary', category: 'ADMINISTRATIVE', type: 'WFS', format: 'GeoJSON' },
    { key: 'taluks', name: 'Taluks Boundary', category: 'ADMINISTRATIVE', type: 'WFS', format: 'GeoJSON' },
    { key: 'villages', name: 'Revenue Villages Boundary', category: 'ADMINISTRATIVE', type: 'WFS', format: 'GeoJSON' },
    { key: 'roads', name: 'Road Network', category: 'TRANSPORT', type: 'WFS', format: 'GeoJSON' },
    { key: 'rivers', name: 'Rivers & Streams', category: 'WATER', type: 'WFS', format: 'GeoJSON' },
    { key: 'tanks', name: 'Tanks & Reservoirs', category: 'WATER', type: 'WFS', format: 'GeoJSON' },
    { key: 'forests', name: 'Forest Boundaries', category: 'FOREST', type: 'WFS', format: 'GeoJSON' },
    { key: 'schools', name: 'Schools', category: 'EDUCATION', type: 'WFS', format: 'GeoJSON' },
    { key: 'government_offices', name: 'Government Offices', category: 'GOVERNMENT FACILITIES', type: 'WFS', format: 'GeoJSON' },
    { key: 'landuse', name: 'Land Use', category: 'NATURAL RESOURCES', type: 'WFS', format: 'GeoJSON' },
  ];

  for (const ds of knownDatasets) {
    const sql = `
      INSERT INTO gis_data_sources 
        (dataset_key, dataset_name, category, source_organization, source_system, service_type, format, authorization_status, data_status)
      VALUES 
        ($1, $2, $3, 'TNGIS / TNeGA', 'TNGIS Generic Viewer', $4, $5, 'PUBLIC', 'DISCOVERED')
      ON CONFLICT (dataset_key) DO UPDATE SET
        last_checked_at = NOW();
    `;
    
    try {
      await queryPostGIS(sql, [ds.key, ds.name, ds.category, ds.type, ds.format]);
      console.log(`Registered known dataset: ${ds.key}`);
    } catch (e: any) {
      if (e.message.includes('relation "gis_data_sources" does not exist')) {
        console.error(`PostGIS missing or migrations not run. Cannot register ${ds.key}.`);
        break; // Stop loop if table is missing
      }
      console.warn(`Could not insert ${ds.key}:`, e.message);
    }
  }
}
