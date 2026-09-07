-- ====================================================================
-- LAND STACK Phase 5: Real GIS Data Integration Schema Migration
-- Run this AFTER schema.sql (Phase 4 base schema)
-- ====================================================================

-- ============================================================
-- 1. DATASET CATALOG — provenance registry for all GIS datasets
-- ============================================================
CREATE TABLE IF NOT EXISTS gis_datasets (
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
  attribution TEXT,
  crs VARCHAR(50) DEFAULT 'EPSG:4326',
  coverage VARCHAR(100),
  scale VARCHAR(50),
  resolution VARCHAR(50),
  source_status VARCHAR(20) DEFAULT 'REAL' CHECK (source_status IN ('MOCK', 'REAL', 'DERIVED')),
  last_updated TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'staging', 'archived', 'error')),
  record_count INTEGER,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_gis_datasets_category ON gis_datasets (category);
CREATE INDEX IF NOT EXISTS idx_gis_datasets_status ON gis_datasets (status);
CREATE INDEX IF NOT EXISTS idx_gis_datasets_source_status ON gis_datasets (source_status);

-- ============================================================
-- 2. PROVENANCE COLUMNS — add source tracking to ALL tables
-- ============================================================

-- States
ALTER TABLE states ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MOCK_SURVEY';
ALTER TABLE states ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE states ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE states ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE states ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Districts
ALTER TABLE districts ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MOCK_SURVEY';
ALTER TABLE districts ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE districts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE districts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

"-- Villages
ALTER TABLE villages ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MOCK_SURVEY';
ALTER TABLE villages ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE villages ADD COLUMN IF NOT EXISTS village_lgd VARCHAR(50);
ALTER TABLE villages ADD COLUMN IF NOT EXISTS subdistrict_lgd VARCHAR(50);
ALTER TABLE villages ADD COLUMN IF NOT EXISTS district_lgd VARCHAR(50);
ALTER TABLE villages ADD COLUMN IF NOT EXISTS state_lgd VARCHAR(50);
ALTER TABLE villages ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE villages ADD COLUMN IF NOT EXISTS shape_area NUMERIC;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS shape_leng NUMERIC;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE villages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_villages_state_dist ON villages (state_name, district_name);
CREATE INDEX IF NOT EXISTS idx_villages_village_lgd ON villages (village_lgd);

-- Soil
ALTER TABLE soil ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MOCK';
ALTER TABLE soil ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE soil ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE soil ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE soil ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Land Use
ALTER TABLE landuse ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE landuse ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE landuse ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE landuse ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Waterbodies
ALTER TABLE waterbodies ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MOCK';
ALTER TABLE waterbodies ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE waterbodies ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE waterbodies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE waterbodies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Roads
ALTER TABLE roads ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MOCK';
ALTER TABLE roads ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE roads ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE roads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE roads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Risk Zones
ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MOCK';
ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 3. EXTENDED GEOLOGY TABLE — GSI data model
-- ============================================================
ALTER TABLE geology ADD COLUMN IF NOT EXISTS geology_code VARCHAR(50);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS unit_name VARCHAR(200);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS rock_type VARCHAR(100);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS age VARCHAR(100);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS formation VARCHAR(200);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE geology ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MOCK_GSI';
ALTER TABLE geology ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE geology ADD COLUMN IF NOT EXISTS dataset_version VARCHAR(50);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(100);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS scale VARCHAR(50);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS survey_year INTEGER;
ALTER TABLE geology ADD COLUMN IF NOT EXISTS confidence VARCHAR(20);
ALTER TABLE geology ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE geology ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 4. STAGING TABLES — for safe import of large real datasets
-- ============================================================

-- Geology staging
CREATE TABLE IF NOT EXISTS geology_staging (
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
  source VARCHAR(50) DEFAULT 'REAL_GSI',
  source_url TEXT,
  dataset_version VARCHAR(50),
  dataset_id VARCHAR(100),
  scale VARCHAR(50),
  survey_year INTEGER,
  confidence VARCHAR(20),
  geom GEOMETRY(MultiPolygon, 4326),
  import_batch_id VARCHAR(50),
  validated BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geology_staging_geom ON geology_staging USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_geology_staging_batch ON geology_staging (import_batch_id);

-- States staging
CREATE TABLE IF NOT EXISTS states_staging (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10),
  source VARCHAR(50) DEFAULT 'REAL',
  source_url TEXT,
  dataset_id VARCHAR(100),
  geom GEOMETRY(MultiPolygon, 4326),
  import_batch_id VARCHAR(50),
  validated BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_states_staging_geom ON states_staging USING GIST (geom);

-- Districts staging
CREATE TABLE IF NOT EXISTS districts_staging (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_id INTEGER,
  state_name VARCHAR(100),
  source VARCHAR(50) DEFAULT 'REAL',
  source_url TEXT,
  dataset_id VARCHAR(100),
  geom GEOMETRY(MultiPolygon, 4326),
  import_batch_id VARCHAR(50),
  validated BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_districts_staging_geom ON districts_staging USING GIST (geom);

-- ============================================================
-- 5. INGESTION LOG — track every import operation
-- ============================================================
CREATE TABLE IF NOT EXISTS gis_ingestion_log (
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
);
CREATE INDEX IF NOT EXISTS idx_ingestion_log_batch ON gis_ingestion_log (batch_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_log_dataset ON gis_ingestion_log (dataset_id);
