import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function initPostGisSchema() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'Praveen@2005';
  const dbName = process.env.PGDATABASE || 'landstack_gis';

  console.log(`====================================================`);
  console.log(`INIT POSTGIS SCHEMA: ${dbName} at ${host}:${port}`);
  console.log(`====================================================\n`);

  const client = new Client({ host, port, user, password, database: dbName });
  await client.connect();

  try {
    // 1. Enable PostGIS
    console.log('Enabling PostGIS extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    // 2. Run schema_sih2026.sql
    const schemaFile1 = path.resolve(process.cwd(), 'src', 'gis', 'config', 'schema_sih2026.sql');
    if (fs.existsSync(schemaFile1)) {
      console.log(`Executing ${path.basename(schemaFile1)}...`);
      const sql1 = fs.readFileSync(schemaFile1, 'utf-8');
      await client.query(sql1);
    }

    // 3. Run schema_parcels.sql
    const schemaFile2 = path.resolve(process.cwd(), 'src', 'gis', 'config', 'schema_parcels.sql');
    if (fs.existsSync(schemaFile2)) {
      console.log(`Executing ${path.basename(schemaFile2)}...`);
      const sql2 = fs.readFileSync(schemaFile2, 'utf-8');
      await client.query(sql2);
    }

    // 4. Add missing geom / record_count columns if tables existed previously without them
    console.log('Verifying spatial columns...');
    await client.query(`
      ALTER TABLE subdistricts ADD COLUMN IF NOT EXISTS geom GEOMETRY(Geometry, 4326);
      ALTER TABLE districts ADD COLUMN IF NOT EXISTS geom GEOMETRY(Geometry, 4326);
      ALTER TABLE villages ADD COLUMN IF NOT EXISTS geom GEOMETRY(Geometry, 4326);
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS geom GEOMETRY(Geometry, 4326);
      ALTER TABLE gis_datasets ADD COLUMN IF NOT EXISTS record_count INTEGER DEFAULT 0;
      ALTER TABLE gis_datasets ADD COLUMN IF NOT EXISTS coverage_bbox GEOMETRY(Polygon, 4326);
      CREATE INDEX IF NOT EXISTS idx_subdistricts_geom ON subdistricts USING GIST (geom);
      CREATE INDEX IF NOT EXISTS idx_districts_geom ON districts USING GIST (geom);
      CREATE INDEX IF NOT EXISTS idx_villages_geom ON villages USING GIST (geom);
    `);

    console.log('✅ PostGIS database schema initialized successfully!\n');
  } catch (err: any) {
    console.error('❌ Schema initialization error:', err.message);
  } finally {
    await client.end();
  }
}

initPostGisSchema().catch(console.error);
