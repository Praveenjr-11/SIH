import { identifyParcelAtPoint } from '../gis/tngis/tngisIdentifyAdapter.js';
import { getTamilNilamRecord } from '../gis/adapters/tamilNilamAdapter.js';

async function runOfficialLandDataTests() {
  console.log("=======================================================");
  console.log("🧪 RUNNING TNGIS & TAMIL NILAM OFFICIAL DATA TEST SUITE");
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
    // Test 1: TNGIS Parcel Identification at Pollachi / Coimbatore pilot coordinates
    const lat = 10.6609;
    const lng = 77.0048;
    const parcel = await identifyParcelAtPoint(lat, lng);

    assert(Boolean(parcel.parcel_id), "TNGIS Identify returns valid parcel_id");
    assert(parcel.district.length > 0, `Parcel identified in district: ${parcel.district}`);
    assert(Boolean(parcel.survey_number), `Parcel has survey number: S.No ${parcel.survey_number}/${parcel.subdivision_number}`);
    assert((parcel.area_sqft || 0) > 0, `Parcel area calculated: ${parcel.area_sqft} sq.ft`);

    // Test 2: Tamil Nilam Land Record Adapter - Unauthenticated Citizen View
    const recordUnauth = await getTamilNilamRecord(parcel, { officerAuthenticated: false });
    assert(recordUnauth.ownership.status === 'NOT_CONNECTED', "Unauthenticated citizen query yields NOT_CONNECTED ownership status");
    assert(recordUnauth.ownership.records.length === 0, "No fake owner names returned in NOT_CONNECTED state");
    assert(recordUnauth.land_type.length > 0, `Land classification: ${recordUnauth.land_type}`);
    assert(recordUnauth.tax.length > 0, `Tax calculation: ${recordUnauth.tax}`);

    // Test 3: Tamil Nilam Land Record Adapter - Authenticated Officer View
    const recordAuth = await getTamilNilamRecord(parcel, { officerAuthenticated: true });
    assert(recordAuth.ownership.status === 'AVAILABLE' || recordAuth.ownership.status === 'RESTRICTED', `Authenticated officer query yields valid state: ${recordAuth.ownership.status}`);

    console.log("-------------------------------------------------------");
    console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log("=======================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("❌ Test suite crashed with error:", err);
    process.exit(1);
  }
}

runOfficialLandDataTests();
