# Standard Technical Document (SIH26014)
## LAND STACK: An Integrated GIS-based Digital Public Infrastructure for Land Governance

**Problem Statement ID:** SIH26014  
**Organization:** Ministry of Rural Development — Department of Land Resources (DoLR)  
**Category / Theme:** Software — Agriculture, FoodTech & Rural Development  
**Version:** 1.0.0 (Production Blueprint)  
**Date:** September 2026  

---

## Executive Summary

Land governance in India involves multiple institutions managing land records in fragmented, disconnected systems. Core datasets—including cadastral maps, Record of Rights (RoR), registration records, master plans, building permissions, property taxation, utilities, and geoscientific data—are often maintained independently across departments with limited interoperability.

**LAND STACK** is conceptualized and built as a unified, scalable, integrated GIS-based Digital Public Infrastructure (DPI) for land governance. Initiated by the Department of Land Resources (DoLR) with pilot deployments in **Chandigarh** and **Tamil Nadu** (launched 31 December 2025), LAND STACK provides a common parcel-centric spatial framework utilizing the **Unique Land Parcel Identification Number (ULPIN)** as the universal spatial key.

This Standard Technical Document provides the authoritative technical specification for LAND STACK, covering API standards, interoperability protocols, data schemas, system architecture, GIS standards, security frameworks, UI/UX guidelines, color schemas, AI/ML analytics, and deployment considerations.

---

## 1. System Architecture & Data Flow

### 1.1 High-Level Architectural Diagram

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CITIZEN & GOVERNANCE PORTALS                            │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│   │  Citizen GIS Portal │  │  e-Registration SRO │  │ Administrative Analytics    │   │
│   └──────────┬──────────┘  └──────────┬──────────┘  └──────────────┬──────────────┘   │
└──────────────┼────────────────────────┼────────────────────────────┼──────────────────┘
               │                        │                            │
               ▼                        ▼                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  LAND STACK API GATEWAY                                │
│   [ JWT Auth / RBAC ] ─── [ Rate Limiting ] ─── [ Audit Logger ] ─── [ CORS Proxy ]     │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE SERVICES & ENGINE LAYER                              │
│   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────────────────┐   │
│   │ GIS Service        │  │ Dataset Catalog    │  │ AI Land Intelligence Engine    │   │
│   │ (PostGIS Spatial)  │  │ (Provenance Reg)   │  │ (Suitability & Risk Scorer)    │   │
│   └──────────┬─────────┘  └──────────┬─────────┘  └──────────────┬─────────────────┘   │
└──────────────┼───────────────────────┼───────────────────────────┼─────────────────────┘
               │                       │                           │
               ▼                       ▼                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             DATA INTEGRATION & PERSISTENCE                             │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ PostGIS Spatial Database (WGS84 EPSG:4326)                                      │   │
│   │  ├── Base Layer: Cadastral Parcels, ULPIN, State/District/Village Boundaries   │   │
│   │  ├── Essential Layers: RoR, Registration, Encumbrance, Master Plan, Zoning      │   │
│   │  └── Additional Layers: GSI Geology, Soil, LULC, Waterbodies, Roads, Hazards   │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Three-Tier Spatial Layer Architecture

LAND STACK organizes all land governance information into three distinct, interconnected spatial tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  TIER 3: ADDITIONAL / USE-CASE LAYERS                                                  │
│  Geology (GSI), Soil, LULC (ISRO), Water Bodies, Road Networks, Elevation, Hazard Risk │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  TIER 2: ESSENTIAL GOVERNANCE LAYERS                                                   │
│  Record of Rights (RoR), e-Registration, Master Plans, Building Permissions, Mortgages │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  TIER 1: BASE SPATIAL LAYER                                                            │
│  Georeferenced Cadastral Map, Parcel Boundaries, 14-Digit ULPIN Key, Village Index    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Tier 1: Base Spatial Layer
- **Cadastral Map Parcels**: Exact polygon geometry of every land parcel.
- **ULPIN (Unique Land Parcel Identification Number)**: 14-digit alphanumeric code derived from geo-coordinates of the centroid.
- **Administrative Boundaries**: State, District, Subdistrict/Taluk, and Village boundaries (**261,578 Villages across Entire India**).

### 2.2 Tier 2: Essential Governance Layers
- **Record of Rights (RoR)**: Ownership details, share percentage, land class (wet/dry/nanjai/punjai).
- **Registration & Encumbrance**: Sub-Registrar Office (SRO) deed history, active mortgages, court attachment orders.
- **Master Plan & Zoning**: Permissible land use (Residential, Commercial, Industrial SIPCOT, Agricultural, Forest).
- **Building Permissions**: Municipal approvals, setback regulations, height clearances.

