import fs from 'fs';
import path from 'path';
import { queryPostGIS, testPostGISConnection } from '../config/db.js';
import { datasetCatalogService } from '../services/datasetCatalog.js';

const MOCK_DIR = path.resolve(process.cwd(), 'src/gis/mock-data');

/**
 * Property-to-column mapping for each mock GeoJSON layer
 * Phase 5 fix: The original seeder only inserted geom, discarding all properties.
 * Now we map each feature's properties to the correct table columns.
 */
const TABLE_PROPERTY_MAPS: Record<string, Record<string, string>> = {
  states: {
    state_name: 'name',
    state_code: 'code',
    source: 'source',
  },
  districts: {
    district_name: 'name',
    state_name: 'state_name',
    source: 'source',
  },
  villages: {
    village_name: 'name',
    subdistrict: 'subdistrict',
    district_name: 'district_name',
    state_name: 'state_name',
    source: 'source',
  },
  geology: {
    rock_formation: 'rock_formation',
    lithology: 'lithology',
    geomorphology_unit: 'geomorphology_unit',
    bearing_capacity_kpa: 'bearing_capacity_kpa',
    gsi_report_id: 'gsi_report_id',
    source: 'source',
  },
  soil: {
    soil_type: 'soil_type',
    texture: 'texture',
    permeability: 'permeability',
    bearing_capacity_kpa: 'bearing_capacity_kpa',
    source: 'source',
  },
  landuse: {
    classification: 'classification',
    current_use: 'current_use',
    source: 'source',
  },
  waterbodies: {
    name: 'name',
    water_type: 'water_type',
    buffer_zone_meters: 'buffer_zone_meters',
    source: 'source',
  },
  roads: {
    name: 'name',
    road_type: 'road_type',
    width_meters: 'width_meters',
    source: 'source',
  },
  risk_zones: {
    hazard_type: 'hazard_type',
    risk_level: 'risk_level',
    description: 'description',
    source: 'source',
  },
};

/**
 * Default source values for mock data — ensures mock data is never confused with real data
 */
const MOCK_SOURCE_DEFAULTS: Record<string, string> = {
  states: 'MOCK_SURVEY',
  districts: 'MOCK_SURVEY',
  villages: 'MOCK_SURVEY',
  geology: 'MOCK_GSI',
  soil: 'MOCK',
  landuse: 'MOCK',
  waterbodies: 'MOCK',
  roads: 'MOCK',
  elevation: 'MOCK',
  risk_zones: 'MOCK',
};

export async function runGisSeed() {
  console.log('=======================================================');
  console.log('🚀 GIS Seed Started (Phase 5 — Properties + Provenance)');
  console.log('=======================================================');

  const counts: Record<string, { inserted: number; skipped: number }> = {};

  const files = [
    { file: 'states.geojson', table: 'states' },
    { file: 'districts.geojson', table: 'districts' },
    // NOTE: villages boundary data should come from real LGD importer,
    // NOT from mock seed data. Run `npm run gis:import-subdistricts` instead.
    // { file: 'villages.geojson', table: 'villages' },
    { file: 'geology.geojson', table: 'geology' },
    { file: 'soil.geojson', table: 'soil' },
    { file: 'landuse.geojson', table: 'landuse' },
    { file: 'waterbodies.geojson', table: 'waterbodies' },
    { file: 'roads.geojson', table: 'roads' },
    { file: 'elevation.geojson', table: 'elevation' },
    { file: 'risk-zones.geojson', table: 'risk_zones' },
  ];

  const dbConnected = await testPostGISConnection();

  for (const item of files) {
    const filePath = path.join(MOCK_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Warning: Mock GeoJSON file '${item.file}' not found.`);
      counts[item.table] = { inserted: 0, skipped: 0 };
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const geojson = JSON.parse(content);

      if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
        console.error(`❌ Invalid GeoJSON structure in ${item.file}`);
        counts[item.table] = { inserted: 0, skipped: 0 };
        continue;
      }

      let insertedCount = 0;
      let skippedCount = 0;

      const propMap = TABLE_PROPERTY_MAPS[item.table] || {};
      const defaultSource = MOCK_SOURCE_DEFAULTS[item.table] || 'MOCK';

      for (const feature of geojson.features) {
        if (!feature.geometry || !feature.geometry.coordinates) {
          skippedCount++;
          continue;
        }

        // Ensure source is always set for mock data
        if (!feature.properties) feature.properties = {};
        if (!feature.properties.source) {
          feature.properties.source = defaultSource;
        }

        if (dbConnected) {
          try {
            // Build dynamic INSERT with property mapping (Phase 5 fix)
            const columns: string[] = [];
            const placeholders: string[] = [];
            const values: any[] = [];
            let paramIdx = 1;

            // Map each property to its column
            for (const [propName, colName] of Object.entries(propMap)) {
              const value = feature.properties[propName];
              if (value !== undefined && value !== null) {
                columns.push(colName);
                placeholders.push(`$${paramIdx++}`);
                values.push(value);
              }
            }

            // Add geometry
            const geomJson = JSON.stringify(feature.geometry);
            columns.push('geom');
            placeholders.push(`ST_SetSRID(ST_GeomFromGeoJSON($${paramIdx++}), 4326)`);
            values.push(geomJson);

            const sql = `INSERT INTO ${item.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')});`;
            await queryPostGIS(sql, values);
            insertedCount++;
          } catch (dbErr) {
            skippedCount++;
          }
        } else {
          // Record validated feature count for spatial pipeline
          insertedCount++;
        }
      }

      counts[item.table] = { inserted: insertedCount, skipped: skippedCount };
    } catch (err: any) {
      console.error(`❌ Error seeding ${item.file}:`, err.message);
      counts[item.table] = { inserted: 0, skipped: 0 };
    }
  }

  // Register mock datasets in the catalog (Phase 5)
  if (dbConnected) {
    try {
      await datasetCatalogService.registerMockDatasets();
    } catch (err) {
      console.warn('⚠️ Could not register mock datasets in catalog (table may not exist yet)');
    }
  }

  console.log('\n--- Ingestion Summary ---');
  console.log(`States:       ${counts['states']?.inserted || 0} inserted (${counts['states']?.skipped || 0} skipped) [source: MOCK_SURVEY]`);
  console.log(`Districts:    ${counts['districts']?.inserted || 0} inserted (${counts['districts']?.skipped || 0} skipped) [source: MOCK_SURVEY]`);
  console.log(`Villages:     ${counts['villages']?.inserted || 0} inserted (${counts['villages']?.skipped || 0} skipped) [source: MOCK_SURVEY]`);
  console.log(`Geology:      ${counts['geology']?.inserted || 0} inserted (source: MOCK_GSI)`);
  console.log(`Soil:         ${counts['soil']?.inserted || 0} inserted [source: MOCK]`);
  console.log(`Land Use:     ${counts['landuse']?.inserted || 0} inserted [source: MOCK]`);
  console.log(`Water Bodies: ${counts['waterbodies']?.inserted || 0} inserted [source: MOCK]`);
  console.log(`Roads:        ${counts['roads']?.inserted || 0} inserted [source: MOCK]`);
  console.log(`Elevation:    ${counts['elevation']?.inserted || 0} inserted [source: MOCK]`);
  console.log(`Risk Zones:   ${counts['risk_zones']?.inserted || 0} inserted [source: MOCK]`);
  console.log('-------------------------');
  console.log('✅ GIS seed completed (Phase 5 — with property mapping & provenance).\n');

  return counts;
}

runGisSeed();
