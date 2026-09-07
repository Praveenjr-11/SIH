import { queryPostGIS } from '../gis/config/db.js';

export interface AuditLogParams {
  officerId?: number;
  officerRole?: string;
  actionType: string;
  caseId?: number;
  parcelId?: number;
  ipAddress?: string;
  previousState?: any;
  newState?: any;
  provenanceNote?: string;
}

export async function recordAuditLog(params: AuditLogParams) {
  try {
    await queryPostGIS(`
      INSERT INTO audit_logs (officer_id, officer_role, action_type, case_id, parcel_id, ip_address, previous_state, new_state, provenance_note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      params.officerId || null,
      params.officerRole || 'SYSTEM',
      params.actionType,
      params.caseId || null,
      params.parcelId || null,
      params.ipAddress || '127.0.0.1',
      params.previousState ? JSON.stringify(params.previousState) : null,
      params.newState ? JSON.stringify(params.newState) : null,
      params.provenanceNote || 'AUTOMATED_GOVERNMENT_AUDIT_LOG'
    ]);
  } catch (err: any) {
    console.warn('Audit log write warning:', err.message);
  }
}
