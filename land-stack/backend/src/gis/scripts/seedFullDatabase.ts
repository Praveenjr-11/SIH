import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { landCasesData } from '../../data/db.js';

const { Client } = pg;

async function seedFullDatabase() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'Praveen@2005';
  const dbName = process.env.PGDATABASE || 'landstack_gis';

  console.log(`==========================================================`);
  console.log(`🌱 Seeding Full PostgreSQL Database '${dbName}'`);
  console.log(`==========================================================`);

  const client = new Client({ host, port, user, password, database: dbName });
  await client.connect();

  // Step 1: Seed Roles
  console.log('[Seed] Seeding Roles...');
  const roles = [
    { code: 'ROLE_ADMIN', name: 'State Administrator', rank: 1 },
    { code: 'ROLE_COLLECTOR', name: 'District Collector', rank: 2 },
    { code: 'ROLE_DRO', name: 'District Revenue Officer', rank: 3 },
    { code: 'ROLE_RDO', name: 'Revenue Divisional Officer', rank: 4 },
    { code: 'ROLE_TAHSILDAR', name: 'Tahsildar', rank: 5 },
    { code: 'ROLE_SURVEYOR', name: 'Survey Officer', rank: 9 },
    { code: 'ROLE_VAO', name: 'Village Administrative Officer', rank: 8 }
  ];

  const roleIdMap: Record<string, number> = {};
  for (const r of roles) {
    const res = await client.query(`
      INSERT INTO roles (role_code, role_name, level_rank)
      VALUES ($1, $2, $3)
      ON CONFLICT (role_code) DO UPDATE SET role_name = EXCLUDED.role_name
      RETURNING id;
    `, [r.code, r.name, r.rank]);
    roleIdMap[r.code] = res.rows[0].id;
  }
  console.log(`  ✅ Roles seeded (${Object.keys(roleIdMap).length} roles).`);

  // Step 2: Seed Demo Officers
  console.log('[Seed] Seeding Demo Officers...');
  const demoPasswordHash = await bcrypt.hash('demo1234', 10);

  const demoOfficers = [
    { code: 'OFF-TN-001', name: 'K. Ramachandran, IAS', email: 'collector.kanchipuram@tn.gov.in', designation: 'District Collector', role: 'ROLE_COLLECTOR', dist: 'Kanchipuram' },
    { code: 'OFF-TN-002', name: 'S. Sundaram, DRO', email: 'dro.kanchipuram@tn.gov.in', designation: 'District Revenue Officer', role: 'ROLE_DRO', dist: 'Kanchipuram' },
    { code: 'OFF-TN-003', name: 'V. Jayaraman', email: 'tahsildar.sriperumbudur@tn.gov.in', designation: 'Tahsildar', role: 'ROLE_TAHSILDAR', dist: 'Kanchipuram' },
    { code: 'OFF-TN-004', name: 'M. Loganathan', email: 'surveyor.sriperumbudur@tn.gov.in', designation: 'Senior Survey Officer', role: 'ROLE_SURVEYOR', dist: 'Kanchipuram' },
    { code: 'OFF-TN-005', name: 'P. Karuppasamy', email: 'admin@landstack.gov.in', designation: 'State System Administrator', role: 'ROLE_ADMIN', dist: 'Chennai' }
  ];

  const officerIdMap: Record<string, number> = {};
  for (const off of demoOfficers) {
    const roleId = roleIdMap[off.role] || roleIdMap['ROLE_TAHSILDAR'];
    const res = await client.query(`
      INSERT INTO officers (officer_code, full_name, email, password_hash, designation, role_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
      RETURNING id;
    `, [off.code, off.name, off.email, demoPasswordHash, off.designation, roleId]);
    officerIdMap[off.code] = res.rows[0].id;
  }
  console.log(`  ✅ Demo Officers seeded (${Object.keys(officerIdMap).length} officers).`);

  // Step 3: Seed 114 Land Cases
  console.log(`[Seed] Seeding ${landCasesData.length} Land Cases...`);
  let insertedCases = 0;

  for (const c of landCasesData) {
    try {
      const assignedOfficerId = officerIdMap['OFF-TN-003']; // Default to Tahsildar
      await client.query(`
        INSERT INTO cases (
          case_number, title, description, case_type, status, priority,
          latitude, longitude, state_name, district_name, subdistrict, village_name,
          assigned_officer_id, risk_score, risk_level
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15
        )
        ON CONFLICT (case_number) DO NOTHING;
      `, [
        c.caseNumber,
        c.title,
        `Case for ${c.caseType} on Survey No. ${c.surveyNumber}, ${c.village}`,
        c.caseType,
        c.status === 'OFFICER_REVIEW' ? 'OFFICER_REVIEW' : c.status === 'FIELD_INSPECTION' ? 'FIELD_INSPECTION' : c.status === 'APPROVED' ? 'APPROVED' : 'NEW',
        c.priority === 'CRITICAL' ? 'URGENT' : c.priority,
        c.latitude,
        c.longitude,
        'Tamil Nadu',
        c.district,
        c.taluk,
        c.village,
        assignedOfficerId,
        c.riskAssessment?.compositeScore || 30,
        c.riskAssessment?.riskLevel || 'LOW'
      ]);
      insertedCases++;
    } catch (err: any) {
      console.warn(`  ⚠️ Case insertion failed for ${c.caseNumber}:`, err.message);
    }
  }
  console.log(`  ✅ Successfully seeded ${insertedCases} Land Cases into 'cases' table.`);

  // Step 4: Seed Audit Log
  console.log('[Seed] Seeding Initial Audit Log...');
  await client.query(`
    INSERT INTO audit_logs (officer_id, officer_role, action_type, provenance_note)
    VALUES ($1, $2, $3, $4)
  `, [
    officerIdMap['OFF-TN-005'],
    'ROLE_ADMIN',
    'DATABASE_INIT_SUCCESS',
    'PostgreSQL 23-table schema initialized and seeded successfully.'
  ]);
  console.log('  ✅ Audit Log seeded.');

  // Summary
  const caseCountRes = await client.query('SELECT count(*) FROM cases');
  const officerCountRes = await client.query('SELECT count(*) FROM officers');
  const parcelCountRes = await client.query('SELECT count(*) FROM parcels');

  console.log('\n==========================================================');
  console.log('📊 Seeding Summary in PostgreSQL:');
  console.log(`   - Officers: ${officerCountRes.rows[0].count}`);
  console.log(`   - Cases:    ${caseCountRes.rows[0].count}`);
  console.log(`   - Parcels:  ${parcelCountRes.rows[0].count}`);
  console.log('==========================================================');

  await client.end();
  console.log('✨ All Seeding Tasks Completed Successfully!');
}

seedFullDatabase().catch(console.error);
