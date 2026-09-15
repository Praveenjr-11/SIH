const { Pool } = require('pg');
const p = new Pool({host: 'localhost', database: 'landstack_gis', user: 'postgres', password: 'Praveen@2005'});

async function audit() {
  try {
    const res = await p.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('--- TABLES ---');
    console.log(res.rows.map(r => r.table_name));
    
    for (const r of res.rows) {
      const cols = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1", [r.table_name]);
      console.log(`\n--- TABLE: ${r.table_name} ---`);
      console.log(cols.rows.map(c => `${c.column_name}: ${c.data_type}`));
    }
    p.end();
  } catch (e) {
    console.error(e);
    p.end();
  }
}
audit();
