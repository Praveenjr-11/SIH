-- Phase 5 TNGIS-style registry migration. Run after schema_phase5.sql.
CREATE TABLE IF NOT EXISTS gis_layer_registry (
  id VARCHAR(100) PRIMARY KEY, name VARCHAR(200) NOT NULL, category VARCHAR(80) NOT NULL,
  geometry_type VARCHAR(30) NOT NULL, source_type VARCHAR(30) NOT NULL, source TEXT NOT NULL,
  source_department TEXT, source_system TEXT, source_url TEXT, dataset_name TEXT NOT NULL,
  last_verified TIMESTAMPTZ, license_or_usage_status TEXT, data_status VARCHAR(30) NOT NULL,
  min_zoom SMALLINT NOT NULL DEFAULT 0, max_zoom SMALLINT NOT NULL DEFAULT 22,
  selectable BOOLEAN NOT NULL DEFAULT FALSE, queryable BOOLEAN NOT NULL DEFAULT FALSE,
  downloadable BOOLEAN NOT NULL DEFAULT FALSE, searchable BOOLEAN NOT NULL DEFAULT FALSE,
  style JSONB NOT NULL DEFAULT '{}'::jsonb, fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  crs VARCHAR(32) NOT NULL DEFAULT 'EPSG:4326', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gis_layer_registry_category ON gis_layer_registry(category);
CREATE INDEX IF NOT EXISTS idx_gis_layer_registry_status ON gis_layer_registry(data_status);
