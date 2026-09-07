import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { queryPostGIS } from '../gis/config/db.js';

export async function getOfficerDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const officer = req.officer;
    if (!officer) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    }

    const isHighLevel = officer.level_rank <= 4; // Collector, DRO, RDO, State
    const districtFilter = officer.role === 'SYSTEM_ADMIN' || officer.role === 'STATE_OFFICER' ? null : officer.district;
    const talukFilter = isHighLevel ? null : officer.taluk;

    let dbCasesCount = { total: 0, pending: 0, underVerification: 0, inspectionsPending: 0, approved: 0, rejected: 0 };
    let recentCases: any[] = [];
    let recentAuditActivity: any[] = [];

    try {
      let queryStr = `SELECT count(*) as total,
        COUNT(CASE WHEN status IN ('NEW', 'DOCUMENT_VERIFICATION', 'GIS_ANALYSIS') THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'OFFICER_REVIEW' THEN 1 END) as under_verification,
        COUNT(CASE WHEN status = 'FIELD_INSPECTION' THEN 1 END) as inspections_pending,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
        FROM cases WHERE 1=1`;

      const params: any[] = [];
      if (districtFilter) {
        params.push(districtFilter);
        queryStr += ` AND district_name = $${params.length}`;
      }
      if (talukFilter) {
        params.push(talukFilter);
        queryStr += ` AND subdistrict = $${params.length}`;
      }

      const resCases = await queryPostGIS(queryStr, params);
      if (resCases && resCases.rows.length > 0) {
        const row = resCases.rows[0];
        dbCasesCount = {
          total: parseInt(row.total || '0', 10),
          pending: parseInt(row.pending || '0', 10),
          underVerification: parseInt(row.under_verification || '0', 10),
          inspectionsPending: parseInt(row.inspections_pending || '0', 10),
          approved: parseInt(row.approved || '0', 10),
          rejected: parseInt(row.rejected || '0', 10)
        };
      }

      // Recent cases
      const resRecent = await queryPostGIS(`
        SELECT id, case_number, title, status, priority, district_name, subdistrict, village_name, created_at
        FROM cases
        ORDER BY created_at DESC LIMIT 5
      `);
      if (resRecent && resRecent.rows) {
        recentCases = resRecent.rows;
      }
    } catch {
      // Return zero states if database tables have not been populated yet
    }

    return res.json({
      success: true,
      officerJurisdiction: {
        officerName: officer.full_name,
        role: officer.role,
        district: officer.district,
        taluk: officer.taluk,
        state: officer.state,
        jurisdictionType: isHighLevel ? 'DISTRICT_LEVEL_AGGREGATED' : 'TALUK_LEVEL_SPECIFIC'
      },
      metrics: dbCasesCount,
      recentCases,
      recentAuditActivity,
      alerts: {
        riskAlerts: dbCasesCount.inspectionsPending > 0 ? 1 : 0,
        documentMismatches: 0,
        gisAlerts: 0
      }
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch officer dashboard',
      details: err.message
    });
  }
}
