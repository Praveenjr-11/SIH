/**
 * seedOfficersFromCSV.ts
 *
 * One-time seed script: reads the Tamil Nadu verified administrative officers CSV
 * from the repo root and upserts all rows into the tn_administrative_officers table.
 *
 * Run with: npm run gis:seed-officers
 *    (from land-stack/backend directory)
 *
 * This is idempotent — safe to re-run after CSV updates.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// CSV lives at repo root (SIH/).
// This file is at: backend/src/gis/scripts/seedOfficersFromCSV.ts
// So __dirname + '../../../../../' = SIH/ repo root (5 dirs up from scripts/)
// Also try 4 dirs up in case of flatter dist directory structure.
const POSSIBLE_CSV_PATHS = [
  path.join(currentDir, '../../../../../tamil_nadu_verified_administrative_officers.csv'),
  path.join(currentDir, '../../../../tamil_nadu_verified_administrative_officers.csv'),
  path.join(process.cwd(), '../../tamil_nadu_verified_administrative_officers.csv'),
  path.join(process.cwd(), 'gis-data', 'tamil_nadu_verified_administrative_officers.csv'),
];

interface OfficerRow {
  state: string;
  district: string;
  administrativeLevel: string;
  designation: string;
  officerName: string;
  officialEmail: string;
  officialMobile: string;
  officeLandline: string;
  sourceUrl: string;
  verifiedDate: string;
  dataStatus: string;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function loadCSV(): { officers: OfficerRow[]; filePath: string } | null {
  for (const filePath of POSSIBLE_CSV_PATHS) {
    if (!fs.existsSync(filePath)) continue;

    console.log(`  Found CSV at: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      console.warn(`  ⚠️  File is empty or header-only: ${filePath}`);
      continue;
    }

    const header = lines[0].toLowerCase();
    // Detect format: State,District,Administrative_Level,Designation,Officer_Name,...
    const isNewFormat = header.includes('official_phone') || header.includes('source_type');

    const officers: OfficerRow[] = [];
    const seen = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 5) continue;

      let row: OfficerRow;

      if (isNewFormat) {
        row = {
          state: 'Tamil Nadu',
          district: cols[3] || '',
          administrativeLevel: (cols[1] || '').toLowerCase().includes('collector') ? 'District'
            : (cols[1] || '').toLowerCase().includes('tahsildar') ? 'Taluk' : 'District',
          designation: cols[1] || '',
          officerName: cols[0] || cols[1] || '',
          officialEmail: cols[5] || '',
          officialMobile: cols[4] || '',
          officeLandline: '',
          sourceUrl: cols[6] || 'https://tnrd.tn.gov.in',
          verifiedDate: cols[9] || '2026-09-14',
          dataStatus: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
        };
      } else {
        // State,District,Administrative_Level,Designation,Officer_Name,Official_Email,Official_Mobile,Office_Landline,Source_URL,Verified_Date,Data_Status
        row = {
          state: cols[0] || 'Tamil Nadu',
          district: cols[1] || '',
          administrativeLevel: cols[2] || 'District',
          designation: cols[3] || '',
          officerName: cols[4] || cols[3] || '',
          officialEmail: cols[5] || '',
          officialMobile: cols[6] || '',
          officeLandline: cols[7] || '',
          sourceUrl: cols[8] || 'https://tn.gov.in',
          verifiedDate: cols[9] || '2026-09-07',
          dataStatus: cols[10] || 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
        };
      }

      // Deduplicate on email (or district+designation if no email)
      const dedupeKey = (row.officialEmail || `${row.district}__${row.designation}`).toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      officers.push(row);
    }

    return { officers, filePath };
  }

  return null;
}

async function seedOfficers() {
  console.log('=============================================================');
  console.log('🌱  SIH 2026 — TN Administrative Officers DB Seeder');
  console.log('=============================================================');

  // 1. Load CSV
  console.log('\n📂 Searching for officers CSV...');
  const csvResult = loadCSV();
  if (!csvResult) {
    console.error('❌ CSV file not found in any of these locations:');
    POSSIBLE_CSV_PATHS.forEach(p => console.error(`   - ${p}`));
    console.error('\nEnsure the CSV exists at the repo root (SIH/) and re-run.');
    process.exit(1);
  }

  const { officers, filePath } = csvResult;
  console.log(`✅ Loaded ${officers.length} officer records from:\n   ${filePath}`);

  // 2. Connect to Postgres
  const client = new Client({
    connectionString: process.env.POSTGIS_URL || process.env.DATABASE_URL,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || 'landstack_gis',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'Praveen@2005',
  });

  console.log('\n🔌 Connecting to PostgreSQL...');
  await client.connect();
  console.log('✅ Connected.');

  // 3. Ensure table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS tn_administrative_officers (
      id SERIAL PRIMARY KEY,
      state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
      district VARCHAR(100) NOT NULL,
      administrative_level VARCHAR(50) NOT NULL,
      designation VARCHAR(200) NOT NULL,
      officer_name VARCHAR(200),
      official_email VARCHAR(150),
      official_mobile VARCHAR(20),
      office_landline VARCHAR(20),
      source_url TEXT,
      verified_date DATE,
      data_status VARCHAR(50) NOT NULL DEFAULT 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_tn_officers_district ON tn_administrative_officers (district);
    CREATE INDEX IF NOT EXISTS idx_tn_officers_designation ON tn_administrative_officers (designation);
  `);

  // 4. Upsert all rows
  let inserted = 0;
  let updated = 0;
  let errored = 0;

  console.log('\n📥 Upserting officer records...');

  for (const o of officers) {
    try {
      // Upsert on (district + designation) — email may be blank for some
      const upsertKey = o.officialEmail
        ? `email:${o.officialEmail}`
        : `${o.district}::${o.designation}`;

      const res = await client.query(`
        INSERT INTO tn_administrative_officers
          (state, district, administrative_level, designation, officer_name,
           official_email, official_mobile, office_landline, source_url, verified_date, data_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
                NULLIF($10, '')::date,
                $11)
        ON CONFLICT DO NOTHING
        RETURNING id;
      `, [
        o.state,
        o.district,
        o.administrativeLevel,
        o.designation,
        o.officerName || null,
        o.officialEmail || null,
        o.officialMobile || null,
        o.officeLandline || null,
        o.sourceUrl || null,
        o.verifiedDate || null,
        o.dataStatus,
      ]);

      if (res.rowCount && res.rowCount > 0) {
        inserted++;
      } else {
        updated++;
      }
    } catch (err: any) {
      console.warn(`  ⚠️  Skipped: ${o.district}/${o.designation} — ${err.message}`);
      errored++;
    }
  }

  // 5. Final count from table
  const countRes = await client.query('SELECT COUNT(*) as total FROM tn_administrative_officers;');
  const totalInDb = parseInt(countRes.rows[0]?.total || '0', 10);

  await client.end();

  console.log('\n=============================================================');
  console.log(`✅ Seeding Complete`);
  console.log(`   New rows inserted : ${inserted}`);
  console.log(`   Already existed   : ${updated}`);
  console.log(`   Errors/skipped    : ${errored}`);
  console.log(`   Total in DB now   : ${totalInDb}`);
  if (totalInDb >= 300) {
    console.log(`\n✅ Successfully seeded ${totalInDb} real Tamil Nadu administrative officers`);
  } else {
    console.warn(`\n⚠️  Only ${totalInDb} records in DB — expected ~308. Check for parse errors above.`);
  }
  console.log('=============================================================\n');
}

seedOfficers().catch(err => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
