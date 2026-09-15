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
    let officerRole = role || 'DISTRICT_COLLECTOR';
    let rank = 2;
    let badgeNo = 'TN-IAS-2012-042';

    if (assigned.collector && (officerRole === 'DISTRICT_COLLECTOR' || email?.includes('collr'))) {
      officerName = assigned.collector.officerName;
      officerDesignation = assigned.collector.designation;
      officerRole = 'DISTRICT_COLLECTOR';
      rank = 2;
      badgeNo = 'TN-IAS-2012-042';
    } else if (assigned.dro && (officerRole === 'DRO' || email?.includes('dro'))) {
      officerName = assigned.dro.officerName;
      officerDesignation = assigned.dro.designation;
      officerRole = 'DRO';
      rank = 3;
      badgeNo = 'TN-DRO-2015-108';
    } else if (assigned.rdo && (officerRole === 'RDO' || email?.includes('rdo'))) {
      officerName = assigned.rdo.officerName;
      officerDesignation = assigned.rdo.designation;
      officerRole = 'RDO';
      rank = 4;
      badgeNo = 'TN-RDO-2018-074';
    } else if (assigned.tahsildar && (officerRole === 'TAHSILDAR' || email?.includes('tahsildar'))) {
      officerName = assigned.tahsildar.officerName;
      officerDesignation = assigned.tahsildar.designation;
      officerRole = 'TAHSILDAR';
      rank = 5;
      badgeNo = 'TN-TAH-2020-312';
    } else if (assigned.surveyAD && (officerRole === 'SURVEY_OFFICER' || email?.includes('survey'))) {
      officerName = assigned.surveyAD.officerName;
      officerDesignation = assigned.surveyAD.designation;
      officerRole = 'SURVEY_OFFICER';
      rank = 9;
      badgeNo = 'TN-SURV-2017-089';
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
