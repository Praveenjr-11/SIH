/**
 * GeoJSON Importer — reads GeoJSON files and inserts into PostGIS staging tables
 */

import fs from 'fs';
import { queryPostGIS } from '../../config/db.js';
import { validateGeoJSON, validateFeature } from '../validators.js';
import { detectCrsFromGeoJSON } from '../crsHandler.js';
import {
  createIngestionReport,
  finalizeReport,
  formatReportText,
  generateBatchId,
  IngestionReport,
} from '../importReport.js';
import { datasetRepository } from '../../repositories/datasetRepository.js';

export interface GeoJsonImportOptions {
  /** Path to the GeoJSON file */
  filePath: string;
  /** Target PostGIS table name */
  tableName: string;
  /** Dataset ID for provenance */
  datasetId: string;
  /** Human-readable dataset name */
  datasetName: string;
  /** Source organization name */
  sourceOrganization: string;
  /** Whether to use staging table (recommended for large datasets) */
  useStaging: boolean;
  /** Mapping from GeoJSON property names to table column names */
  propertyMapping: Record<string, string>;
  /** Additional fixed columns to insert (e.g., source, dataset_id) */
  fixedColumns?: Record<string, any>;
  /** Batch ID (auto-generated if not provided) */
  batchId?: string;
}

/**
 * Import a GeoJSON file into a PostGIS table with full validation and reporting
 */
export async function importGeoJsonFile(options: GeoJsonImportOptions): Promise<IngestionReport> {
  const batchId = options.batchId || generateBatchId();
  const targetTable = options.useStaging ? `${options.tableName}_staging` : options.tableName;

  const report = createIngestionReport(
    batchId,
    options.datasetId,
    options.datasetName,
    targetTable,
    options.filePath,
    options.sourceOrganization,
  );

  try {
    // 1. Read file
    if (!fs.existsSync(options.filePath)) {
      report.errors.push(`File not found: ${options.filePath}`);
      return finalizeReport(report);
    }

    const content = fs.readFileSync(options.filePath, 'utf8');
    let geojson: any;

    try {
      geojson = JSON.parse(content);
    } catch (parseErr) {
      report.errors.push(`Invalid JSON: ${(parseErr as Error).message}`);
      return finalizeReport(report);
    }

    // 2. Validate GeoJSON structure
    const validation = validateGeoJSON(geojson);
    report.records.read = validation.stats.totalFeatures;
    report.records.nullGeometries = validation.stats.nullGeometries;
    report.records.invalidGeometries = validation.stats.invalidFeatures;
    report.warnings.push(...validation.warnings);

    if (!validation.valid && validation.stats.validFeatures === 0) {
      report.errors.push(...validation.errors);
      return finalizeReport(report);
    }

    // 3. Detect CRS
    const crsInfo = detectCrsFromGeoJSON(geojson);
    report.crs = {
      detected: crsInfo.detected,
      target: 'EPSG:4326',
      transformRequired: crsInfo.needsTransform,
    };

    if (crsInfo.needsTransform) {
      report.warnings.push(`CRS transform required: ${crsInfo.detected} → EPSG:4326. Using PostGIS ST_Transform.`);
    }

    // 4. Log ingestion start
    await datasetRepository.logIngestion({
      batch_id: batchId,
      dataset_id: options.datasetId,
      table_name: targetTable,
      source_file: options.filePath,
      records_read: report.records.read,
      records_accepted: 0,
      records_rejected: 0,
      invalid_geometries: 0,
      detected_crs: crsInfo.detected,
      status: 'running',
    });

    // 5. Insert features
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    for (let i = 0; i < geojson.features.length; i++) {
      const feature = geojson.features[i];

      // Validate individual feature
      const fv = validateFeature(feature, i);
      if (!fv.valid) {
        report.records.rejected++;
        continue;
      }

      try {
        // Build column names and values from property mapping
        const columns: string[] = [];
        const placeholders: string[] = [];
        const values: any[] = [];
        let paramIdx = 1;

        // Map properties to columns
        for (const [propName, colName] of Object.entries(options.propertyMapping)) {
          const value = feature.properties?.[propName];
          if (value !== undefined) {
            columns.push(colName);
            placeholders.push(`$${paramIdx++}`);
            values.push(value);
          }
        }

        // Add fixed columns
        if (options.fixedColumns) {
          for (const [colName, value] of Object.entries(options.fixedColumns)) {
            columns.push(colName);
            placeholders.push(`$${paramIdx++}`);
            values.push(value);
          }
        }

        // Add staging-specific columns
        if (options.useStaging) {
          columns.push('import_batch_id');
          placeholders.push(`$${paramIdx++}`);
          values.push(batchId);

          columns.push('validated');
          placeholders.push(`$${paramIdx++}`);
          values.push(true);
        }

        // Add geometry
        const geomJson = JSON.stringify(feature.geometry);
        columns.push('geom');

        if (crsInfo.needsTransform) {
          const sridMatch = crsInfo.detected.match(/EPSG:(\d+)/);
          const srid = sridMatch ? parseInt(sridMatch[1], 10) : 4326;
          placeholders.push(`ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON($${paramIdx++}), ${srid}), 4326)`);
        } else {
          placeholders.push(`ST_SetSRID(ST_GeomFromGeoJSON($${paramIdx++}), 4326)`);
        }
        values.push(geomJson);

        const sql = `INSERT INTO ${targetTable} (${columns.join(', ')}) VALUES (${placeholders.join(', ')});`;
        await queryPostGIS(sql, values);

        report.records.accepted++;

        // Track coverage bbox
        try {
          const coords = flattenCoordsFromGeometry(feature.geometry);
          for (const [lng, lat] of coords) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
          }
        } catch { /* coverage tracking is best-effort */ }

      } catch (insertErr) {
        report.records.rejected++;
        report.warnings.push(`Feature[${i}]: Insert failed — ${(insertErr as Error).message}`);
      }
    }

    // 6. Set coverage
    if (isFinite(minLat)) {
      report.coverage = { minLat, maxLat, minLng, maxLng };
    }

    // 7. Finalize report
    const finalReport = finalizeReport(report);

    // 8. Update ingestion log
    await datasetRepository.completeIngestion(batchId, {
      records_read: finalReport.records.read,
      records_accepted: finalReport.records.accepted,
      records_rejected: finalReport.records.rejected,
      invalid_geometries: finalReport.records.invalidGeometries,
      duration_ms: finalReport.durationMs,
      status: finalReport.status,
    });

    // 9. Print report
    console.log(formatReportText(finalReport));

    return finalReport;

  } catch (err) {
    report.errors.push(`Pipeline error: ${(err as Error).message}`);
    const finalReport = finalizeReport(report);
    console.error(formatReportText(finalReport));
    return finalReport;
  }
}

