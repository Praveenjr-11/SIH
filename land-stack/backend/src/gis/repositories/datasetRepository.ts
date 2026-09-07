import { queryPostGIS } from '../config/db.js';

export interface DatasetRecord {
  id?: number;
  dataset_id: string;
  name: string;
  category: string;
  source: string;
  source_url?: string;
  organization?: string;
  version?: string;
  publication_date?: string;
  download_date?: string;
  license?: string;
  attribution?: string;
  crs?: string;
  coverage?: string;
  scale?: string;
  resolution?: string;
  source_status: 'MOCK' | 'REAL' | 'DERIVED';
  last_updated?: string;
  ingested_at?: string;
  status?: 'active' | 'staging' | 'archived' | 'error';
  record_count?: number;
  notes?: string;
}

export interface IngestionLogEntry {
  batch_id: string;
  dataset_id?: string;
  table_name: string;
  source_file?: string;
  records_read: number;
  records_accepted: number;
  records_rejected: number;
  invalid_geometries: number;
  detected_crs?: string;
  target_crs?: string;
  coverage_bbox?: string;
  duration_ms?: number;
  status: 'running' | 'completed' | 'failed' | 'partial';
  error_message?: string;
}

export class DatasetRepository {
  /**
   * Register a new dataset in the catalog
   */
  async registerDataset(ds: DatasetRecord): Promise<DatasetRecord> {
    try {
      const sql = `
        INSERT INTO gis_datasets (
          dataset_id, name, category, source, source_url, organization,
          version, publication_date, download_date, license, attribution,
          crs, coverage, scale, resolution, source_status, last_updated,
          status, record_count, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17,
          $18, $19, $20
        )
        ON CONFLICT (dataset_id) DO UPDATE SET
          name = EXCLUDED.name,
          source = EXCLUDED.source,
          source_url = EXCLUDED.source_url,
          version = EXCLUDED.version,
          source_status = EXCLUDED.source_status,
          last_updated = EXCLUDED.last_updated,
          status = EXCLUDED.status,
          record_count = EXCLUDED.record_count,
          notes = EXCLUDED.notes
        RETURNING *;
      `;
      const res = await queryPostGIS(sql, [
        ds.dataset_id, ds.name, ds.category, ds.source,
        ds.source_url || null, ds.organization || null,
        ds.version || null, ds.publication_date || null,
        ds.download_date || null, ds.license || null,
        ds.attribution || null, ds.crs || 'EPSG:4326',
        ds.coverage || null, ds.scale || null,
        ds.resolution || null, ds.source_status,
        ds.last_updated || null, ds.status || 'active',
        ds.record_count || null, ds.notes || null,
      ]);
      return res.rows[0];
    } catch (err) {
      console.warn('DatasetRepository.registerDataset fallback (PostGIS not available):', (err as Error).message);
      return ds;
    }
  }

  /**
   * List all datasets, optionally filtered
   */
  async listDatasets(filters?: { category?: string; source_status?: string; status?: string }): Promise<DatasetRecord[]> {
    try {
      let sql = 'SELECT * FROM gis_datasets WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.category) {
        sql += ` AND category = $${paramIndex++}`;
        params.push(filters.category);
      }
      if (filters?.source_status) {
        sql += ` AND source_status = $${paramIndex++}`;
        params.push(filters.source_status);
      }
      if (filters?.status) {
        sql += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }

      sql += ' ORDER BY category, name;';
      const res = await queryPostGIS(sql, params);
      return res.rows;
    } catch (err) {
      console.warn('DatasetRepository.listDatasets fallback:', (err as Error).message);
      return [];
    }
  }

  /**
   * Get a single dataset by dataset_id
   */
  async getDatasetById(datasetId: string): Promise<DatasetRecord | null> {
    try {
      const sql = 'SELECT * FROM gis_datasets WHERE dataset_id = $1;';
      const res = await queryPostGIS(sql, [datasetId]);
      return res.rows[0] || null;
    } catch (err) {
      console.warn('DatasetRepository.getDatasetById fallback:', (err as Error).message);
      return null;
    }
  }

  /**
   * Update dataset status (e.g., staging → active)
   */
  async updateDatasetStatus(datasetId: string, status: string, recordCount?: number): Promise<void> {
    try {
      const sql = `
        UPDATE gis_datasets 
        SET status = $2, record_count = COALESCE($3, record_count), last_updated = NOW()
        WHERE dataset_id = $1;
      `;
      await queryPostGIS(sql, [datasetId, status, recordCount || null]);
    } catch (err) {
      console.warn('DatasetRepository.updateDatasetStatus fallback:', (err as Error).message);
    }
  }

  /**
   * Get provenance metadata for a layer table
   */
  async getLayerProvenance(tableName: string): Promise<DatasetRecord | null> {
    try {
      // Map table names to dataset categories
      const categoryMap: Record<string, string> = {
        states: 'administrative',
        districts: 'administrative',
        villages: 'administrative',
        geology: 'geology',
        soil: 'soil',
        landuse: 'landuse',
        waterbodies: 'water',
        roads: 'roads',
        elevation: 'elevation',
        risk_zones: 'hazard',
      };

      const category = categoryMap[tableName];
      if (!category) return null;

      const sql = `
        SELECT * FROM gis_datasets 
        WHERE category = $1 AND status = 'active'
        ORDER BY source_status = 'REAL' DESC, ingested_at DESC
        LIMIT 1;
      `;
      const res = await queryPostGIS(sql, [category]);
      return res.rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Record an ingestion log entry
   */
  async logIngestion(entry: IngestionLogEntry): Promise<number> {
    try {
      const sql = `
        INSERT INTO gis_ingestion_log (
          batch_id, dataset_id, table_name, source_file,
          records_read, records_accepted, records_rejected,
          invalid_geometries, detected_crs, target_crs,
          coverage_bbox, duration_ms, status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id;
      `;
      const res = await queryPostGIS(sql, [
        entry.batch_id, entry.dataset_id || null, entry.table_name,
        entry.source_file || null, entry.records_read, entry.records_accepted,
        entry.records_rejected, entry.invalid_geometries,
        entry.detected_crs || null, entry.target_crs || 'EPSG:4326',
        entry.coverage_bbox || null, entry.duration_ms || null,
        entry.status, entry.error_message || null,
      ]);
      return res.rows[0]?.id || 0;
    } catch (err) {
      console.warn('DatasetRepository.logIngestion fallback:', (err as Error).message);
      return 0;
    }
  }

  /**
   * Update ingestion log status on completion
   */
  async completeIngestion(batchId: string, updates: Partial<IngestionLogEntry>): Promise<void> {
    try {
      const sql = `
        UPDATE gis_ingestion_log SET
          records_read = COALESCE($2, records_read),
          records_accepted = COALESCE($3, records_accepted),
          records_rejected = COALESCE($4, records_rejected),
          invalid_geometries = COALESCE($5, invalid_geometries),
          duration_ms = COALESCE($6, duration_ms),
          status = COALESCE($7, status),
          error_message = COALESCE($8, error_message),
          completed_at = NOW()
        WHERE batch_id = $1;
      `;
      await queryPostGIS(sql, [
        batchId,
        updates.records_read ?? null,
        updates.records_accepted ?? null,
        updates.records_rejected ?? null,
        updates.invalid_geometries ?? null,
        updates.duration_ms ?? null,
        updates.status ?? null,
        updates.error_message ?? null,
      ]);
    } catch (err) {
      console.warn('DatasetRepository.completeIngestion fallback:', (err as Error).message);
    }
  }
}

export const datasetRepository = new DatasetRepository();
