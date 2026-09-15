process.env.NODE_ENV = 'test';
process.env.TEST_MODE = 'true';

import http from 'http';

function makeRequest(port: number, path: string, headers: Record<string, string> = {}): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.get({
      hostname: '127.0.0.1',
      port,
      path,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode || 500, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
  });
}

async function runPhase1FoundationTests() {
  console.log("========================================================================");
  console.log("🚀 RUNNING PHASE 01 — BACKEND / API FOUNDATION & OWASP SECURITY SUITE");
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

  const { app } = await import('../server.js');

  // Start test server on ephemeral port 5005
  const TEST_PORT = 5005;
  const server = app.listen(TEST_PORT);

  await new Promise(resolve => setTimeout(resolve, 500));

  const VALID_AUTH_HEADER = { 'Authorization': 'Bearer DEMO_OFFICER_TOKEN_DISTRICT_COLLECTOR' };

  try {
    // 1. Check API Health Base Endpoint (Public)
    const healthRes = await makeRequest(TEST_PORT, '/api/v1/health');
    assert(
      healthRes.status === 200 &&
      healthRes.body.status === 'HEALTHY' &&
      healthRes.body.platform === 'LAND STACK SIH 2026 REST API',
      "GET /api/v1/health returns HTTP 200 with platform health metadata"
    );

    // 2. Check Database Health Endpoint (Public)
    const dbHealthRes = await makeRequest(TEST_PORT, '/api/v1/health/database');
    assert(
      dbHealthRes.status === 200 &&
      (dbHealthRes.body.status === 'HEALTHY' || dbHealthRes.body.status === 'DEGRADED'),
      "GET /api/v1/health/database returns HTTP 200 with PostGIS connection status"
    );

    // 3. Check Spatial Engine Health Endpoint (Public)
    const spatialHealthRes = await makeRequest(TEST_PORT, '/api/v1/health/spatial');
    assert(
      spatialHealthRes.status === 200 &&
      spatialHealthRes.body.engine.includes('PostGIS'),
      "GET /api/v1/health/spatial returns HTTP 200 with PostGIS & TNGIS status"
    );

    // 4. OWASP SECURITY TEST: Reject Unauthenticated Direct API Access to Restricted Officer Endpoints
    const unauthDashboardRes = await makeRequest(TEST_PORT, '/api/v1/dashboard');
    assert(
      unauthDashboardRes.status === 401 &&
      unauthDashboardRes.body.success === false &&
      unauthDashboardRes.body.error.code === 'UNAUTHORIZED',
      "OWASP Security: Unauthenticated request to /api/v1/dashboard is blocked with HTTP 401 Unauthorized"
    );

    const unauthCasesRes = await makeRequest(TEST_PORT, '/api/v1/cases');
    assert(
      unauthCasesRes.status === 401 &&
      unauthCasesRes.body.error.code === 'UNAUTHORIZED',
      "OWASP Security: Unauthenticated request to /api/v1/cases is blocked with HTTP 401 Unauthorized"
    );

    const unauthOfficersRes = await makeRequest(TEST_PORT, '/api/v1/officers');
    assert(
      unauthOfficersRes.status === 401 &&
      unauthOfficersRes.body.error.code === 'UNAUTHORIZED',
      "OWASP Security: Unauthenticated request to /api/v1/officers is blocked with HTTP 401 Unauthorized"
    );

    // 5. Check Request ID Middleware Generation
    assert(
      typeof healthRes.headers['x-request-id'] === 'string' && (healthRes.headers['x-request-id'] as string).length > 10,
      "Request ID middleware automatically attaches unique X-Request-ID header to responses"
    );

    // 6. Check Request ID Middleware Header Propagation
    const customReqId = 'custom-test-uuid-12345';
    const reqIdRes = await makeRequest(TEST_PORT, '/api/v1/health', { 'x-request-id': customReqId });
    assert(
      reqIdRes.headers['x-request-id'] === customReqId,
      "Request ID middleware preserves incoming X-Request-ID header"
    );

    // 7. Check OpenAPI Specification Endpoint (Public)
    const openapiRes = await makeRequest(TEST_PORT, '/api/v1/openapi.json');
    assert(
      openapiRes.status === 200 &&
      openapiRes.body.openapi === '3.0.3' &&
      openapiRes.body.info.title.includes('LAND STACK'),
      "GET /api/v1/openapi.json returns valid OpenAPI 3.0 specification"
    );

    // 8. Check Swagger UI HTML Docs Endpoint (Public)
    const docsRes = await makeRequest(TEST_PORT, '/api/v1/docs');
    assert(
      docsRes.status === 200 &&
      typeof docsRes.body === 'string' &&
      docsRes.body.includes('SwaggerUIBundle'),
      "GET /api/v1/docs serves interactive Swagger UI documentation page"
    );

    // 9. Check Officers API Route (Authenticated)
    const officersRes = await makeRequest(TEST_PORT, '/api/v1/officers', VALID_AUTH_HEADER);
    assert(
      officersRes.status === 200 &&
      officersRes.body.success === true &&
      Array.isArray(officersRes.body.officers) &&
      officersRes.body.officers.length > 0,
      "GET /api/v1/officers with valid bearer token returns HTTP 200 officer registry"
    );

    // 10. Check Land Core API Route (Authenticated)
    const landRes = await makeRequest(TEST_PORT, '/api/v1/land/records', VALID_AUTH_HEADER);
    assert(
      landRes.status === 200 &&
      landRes.body.success === true &&
      Array.isArray(landRes.body.records) &&
      landRes.body.records.length > 0,
      "GET /api/v1/land/records with valid bearer token returns HTTP 200 land records"
    );

    // 11. Check Government Adapter Status API Route (Authenticated)
    const govtRes = await makeRequest(TEST_PORT, '/api/v1/government/status', VALID_AUTH_HEADER);
    assert(
      govtRes.status === 200 &&
      govtRes.body.success === true &&
      govtRes.body.state === 'Tamil Nadu' &&
      govtRes.body.integrations.landRecords.status === 'CONNECTED',
      "GET /api/v1/government/status with valid bearer token returns state ecosystem statuses"
    );

    // 12. Check Standardized Error Handling (404 Not Found)
    const nonExistentRes = await makeRequest(TEST_PORT, '/api/v1/non-existent-route-123');
    assert(
      nonExistentRes.status === 404 &&
      nonExistentRes.body.success === false &&
      nonExistentRes.body.error.code === 'NOT_FOUND',
      "Standardized error handling middleware formats 404 response with error envelope"
    );

    // 13. Check Frozen GIS Layer Endpoints (/api/gis/layer/cadastral_parcels) (Public Map)
    const gisParcelsRes = await makeRequest(TEST_PORT, '/api/gis/layer/cadastral_parcels?bbox=79.94,12.94,79.96,12.96');
    assert(
      gisParcelsRes.status === 200 &&
      gisParcelsRes.body.type === 'FeatureCollection',
      "Frozen GIS route /api/gis/layer/cadastral_parcels remains 100% operational"
    );

  } catch (err: any) {
    console.error("Phase 01 test execution error:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log("========================================================================");
  console.log(`📊 PHASE 01 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase1FoundationTests();
