import pg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const { Client } = pg;

async function run() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'Praveen@2005';
  const dbName = process.env.PGDATABASE || 'landstack_gis';

  console.log(`[Setup] Connecting to PostgreSQL at ${host}:${port} as user '${user}'...`);

  // Step 1: Ensure database exists
  const adminClient = new Client({ host, port, user, password, database: 'postgres' });
  await adminClient.connect();
  const dbCheck = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (dbCheck.rows.length === 0) {
    console.log(`[Setup] Creating database '${dbName}'...`);
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
    console.log(`[Setup] Database '${dbName}' created successfully.`);
  } else {
    console.log(`[Setup] Database '${dbName}' already exists.`);
  }
  await adminClient.end();

  // Step 2: Connect to target database
  const dbClient = new Client({ host, port, user, password, database: dbName });
  await dbClient.connect();
  console.log(`[Setup] Connected to database '${dbName}'.`);

  // Check if PostGIS extension is available
  let hasPostGIS = false;
  try {
    await dbClient.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    hasPostGIS = true;
    console.log('[Setup] Extension PostGIS enabled/verified.');
  } catch (e: any) {
    console.warn('[Setup] Note: PostGIS extension not available in local PostgreSQL. Falling back to standard relational tables.');
  }

  // Create core parcels table
  const createParcelsTable = `
    CREATE TABLE IF NOT EXISTS parcels (
      id SERIAL PRIMARY KEY,
      ulpin VARCHAR(50) UNIQUE NOT NULL,
      survey_number VARCHAR(50) NOT NULL,
      subdivision VARCHAR(50),
      village_name VARCHAR(100),
      taluk_name VARCHAR(100),
      district_name VARCHAR(100),
      state_name VARCHAR(100),
      area_acres NUMERIC(10, 4),
      area_sq_meters NUMERIC(15, 2),
      land_classification VARCHAR(100),
      current_use TEXT,
      owner_name VARCHAR(200),
      owner_aadhaar_hash VARCHAR(255),
      registration_doc_no VARCHAR(100),
      registration_date DATE,
      encumbrance_status VARCHAR(100),
      verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED'
        CHECK (verification_status IN ('UNVERIFIED', 'FIELD_SURVEYED', 'REGISTRAR_ENDORSED', 'IMMUTABLE', 'Verified', 'Pending', 'Disputed')),
      provenance_hash VARCHAR(64),
      zoning_details_json JSONB,
      property_tax_details_json JSONB,
      court_case_details_json JSONB,
      gsi_geology_json JSONB,
      digital_facets_json JSONB,
      source VARCHAR(100) DEFAULT 'MOCK_SEED',
      ingested_at TIMESTAMPTZ DEFAULT NOW(),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_parcels_ulpin ON parcels (ulpin);
    CREATE INDEX IF NOT EXISTS idx_parcels_state_dist ON parcels (state_name, district_name);
    CREATE INDEX IF NOT EXISTS idx_parcels_verification ON parcels (verification_status);
  `;

  await dbClient.query(createParcelsTable);
  console.log('[Setup] Created/verified table: parcels');

  if (hasPostGIS) {
    try {
      await dbClient.query('ALTER TABLE parcels ADD COLUMN IF NOT EXISTS geom GEOMETRY(MultiPolygon, 4326);');
      await dbClient.query('CREATE INDEX IF NOT EXISTS idx_parcels_geom ON parcels USING GIST (geom);');
    } catch (e: any) {
      console.warn('[Setup] Skipped spatial column addition:', e.message);
    }
  }

  await dbClient.end();
  console.log('[Setup] Database setup completed successfully!');
}

run().catch(console.error);
