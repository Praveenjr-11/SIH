# PHASE 0 — GIS FREEZE & BASELINE MANIFEST

## Executive Summary
As of **Phase 0 (GIS Baseline Freeze)**, the GIS spatial engine, Leaflet interactive map UI, TNGIS GeoServer integrations, spatial analysis services, and PostGIS data layers are **FROZEN**.

No subsequent implementation phases (Phase 1 through Phase 12) shall modify, rewrite, break, or alter existing GIS API contracts, map UI components, or TNGIS GeoServer live integration mappings.

---

## 1. Frozen Frontend GIS Components (`frontend/src/components/gis/`)

| Component | File Path | Function & Role | Freeze Status |
| :--- | :--- | :--- | :---: |
| **GisMapContainer** | `components/gis/GisMapContainer.tsx` | Main map wrapper, layer state provider, search integration | 🔒 FROZEN |
| **GisMapInner** | `components/gis/GisMapInner.tsx` | Leaflet map instance, tile layers, map click events, tooltips | 🔒 FROZEN |
| **DynamicVectorLayer** | `components/gis/DynamicVectorLayer.tsx` | Dynamic GeoJSON fetcher & renderer for vector layers | 🔒 FROZEN |
| **LayerManager** | `components/gis/LayerManager.tsx` | Side panel layer toggle, category groups, loaded state | 🔒 FROZEN |
| **LayerOverlayPanel** | `components/gis/LayerOverlayPanel.tsx` | Overlay controls & opacity sliders | 🔒 FROZEN |
| **FeatureDataTable** | `components/gis/FeatureDataTable.tsx` | Attribute inspector table for selected spatial features | 🔒 FROZEN |
| **HierarchyNavigator** | `components/gis/HierarchyNavigator.tsx` | Administrative drill-down (State -> District -> Taluk -> Village) | 🔒 FROZEN |
| **MeasureTool** | `components/gis/MeasureTool.tsx` | Distance & Area measurement tools on map | 🔒 FROZEN |
| **TngisLiveOverlay** | `components/gis/TngisLiveOverlay.tsx` | Live TNGIS WMS tile overlay renderer | 🔒 FROZEN |
| **OverlayUploadPanel** | `components/gis/OverlayUploadPanel.tsx` | GeoJSON/KML file upload overlay preview | 🔒 FROZEN |
| **GIS Layer Registry** | `config/gisLayerRegistry.ts` | 38 registered GIS layers with category, style, min_zoom | 🔒 FROZEN |

---

## 2. Frozen Backend GIS API Endpoints (`backend/src/gis/routes/gisRoutes.ts`)

| Endpoint | Method | Service Method | Description | Freeze Status |
| :--- | :---: | :--- | :--- | :---: |
| `/api/v1/gis/health` | `GET` | `gisService.getHealth()` | Health check for spatial engine & PostGIS | 🔒 FROZEN |
| `/api/v1/gis/location` | `GET` | `gisService.getLocation()` | Point-in-polygon administrative lookup | 🔒 FROZEN |
| `/api/v1/gis/search` | `GET` | `gisService.search()` | Location & landmark search query | 🔒 FROZEN |
| `/api/v1/gis/layers` | `GET` | `gisService.getLayers()` | Enumerates all registered GIS layers | 🔒 FROZEN |
| `/api/v1/gis/layer/:layer` | `GET` | `gisService.getLayerGeoJSON()` | GeoJSON feature retrieval with `bbox` filter | 🔒 FROZEN |
| `/api/v1/gis/boundaries` | `GET` | `gisService.getBoundaries()` | Administrative boundary GeoJSON (district/state/village) | 🔒 FROZEN |
| `/api/v1/gis/nearby/water` | `GET` | `gisService.getNearbyWater()` | Proximity search for rivers, lakes, reservoirs | 🔒 FROZEN |
| `/api/v1/gis/nearby/roads` | `GET` | `gisService.getNearbyRoads()` | Proximity search for road lines | 🔒 FROZEN |
| `/api/v1/gis/analysis` | `GET` | `gisService.getCombinedAnalysis()` | Multi-layered spatial report for coordinates | 🔒 FROZEN |
| `/api/v1/gis/parcels/:ulpin/overlay` | `GET` | `gisController.getParcelSpatialOverlay()` | Multi-layer spatial overlay for specific ULPIN | 🔒 FROZEN |
| `/api/v1/gis/feature-info` | `GET` | `gisController.getFeatureInfo()` | Point-click feature attribute query | 🔒 FROZEN |

