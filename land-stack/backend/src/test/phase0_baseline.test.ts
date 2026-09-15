import { gisService } from '../gis/services/gisService.js';
import { validateCoordinates, validateRadius, validateLayer } from '../gis/validators/gisValidator.js';
import { GIS_LAYER_REGISTRY } from '../gis/config/layerRegistry.js';
import { TNGIS_LAYER_MAP } from '../gis/tngis/tngisClient.js';

async function runPhase0BaselineTests() {
  console.log("========================================================================");
  console.log("🛡️ RUNNING PHASE 0 — GIS FREEZE & REGRESSION BASELINE TEST SUITE");
  console.log("========================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. GIS Service Health Verification
    const health = await gisService.getHealth();
    assert(health.postgisConnected !== undefined && typeof health.message === 'string', "GIS Health Check returns valid health payload");

    // 2. Point-in-Polygon Reverse Geocode Location Lookup
    const loc = await gisService.getLocation(12.94489, 79.95564);
    assert(loc.latitude === 12.94489 && loc.longitude === 79.95564 && typeof loc.state === "string", "Point-in-polygon location resolution succeeds");

    // 3. Coordinate Validators (Latitude & Longitude Boundaries)
    const invalidLat = validateCoordinates(120, 79.95);
    assert(invalidLat.valid === false, "Coordinate validator rejects out-of-bounds latitude (>90)");

    const invalidLng = validateCoordinates(12.94, -200);
    assert(invalidLng.valid === false, "Coordinate validator rejects out-of-bounds longitude (<-180)");

    const validCoord = validateCoordinates(13.0827, 80.2707);
    assert(validCoord.valid === true, "Coordinate validator accepts valid Chennai coordinates");

    // 4. Spatial Search Functionality
    const searchRes = await gisService.search("Sriperumbudur");
    assert(Array.isArray(searchRes) && searchRes.length > 0, "Spatial location search returns matched records");

    // 5. GIS Layer Registry Metadata Enumeration
    const layers = await gisService.getLayers();
    assert(Array.isArray(layers) && layers.length >= 10, `GIS Layer Registry enumerates supported layers (Total: ${layers.length})`);

    // 6. Cadastral Parcels Layer GeoJSON Retrieval (BBox Filtered)
    const cadastralGeoJSON = await gisService.getLayerGeoJSON("cadastral_parcels", "79.94,12.94,79.96,12.96");
    assert(
      cadastralGeoJSON.type === "FeatureCollection" && Array.isArray(cadastralGeoJSON.features),
      "Cadastral parcels layer returns valid GeoJSON FeatureCollection"
    );

    // 7. Administrative Boundary Retrieval
    const districtBoundaries = await gisService.getBoundaries("district");
    assert(districtBoundaries.type === "FeatureCollection", "Administrative district boundaries return FeatureCollection");

    // 8. Spatial Proximity — Nearby Waterbodies
    const nearbyWater = await gisService.getNearbyWater(12.94489, 79.95564, 5000);
    assert(nearbyWater.query.radiusMeters === 5000 && Array.isArray(nearbyWater.waterbodies), "Spatial proximity query for waterbodies succeeds");

    // 9. Spatial Proximity — Nearby Roads
    const nearbyRoads = await gisService.getNearbyRoads(12.94489, 79.95564, 5000);
    assert(Array.isArray(nearbyRoads.roads), "Spatial proximity query for road lines succeeds");

    // 10. Radius Validator Check
    const invalidRad = validateRadius(100000);
    assert(invalidRad.valid === false, "Radius validator rejects excessive distances (>50km)");

    // 11. Multi-Layer Location Analysis Engine
    const analysis = await gisService.getCombinedAnalysis(12.94489, 79.95564);
    assert(
      typeof analysis.location === "object" &&
      typeof analysis.administration === "object" &&
      typeof analysis.risk === "object",
      "Combined GIS location analysis engine returns comprehensive spatial report"
    );

    // 12. TNGIS Live Layer Map Registry Integrity
    const hasFmbMapping = TNGIS_LAYER_MAP.cadastral_parcels?.geoserverLayer === 'cadastral_data_wms:view_fmb';
    assert(hasFmbMapping, "TNGIS Layer Map registers official FMB survey layer (cadastral_data_wms:view_fmb)");

  } catch (err: any) {
    console.error("Test execution error:", err);
    failed++;
  }

  console.log("========================================================================");
  console.log(`📊 PHASE 0 BASELINE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase0BaselineTests();
