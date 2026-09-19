import 'dotenv/config';
import fetch from 'node-fetch';

const API = 'http://127.0.0.1:5000/api/v1';
let adminToken = '';

async function runTests() {
  console.log("🏃 Running Auth & Security Tests...\n");

  try {
    // 1. Successful Login
    console.log("🧪 Test: Successful Admin Login");
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@tn.gov.in', password: 'Admin@1234' })
    });
    const loginData = await loginRes.json();
    if (loginData.success && loginData.token) {
      console.log("✅ Passed");
      adminToken = loginData.token;
    } else {
      console.error("❌ Failed", loginData);
    }

    // 2. Invalid Password
    console.log("\n🧪 Test: Invalid Password");
    const badLoginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@tn.gov.in', password: 'WrongPassword' })
    });
    if (badLoginRes.status === 401) console.log("✅ Passed (401 Unauthorized)");
    else console.error("❌ Failed");

    // 3. Missing Authentication
    console.log("\n🧪 Test: Missing Authentication for Protected Route");
    const noAuthRes = await fetch(`${API}/admin/officers`);
    if (noAuthRes.status === 401) console.log("✅ Passed (401 Unauthorized)");
    else console.error("❌ Failed");

    // 4. Provision a Survey Officer
    console.log("\n🧪 Test: Provisioning a test Survey Officer");
    const provRes = await fetch(`${API}/admin/officers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        employee_code: `TEST-${Date.now()}`,
        full_name: 'Test Survey Officer',
        email: `survey_${Date.now()}@tn.gov.in`,
        department: 'Survey',
        designation: 'Surveyor',
        role: 'SURVEY_OFFICER',
        district: 'Chennai',
        password: 'Password123'
      })
    });
    const provData = await provRes.json();
    if (provRes.status === 201) console.log("✅ Passed");
    else console.error("❌ Failed", provData);

    const testEmail = provData.officer.email;
    const testId = provData.officer.id;

    // 5. Unauthorized Role Access
    console.log("\n🧪 Test: Unauthorized Role Access (Survey Officer trying to access Admin API)");
    const surveyLogin = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'Password123' })
    });
    const surveyData = await surveyLogin.json();
    const surveyToken = surveyData.token;

    const unauthorizedRes = await fetch(`${API}/admin/officers`, {
      headers: { 'Authorization': `Bearer ${surveyToken}` }
    });
    if (unauthorizedRes.status === 403) console.log("✅ Passed (403 Forbidden)");
    else console.error("❌ Failed", await unauthorizedRes.text());

    // 6. Suspended Account
    console.log("\n🧪 Test: Suspending Account and Testing Login Denial");
    await fetch(`${API}/admin/officers/${testId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'SUSPENDED' })
    });

    const suspendedLoginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'Password123' })
    });
    if (suspendedLoginRes.status === 403) console.log("✅ Passed (403 Account Suspended)");
    else console.error("❌ Failed", await suspendedLoginRes.json());

    // 7. Sensitive field redaction (Checking if GET /me exposes password hash)
    console.log("\n🧪 Test: Sensitive-field redaction (GET /me)");
    const meRes = await fetch(`${API}/auth/me`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const meData = await meRes.json();
    if (!meData.officer.password_hash) console.log("✅ Passed (No password_hash exposed)");
    else console.error("❌ Failed");

    console.log("\n🎉 All integration tests complete.");
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runTests();
