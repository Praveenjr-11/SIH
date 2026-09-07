-- ====================================================================
-- LAND STACK Phase 4: PostGIS Spatial Database Schema & Seed Data
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. States Table
CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_states_geom ON states USING GIST (geom);

-- 2. Districts Table
CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_id INTEGER REFERENCES states(id),
  state_name VARCHAR(100) NOT NULL,
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_districts_geom ON districts USING GIST (geom);

-- 3. Villages / Subdistricts Table
CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subdistrict VARCHAR(100) NOT NULL,
  district_name VARCHAR(100) NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_villages_geom ON villages USING GIST (geom);

-- 4. Geology Table
CREATE TABLE IF NOT EXISTS geology (
  id SERIAL PRIMARY KEY,
  rock_formation VARCHAR(150),
  lithology VARCHAR(150),
  geomorphology_unit VARCHAR(150),
  bearing_capacity_kpa INTEGER,
  gsi_report_id VARCHAR(50),
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_geology_geom ON geology USING GIST (geom);

-- 5. Soil Table
CREATE TABLE IF NOT EXISTS soil (
  id SERIAL PRIMARY KEY,
  soil_type VARCHAR(100),
  texture VARCHAR(100),
  permeability VARCHAR(50),
  bearing_capacity_kpa INTEGER,
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_soil_geom ON soil USING GIST (geom);

-- 6. Land Use (LULC) Table
CREATE TABLE IF NOT EXISTS landuse (
  id SERIAL PRIMARY KEY,
  classification VARCHAR(100),
  current_use VARCHAR(150),
  source VARCHAR(100),
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_landuse_geom ON landuse USING GIST (geom);

-- 7. Waterbodies Table
CREATE TABLE IF NOT EXISTS waterbodies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  water_type VARCHAR(50), -- Lake, Canal, River, Reservoir
  buffer_zone_meters INTEGER,
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_waterbodies_geom ON waterbodies USING GIST (geom);

-- 8. Roads Table
CREATE TABLE IF NOT EXISTS roads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  road_type VARCHAR(50), -- National Highway, State Highway, District Road, Local
  width_meters INTEGER,
  geom GEOMETRY(MultiLineString, 4326)
);
CREATE INDEX IF NOT EXISTS idx_roads_geom ON roads USING GIST (geom);

-- 9. Risk Zones Table
CREATE TABLE IF NOT EXISTS risk_zones (
  id SERIAL PRIMARY KEY,
  hazard_type VARCHAR(50), -- Flood, Landslide, Seismic, Environmental
  risk_level VARCHAR(20),  -- Low, Moderate, High, Severe
  description TEXT,
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_risk_zones_geom ON risk_zones USING GIST (geom);