/**
 * Promote data from staging table to production table
 */
export async function promoteFromStaging(
  stagingTable: string,
  productionTable: string,
  batchId: string,
  clearProduction: boolean = false,
): Promise<{ promoted: number; errors: string[] }> {
  const errors: string[] = [];

  try {
    // Validate staging data
    const countRes = await queryPostGIS(
      `SELECT COUNT(*) as cnt FROM ${stagingTable} WHERE import_batch_id = $1 AND validated = true;`,
      [batchId],
    );
    const validCount = parseInt(countRes.rows[0]?.cnt || '0', 10);

    if (validCount === 0) {
      errors.push('No validated records in staging table to promote');
      return { promoted: 0, errors };
    }

    // Optionally clear production table
    if (clearProduction) {
      await queryPostGIS(`DELETE FROM ${productionTable};`);
    }

    // Copy from staging to production (select columns that exist in both tables)
    // This is a simplified version — production column list should match staging
    const res = await queryPostGIS(
      `INSERT INTO ${productionTable} SELECT * FROM ${stagingTable} WHERE import_batch_id = $1 AND validated = true;`,
      [batchId],
    );

    console.log(`✅ Promoted ${validCount} records from ${stagingTable} → ${productionTable}`);
    return { promoted: validCount, errors };

  } catch (err) {
    errors.push(`Promotion failed: ${(err as Error).message}`);
    return { promoted: 0, errors };
  }
}

/**
 * Flatten coordinates from a geometry object
 */
function flattenCoordsFromGeometry(geometry: any): [number, number][] {
  const result: [number, number][] = [];

  function recurse(arr: any) {
    if (!Array.isArray(arr)) return;
    if (arr.length >= 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
      result.push([arr[0], arr[1]]);
      return;
    }
    for (const item of arr) {
      recurse(item);
    }
  }

  recurse(geometry.coordinates);
  return result.slice(0, 200); // Limit for performance
}
