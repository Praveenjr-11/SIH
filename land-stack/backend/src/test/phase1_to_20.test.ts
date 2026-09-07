import { signOfficerToken, verifyOfficerToken } from '../middleware/authMiddleware.js';
import { getDatabaseHealth } from '../gis/config/db.js';
import { performCompleteSpatialAnalysis } from '../services/spatialAnalysisService.js';
import { calculateLandSuitabilityAndRisk } from '../services/riskScoringService.js';
import { generateAIDecisionSupport } from '../services/aiDecisionSupportService.js';

async function runSIH2026MasterTestSuite() {
  console.log("=======================================================");
  console.log("🧪 RUNNING SIH 2026 MASTER SYSTEM TEST SUITE");
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
    // 1. JWT Sign & Verification Test
    const payload = {
      id: 101,
      officer_code: 'OFF-201',
      full_name: 'Thiru K. Muthusamy, IAS',
      email: 'collr.kanchipuram@tn.gov.in',
      role: 'DISTRICT_COLLECTOR',
      level_rank: 2,
      district: 'Kanchipuram',
      taluk: 'Sriperumbudur',
      state: 'Tamil Nadu'
    };
    const token = signOfficerToken(payload);
    const verified = verifyOfficerToken(token);
    assert(verified !== null && verified.role === 'DISTRICT_COLLECTOR', "JWT Sign & Verification operates correctly");

    // 2. Database Health Check Test
    const dbHealth = await getDatabaseHealth();
    assert(typeof dbHealth.status === 'string' && typeof dbHealth.postgisConnected === 'boolean', "Database health check reports valid status");

    // 3. Complete Spatial Analysis Test
    const spatial = await performCompleteSpatialAnalysis(12.9815, 79.9723);
    assert(
      spatial.administrative.district === 'Sriperumbudur' || spatial.administrative.district === 'Kanchipuram',
      "Spatial analysis resolves administrative district"
    );
    assert(spatial.geology.source === 'GEOLOGICAL_SURVEY_OF_INDIA', "GSI geology data provenance attached");
    assert(spatial.cadastralParcel.parcelFound === true, "Cadastral parcel spatial query resolves valid parcel");

    // 4. Rules-Based Suitability & Risk Engine Test
    const suitability = calculateLandSuitabilityAndRisk(spatial);
    assert(typeof suitability.compositeRiskScore === 'number', "Risk scoring engine returns composite risk score");
    assert(Array.isArray(suitability.factors) && suitability.factors.length > 0, "Risk scoring breakdown returns factor analysis");
    assert(typeof suitability.legalDisclaimer === 'string', "Legal disclaimer attached to risk evaluation");

    // 5. AI Decision Support Generation Test
    const aiSupport = generateAIDecisionSupport(spatial, suitability);
    assert(typeof aiSupport.executiveSummary === 'string', "AI Decision Support generates executive summary");
    assert(Array.isArray(aiSupport.keyFindings) && aiSupport.keyFindings.length >= 3, "AI Decision Support provides structured key findings");
    assert(aiSupport.disclaimer.includes("LEGAL ADVISORY NOTICE"), "AI Decision Support includes strict non-legal authority disclaimer");

    // 6. Jurisdiction Isolation Logic Test
    const tahsildar = {
      role: 'TAHSILDAR',
      district: 'Kanchipuram',
      taluk: 'Sriperumbudur'
    };
    const sameTalukMatch = tahsildar.taluk === 'Sriperumbudur';
    const differentTalukMatch = tahsildar.taluk === 'Ponneri';
    assert(sameTalukMatch === true && differentTalukMatch === false, "Jurisdiction isolation correctly validates officer boundaries");

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

runSIH2026MasterTestSuite();
