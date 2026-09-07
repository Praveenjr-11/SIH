/**
 * Phase 5 Test Suite — Real GIS Data Integration Tests
 * 
 * Tests data validation, CRS detection, ingestion pipeline,
 * dataset catalog, provenance, and source labeling.
 * 
 * Run: npm run test:phase5
 */

import { validateGeoJSON, validateFeature, detectDuplicates } from '../gis/ingestion/validators.js';
import { detectCrsFromGeoJSON, buildCrsMetadata } from '../gis/ingestion/crsHandler.js';
import { createIngestionReport, finalizeReport, generateBatchId } from '../gis/ingestion/importReport.js';
import { datasetCatalogService, MOCK_DATASET_DEFINITIONS } from '../gis/services/datasetCatalog.js';
import { gisService } from '../gis/services/gisService.js';
import { validateCoordinates, validateRadius, validateLayer } from '../gis/validators/gisValidator.js';

async function runPhase5Tests() {
  console.log("=======================================================");
  console.log("🧪 RUNNING PHASE 5 REAL GIS DATA INTEGRATION TESTS");
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

  // ─── 1. GeoJSON Validation Tests ─────────────────────────────

  console.log("\n--- GeoJSON Validation ---");

  // Valid GeoJSON
  const validGeojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Test" },
        geometry: {
          type: "Polygon",
          coordinates: [[[79.0, 12.0], [80.0, 12.0], [80.0, 13.0], [79.0, 13.0], [79.0, 12.0]]],
        },
      },
    ],
  };
  const validResult = validateGeoJSON(validGeojson);
  assert(validResult.valid === true, "Valid GeoJSON passes validation");
  assert(validResult.stats.totalFeatures === 1, "Correct feature count");
  assert(validResult.stats.validFeatures === 1, "Valid features counted correctly");

  // Invalid GeoJSON — wrong type
  const badType = { type: "Feature", features: [] };
  const badTypeResult = validateGeoJSON(badType);
  assert(badTypeResult.valid === false, "Non-FeatureCollection type rejected");

  // Invalid GeoJSON — null geometry
  const nullGeom = {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: {}, geometry: null }],
  };
  const nullGeomResult = validateGeoJSON(nullGeom);
  assert(nullGeomResult.stats.nullGeometries === 1, "Null geometries detected");

  // Invalid geometry type
  const badGeomType = {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: {}, geometry: { type: "InvalidType", coordinates: [] } },
    ],
  };
  const badGeomResult = validateGeoJSON(badGeomType);
  assert(badGeomResult.stats.invalidFeatures >= 1, "Invalid geometry type detected");

  // Empty feature collection
  const emptyFC = { type: "FeatureCollection", features: [] };
  const emptyResult = validateGeoJSON(emptyFC);
  assert(emptyResult.valid === true, "Empty FeatureCollection is valid (with warning)");
  assert(emptyResult.warnings.length > 0, "Empty FeatureCollection generates warning");

  // ─── 2. CRS Detection Tests ──────────────────────────────────

  console.log("\n--- CRS Detection ---");

  // Explicit CRS in GeoJSON
  const withCrs = {
    type: "FeatureCollection",
    crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    features: [
      { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [79.0, 12.0] } },
    ],
  };
  const crsResult = detectCrsFromGeoJSON(withCrs);
  assert(crsResult.detected === "EPSG:4326", "CRS84 detected as EPSG:4326");
  assert(crsResult.isEpsg4326 === true, "CRS84 recognized as WGS84");
  assert(crsResult.needsTransform === false, "No transform needed for CRS84");

  // No CRS — auto-detect from coordinates
  const noCrs = {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [79.0, 12.0] } },
    ],
  };
  const noCrsResult = detectCrsFromGeoJSON(noCrs);
  assert(noCrsResult.detected === "EPSG:4326", "Auto-detected EPSG:4326 from India coordinates");
  assert(noCrsResult.source === "auto_detect" || noCrsResult.source === "assumed", "Detection source is auto_detect or assumed");

  // CRS metadata builder
  const crsMeta = buildCrsMetadata(crsResult);
  assert(crsMeta.source_crs === "EPSG:4326", "CRS metadata has correct source_crs");
  assert(crsMeta.target_crs === "EPSG:4326", "CRS metadata has correct target_crs");

  // ─── 3. Ingestion Report Tests ───────────────────────────────

  console.log("\n--- Ingestion Report ---");

  const batchId = generateBatchId();
  assert(batchId.startsWith("BATCH-"), "Batch ID has correct prefix");
  assert(batchId.length > 15, "Batch ID has sufficient length");

  const report = createIngestionReport(batchId, "test-ds-1", "Test Dataset", "test_table", "test.geojson", "Test Org");
  assert(report.batchId === batchId, "Report has correct batch ID");
  assert(report.records.read === 0, "Report starts with zero records");
  assert(report.status === "completed", "Report starts with completed status");

  report.records.read = 100;
  report.records.accepted = 95;
  report.records.rejected = 5;
  const finalReport = finalizeReport(report);
  assert(finalReport.durationMs !== undefined, "Report has duration");
  assert(finalReport.endTime !== undefined, "Report has end time");
  assert(finalReport.status === "partial", "Report with rejected records is partial");

  // ─── 4. Dataset Catalog Tests ────────────────────────────────

  console.log("\n--- Dataset Catalog ---");

  assert(MOCK_DATASET_DEFINITIONS.length >= 8, "At least 8 mock dataset definitions exist");

  const geologyMock = MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === "mock-geology-v1");
  assert(geologyMock !== undefined, "Mock geology dataset definition exists");
  assert(geologyMock?.source_status === "MOCK", "Mock geology has MOCK source status");
  assert(geologyMock?.source === "MOCK_GSI", "Mock geology source is MOCK_GSI");

  const statesMock = MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === "mock-states-v1");
  assert(statesMock !== undefined, "Mock states dataset definition exists");
  assert(statesMock?.source_status === "MOCK", "Mock states has MOCK source status");

  // Catalog service operations
  const allDatasets = await datasetCatalogService.listDatasets();
  assert(Array.isArray(allDatasets), "listDatasets returns array");
  assert(allDatasets.length >= 8, "At least 8 datasets in catalog");

  const dsById = await datasetCatalogService.getDatasetById("mock-geology-v1");
  assert(dsById !== null, "getDatasetById returns mock geology");
  assert(dsById?.source_status === "MOCK", "Retrieved dataset has correct source_status");

  const nonExistent = await datasetCatalogService.getDatasetById("nonexistent-dataset");
  assert(nonExistent === null || nonExistent === undefined, "Non-existent dataset returns null");

  // ─── 5. Source Labeling Tests ────────────────────────────────

  console.log("\n--- Source Labeling ---");

  // Layers list includes provenance
  const layers = await gisService.getLayers();
  assert(Array.isArray(layers), "getLayers returns array");
  assert(layers.length === 10, "10 GIS layers available");

  if (layers.length > 0) {
    const firstLayer = layers[0];
    assert("source" in firstLayer, "Layer includes source field");
    assert("sourceStatus" in firstLayer, "Layer includes sourceStatus field");
    assert("version" in firstLayer, "Layer includes version field");
    assert("crs" in firstLayer, "Layer includes crs field");
  }

  // Combined analysis includes data source
  const analysis = await gisService.getCombinedAnalysis(12.94489, 79.95564);
  assert("geologyDataSource" in analysis, "Analysis includes geologyDataSource field");
  assert(
    analysis.geologyDataSource === "REAL_GSI" ||
    analysis.geologyDataSource === "MOCK_GSI" ||
    analysis.geologyDataSource === "SYNTHETIC",
    "geologyDataSource is a valid source type",
  );

  // GeoJSON features include source properties
  const statesGeoJSON = await gisService.getLayerGeoJSON("states");
  assert(statesGeoJSON.type === "FeatureCollection", "States layer is FeatureCollection");
  if (statesGeoJSON.features?.length > 0) {
    const firstFeature = statesGeoJSON.features[0];
    assert("_source" in firstFeature.properties || "source" in firstFeature.properties, 
      "GeoJSON features include source property");
  }

  // ─── 6. Duplicate Detection Tests ────────────────────────────

  console.log("\n--- Duplicate Detection ---");

  const features = [
    { properties: { code: "TN" } },
    { properties: { code: "MH" } },
    { properties: { code: "TN" } }, // duplicate
    { properties: { code: "KA" } },
  ];
  const dups = detectDuplicates(features, "code");
  assert(dups.duplicateCount === 1, "Detects 1 duplicate");
  assert(dups.duplicateValues.includes("TN"), "Duplicate value identified");

  // ─── 7. Phase 4 Regression Tests ─────────────────────────────

  console.log("\n--- Phase 4 Regression ---");

  // Health check
  const health = await gisService.getHealth();
  assert(health.postgisConnected === true, "Health check passes");

  // Location lookup
  const loc = await gisService.getLocation(12.94489, 79.95564);
  assert(loc.latitude === 12.94489 && loc.state === "Tamil Nadu", "Location lookup works");

  // Validation
  assert(validateCoordinates(999, 79).valid === false, "Invalid lat rejected");
  assert(validateCoordinates(12, -999).valid === false, "Invalid lng rejected");
  assert(validateRadius(999999).valid === false, "Excessive radius rejected");
  assert(validateLayer("evil_table").valid === false, "Invalid layer rejected");
  assert(validateLayer("states").valid === true, "Valid layer accepted");

  // Search
  const search = await gisService.search("Sriperumbudur");
  assert(Array.isArray(search) && search.length > 0, "Search returns results");

  // Boundaries
  const boundaries = await gisService.getBoundaries("district");
  assert(boundaries.type === "FeatureCollection", "Boundaries return GeoJSON");

  // Analysis structure
  assert(typeof analysis.location.latitude === "number", "Analysis has lat");
  assert(typeof analysis.administration === "object", "Analysis has admin");
  assert(typeof analysis.geology === "object", "Analysis has geology");
  assert(typeof analysis.water === "object", "Analysis has water");
  assert(typeof analysis.roads === "object", "Analysis has roads");
  assert(typeof analysis.risk === "object", "Analysis has risk");

  // ─── 8. Dataset API Tests ────────────────────────────────────

  console.log("\n--- Dataset API ---");

  // getDatasets
  const datasets = await gisService.getDatasets();
  assert(Array.isArray(datasets), "getDatasets returns array");

  // getDatasetById valid
  const ds = await gisService.getDatasetById("mock-geology-v1");
  assert(ds !== null, "getDatasetById returns data for valid ID");

  // getDatasetById invalid
  try {
    await gisService.getDatasetById("does-not-exist");
    assert(false, "getDatasetById throws for invalid ID");
  } catch (err: any) {
    assert(err.status === 404, "getDatasetById returns 404 for invalid ID");
  }

  // ─── Results ─────────────────────────────────────────────────

  console.log("\n=======================================================");
  console.log(`📊 PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests();
