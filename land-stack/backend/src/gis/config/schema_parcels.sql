-- ====================================================================
-- LAND STACK — Phase migration: flat parcels table for multi-state data
-- Run AFTER schema_sih2026.sql
-- ====================================================================

-- Flat parcels table that combines land_parcels + land_records for API access
-- Used by parcelsController and the multi-state adapter engine
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

  -- Verification state machine: enforced order UNVERIFIED → FIELD_SURVEYED → REGISTRAR_ENDORSED → IMMUTABLE
  verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (verification_status IN ('UNVERIFIED', 'FIELD_SURVEYED', 'REGISTRAR_ENDORSED', 'IMMUTABLE', 'Verified', 'Pending', 'Disputed')),

  -- Ledger hash — populated only on IMMUTABLE transition
  provenance_hash VARCHAR(64),

  -- Rich metadata stored as JSONB for backward-compat
  zoning_details_json JSONB,
  property_tax_details_json JSONB,
  court_case_details_json JSONB,
  gsi_geology_json JSONB,
  digital_facets_json JSONB,

  -- Source provenance
  source VARCHAR(100) DEFAULT 'MOCK_SEED',
  ingested_at TIMESTAMPTZ DEFAULT NOW(),

  -- Spatial geometry
  geom GEOMETRY(MultiPolygon, 4326),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parcels_geom ON parcels USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_parcels_ulpin ON parcels (ulpin);
CREATE INDEX IF NOT EXISTS idx_parcels_state_dist ON parcels (state_name, district_name);
CREATE INDEX IF NOT EXISTS idx_parcels_verification ON parcels (verification_status);
