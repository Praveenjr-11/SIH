import pg from 'pg';

const { Pool } = pg;

const isConfigured = Boolean(
  process.env.POSTGIS_URL ||
  process.env.DATABASE_URL ||
  (process.env.PGHOST && process.env.PGDATABASE)
);

export const pool = new Pool({
  connectionString: process.env.POSTGIS_URL || process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'landstack_gis',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.warn('PostgreSQL Pool background connection warning:', err.message);
});

export async function queryPostGIS(text: string, params?: any[]) {
  if (!isConfigured) {
    throw new Error('POSTGIS_NOT_CONFIGURED');
  }
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function testPostGISConnection(): Promise<boolean> {
  try {
    const res = await queryPostGIS('SELECT PostGIS_Full_Version() as ver;');
    return Boolean(res && res.rows && res.rows.length > 0);
  } catch (err) {
    return false;
  }
}

export async function getDatabaseHealth() {
  try {
    const isConnected = await testPostGISConnection();
    if (!isConnected) {
      return {
        status: 'DEGRADED',
        postgisConnected: false,
        mode: 'SPATIAL_ENGINE_FALLBACK',
        message: 'PostgreSQL/PostGIS server disconnected or not running on port 5432. Active fallback engine serving requests.'
      };
    }

    const versionRes = await queryPostGIS('SELECT PostGIS_Full_Version() as ver;');
    const tablesRes = await queryPostGIS(`
      SELECT count(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

    return {
      status: 'HEALTHY',
      postgisConnected: true,
      mode: 'POSTGIS_LIVE_DB',
      version: versionRes.rows[0]?.ver || 'PostGIS 3.x',
      tableCount: parseInt(tablesRes.rows[0]?.table_count || '0', 10),
      totalPoolConnections: pool.totalCount,
      idlePoolConnections: pool.idleCount
    };
  } catch (err: any) {
    return {
      status: 'DEGRADED',
      postgisConnected: false,
      mode: 'SPATIAL_ENGINE_FALLBACK',
      error: err.message
    };
  }
}
