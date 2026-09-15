/**
 * Verification State Machine Service
 *
 * Enforces the legal status progression for land parcels:
 *   UNVERIFIED → FIELD_SURVEYED → REGISTRAR_ENDORSED → IMMUTABLE
 *
 * Only forward sequential transitions are allowed. No skipping. No reversal
 * unless explicitly flagged with a rejection reason (future extension).
 * On IMMUTABLE transition: a SHA-256 hash of the parcel state is computed
 * and stored as the provenance_hash (the "ledger seal").
 */

import crypto from 'crypto';
import { queryPostGIS } from '../gis/config/db.js';
import { recordAuditLog } from './auditLogger.js';

export const VERIFICATION_STATES = [
  'UNVERIFIED',
  'FIELD_SURVEYED',
  'REGISTRAR_ENDORSED',
  'IMMUTABLE'
] as const;

export type VerificationStatus = typeof VERIFICATION_STATES[number];

export interface VerificationAdvanceResult {
  success: boolean;
  ulpin: string;
  previousStatus: string;
  newStatus: string;
  provenanceHash?: string;
  error?: string;
}

/**
 * Validate that `target` is exactly one step ahead of `current`
 */
export function isValidTransition(current: string, target: string): boolean {
  const currentIdx = VERIFICATION_STATES.indexOf(current as VerificationStatus);
  const targetIdx = VERIFICATION_STATES.indexOf(target as VerificationStatus);

  if (currentIdx === -1 || targetIdx === -1) return false;
  return targetIdx === currentIdx + 1;
}

/**
 * Compute a SHA-256 hash of the parcel's current state as the immutable ledger seal
 */
function computeParcelHash(parcelRow: Record<string, any>): string {
  // Exclude mutable metadata (updated_at, ingested_at) from hash
  const { updated_at, ingested_at, geom, geom_json, ...stable } = parcelRow;
  const canonical = JSON.stringify(stable, Object.keys(stable).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Advance a parcel's verification_status by exactly one step.
 * Tahsildar and above only (enforced at the route level, not here).
 */
export async function advanceVerificationStatus(
  ulpin: string,
  targetStatus: string,
  officerId: number,
  officerRole: string,
  ipAddress?: string
): Promise<VerificationAdvanceResult> {
  // Fetch current parcel
  let parcelRow: Record<string, any>;
  try {
    const res = await queryPostGIS(
      `SELECT id, ulpin, survey_number, village_name, district_name, state_name,
              verification_status, provenance_hash, owner_name, area_acres, land_classification
       FROM parcels WHERE ulpin = $1`,
      [ulpin]
    );

    if (!res.rows.length) {
      return { success: false, ulpin, previousStatus: 'UNKNOWN', newStatus: targetStatus, error: `Parcel '${ulpin}' not found` };
    }
    parcelRow = res.rows[0];
  } catch (err: any) {
    return { success: false, ulpin, previousStatus: 'UNKNOWN', newStatus: targetStatus, error: `DB error: ${err.message}` };
  }

  const currentStatus = parcelRow.verification_status;

  // Validate the state transition
  if (!isValidTransition(currentStatus, targetStatus)) {
    return {
      success: false,
      ulpin,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      error: `Invalid transition: '${currentStatus}' → '${targetStatus}'. ` +
             `Allowed sequence: ${VERIFICATION_STATES.join(' → ')}. ` +
             `No skipping or reversal permitted.`
    };
  }

  // Compute ledger hash only on IMMUTABLE transition
  let provenanceHash: string | undefined;
  if (targetStatus === 'IMMUTABLE') {
    provenanceHash = computeParcelHash({ ...parcelRow, verification_status: 'IMMUTABLE' });
    console.log(`[verificationService] 🔐 SHA-256 ledger hash for ${ulpin}: ${provenanceHash}`);
  }

  // Update the status in DB
  try {
    if (provenanceHash) {
      await queryPostGIS(
        `UPDATE parcels SET verification_status = $1, provenance_hash = $2, updated_at = NOW() WHERE ulpin = $3`,
        [targetStatus, provenanceHash, ulpin]
      );
    } else {
      await queryPostGIS(
        `UPDATE parcels SET verification_status = $1, updated_at = NOW() WHERE ulpin = $2`,
        [targetStatus, ulpin]
      );
    }
  } catch (err: any) {
    return { success: false, ulpin, previousStatus: currentStatus, newStatus: targetStatus, error: `Update failed: ${err.message}` };
  }

  // Write to audit log (reusing existing recordAuditLog — no second logging path)
  await recordAuditLog({
    officerId,
    officerRole,
    actionType: `VERIFICATION_STATUS_ADVANCE`,
    parcelId: parcelRow.id,
    ipAddress,
    previousState: { verification_status: currentStatus },
    newState: {
      verification_status: targetStatus,
      ...(provenanceHash ? { provenance_hash: provenanceHash } : {})
    },
    provenanceNote: provenanceHash
      ? `IMMUTABLE_SEAL: SHA-256=${provenanceHash}`
      : `STATUS_ADVANCE: ${currentStatus} → ${targetStatus}`
  });

  console.log(`[verificationService] ✅ ${ulpin}: ${currentStatus} → ${targetStatus}${provenanceHash ? ' (SEALED)' : ''}`);

  return {
    success: true,
    ulpin,
    previousStatus: currentStatus,
    newStatus: targetStatus,
    provenanceHash
  };
}
