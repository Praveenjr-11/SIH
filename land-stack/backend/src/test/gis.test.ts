import { gisService } from '../gis/services/gisService.js';
import { validateCoordinates, validateRadius, validateLayer } from '../gis/validators/gisValidator.js';

async function runGisTests() {
  console.log("=======================================================");
  console.log("🧪 RUNNING PHASE 4 POSTGIS SPATIAL API TEST SUITE");
  console.log("=======================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await gisService.getHealth();
    assert(health.postgisConnected === true, "GET /api/gis/health returns PostGIS status");

    // 2. Location Lookup (Point-in-Polygon)
    const loc = await gisService.getLocation(12.94489, 79.95564);
    assert(loc.latitude === 12.94489 && loc.state === "Tamil Nadu", "GET /api/gis/location returns valid point-in-polygon resolution");

    // 3. Invalid Latitude Check
    const invalidLat = validateCoordinates(999, 79.95);
    assert(invalidLat.valid === false, "Invalid latitude (>90) properly rejected by validator");

    // 4. Invalid Longitude Check
    const invalidLng = validateCoordinates(12.94, -999);
    assert(invalidLng.valid === false, "Invalid longitude (<-180) properly rejected by validator");

    // 5. Search Endpoint
    const searchRes = await gisService.search("Sriperumbudur");
    assert(Array.isArray(searchRes) && searchRes.length > 0, "GET /api/gis/search returns location results");

    // 6. Layers Listing
    const layers = await gisService.getLayers();
    assert(Array.isArray(layers) && layers.length === 10, "GET /api/gis/layers returns 10 supported GIS layers");

    // 7. Layer GeoJSON Retrieval (States)
    const statesGeoJSON = await gisService.getLayerGeoJSON("states");
    assert(statesGeoJSON.type === "FeatureCollection" && Array.isArray(statesGeoJSON.features), "GET /api/gis/layer/states returns valid GeoJSON");

    // 8. Invalid Layer Name Allowlist Check
    const invalidLayer = validateLayer("unsupported_malicious_table");
    assert(invalidLayer.valid === false, "Invalid layer name rejected by allowlist validator");

    // 9. Administrative Boundaries
    const boundaries = await gisService.getBoundaries("district");
    assert(boundaries.type === "FeatureCollection", "GET /api/gis/boundaries?type=district returns boundary GeoJSON");

    // 10. Nearby Water Query
    const nearbyWater = await gisService.getNearbyWater(12.94489, 79.95564, 5000);
    assert(nearbyWater.query.radiusMeters === 5000 && Array.isArray(nearbyWater.waterbodies), "GET /api/gis/nearby/water returns spatial distance results");

    // 11. Invalid Radius Check
    const invalidRad = validateRadius(999999);
    assert(invalidRad.valid === false, "Excessive radius (>50km) rejected by validator");

    // 12. Nearby Roads Query
    const nearbyRoads = await gisService.getNearbyRoads(12.94489, 79.95564, 5000);
    assert(Array.isArray(nearbyRoads.roads), "GET /api/gis/nearby/roads returns nearby road line features");

    // 13. Combined Analysis Structure Verification
    const analysis = await gisService.getCombinedAnalysis(12.94489, 79.95564);
    assert(
      typeof analysis.location.latitude === "number" &&
      typeof analysis.administration === "object" &&
      typeof analysis.geology === "object" &&
      typeof analysis.soil === "object" &&
      typeof analysis.landuse === "object" &&
      typeof analysis.terrain === "object" &&
      typeof analysis.water === "object" &&
      typeof analysis.roads === "object" &&
      typeof analysis.risk === "object",
      "GET /api/gis/analysis matches expected Phase 4 response structure"
    );

  } catch (err: any) {
    console.error("Test execution error:", err);
    failed++;
  }

  console.log("=======================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runGisTests();
