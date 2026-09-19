import 'dotenv/config';
import { queryPostGIS } from '../config/db.js';
import bcrypt from 'bcrypt';

async function migrate() {
  console.log("🚀 Starting officer_accounts migration...");

  try {
    await queryPostGIS(`
      CREATE TABLE IF NOT EXISTS officer_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_code VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(150) NOT NULL,
        designation VARCHAR(150) NOT NULL,
        role VARCHAR(80) NOT NULL,
        district VARCHAR(100),
        taluk VARCHAR(100),
        password_hash TEXT NOT NULL,
        account_status VARCHAR(30) DEFAULT 'PENDING',
        mfa_enabled BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ officer_accounts table created successfully.");

    // Check if SUPER_ADMIN exists
    const adminCheck = await queryPostGIS(`SELECT id FROM officer_accounts WHERE role = 'SUPER_ADMIN' LIMIT 1`);
    if (adminCheck.rows.length === 0) {
      console.log("⚠️ No SUPER_ADMIN found. Provisioning default super admin...");
      const passwordHash = await bcrypt.hash('Admin@1234', 10);
      
      await queryPostGIS(`
        INSERT INTO officer_accounts (
          employee_code, full_name, email, phone, department, designation, role, password_hash, account_status
        ) VALUES (
          'ADM-001', 'System Administrator', 'admin@tn.gov.in', '044-2000000', 'IT & Digital Governance', 'Chief Admin', 'SUPER_ADMIN', $1, 'ACTIVE'
        )
      `, [passwordHash]);
      console.log("✅ Default SUPER_ADMIN provisioned. Email: admin@tn.gov.in | Password: Admin@1234");
    } else {
      console.log("ℹ️ SUPER_ADMIN already exists. Skipping provisioning.");
    }

    console.log("🎉 Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
