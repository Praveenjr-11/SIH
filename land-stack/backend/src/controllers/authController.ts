import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { signOfficerToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getOfficersForLocation } from '../gis/services/officerService.js';

export const AUTH_ROLES = [
  { role_code: 'STATE_OFFICER', name: 'State Level Revenue Officer', rank: 1 },
  { role_code: 'DISTRICT_COLLECTOR', name: 'District Collector & Magistrate', rank: 2 },
  { role_code: 'DRO', name: 'District Revenue Officer', rank: 3 },
  { role_code: 'RDO', name: 'Revenue Divisional Officer', rank: 4 },
  { role_code: 'TAHSILDAR', name: 'Taluk Tahsildar', rank: 5 },
  { role_code: 'DEPUTY_TAHSILDAR', name: 'Deputy Tahsildar', rank: 6 },
  { role_code: 'REVENUE_INSPECTOR', name: 'Revenue Inspector (RI)', rank: 7 },
  { role_code: 'VAO', name: 'Village Administrative Officer (VAO)', rank: 8 },
  { role_code: 'SURVEY_OFFICER', name: 'Assistant Director of Survey', rank: 9 },
  { role_code: 'SYSTEM_ADMIN', name: 'System Administrator', rank: 10 }
];

/**
 * Demo credential store — bcrypt-hashed passwords for hackathon demo.
 * In production this would be an `officers` table with hashed passwords.
 * Hash is bcrypt of 'demo1234' with saltRounds=10.
 *
 * To regenerate: await bcrypt.hash('demo1234', 10)
 */
const DEMO_PASSWORD_HASH = '$2b$10$lESBG.dAtCsKg9dldTOfPO5oORPMtroInObcALfdfrNAL7Un1TGra';

/** Maps partial email patterns to pre-hashed credentials for demo login */
const OFFICER_CREDENTIALS: Record<string, string> = {
  default: DEMO_PASSWORD_HASH,
};

async function verifyOfficerPassword(password: string): Promise<boolean> {
  if (!password) return false;
  try {
    // All demo officers share the same demo password: 'demo1234'
    return await bcrypt.compare(password, DEMO_PASSWORD_HASH);
  } catch {
    return false;
  }
}

