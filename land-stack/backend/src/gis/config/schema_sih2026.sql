-- ====================================================================
-- LAND STACK — SIH 2026 Comprehensive PostGIS Database Schema
-- Phase 1 Foundation: Normalized Entities, RBAC, Cases, Spatial Indexing
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  role_code VARCHAR(50) UNIQUE NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  level_rank INTEGER NOT NULL, -- 1: State, 2: District, 3: DRO, 4: RDO, 5: Tahsildar, 6: Deputy Tahsildar, 7: RI, 8: VAO, 9: Survey Officer, 10: Admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  permission_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 2. OFFICERS & JURISDICTIONS
CREATE TABLE IF NOT EXISTS officers (
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
);

CREATE TABLE IF NOT EXISTS officer_jurisdictions (
  id SERIAL PRIMARY KEY,
  officer_id INTEGER REFERENCES officers(id) ON DELETE CASCADE,
  state_code VARCHAR(10),
  state_name VARCHAR(100),
  district_name VARCHAR(100),
  subdistrict_name VARCHAR(100), -- Taluk / Tehsil
  village_name VARCHAR(100),
  is_primary BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_officer_jur_lookup ON officer_jurisdictions (officer_id, state_name, district_name, subdistrict_name);

-- 3. ADMINISTRATIVE BOUNDARIES & CADASTRAL PARCELS
CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  lgd_code VARCHAR(50),
  source VARCHAR(100) DEFAULT 'SURVEY_OF_INDIA',
  source_url TEXT,
  dataset_id VARCHAR(100),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_states_geom ON states USING GIST (geom);

CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
  state_name VARCHAR(100) NOT NULL,
  lgd_code VARCHAR(50),
  source VARCHAR(100) DEFAULT 'SURVEY_OF_INDIA',
  source_url TEXT,
  dataset_id VARCHAR(100),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_districts_geom ON districts USING GIST (geom);

CREATE TABLE IF NOT EXISTS subdistricts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
  district_name VARCHAR(100) NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  lgd_code VARCHAR(50),
  source VARCHAR(100) DEFAULT 'SURVEY_OF_INDIA',
  source_url TEXT,
  dataset_id VARCHAR(100),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subdistricts_geom ON subdistricts USING GIST (geom);

CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subdistrict VARCHAR(100) NOT NULL,
  district_name VARCHAR(100) NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  village_lgd VARCHAR(50),
  source VARCHAR(100) DEFAULT 'STATE_REVENUE_RECORDS',
  source_url TEXT,
  dataset_id VARCHAR(100),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_villages_geom ON villages USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_villages_state_dist_sub ON villages (state_name, district_name, subdistrict);

CREATE TABLE IF NOT EXISTS land_parcels (
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
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_land_parcels_geom ON land_parcels USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_land_parcels_ulpin ON land_parcels (ulpin);
CREATE INDEX IF NOT EXISTS idx_land_parcels_survey ON land_parcels (state_name, district_name, subdistrict, village_name, survey_number);

CREATE TABLE IF NOT EXISTS land_records (
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
);
CREATE INDEX IF NOT EXISTS idx_land_records_patta ON land_records (patta_number);

-- 4. SPATIAL THEMATIC LAYERS (GSI, Soil, Water, Roads, Elevation, Forest, Hazards)
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
  crs VARCHAR(50) DEFAULT 'EPSG:4326',
  coverage VARCHAR(100),
  scale VARCHAR(50),
  resolution VARCHAR(50),
  source_status VARCHAR(20) DEFAULT 'REAL' CHECK (source_status IN ('MOCK', 'REAL', 'DERIVED')),
  last_updated TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'staging', 'archived', 'error'))
);