---

## 3. Frozen Live TNGIS GeoServer Integration (`backend/src/gis/tngis/tngisClient.ts`)

The following live TNGIS GeoServer layer mappings are **verified working** and **frozen**:

- **Cadastral FMB Parcels**: `cadastral_data_wms:view_fmb` (WFS)
- **Cadastral Survey Boundaries**: `cadastral_data_wms:view_cadastral` (WFS)
- **Districts**: `generic_viewer:districts` (WFS)
- **Taluks**: `generic_viewer:taluk_boundary` (WFS)
- **Revenue Villages**: `generic_viewer:revenue_village_boundary` (WFS)
- **Panchayat Villages**: `generic_viewer:tn_village_panchayat_boundary` (WFS)
- **Road Network**: `generic_viewer:tnrd_rural_roads` (WFS)
- **National / State Highways**: `generic_viewer:village_roads` / `generic_viewer:tnrd_rural_roads` (WFS)
- **Railway Line**: `generic_viewer:tn_railway` (WFS)
- **Airports**: `generic_viewer:airport_location` (WFS)
- **Government Offices / Hospitals**: `generic_viewer:govt_hospital` (WFS)
- **Registration Offices (SRO)**: `generic_viewer:sub_registrar_office` (WFS)
- **District Revenue Offices (DRO)**: `generic_viewer:district_collectorate` (WFS)
- **Taluk Offices**: `generic_viewer:taluk_office` (WFS)
- **Village Panchayat Offices**: `generic_viewer:village_panchayat_office` (WFS)

---

## 4. Phase 0 Automated Regression Test Suite

**Test Command**:
```bash
cd backend && npx tsx src/test/phase0_baseline.test.ts
```

**Verification Output**:
```text
========================================================================
🛡️ RUNNING PHASE 0 — GIS FREEZE & REGRESSION BASELINE TEST SUITE
========================================================================
  ✅ [PASS] GIS Health Check returns valid health payload
  ✅ [PASS] Point-in-polygon location resolution succeeds
  ✅ [PASS] Coordinate validator rejects out-of-bounds latitude (>90)
  ✅ [PASS] Coordinate validator rejects out-of-bounds longitude (<-180)
  ✅ [PASS] Coordinate validator accepts valid Chennai coordinates
  ✅ [PASS] Spatial location search returns matched records
  ✅ [PASS] GIS Layer Registry enumerates supported layers (Total: 37)
  ✅ [PASS] Cadastral parcels layer returns valid GeoJSON FeatureCollection
  ✅ [PASS] Administrative district boundaries return FeatureCollection
  ✅ [PASS] Spatial proximity query for waterbodies succeeds
  ✅ [PASS] Spatial proximity query for road lines succeeds
  ✅ [PASS] Radius validator rejects excessive distances (>50km)
  ✅ [PASS] Combined GIS location analysis engine returns comprehensive spatial report
  ✅ [PASS] TNGIS Layer Map registers official FMB survey layer (cadastral_data_wms:view_fmb)
========================================================================
📊 PHASE 0 BASELINE RESULTS: 14 PASSED, 0 FAILED
========================================================================
```

---

## 5. Inviolable Phase 0 Rules for Future Phases

1. ❌ **DO NOT MODIFY GIS** components, maps, or layers.
2. ❌ **DO NOT REWRITE GIS** endpoints or change parameter schemas.
3. ❌ **DO NOT CHANGE MAP UI** layouts, zoom defaults, or controls.
4. ❌ **DO NOT CHANGE TNGIS** WFS client mappings or property normalization.
5. ❌ **DO NOT CHANGE EXISTING GIS APIs**.
6. ✅ **ALWAYS RUN** `npx tsx src/test/phase0_baseline.test.ts` before declaring any phase complete.