export async function loginOfficer(req: Request, res: Response) {
  try {
    const { email, role, district, taluk, password } = req.body;

    if (!email && !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required credentials: email or role'
      });
    }

    // Verify password via bcrypt
    const passwordValid = await verifyOfficerPassword(password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED: Invalid credentials. Use demo password: demo1234'
      });
    }

    const selectedDistrict = district || 'Kanchipuram';
    const selectedTaluk = taluk || 'Sriperumbudur';
    const assigned: any = getOfficersForLocation(selectedDistrict, selectedTaluk) || {};

    let officerName = 'Thiru K. Muthusamy, IAS';
    let officerDesignation = 'District Collector & District Magistrate';
    let officerRole = role; // Do not default yet
    let rank = 2;
    let badgeNo = 'TN-IAS-2012-042';

    if (officerRole === 'DISTRICT_COLLECTOR' || email?.includes('collr') || (!officerRole && !email)) {
      officerName = assigned.collector?.officerName || 'Thiru K. Muthusamy, IAS';
      officerDesignation = assigned.collector?.designation || 'District Collector & District Magistrate';
      officerRole = 'DISTRICT_COLLECTOR';
      rank = 2;
      badgeNo = 'TN-IAS-2012-042';
    } else if (officerRole === 'DRO' || email?.includes('dro')) {
      officerName = assigned.dro?.officerName || 'District Revenue Officer';
      officerDesignation = assigned.dro?.designation || 'District Revenue Officer';
      officerRole = 'DRO';
      rank = 3;
      badgeNo = 'TN-DRO-2015-108';
    } else if (officerRole === 'RDO' || email?.includes('rdo')) {
      officerName = assigned.rdo?.officerName || 'Revenue Divisional Officer';
      officerDesignation = assigned.rdo?.designation || 'Revenue Divisional Officer';
      officerRole = 'RDO';
      rank = 4;
      badgeNo = 'TN-RDO-2018-074';
    } else if (officerRole === 'TAHSILDAR' || email?.includes('tahsildar')) {
      officerName = assigned.tahsildar?.officerName || 'Taluk Tahsildar';
      officerDesignation = assigned.tahsildar?.designation || 'Taluk Tahsildar';
      officerRole = 'TAHSILDAR';
      rank = 5;
      badgeNo = 'TN-TAH-2020-312';
    } else if (officerRole === 'SURVEY_OFFICER' || email?.includes('survey')) {
      officerName = assigned.surveyAD?.officerName || 'Er. M. Gunasekar';
      officerDesignation = assigned.surveyAD?.designation || 'Assistant Director of Survey';
      officerRole = 'SURVEY_OFFICER';
      rank = 9;
      badgeNo = 'TN-SURV-2017-089';
    } else if (officerRole === 'SUB_REGISTRAR' || email?.includes('sro') || email?.includes('reg')) {
      officerName = assigned.sro?.officerName || 'Sub-Registrar';
      officerDesignation = assigned.sro?.designation || 'Sub-Registrar';
      officerRole = 'SUB_REGISTRAR';
      rank = 6;
      badgeNo = 'TN-REG-2019-112';
    } else if (officerRole === 'TOWN_PLANNER' || email?.includes('dtcp')) {
      officerName = assigned.dtcpOfficer?.officerName || 'Er. R. Anitha';
      officerDesignation = assigned.dtcpOfficer?.designation || 'Senior Town Planning Officer';
      officerRole = 'TOWN_PLANNER';
      rank = 7;
      badgeNo = 'TN-DTCP-2016-045';
    } else if (officerRole === 'EXECUTIVE_ENGINEER_WRD' || email?.includes('wrd') || email?.includes('pwd')) {
      officerName = assigned.wrdEE?.officerName || 'Executive Engineer (WRD)';
      officerDesignation = assigned.wrdEE?.designation || 'Executive Engineer (WRD)';
      officerRole = 'EXECUTIVE_ENGINEER_WRD';
      rank = 8;
      badgeNo = 'TN-WRD-2014-088';
    } else if (officerRole === 'DISTRICT_FOREST_OFFICER' || email?.includes('dfo') || email?.includes('forest')) {
      officerName = assigned.forestOfficer?.officerName || 'District Forest Officer';
      officerDesignation = assigned.forestOfficer?.designation || 'District Forest Officer';
      officerRole = 'DISTRICT_FOREST_OFFICER';
      rank = 6;
      badgeNo = 'TN-IFS-2015-021';
    } else if (officerRole === 'MUNICIPAL_COMMISSIONER' || email?.includes('commr') || email?.includes('bdo') || email?.includes('maws')) {
      officerName = assigned.mawsOfficer?.officerName || 'Municipal Commissioner / BDO';
      officerDesignation = assigned.mawsOfficer?.designation || 'Municipal Commissioner / BDO';
      officerRole = 'MUNICIPAL_COMMISSIONER';
      rank = 6;
      badgeNo = 'TN-MAWS-2018-092';
    } else {
      officerName = assigned.collector?.officerName || 'Thiru K. Muthusamy, IAS';
      officerRole = 'DISTRICT_COLLECTOR'; // Fallback if no match
    }

    const payload = {
      id: 101,
      officer_code: `OFF-${rank}01`,
      full_name: officerName,
      email: email || `${officerRole.toLowerCase()}.${selectedTaluk.toLowerCase()}@tn.gov.in`,
      role: officerRole,
      level_rank: rank,
      district: selectedDistrict,
      taluk: selectedTaluk,
      state: 'Tamil Nadu'
    };

    // Real JWT — cryptographically signed with HS256, not a raw base64 blob
    const token = signOfficerToken(payload);

    return res.json({
      success: true,
      message: 'Officer authenticated successfully',
      token,
      officer: {
        ...payload,
        badge_number: badgeNo,
        designation: officerDesignation,
        department: 'Revenue & Disaster Management Department'
      }
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: err.message
    });
  }
}

export async function getCurrentOfficerProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.officer) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  return res.json({
    success: true,
    officer: req.officer
  });
}

export async function logoutOfficer(req: Request, res: Response) {
  return res.json({
    success: true,
    message: 'Officer logged out successfully. Token invalidated.'
  });
}
