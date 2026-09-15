// Quick test: does the TNGIS client actually fetch real data?
import 'dotenv/config';
import { fetchTNGISLayer, getLayerConfig } from './src/gis/tngis/tngisClient.js';

async function main() {
  console.log('=== TNGIS Live Fetch Test ===\n');

  // Test 1: Taluks (the broken layer)
  console.log('1. Testing taluks (Tamil Nadu bbox):');
  try {
    const r = await fetchTNGISLayer('taluks', [76.0, 8.0, 81.0, 14.0], 100);
    console.log(`   ✅ SUCCESS: ${r.featureCount} features, source: ${r.source}, cached: ${r.fromCache}`);
    if (r.geojson.features.length > 0) {
      const f = r.geojson.features[0];
      console.log(`   Sample feature: ${JSON.stringify(f.properties).slice(0, 150)}`);
    }
  } catch (err: any) {
    console.log(`   ❌ FAILED: ${err.message}`);
  }

  // Test 2: Districts
  console.log('\n2. Testing districts:');
  try {
    const r = await fetchTNGISLayer('districts', [76.0, 8.0, 81.0, 14.0], 50);
    console.log(`   ✅ SUCCESS: ${r.featureCount} features, source: ${r.source}`);
  } catch (err: any) {
    console.log(`   ❌ FAILED: ${err.message}`);
  }

  // Test 3: Blocks
  console.log('\n3. Testing blocks:');
  try {
    const r = await fetchTNGISLayer('blocks', [76.0, 8.0, 81.0, 14.0], 100);
    console.log(`   ✅ SUCCESS: ${r.featureCount} features, source: ${r.source}`);
  } catch (err: any) {
    console.log(`   ❌ FAILED: ${err.message}`);
  }

  console.log('\n=== Done ===');
}

main().catch(console.error);
