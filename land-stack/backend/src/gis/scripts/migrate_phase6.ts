import { queryPostGIS } from '../config/db';

async function runMigration() {
  console.log('Starting Phase 6 Migrations...');
  
  try {
    // 0. Ensure PostGIS is enabled
    await queryPostGIS('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('Enabled PostGIS extension.');
    
    // 1. Create gis_data_sources
    await queryPostGIS(`
      CREATE TABLE IF NOT EXISTS gis_data_sources (
        id SERIAL PRIMARY KEY,
        dataset_key VARCHAR(255) UNIQUE NOT NULL,
        dataset_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        source_organization VARCHAR(255),
        source_system VARCHAR(255),
        source_url TEXT,
        api_url TEXT,
        download_url TEXT,
        service_type VARCHAR(50),
        format VARCHAR(50),
        geometry_type VARCHAR(50),
        source_srid INTEGER,
        target_srid INTEGER,
        license_status VARCHAR(100),
        authorization_status VARCHAR(100),
        data_status VARCHAR(100),
        last_checked_at TIMESTAMP WITH TIME ZONE,
        last_downloaded_at TIMESTAMP WITH TIME ZONE,
        last_imported_at TIMESTAMP WITH TIME ZONE,
        source_version VARCHAR(100),
        record_count INTEGER,
        checksum VARCHAR(255),
        notes TEXT
      );
    `);
    console.log('Created gis_data_sources table.');

    // 2. Add provenance columns to existing tables
    const tablesToUpdate = ['districts', 'subdistricts', 'villages', 'roads', 'waterbodies', 'landuse', 'geology', 'soil', 'risk_zones'];
    
    for (const table of tablesToUpdate) {
      const sql = `
        ALTER TABLE ${table}
        ADD COLUMN IF NOT EXISTS source_dataset_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS source_record_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS source_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS source_organization VARCHAR(255),
        ADD COLUMN IF NOT EXISTS source_last_updated TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS import_batch_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS original_attributes JSONB;
      `;
      try {
        await queryPostGIS(sql);
        console.log(`Added provenance columns to ${table}.`);
      } catch (err: any) {
        console.log(`Warning altering ${table}: ${err.message}`);
      }
    }

    // 3. Create missing tables requested in Phase 6
    const newTables = ['gis_forests', 'gis_schools', 'gis_government_offices', 'gis_tanks', 'gis_rivers', 'gis_protected_areas', 'gis_sipcot_estates'];
    
    for (const table of newTables) {
      await queryPostGIS(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          geom geometry(Geometry, 4326),
          geom_text TEXT,
          source_dataset_id VARCHAR(255),
          source_record_id VARCHAR(255),
          source_name VARCHAR(255),
          source_organization VARCHAR(255),
          source_url TEXT,
          source_last_updated TIMESTAMP WITH TIME ZONE,
          imported_at TIMESTAMP WITH TIME ZONE,
          import_batch_id VARCHAR(255),
          original_attributes JSONB
        );
      `);
      console.log(`Created new table ${table}.`);
      
      // Add GiST index
      await queryPostGIS(`
        CREATE INDEX IF NOT EXISTS idx_${table}_geom ON ${table} USING GIST (geom);
      `);
      console.log(`Created spatial index for ${table}.`);
    }

    // Add GiST index for existing tables if missing (although they probably exist)
    for (const table of tablesToUpdate) {
      try {
        await queryPostGIS(`
          CREATE INDEX IF NOT EXISTS idx_${table}_geom ON ${table} USING GIST (geom);
        `);
      } catch (e) {}
    }
    
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