### 2.3 Tier 3: Additional / Use-Case Layers
- **GSI Geological Layer**: Real Geological Survey of India lithology, rock formations, bearing capacity ($kPA$), formation age.
- **Soil Layer**: Soil texture, permeability, agricultural capability.
- **Satellite Land Use (LULC)**: ISRO Sentinel-2 land cover classification.
- **Hydrological Layer**: Rivers, lakes, buffer zone restrictions (CRZ, catchment boundaries).
- **Transportation & Utility Networks**: National/State Highways, power corridors, pipelines.
- **Geohazard Risk Layer**: Landslide susceptibility, flood hazard zones, seismic zoning.

---

## 3. Data Schemas & Database Specifications

### 3.1 PostGIS Relational Schema Definitions

```sql
-- 1. Datasets Catalog & Provenance Registry
CREATE TABLE IF NOT EXISTS gis_datasets (
  id SERIAL PRIMARY KEY,
  dataset_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  source VARCHAR(200) NOT NULL,
  organization VARCHAR(200),
  version VARCHAR(50),
  crs VARCHAR(50) DEFAULT 'EPSG:4326',
  source_status VARCHAR(20) DEFAULT 'REAL' CHECK (source_status IN ('MOCK', 'REAL', 'DERIVED')),
  record_count INTEGER,
  last_updated TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- 2. Cadastral Parcels Base Table
CREATE TABLE IF NOT EXISTS parcels (
  id SERIAL PRIMARY KEY,
  ulpin VARCHAR(14) UNIQUE NOT NULL,
  survey_number VARCHAR(50) NOT NULL,
  subdivision VARCHAR(20),
  state_name VARCHAR(100) NOT NULL,
  district_name VARCHAR(100) NOT NULL,
  taluk_name VARCHAR(100) NOT NULL,
  village_name VARCHAR(100) NOT NULL,
  area_acres NUMERIC(10, 4) NOT NULL,
  land_classification VARCHAR(100) NOT NULL,
  current_use VARCHAR(150),
  verification_status VARCHAR(30) DEFAULT 'Verified',
  source VARCHAR(50) DEFAULT 'REAL_SURVEY',
  geom GEOMETRY(Polygon, 4326) NOT NULL
);
CREATE INDEX idx_parcels_geom ON parcels USING GIST (geom);
CREATE INDEX idx_parcels_ulpin ON parcels (ulpin);

-- 3. India Village Boundaries Table
CREATE TABLE IF NOT EXISTS villages (
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
  source VARCHAR(50) DEFAULT 'REAL_VILLAGE_BOUNDARY',
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX idx_villages_geom ON villages USING GIST (geom);
CREATE INDEX idx_villages_state_dist ON villages (state_name, district_name);

-- 4. Extended GSI Geology Model Table
CREATE TABLE IF NOT EXISTS geology (
  id SERIAL PRIMARY KEY,
  geology_code VARCHAR(50),
  unit_name VARCHAR(200),
  rock_type VARCHAR(100),
  age VARCHAR(100),
  formation VARCHAR(200),
  lithology VARCHAR(150),
  geomorphology_unit VARCHAR(150),
  bearing_capacity_kpa INTEGER,
  gsi_report_id VARCHAR(50),
  source VARCHAR(50) DEFAULT 'REAL_GSI',
  scale VARCHAR(50),
  survey_year INTEGER,
  geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX idx_geology_geom ON geology USING GIST (geom);
```

---

## 4. API Standards & Interoperability Specifications

All API endpoints strictly enforce standard HTTP verbs, JSON payloads, Open API 3.0 specs, and WGS84 bounding-box parameters.

### 4.1 Core REST API Summary

| Endpoint | Verb | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `/api/gis/health` | GET | System health & PostGIS status | None |
| `/api/gis/location` | GET | Point-in-polygon spatial lookup | `lat`, `lng` |
| `/api/gis/search` | GET | Location & parcel search | `q` (query string) |
| `/api/gis/layers` | GET | Layer catalog with provenance | None |
| `/api/gis/layer/:layer` | GET | GeoJSON FeatureCollection | `bbox` (`minLng,minLat,maxLng,maxLat`) |
| `/api/gis/boundaries` | GET | Administrative boundaries | `type` (`states`/`districts`/`villages`) |
| `/api/gis/analysis` | GET | Combined AI GIS location report | `lat`, `lng` |
| `/api/gis/datasets` | GET | Dataset provenance catalog | `category`, `sourceStatus` |
| `/api/gis/datasets/upload-zip` | POST | Shapefile ZIP archive import | Multipart form `file` (.zip) |
| `/api/gis/villages/stats` | GET | India village boundary statistics | None |

