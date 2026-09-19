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

import { queryPostGIS } from '../gis/config/db.js';

export async function loginOfficer(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required credentials: email and password'
      });
    }

    const dbRes = await queryPostGIS(`SELECT * FROM officer_accounts WHERE email = $1 OR employee_code = $1 LIMIT 1`, [email]);
    if (dbRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED: Invalid credentials.'
      });
    }

    const account = dbRes.rows[0];

    if (account.account_status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: `FORBIDDEN: Account is ${account.account_status}. Please contact system administrator.`
      });
    }

    const passwordValid = await bcrypt.compare(password, account.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED: Invalid credentials.'
      });
    }

    // Update last_login_at
    await queryPostGIS(`UPDATE officer_accounts SET last_login_at = NOW() WHERE id = $1`, [account.id]);

    // Rank heuristic based on role for backward compatibility
    let rank = 5;
    const roleMatch = AUTH_ROLES.find(r => r.role_code === account.role);
    if (roleMatch) rank = roleMatch.rank;

    const payload = {
      id: account.id, // Using UUID or internal ID
      officer_code: account.employee_code,
      full_name: account.full_name,
      email: account.email,
      role: account.role,
      level_rank: rank,
      district: account.district,
      taluk: account.taluk,
      state: 'Tamil Nadu'
    };

    const token = signOfficerToken(payload);

    res.cookie('officer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({
      success: true,
      message: 'Officer authenticated successfully',
      token, // Also return for backward compatibility if needed temporarily
      officer: {
        ...payload,
        badge_number: account.employee_code,
        designation: account.designation,
        department: account.department
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
  res.clearCookie('officer_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({
    success: true,
    message: 'Officer logged out successfully. Token invalidated.'
  });
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    const officer = req.officer;
    const { currentPassword, newPassword } = req.body;

    if (!officer || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Missing parameters' });
    }

    const dbRes = await queryPostGIS(`SELECT password_hash FROM officer_accounts WHERE id = $1`, [officer.id]);
    if (dbRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Account not found' });

    const passwordValid = await bcrypt.compare(currentPassword, dbRes.rows[0].password_hash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await queryPostGIS(`UPDATE officer_accounts SET password_hash = $1 WHERE id = $2`, [newHash, officer.id]);

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update password', details: err.message });
  }
}
