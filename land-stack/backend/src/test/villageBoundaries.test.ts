import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { parseVillageZip, importVillageBoundaryZips } from '../gis/scripts/villageBoundaryImporter.js';
import { gisRepository } from '../gis/repositories/gisRepository.js';
import { gisService } from '../gis/services/gisService.js';

async function runVillageBoundaryTests() {
  console.log('====================================================');
  console.log('RUNNING VILLAGE BOUNDARY DATABASE INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASSED: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAILED: ${name}`);
      console.error(`    └─ ${err.message}`);
      failed++;
    }
  }

  // Test 1: Check presence of state ZIP archives in D:\SIH or backend/gis-data
  await test('Verify presence of India Village Boundary ZIP files', async () => {
    const isZipAvailable = fs.existsSync('D:\\SIH\\CHANDIGARH.zip') || fs.existsSync('D:\\SIH\\LAKSHYADWEEP.zip');
    assert.strictEqual(isZipAvailable, true, 'Village boundary ZIP files should exist in D:\\SIH\\');
  });

  // Test 2: Parse CHANDIGARH.zip Shapefile archive
  await test('Parse Shapefile ZIP archive for Chandigarh', async () => {
    const zipPath = 'D:\\SIH\\CHANDIGARH.zip';
    if (!fs.existsSync(zipPath)) {
      console.log('    └─ Skipping test (zip file path not found)');
      return;
    }
    const { stateName, features } = await parseVillageZip(zipPath);
    assert.strictEqual(features.length > 0, true, 'Chandigarh ZIP should contain parsed features');
    assert.ok(features[0].name, 'Feature should have a village name');
    assert.ok(features[0].district_name, 'Feature should have a district name');
  });

  // Test 3: Parse GOA.zip Shapefile archive
  await test('Parse Shapefile ZIP archive for Goa', async () => {
    const zipPath = 'D:\\SIH\\GOA.zip';
    if (!fs.existsSync(zipPath)) {
      console.log('    └─ Skipping test (zip file path not found)');
      return;
    }
    const { stateName, features } = await parseVillageZip(zipPath);
    assert.strictEqual(features.length >= 400, true, 'Goa ZIP should contain ~433 parsed villages');
    assert.strictEqual(features[0].state_name.toUpperCase(), 'GOA', 'State name should be GOA');
  });

  // Test 4: Verify Ingestion Report File Generation
  await test('Verify Village Boundary Ingestion Summary Report', async () => {
    const reportPath = path.join(process.cwd(), 'gis-data', 'metadata', 'ingestion-reports', 'village-boundaries-report.json');
    assert.strictEqual(fs.existsSync(reportPath), true, 'village-boundaries-report.json report must exist');

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    assert.strictEqual(report.totalVillagesParsed > 200000, true, 'Report should document over 200,000 parsed villages across India');
    assert.strictEqual(report.statesCoveredCount, 19, 'Report should document 19 states/UTs covered');
  });

  // Test 5: Test GIS Repository Village Stats API
  await test('Query Village Boundary Statistics via Repository', async () => {
    const stats = await gisRepository.getVillageSummaryStats();
    assert.strictEqual(stats.totalVillages >= 261500, true, 'Stats should reflect at least 261,500 total India villages');
    assert.strictEqual(stats.totalStates, 19, 'Stats should reflect 19 states/UTs');
    assert.strictEqual(stats.source, 'REAL_VILLAGE_BOUNDARY', 'Source tag should be REAL_VILLAGE_BOUNDARY');
  });

  // Test 6: Test Layer Control List includes Village Boundaries
  await test('Verify Layer Control Panel metadata includes Village Boundaries layer', async () => {
    const layers = await gisRepository.getLayersList();
    const villageLayer = layers.find((l) => l.layer === 'villages');
    assert.ok(villageLayer, 'Villages layer must exist in GIS layer metadata');
    assert.strictEqual(villageLayer.available, true, 'Villages layer should be available');
    assert.strictEqual(villageLayer.category, 'administrative', 'Category should be administrative');
  });

  // Test 7: Test GIS Layer GeoJSON fallback for Villages
  await test('Fetch Village Layer GeoJSON FeatureCollection', async () => {
    const geojson = await gisRepository.getLayerGeoJSON('villages');
    assert.strictEqual(geojson.type, 'FeatureCollection', 'Result must be a GeoJSON FeatureCollection');
    assert.ok(Array.isArray(geojson.features), 'GeoJSON features must be an array');
  });

  // Test 8: Test Memory ZIP upload importer with CHANDIGARH.zip
  await test('Process uploaded Shapefile ZIP buffer in memory', async () => {
    const zipPath = 'D:\\SIH\\CHANDIGARH.zip';
    if (!fs.existsSync(zipPath)) return;
    const buffer = fs.readFileSync(zipPath);
    const result = await gisService.uploadVillageZip(buffer, 'CHANDIGARH.zip');
    assert.strictEqual(result.filename, 'CHANDIGARH.zip');
    assert.strictEqual(result.parsedCount, 35, 'Chandigarh should yield 35 village polygons');
  });

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVillageBoundaryTests().catch((err) => {
  console.error('Fatal error running village boundary tests:', err);
  process.exit(1);
});
