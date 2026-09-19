import { queryPostGIS } from '../gis/config/db.js';

export const CORE_DEPARTMENTS = [
  'REVENUE',
  'SURVEY',
  'REGISTRATION',
  'GOVERNMENT_LAND',
  'PLANNING',
  'ENVIRONMENT',
  'LOCAL_BODY'
];

export async function initializeDepartmentVerifications(caseId: number) {
  for (const dept of CORE_DEPARTMENTS) {
    try {
      await queryPostGIS(`
        INSERT INTO case_department_verifications (case_id, department, verification_status)
        VALUES ($1, $2, 'PENDING')
        ON CONFLICT (case_id, department) DO NOTHING
      `, [caseId, dept]);
    } catch (err) {
      console.error(`Error initializing verification for ${dept}`, err);
    }
  }
}

export async function evaluateCaseWorkflowStatus(caseId: number) {
  try {
    const res = await queryPostGIS(`
      SELECT department, verification_status 
      FROM case_department_verifications 
      WHERE case_id = $1
    `, [caseId]);

    const verifications = res.rows;
    if (!verifications || verifications.length === 0) return 'CASE_CREATED';

    const allVerified = verifications.every(v => 
      ['VERIFIED', 'NOT_APPLICABLE', 'APPROVED'].includes(v.verification_status)
    );
    const anyRejected = verifications.some(v => 
      ['REJECTED', 'CONFLICT_FOUND', 'ACCESS_RESTRICTED'].includes(v.verification_status)
    );
    const anyInProgress = verifications.some(v => 
      ['IN_PROGRESS', 'DOCUMENT_REQUIRED', 'FIELD_INSPECTION_REQUIRED'].includes(v.verification_status)
    );

    let nextStatus = 'CONSOLIDATED_REVIEW';

    // Simplified workflow progression logic
    if (anyRejected) {
      nextStatus = 'CLARIFICATION_REQUIRED';
    } else if (anyInProgress || !allVerified) {
      // If revenue is verified, we are in parallel checks
      const revenue = verifications.find(v => v.department === 'REVENUE');
      if (revenue && revenue.verification_status === 'VERIFIED') {
        nextStatus = 'SURVEY_VERIFICATION'; // Parallel checks happening
      } else {
        nextStatus = 'REVENUE_VERIFICATION';
      }
    } else if (allVerified) {
      nextStatus = 'CONSOLIDATED_REVIEW';
    }

    // Update case status
    await queryPostGIS(`UPDATE cases SET status = $1 WHERE id = $2`, [nextStatus, caseId]);
    return nextStatus;
  } catch (err) {
    console.error('Error evaluating workflow status', err);
    return null;
  }
}
