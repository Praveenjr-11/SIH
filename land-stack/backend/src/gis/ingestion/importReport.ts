/**
 * Ingestion Report — generates human-readable reports for each data import
 */

export interface IngestionReport {
  batchId: string;
  datasetId: string;
  datasetName: string;
  tableName: string;
  sourceFile: string;
  sourceOrganization: string;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  crs: {
    detected: string;
    target: string;
    transformRequired: boolean;
  };
  records: {
    read: number;
    accepted: number;
    rejected: number;
    invalidGeometries: number;
    duplicates: number;
    nullGeometries: number;
  };
  coverage: {
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
  };
  status: 'completed' | 'failed' | 'partial';
  errors: string[];
  warnings: string[];
}

/**
 * Create a new empty ingestion report
 */
export function createIngestionReport(
  batchId: string,
  datasetId: string,
  datasetName: string,
  tableName: string,
  sourceFile: string,
  sourceOrganization: string,
): IngestionReport {
  return {
    batchId,
    datasetId,
    datasetName,
    tableName,
    sourceFile,
    sourceOrganization,
    startTime: new Date(),
    crs: {
      detected: 'unknown',
      target: 'EPSG:4326',
      transformRequired: false,
    },
    records: {
      read: 0,
      accepted: 0,
      rejected: 0,
      invalidGeometries: 0,
      duplicates: 0,
      nullGeometries: 0,
    },
    coverage: {},
    status: 'completed',
    errors: [],
    warnings: [],
  };
}

/**
 * Finalize a report — calculate duration & format output
 */
export function finalizeReport(report: IngestionReport): IngestionReport {
  report.endTime = new Date();
  report.durationMs = report.endTime.getTime() - report.startTime.getTime();

  if (report.errors.length > 0 && report.records.accepted === 0) {
    report.status = 'failed';
  } else if (report.errors.length > 0 || report.records.rejected > 0) {
    report.status = 'partial';
  }

  return report;
}

/**
 * Generate a human-readable text summary of the report
 */
export function formatReportText(report: IngestionReport): string {
  const lines: string[] = [];
  const divider = '═'.repeat(60);

  lines.push(divider);
  lines.push(`  GIS DATA INGESTION REPORT`);
  lines.push(divider);
  lines.push(``);
  lines.push(`  Batch ID:      ${report.batchId}`);
  lines.push(`  Dataset:       ${report.datasetName}`);
  lines.push(`  Dataset ID:    ${report.datasetId}`);
  lines.push(`  Source:        ${report.sourceOrganization}`);
  lines.push(`  Source File:   ${report.sourceFile}`);
  lines.push(`  Target Table:  ${report.tableName}`);
  lines.push(`  Status:        ${report.status.toUpperCase()}`);
  lines.push(``);

  lines.push(`  CRS`);
  lines.push(`  ├─ Detected:   ${report.crs.detected}`);
  lines.push(`  ├─ Target:     ${report.crs.target}`);
  lines.push(`  └─ Transform:  ${report.crs.transformRequired ? 'Yes' : 'No'}`);
  lines.push(``);

  lines.push(`  Records`);
  lines.push(`  ├─ Read:       ${report.records.read}`);
  lines.push(`  ├─ Accepted:   ${report.records.accepted}`);
  lines.push(`  ├─ Rejected:   ${report.records.rejected}`);
  lines.push(`  ├─ Invalid:    ${report.records.invalidGeometries}`);
  lines.push(`  ├─ Nulls:      ${report.records.nullGeometries}`);
  lines.push(`  └─ Duplicates: ${report.records.duplicates}`);
  lines.push(``);

  if (report.coverage.minLat !== undefined) {
    lines.push(`  Coverage (BBOX)`);
    lines.push(`  ├─ Lat:  ${report.coverage.minLat?.toFixed(4)}° – ${report.coverage.maxLat?.toFixed(4)}°`);
    lines.push(`  └─ Lng:  ${report.coverage.minLng?.toFixed(4)}° – ${report.coverage.maxLng?.toFixed(4)}°`);
    lines.push(``);
  }

  if (report.durationMs !== undefined) {
    const durSec = (report.durationMs / 1000).toFixed(2);
    lines.push(`  Duration:      ${durSec}s`);
    lines.push(``);
  }

  if (report.warnings.length > 0) {
    lines.push(`  ⚠ Warnings (${report.warnings.length}):`);
    for (const w of report.warnings.slice(0, 10)) {
      lines.push(`    • ${w}`);
    }
    if (report.warnings.length > 10) {
      lines.push(`    ... and ${report.warnings.length - 10} more`);
    }
    lines.push(``);
  }

  if (report.errors.length > 0) {
    lines.push(`  ❌ Errors (${report.errors.length}):`);
    for (const e of report.errors.slice(0, 10)) {
      lines.push(`    • ${e}`);
    }
    if (report.errors.length > 10) {
      lines.push(`    ... and ${report.errors.length - 10} more`);
    }
    lines.push(``);
  }

  lines.push(divider);
  return lines.join('\n');
}

/**
 * Generate a unique batch ID
 */
export function generateBatchId(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BATCH-${ts}-${rand}`;
}
