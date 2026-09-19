import 'dotenv/config';
import { queryPostGIS } from './config/db.js';
import bcrypt from 'bcrypt';

async function seedMocks() {
  const hash = await bcrypt.hash('Admin@1234', 10);
  
  const accounts = [
    { code: 'REV-001', name: 'Tahsildar (Revenue)', email: 'tahsildar@tn.gov.in', dept: 'REVENUE', desig: 'Tahsildar', role: 'TAHSILDAR', dist: 'Kanchipuram', taluk: 'Sriperumbudur' },
    { code: 'SUR-001', name: 'Survey Officer', email: 'survey_officer@tn.gov.in', dept: 'SURVEY', desig: 'Surveyor', role: 'SURVEY_OFFICER', dist: 'Kanchipuram', taluk: 'Sriperumbudur' },
    { code: 'REG-001', name: 'Sub-Registrar', email: 'sub_registrar@tn.gov.in', dept: 'REGISTRATION', desig: 'Sub-Registrar', role: 'SUB_REGISTRAR', dist: 'Kanchipuram', taluk: 'Sriperumbudur' },
    { code: 'PLA-001', name: 'Planning Officer', email: 'planner@tn.gov.in', dept: 'PLANNING', desig: 'DTCP Planner', role: 'PLANNER', dist: 'Kanchipuram', taluk: 'Sriperumbudur' }
  ];

  for (const acc of accounts) {
    const exists = await queryPostGIS(`SELECT id FROM officer_accounts WHERE email = $1`, [acc.email]);
    if (exists.rows.length === 0) {
      await queryPostGIS(`
        INSERT INTO officer_accounts (
          employee_code, full_name, email, phone, department, designation, role, district, taluk, password_hash, account_status
        ) VALUES (
          $1, $2, $3, '044-2000000', $4, $5, $6, $7, $8, $9, 'ACTIVE'
        )
      `, [acc.code, acc.name, acc.email, acc.dept, acc.desig, acc.role, acc.dist, acc.taluk, hash]);
      console.log('Seeded ' + acc.email);
    } else {
      console.log('Exists ' + acc.email);
    }
  }
  process.exit(0);
}
seedMocks();
