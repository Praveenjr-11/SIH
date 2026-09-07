/**
 * Real Data Importer — Master script for Phase 5
 * 
 * Downloads and imports verified real GIS datasets into PostGIS.
 * 
 * Usage:
 *   npm run gis:import-real      — import all available real datasets
 *   npm run gis:import-boundaries — import geoBoundaries only
 *   npm run gis:import-gsi       — import GSI geology only
 */

import { importAllGeoBoundaries } from '../ingestion/sources/geoBoundaries.js';
import { importAllGsiData } from '../ingestion/sources/gsiGeology.js';
import { datasetCatalogService } from '../services/datasetCatalog.js';
import { testPostGISConnection } from '../config/db.js';

async function main() {
  const command = process.argv[2] || 'all';

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  LAND STACK — Phase 5 Real Data Import Pipeline`);
  console.log(`  Command: ${command}`);
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log(`${'═'.repeat(60)}\n`);

  // Check PostGIS connectivity
  const dbConnected = await testPostGISConnection();
  if (!dbConnected) {
    console.error('❌ PostGIS is not connected. Real data import requires a running PostgreSQL+PostGIS instance.');
    console.log('\nTo set up PostGIS:');
    console.log('  1. Install PostgreSQL with PostGIS extension');
    console.log('  2. Create database: landstack_gis');
    console.log('  3. Run schema: psql -d landstack_gis -f src/gis/config/schema.sql');
    console.log('  4. Run Phase 5 migration: psql -d landstack_gis -f src/gis/config/schema_phase5.sql');
    console.log('  5. Set env vars: PGHOST, PGDATABASE, PGUSER, PGPASSWORD');
    console.log('\nThe pipeline will still download and validate datasets even without PostGIS.');
  }

  try {
    switch (command) {
      case 'boundaries':
        await importAllGeoBoundaries();
        break;

      case 'gsi':
        await importAllGsiData();
        break;

      case 'all':
      default:
        // Register mock datasets first (so catalog is populated)
        await datasetCatalogService.registerMockDatasets();

        // Import real boundaries
        await importAllGeoBoundaries();

        // Import any available GSI data
        await importAllGsiData();
        break;
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  Import Pipeline Completed`);
    console.log(`  Finished: ${new Date().toISOString()}`);
    console.log(`${'═'.repeat(60)}\n`);

  } catch (err) {
    console.error(`\n❌ Import pipeline error: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