CREATE TABLE IF NOT EXISTS gis_dataset_versions (
  id SERIAL PRIMARY KEY,
  dataset_id VARCHAR(100) REFERENCES gis_datasets(dataset_id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  change_log TEXT,
  ingested_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geology (
  id SERIAL PRIMARY KEY,
  geology_code VARCHAR(50),
  unit_name VARCHAR(200),
  rock_formation VARCHAR(150),
  lithology VARCHAR(150),
  geomorphology_unit VARCHAR(150),
  rock_type VARCHAR(100),
  age VARCHAR(100),
  formation VARCHAR(200),
  bearing_capacity_kpa INTEGER,
  gsi_report_id VARCHAR(50),
  source VARCHAR(100) DEFAULT 'GEOLOGICAL_SURVEY_OF_INDIA',
  source_url TEXT,
  dataset_version VARCHAR(50),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geology_geom ON geology USING GIST (geom);

CREATE TABLE IF NOT EXISTS soil (
  id SERIAL PRIMARY KEY,
  soil_type VARCHAR(100),
  texture VARCHAR(100),
  permeability VARCHAR(50),
  bearing_capacity_kpa INTEGER,
  source VARCHAR(100) DEFAULT 'NBSS_LUP',
  source_url TEXT,
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_soil_geom ON soil USING GIST (geom);

CREATE TABLE IF NOT EXISTS land_use (
  id SERIAL PRIMARY KEY,
  classification VARCHAR(100),
  current_use VARCHAR(150),
  source VARCHAR(100) DEFAULT 'NRSC_BHUVAN',
  source_url TEXT,
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_land_use_geom ON land_use USING GIST (geom);

CREATE TABLE IF NOT EXISTS water_bodies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  water_type VARCHAR(50), -- River, Canal, Lake, Wetland, Reservoir
  buffer_zone_meters INTEGER DEFAULT 50,
  source VARCHAR(100) DEFAULT 'CWRDM_WATER_RESOURCES',
  source_url TEXT,
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_water_bodies_geom ON water_bodies USING GIST (geom);

CREATE TABLE IF NOT EXISTS roads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  road_type VARCHAR(50), -- National Highway, State Highway, District Road, Local
  width_meters INTEGER,
  source VARCHAR(100) DEFAULT 'NHAI_PWD',
  source_url TEXT,
  geom GEOMETRY(MultiLineString, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roads_geom ON roads USING GIST (geom);

CREATE TABLE IF NOT EXISTS elevation (
  id SERIAL PRIMARY KEY,
  elevation_meters NUMERIC(7, 2),
  slope_degree NUMERIC(5, 2),
  source VARCHAR(100) DEFAULT 'SRTM_DEM',
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_elevation_geom ON elevation USING GIST (geom);

CREATE TABLE IF NOT EXISTS forest (
  id SERIAL PRIMARY KEY,
  forest_type VARCHAR(100),
  density VARCHAR(50),
  protection_status VARCHAR(100),
  source VARCHAR(100) DEFAULT 'FOREST_SURVEY_OF_INDIA',
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forest_geom ON forest USING GIST (geom);

CREATE TABLE IF NOT EXISTS hazard_zones (
  id SERIAL PRIMARY KEY,
  hazard_type VARCHAR(50), -- Flood, Landslide, Seismic, Environmental
  risk_level VARCHAR(20),  -- Low, Moderate, High, Severe
  description TEXT,
  source VARCHAR(100) DEFAULT 'NDMA_DISASTER_MAP',
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hazard_zones_geom ON hazard_zones USING GIST (geom);

-- 5. LAND CASES & CASE MANAGEMENT WORKFLOW
CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  case_type VARCHAR(100) NOT NULL, -- Zone Conversion, Mutation, Encroachment, Boundary Demarcation, NOC
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
);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (status);
CREATE INDEX IF NOT EXISTS idx_cases_officer ON cases (assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_cases_jurisdiction ON cases (state_name, district_name, subdistrict);

CREATE TABLE IF NOT EXISTS case_documents (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- Patta, Chitta, Sale Deed, Survey Map, NOC Order, Field Photo
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  ocr_extracted_json JSONB,
  ocr_confidence NUMERIC(5, 2),
  verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'MISMATCH_DETECTED', 'REJECTED')),
  uploaded_by_officer_id INTEGER REFERENCES officers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_case_docs_case_id ON case_documents (case_id);

CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  field_officer_id INTEGER REFERENCES officers(id),
  instructions TEXT,
  scheduled_date DATE,
  completed_date DATE,
  status VARCHAR(50) DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspection_evidence (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  accuracy_meters NUMERIC(6, 2),
  photo_url TEXT,
  observations TEXT,
  encroachment_found BOOLEAN DEFAULT FALSE,
  boundary_match BOOLEAN DEFAULT TRUE,
  geom GEOMETRY(Point, 4326),
  captured_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inspection_evidence_geom ON inspection_evidence USING GIST (geom);

CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  officer_id INTEGER REFERENCES officers(id),
  recommendation_action VARCHAR(50) NOT NULL CHECK (recommendation_action IN ('APPROVE', 'REJECT', 'REQUEST_MORE_INFO', 'FORWARD_TO_COLLECTOR')),
  justification TEXT NOT NULL,
  risk_factors_considered JSONB,
  ai_summary_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUDIT LOGS (Immutable Action Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
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
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_officer ON audit_logs (officer_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_case ON audit_logs (case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);

-- 7. TN ADMINISTRATIVE OFFICERS PUBLIC DIRECTORY
-- Sourced from official government portals (NIC, district websites).
-- Separate from the `officers` auth table which stores login users with password hashes.
CREATE TABLE IF NOT EXISTS tn_administrative_officers (
  id SERIAL PRIMARY KEY,
  state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  district VARCHAR(100) NOT NULL,
  administrative_level VARCHAR(50) NOT NULL,  -- District, Taluk
  designation VARCHAR(200) NOT NULL,
  officer_name VARCHAR(200),
  official_email VARCHAR(150),
  official_mobile VARCHAR(20),
  office_landline VARCHAR(20),
  source_url TEXT,
  verified_date DATE,
  data_status VARCHAR(50) NOT NULL DEFAULT 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tn_officers_district ON tn_administrative_officers (district);
CREATE INDEX IF NOT EXISTS idx_tn_officers_designation ON tn_administrative_officers (designation);

-- 8. DATA STATUS COLUMNS — distinguish real government-sourced fields from synthetic demo data
-- data_status values:
--   REAL_OFFICIAL_GOVERNMENT_PUBLISHED  — sourced from official govt portals / cadastral records
--   REAL_OSM_DERIVED                    — derived from OpenStreetMap / Nominatim
--   SYNTHETIC_DEMO_DATA                 — illustrative, generated for demo purposes
ALTER TABLE districts
  ADD COLUMN IF NOT EXISTS lgd_code VARCHAR(50);

ALTER TABLE subdistricts
  ADD COLUMN IF NOT EXISTS lgd_code VARCHAR(50);

ALTER TABLE villages
  ADD COLUMN IF NOT EXISTS category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS census_population INTEGER,
  ADD COLUMN IF NOT EXISTS census_households INTEGER,
  ADD COLUMN IF NOT EXISTS census_area_hectares NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS pin_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS facilities_reported JSONB,
  ADD COLUMN IF NOT EXISTS data_status VARCHAR(50) DEFAULT 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED';

ALTER TABLE land_parcels
  ADD COLUMN IF NOT EXISTS data_status VARCHAR(50) NOT NULL DEFAULT 'SYNTHETIC_DEMO_DATA',
  ADD COLUMN IF NOT EXISTS data_note TEXT,
  ADD COLUMN IF NOT EXISTS real_guideline_value_per_sqft NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS guideline_effective_date DATE DEFAULT '2026-04-01',
  ADD COLUMN IF NOT EXISTS guideline_source_url TEXT DEFAULT 'https://tnreginet.gov.in';

ALTER TABLE land_records
  ADD COLUMN IF NOT EXISTS data_status VARCHAR(50) NOT NULL DEFAULT 'SYNTHETIC_DEMO_DATA',
  ADD COLUMN IF NOT EXISTS data_note TEXT,
  -- Real Tamil Nadu land document fields (Patta / Chitta / Adangal schema):
  ADD COLUMN IF NOT EXISTS document_type VARCHAR(50),        -- Patta, Chitta, Adangal, FMB, TSLR
  ADD COLUMN IF NOT EXISTS sub_division_number VARCHAR(50),  -- e.g. "181/9A"
  ADD COLUMN IF NOT EXISTS land_type VARCHAR(50),            -- Nanjai (wet/irrigated) or Punjai (dry/rainfed)
  ADD COLUMN IF NOT EXISTS extent_hectares NUMERIC(10, 4),
  ADD COLUMN IF NOT EXISTS extent_ares NUMERIC(10, 4),
  ADD COLUMN IF NOT EXISTS extent_sqm NUMERIC(15, 2),
  ADD COLUMN IF NOT EXISTS tax_amount_inr NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS owner_relationship VARCHAR(100),  -- Self, Inherited, Purchased, Gifted
  ADD COLUMN IF NOT EXISTS guideline_value_per_sqm NUMERIC(12, 2),  -- From TN Registration Dept (tnreginet.gov.in)
  ADD COLUMN IF NOT EXISTS guideline_value_source VARCHAR(100);      -- Source reference for guideline value

