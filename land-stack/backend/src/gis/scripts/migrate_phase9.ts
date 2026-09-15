import 'dotenv/config';
import { queryPostGIS } from '../config/db.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  console.log('Running Phase 9 TNGIS Actual Data Migrations...');

  try {
    const sqlPath = path.join(process.cwd(), 'src', 'gis', 'scripts', 'tngis_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await queryPostGIS(sql);

    console.log('✅ Phase 9 Migrations completed successfully.');
    console.log('Tables created: tngis_layer_sources, gis_districts, gis_taluks, etc.');
  } catch (error: any) {
    if (error.message === 'POSTGIS_NOT_CONFIGURED') {
      console.warn('⚠️ PostGIS is not configured or reachable. Skipping migration.');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  }
  process.exit(0);
}

runMigration();
