import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

async function createAllTables() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'Praveen@2005';
  const dbName = process.env.PGDATABASE || 'landstack_gis';

  console.log(`==========================================================`);
  console.log(`🛠️  Creating Full Relational Schema in database '${dbName}'`);
  console.log(`==========================================================`);

  const client = new Client({ host, port, user, password, database: dbName });
  await client.connect();

  const sqlStatements = [
    // 1. Roles Table
    `CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      role_code VARCHAR(50) UNIQUE NOT NULL,
      role_name VARCHAR(100) NOT NULL,
      description TEXT,
      level_rank INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 2. Permissions Table
    `CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      permission_code VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 3. Role Permissions Join Table
    `CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );`,

    // 4. Officers Table
    `CREATE TABLE IF NOT EXISTS officers (
      id SERIAL PRIMARY KEY,
      officer_code VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      badge_number VARCHAR(100),
      designation VARCHAR(150) NOT NULL,
      role_id INTEGER REFERENCES roles(id),
      department VARCHAR(150) DEFAULT 'Revenue & Disaster Management',
      is_active BOOLEAN DEFAULT TRUE,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 5. Officer Jurisdictions Table
    `CREATE TABLE IF NOT EXISTS officer_jurisdictions (
      id SERIAL PRIMARY KEY,
      officer_id INTEGER REFERENCES officers(id) ON DELETE CASCADE,
      state_code VARCHAR(10),
      state_name VARCHAR(100),
      district_name VARCHAR(100),
      subdistrict_name VARCHAR(100),
      village_name VARCHAR(100),
      is_primary BOOLEAN DEFAULT TRUE,
      assigned_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 6. States Table
    `CREATE TABLE IF NOT EXISTS states (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      lgd_code VARCHAR(50),
      source VARCHAR(100) DEFAULT 'SURVEY_OF_INDIA',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 7. Districts Table
    `CREATE TABLE IF NOT EXISTS districts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
      state_name VARCHAR(100) NOT NULL,
      lgd_code VARCHAR(50),
      source VARCHAR(100) DEFAULT 'SURVEY_OF_INDIA',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 8. Subdistricts (Taluks) Table
    `CREATE TABLE IF NOT EXISTS subdistricts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
      district_name VARCHAR(100) NOT NULL,
      state_name VARCHAR(100) NOT NULL,
      lgd_code VARCHAR(50),
      source VARCHAR(100) DEFAULT 'SURVEY_OF_INDIA',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 9. Villages Table
    `CREATE TABLE IF NOT EXISTS villages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      subdistrict VARCHAR(100) NOT NULL,
      district_name VARCHAR(100) NOT NULL,
      state_name VARCHAR(100) NOT NULL,
      village_lgd VARCHAR(50),
      subdistrict_lgd VARCHAR(50),
      district_lgd VARCHAR(50),
      state_lgd VARCHAR(50),
      category VARCHAR(50),
      shape_area NUMERIC,
      shape_leng NUMERIC,
      remarks TEXT,
      source VARCHAR(100) DEFAULT 'STATE_REVENUE_RECORDS',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 10. Core Parcels Table (Flat API view)
    `CREATE TABLE IF NOT EXISTS parcels (
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
    );`,

    // 11. Land Parcels Normalized Table
    `CREATE TABLE IF NOT EXISTS land_parcels (
      id SERIAL PRIMARY KEY,
      ulpin VARCHAR(50) UNIQUE,
      survey_number VARCHAR(50) NOT NULL,
      subdivision VARCHAR(50),
      state_name VARCHAR(100) NOT NULL,
      district_name VARCHAR(100) NOT NULL,
      subdistrict VARCHAR(100) NOT NULL,
      village_name VARCHAR(100) NOT NULL,
      area_sq_meters NUMERIC(15, 2),
      area_acres NUMERIC(10, 4),
      land_classification VARCHAR(100),
      zoning_type VARCHAR(100),
      source VARCHAR(100) DEFAULT 'CADASTRAL_SURVEY_RECORD',
      source_url TEXT,
      dataset_version VARCHAR(50),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 12. Land Records (Patta / Ownership) Table
    `CREATE TABLE IF NOT EXISTS land_records (
      id SERIAL PRIMARY KEY,
      parcel_id INTEGER REFERENCES land_parcels(id) ON DELETE CASCADE,
      patta_number VARCHAR(100),
      owner_name VARCHAR(200) NOT NULL,
      joint_owners TEXT,
      sro_name VARCHAR(150),
      registration_doc_no VARCHAR(100),
      registration_date DATE,
      market_value_per_sqft NUMERIC(10, 2),
      encumbrance_status VARCHAR(100),
      property_tax_status VARCHAR(100),
      court_case_status VARCHAR(100),
      source_reference VARCHAR(150),
      last_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 13. GIS Datasets Metadata Registry
    `CREATE TABLE IF NOT EXISTS gis_datasets (
      id SERIAL PRIMARY KEY,
      dataset_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      category VARCHAR(50) NOT NULL,
      source VARCHAR(200) NOT NULL,
      source_url TEXT,
      organization VARCHAR(200),
      version VARCHAR(50),
      publication_date DATE,
      download_date DATE,
      license TEXT,
      crs VARCHAR(50) DEFAULT 'EPSG:4326',
      coverage VARCHAR(100),
      scale VARCHAR(50),
      resolution VARCHAR(50),
      source_status VARCHAR(20) DEFAULT 'REAL' CHECK (source_status IN ('MOCK', 'REAL', 'DERIVED')),
      last_updated TIMESTAMPTZ,
      ingested_at TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'staging', 'archived', 'error'))
    );`,

    // 14. Geology Layer Table
    `CREATE TABLE IF NOT EXISTS geology (
      id SERIAL PRIMARY KEY,
      geology_code VARCHAR(50),
      unit_name VARCHAR(200),
      rock_formation VARCHAR(150),
      lithology VARCHAR(150),
      geomorphology_unit VARCHAR(150),
      rock_type VARCHAR(100),
      age VARCHAR(100),
      formation VARCHAR(200),
      description TEXT,
      bearing_capacity_kpa INTEGER,
      gsi_report_id VARCHAR(50),
      source VARCHAR(100) DEFAULT 'GEOLOGICAL_SURVEY_OF_INDIA',
      source_url TEXT,
      dataset_version VARCHAR(50),
      dataset_id VARCHAR(100),
      scale VARCHAR(50),
      survey_year INTEGER,
      confidence VARCHAR(20),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 15. Soil Layer Table
    `CREATE TABLE IF NOT EXISTS soil (
      id SERIAL PRIMARY KEY,
      soil_type VARCHAR(100),
      texture VARCHAR(100),
      permeability VARCHAR(50),
      bearing_capacity_kpa INTEGER,
      source VARCHAR(100) DEFAULT 'NBSS_LUP',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 16. Land Use Layer Table
    `CREATE TABLE IF NOT EXISTS landuse (
      id SERIAL PRIMARY KEY,
      classification VARCHAR(100),
      current_use VARCHAR(150),
      source VARCHAR(100) DEFAULT 'NRSC_BHUVAN',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 17. Waterbodies Layer Table
    `CREATE TABLE IF NOT EXISTS waterbodies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150),
      water_type VARCHAR(50),
      buffer_zone_meters INTEGER DEFAULT 50,
      source VARCHAR(100) DEFAULT 'CWRDM_WATER_RESOURCES',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 18. Roads Layer Table
    `CREATE TABLE IF NOT EXISTS roads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150),
      road_type VARCHAR(50),
      width_meters INTEGER,
      source VARCHAR(100) DEFAULT 'NHAI_PWD',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 19. Risk Zones Layer Table
    `CREATE TABLE IF NOT EXISTS risk_zones (
      id SERIAL PRIMARY KEY,
      hazard_type VARCHAR(50),
      risk_level VARCHAR(20),
      description TEXT,
      source VARCHAR(100) DEFAULT 'NDMA_DISASTER_MAP',
      source_url TEXT,
      dataset_id VARCHAR(100),
      geom_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 20. Cases Table (Officer Workflow)
    `CREATE TABLE IF NOT EXISTS cases (
      id SERIAL PRIMARY KEY,
      case_number VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      case_type VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN (
        'NEW', 'DOCUMENT_VERIFICATION', 'GIS_ANALYSIS', 'FIELD_INSPECTION', 
        'OFFICER_REVIEW', 'RECOMMENDATION', 'APPROVED', 'REJECTED', 'CLOSED'
      )),
      priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
      parcel_id INTEGER REFERENCES land_parcels(id),
      latitude NUMERIC(10, 7) NOT NULL,
      longitude NUMERIC(10, 7) NOT NULL,
      state_name VARCHAR(100) NOT NULL,
      district_name VARCHAR(100) NOT NULL,
      subdistrict VARCHAR(100) NOT NULL,
      village_name VARCHAR(100) NOT NULL,
      assigned_officer_id INTEGER REFERENCES officers(id),
      created_by_officer_id INTEGER REFERENCES officers(id),
      risk_score NUMERIC(5, 2),
      risk_level VARCHAR(20),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 21. Case Documents Table
    `CREATE TABLE IF NOT EXISTS case_documents (
      id SERIAL PRIMARY KEY,
      case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      document_type VARCHAR(100) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_size_bytes BIGINT,
      mime_type VARCHAR(100),
      ocr_extracted_json JSONB,
      ocr_confidence NUMERIC(5, 2),
      verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'MISMATCH_DETECTED', 'REJECTED')),
      uploaded_by_officer_id INTEGER REFERENCES officers(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 22. Audit Logs Table (Provenance & Blockchain-style hash tracking)
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      officer_id INTEGER REFERENCES officers(id),
      officer_role VARCHAR(50),
      action_type VARCHAR(100) NOT NULL,
      case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
      parcel_id INTEGER REFERENCES land_parcels(id) ON DELETE SET NULL,
      ip_address VARCHAR(45),
      previous_state JSONB,
      new_state JSONB,
      provenance_note TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 23. GIS Ingestion Log Table
    `CREATE TABLE IF NOT EXISTS gis_ingestion_log (
      id SERIAL PRIMARY KEY,
      batch_id VARCHAR(50) NOT NULL,
      dataset_id VARCHAR(100),
      table_name VARCHAR(100) NOT NULL,
      source_file TEXT,
      records_read INTEGER DEFAULT 0,
      records_accepted INTEGER DEFAULT 0,
      records_rejected INTEGER DEFAULT 0,
      invalid_geometries INTEGER DEFAULT 0,
      detected_crs VARCHAR(50),
      target_crs VARCHAR(50) DEFAULT 'EPSG:4326',
      coverage_bbox TEXT,
      duration_ms INTEGER,
      status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
      error_message TEXT,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );`,

    // 24. TN Administrative Officers Public Directory
    // Separate from the auth `officers` table (which has password_hash).
    // Populated by: npm run gis:seed-officers
    `CREATE TABLE IF NOT EXISTS tn_administrative_officers (
      id SERIAL PRIMARY KEY,
      state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
      district VARCHAR(100) NOT NULL,
      administrative_level VARCHAR(50) NOT NULL,
      designation VARCHAR(200) NOT NULL,
      officer_name VARCHAR(200),
      official_email VARCHAR(150),
      official_mobile VARCHAR(20),
      office_landline VARCHAR(20),
      source_url TEXT,
      verified_date DATE,
      data_status VARCHAR(50) NOT NULL DEFAULT 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_tn_officers_district ON tn_administrative_officers (district);`,
    `CREATE INDEX IF NOT EXISTS idx_tn_officers_designation ON tn_administrative_officers (designation);`,

    // 25. Data status columns: distinguish REAL govt data vs SYNTHETIC_DEMO_DATA
    `ALTER TABLE land_parcels ADD COLUMN IF NOT EXISTS data_status VARCHAR(50) NOT NULL DEFAULT 'SYNTHETIC_DEMO_DATA';`,
    `ALTER TABLE land_parcels ADD COLUMN IF NOT EXISTS data_note TEXT;`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS data_status VARCHAR(50) NOT NULL DEFAULT 'SYNTHETIC_DEMO_DATA';`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS data_note TEXT;`,
    // Real TN land document fields (Patta / Chitta / Adangal schema)
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS document_type VARCHAR(50);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS sub_division_number VARCHAR(50);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS land_type VARCHAR(50);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS extent_hectares NUMERIC(10, 4);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS extent_ares NUMERIC(10, 4);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS extent_sqm NUMERIC(15, 2);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS tax_amount_inr NUMERIC(12, 2);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS owner_relationship VARCHAR(100);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS guideline_value_per_sqm NUMERIC(12, 2);`,
    `ALTER TABLE land_records ADD COLUMN IF NOT EXISTS guideline_value_source VARCHAR(100);`,
  ];

  let count = 0;
  for (const sql of sqlStatements) {
    try {
      await client.query(sql);
      count++;
    } catch (err: any) {
      console.warn(`  ⚠️ Table statement warning: ${err.message}`);
    }
  }

  console.log(`✅ Successfully executed ${count}/${sqlStatements.length} table creation statements.`);

  // Query final table list from information_schema
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log(`\n📋 Final Tables in '${dbName}' (${res.rows.length} total):`);
  res.rows.forEach((r, i) => console.log(`   ${i + 1}. ${r.table_name}`));

  await client.end();
  console.log('\n✨ Database Schema Creation Completed Successfully!');
}

createAllTables().catch(console.error);
