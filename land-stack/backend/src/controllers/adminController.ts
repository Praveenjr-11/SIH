import { Request, Response } from 'express';
import { queryPostGIS } from '../gis/config/db.js';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getOfficers(req: AuthenticatedRequest, res: Response) {
  try {
    const dbRes = await queryPostGIS(`
      SELECT id, employee_code, full_name, email, phone, department, designation, role, district, taluk, account_status, last_login_at, created_at
      FROM officer_accounts
      ORDER BY created_at DESC
    `);
    return res.json({ success: true, officers: dbRes.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch officers', details: err.message });
  }
}

export async function provisionOfficer(req: AuthenticatedRequest, res: Response) {
  try {
    const { employee_code, full_name, email, phone, department, designation, role, district, taluk, password } = req.body;
    
    if (!employee_code || !full_name || !email || !department || !designation || !role || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields for provisioning' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const dbRes = await queryPostGIS(`
      INSERT INTO officer_accounts (
        employee_code, full_name, email, phone, department, designation, role, district, taluk, password_hash, account_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE')
      RETURNING id, employee_code, full_name, email, role, account_status
    `, [employee_code, full_name, email, phone, department, designation, role, district || null, taluk || null, password_hash]);

    return res.status(201).json({ success: true, message: 'Officer provisioned successfully', officer: dbRes.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'Officer with this email or employee code already exists' });
    }
    return res.status(500).json({ success: false, error: 'Failed to provision officer', details: err.message });
  }
}

export async function updateOfficerStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const dbRes = await queryPostGIS(`
      UPDATE officer_accounts SET account_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, account_status
    `, [status, id]);

    if (dbRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Officer not found' });

    return res.json({ success: true, message: `Officer status updated to ${status}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update status', details: err.message });
  }
}

export async function updateOfficerRole(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role) return res.status(400).json({ success: false, error: 'Role is required' });

    const dbRes = await queryPostGIS(`
      UPDATE officer_accounts SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, role
    `, [role, id]);

    if (dbRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Officer not found' });

    return res.json({ success: true, message: `Officer role updated to ${role}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update role', details: err.message });
  }
}
