import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

async function alterCases() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'Praveen@2005';
  const dbName = process.env.PGDATABASE || 'landstack_gis';

  const client = new Client({ host, port, user, password, database: dbName });
  await client.connect();

  try {
    // 1. Drop existing constraint
    const checkRes = await client.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'cases'::regclass AND contype = 'c' AND conname LIKE '%status%';
    `);
    
    if (checkRes.rows.length > 0) {
      const constraintName = checkRes.rows[0].conname;
      await client.query(`ALTER TABLE cases DROP CONSTRAINT ${constraintName}`);
      console.log(`Dropped constraint ${constraintName}`);
    }

    // 2. Add new constraint
    await client.query(`
      ALTER TABLE cases ADD CONSTRAINT cases_status_check CHECK (status IN (
        'NEW', 'CASE_CREATED', 'PARCEL_IDENTIFIED', 
        'REVENUE_VERIFICATION', 'SURVEY_VERIFICATION', 'REGISTRATION_VERIFICATION', 
        'GOVERNMENT_LAND_CHECK', 'PLANNING_AND_CONSTRAINT_CHECK', 'FIELD_INSPECTION', 
        'CONSOLIDATED_REVIEW', 'OFFICER_RECOMMENDATION', 'CLARIFICATION_REQUIRED',
        'APPROVED', 'REJECTED', 'CLOSED',
        'DOCUMENT_VERIFICATION', 'GIS_ANALYSIS', 'OFFICER_REVIEW', 'RECOMMENDATION'
      ));
    `);
    console.log('Added new cases_status_check constraint');

    // 3. Create case_department_verifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS case_department_verifications (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        department VARCHAR(100) NOT NULL,
        verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK (verification_status IN (
          'PENDING', 'IN_PROGRESS', 'VERIFIED', 'CONFLICT_FOUND', 'DOCUMENT_REQUIRED',
          'FIELD_INSPECTION_REQUIRED', 'SOURCE_UNAVAILABLE', 'ACCESS_RESTRICTED', 'NOT_APPLICABLE', 'REJECTED'
        )),
        verified_by_officer_id INTEGER REFERENCES officers(id),
        verified_at TIMESTAMPTZ,
        findings JSONB,
        evidence_ids JSONB,
        remarks TEXT,
        requires_further_review BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (case_id, department)
      );
    `);
    console.log('Created case_department_verifications table');

    await client.query(`CREATE INDEX IF NOT EXISTS idx_case_dept_verif_case ON case_department_verifications (case_id);`);
    console.log('Created index on case_id');

  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

alterCases().catch(console.error);
