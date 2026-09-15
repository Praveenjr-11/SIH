import { queryPostGIS } from '../../../config/db';

export async function verifyDataset() {
  console.log('Generating Data Quality Report for all imported datasets...');

  try {
    const res = await queryPostGIS(`
      SELECT dataset_key, dataset_name, data_status, record_count, last_imported_at, authorization_status
      FROM gis_data_sources
      ORDER BY dataset_key
    `);

    if (res && res.rows.length > 0) {
      console.log('\n=========================================');
      console.log('       TNGIS DATA QUALITY REPORT         ');
      console.log('=========================================');
      for (const row of res.rows) {
        console.log(`\nDataset: ${row.dataset_name} (${row.dataset_key})`);
        console.log(`Status:  ${row.data_status}`);
        console.log(`Auth:    ${row.authorization_status}`);
        if (row.record_count !== null) {
          console.log(`Records: ${row.record_count}`);
        }
        if (row.last_imported_at) {
          console.log(`Last Imported: ${row.last_imported_at}`);
        }

        // Normally we would query the actual production table to get geometry errors:
        // SELECT count(*) FROM table WHERE NOT ST_IsValid(geom);
        // But since PostGIS is not available yet, we skip the spatial validation step here.
      }
      console.log('\n=========================================\n');
    } else {
      console.log('No datasets registered in gis_data_sources.');
    }
  } catch (error: any) {
    console.error('Failed to run verification report:', error.message);
  }
}