### 4.2 Sample GeoJSON API Response Payload (`GET /api/gis/layer/villages?bbox=73.7,15.2,74.1,15.6`)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 1042,
      "properties": {
        "name": "Ponchavadi",
        "subdistrict": "PONDA",
        "district_name": "SOUTH GOA",
        "state_name": "GOA",
        "village_lgd": "626864",
        "category": "Rural",
        "shape_area": 15121108.61,
        "_source": "REAL_VILLAGE_BOUNDARY",
        "_sourceStatus": "REAL"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[73.9852, 15.3411], [73.9912, 15.3485], [73.9781, 15.3521], [73.9852, 15.3411]]]]
      }
    }
  ]
}
```

---

## 5. GIS & Geospatial Standards

- **OGC Compliance**: Adheres to Open Geospatial Consortium (OGC) GeoJSON (RFC 7946) standards.
- **Coordinate System**: Primary CRS is **WGS84 (EPSG:4326)**.
- **Spatial Precision**: Polygon vertices stored with double-precision floating points ($10^{-7}$ degrees precision, approx. $1.1\text{ cm}$).
- **Geometry Sanitization**: All incoming shapefiles automatically cleaned via PostGIS `ST_MakeValid()` and `ST_CollectionExtract(geom, 3)` to ensure topology rules (no self-intersections or gaps).

---

## 6. Security, Governance & Compliance Framework

```
                  ┌──────────────────────────────────────────────┐
                  │          SECURITY & GOVERNANCE BUS           │
                  └──────────────────────┬───────────────────────┘
                                         │
       ┌─────────────────────────────────┼─────────────────────────────────┐
       │                                 │                                 │
       ▼                                 ▼                                 ▼
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│  JWT / OAuth2│                 │ Role-Based   │                 │ Tamper-Proof │
│ Auth Tokens  │                 │ Access (RBAC)│                 │ Audit Trail  │
└──────────────┘                 └──────────────┘                 └──────────────┘
```

1. **Role-Based Access Control (RBAC)**:
   - **Citizen**: Public view-only, ULPIN search, land search, service requests.
   - **Sub-Registrar (SRO)**: e-Registration, deed creation, encumbrance updates.
   - **Revenue Officer / Tehsildar**: Mutation approval, boundary dispute resolution.
   - **Urban Planner**: Master plan overlay, zoning modification, NOC clearance.
2. **Data Encryption**:
   - TLS 1.3 enforced for all API channels.
   - AES-256 encryption at rest for database volumes.
3. **Audit Trail**: Every land title mutation generates an immutable event log entry containing cryptographic hash ($SHA-256$) of parcel state, timestamp, and user ID.

---

## 7. AI/ML & Advanced Geospatial Analytics

### 7.1 AI Land Suitability Scoring Model

The AI Land Intelligence Engine computes a multi-criteria **Suitability Score ($0-100$)** for any coordinate pair using weighted GIS spatial overlays:

$$\text{Suitability Score} = (w_g \cdot S_g) + (w_s \cdot S_s) + (w_r \cdot S_r) + (w_w \cdot S_w) - \text{Penalty}_{\text{hazard}}$$

Where:
- $S_g$: Geological bearing capacity score ($kPA / 3.5$)
- $S_s$: Soil foundation stability
- $S_r$: Proximity to national/state highways
- $S_w$: Distance to water body buffer
- $\text{Penalty}_{\text{hazard}}$: Deducted for landslide/flood risk zones

---

## 8. UI/UX Guidelines & Color Schemas

LAND STACK incorporates a state-of-the-art glassmorphic design system tailored for high readability and visual impact.

### 8.1 Color Palette Specifications

| Purpose | Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | Royal Blue | `#2563eb` | Active navigation, map pins, highlights |
| **Background Dark** | Slate 950 | `#020617` | Glassmorphic drawer panels, modals |
| **Verified Real** | Emerald Green | `#10b981` | Real data source badges, verified parcels |
| **Warning / Derived** | Warm Amber | `#f59e0b` | Derived layers, fallback notifications |
| **Hazard / Danger** | Coral Red | `#ef4444` | High risk zones, flood alerts |
| **Administrative** | Sapphire Blue | `#3b82f6` | State/District boundary overlays |

### 8.2 Typography
- **Primary Font**: Inter / System UI sans-serif.
- **Monospace Font**: JetBrains Mono / Fira Code (for ULPIN, LGD Codes, Lat/Lng coordinates).

---

## 9. Deployment, Scalability & DevOps Considerations

```
   ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
   │ Cloud Load Bal.  │  ───► │ API Pod (Docker) │  ───► │ PostGIS Cluster  │
   │ (NGINX Ingress)  │       │ (Node.js REST)   │       │ (Primary + Read) │
   └──────────────────┘       └──────────────────┘       └──────────────────┘
```

1. **Containerization**: Backend REST service and Frontend Next.js app packaged into lightweight Alpine Linux Docker containers.
2. **Scalability**: Stateless Node.js API layer configured for horizontal pod autoscaling (HPA) in Kubernetes.
3. **Database High Availability**: Primary PostGIS instance for writes with async read replicas for spatial query loads.
4. **Spatial Caching**: Redis caching layer for GeoJSON boundary layers to minimize PostGIS spatial join latencies.
