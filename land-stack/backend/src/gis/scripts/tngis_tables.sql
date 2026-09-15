-- Phase 9: TNGIS Actual Data Integration Schema

-- 1. Source Discovery Table
CREATE TABLE IF NOT EXISTS tngis_layer_sources (
    id SERIAL PRIMARY KEY,
    layer_id VARCHAR(100) UNIQUE,
    layer_name VARCHAR(255),
    category VARCHAR(100),
    tngis_source_url TEXT,
    api_url TEXT,
    wms_url TEXT,
    wfs_url TEXT,
    download_url TEXT,
    source_type VARCHAR(50), -- REST_API, WMS, WFS, VECTOR_TILE
    source_layer_id VARCHAR(100),
    source_department VARCHAR(255),
    geometry_type VARCHAR(50),
    source_srid INTEGER,
    authorization_status VARCHAR(50), -- PUBLIC, AUTHORIZATION_REQUIRED
    discovery_status VARCHAR(50), -- DISCOVERED, VERIFIED, UNAVAILABLE
    last_checked TIMESTAMP,
    notes TEXT
);

-- 2. 30 Spatial Data Tables (Dynamic structure for GIS data)
-- Administrative
CREATE TABLE IF NOT EXISTS gis_state_boundary (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_state_boundary_geom ON gis_state_boundary USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_districts (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_districts_geom ON gis_districts USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_taluks (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_taluks_geom ON gis_taluks USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_revenue_villages (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_revenue_villages_geom ON gis_revenue_villages USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_panchayat_villages (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_panchayat_villages_geom ON gis_panchayat_villages USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_blocks (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_blocks_geom ON gis_blocks USING GIST (geom);

-- Assembly/Parliament
CREATE TABLE IF NOT EXISTS gis_assembly_constituency (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_assembly_constituency_geom ON gis_assembly_constituency USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_parliament_constituency (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_parliament_constituency_geom ON gis_parliament_constituency USING GIST (geom);

-- Roads
CREATE TABLE IF NOT EXISTS gis_national_highways (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiLineString, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_national_highways_geom ON gis_national_highways USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_state_highways (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiLineString, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_state_highways_geom ON gis_state_highways USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_major_district_roads (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiLineString, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_major_district_roads_geom ON gis_major_district_roads USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_other_district_roads (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiLineString, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_other_district_roads_geom ON gis_other_district_roads USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_roads (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiLineString, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_roads_geom ON gis_roads USING GIST (geom);

-- Water
CREATE TABLE IF NOT EXISTS gis_rivers (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiLineString, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_rivers_geom ON gis_rivers USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_tanks (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_tanks_geom ON gis_tanks USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_reservoirs (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_reservoirs_geom ON gis_reservoirs USING GIST (geom);

-- Facilities & POIs
CREATE TABLE IF NOT EXISTS gis_schools (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_schools_geom ON gis_schools USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_government_offices (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_government_offices_geom ON gis_government_offices USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_registration_offices (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_registration_offices_geom ON gis_registration_offices USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_district_revenue_officers (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_district_revenue_officers_geom ON gis_district_revenue_officers USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_taluk_offices (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_taluk_offices_geom ON gis_taluk_offices USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_village_panchayat_offices (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_village_panchayat_offices_geom ON gis_village_panchayat_offices USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_railway_line (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiLineString, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_railway_line_geom ON gis_railway_line USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_airport_location (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_airport_location_geom ON gis_airport_location USING GIST (geom);

-- Environment & Natural Resources
CREATE TABLE IF NOT EXISTS gis_reserve_forests (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_reserve_forests_geom ON gis_reserve_forests USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_protected_areas (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_protected_areas_geom ON gis_protected_areas USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_landuse (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_landuse_geom ON gis_landuse USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_soil (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_soil_geom ON gis_soil USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_geology (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_geology_geom ON gis_geology USING GIST (geom);

CREATE TABLE IF NOT EXISTS gis_geomorphology (
    id SERIAL PRIMARY KEY,
    source_feature_id VARCHAR(100),
    source_attributes JSONB,
    source_url TEXT,
    source_department VARCHAR(255),
    source_timestamp TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_gis_geomorphology_geom ON gis_geomorphology USING GIST (geom);
