import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedOfficerPayload {
  id: number;
  officer_code: string;
  full_name: string;
  email: string;
  role: string;
  level_rank: number;
  district: string;
  taluk: string;
  state: string;
}

export interface AuthenticatedRequest extends Request {
  officer?: AuthenticatedOfficerPayload;
}

// Simple base64/hash pseudo JWT token parser for zero external crypto dependency issues
export function signOfficerToken(payload: AuthenticatedOfficerPayload): string {
  const dataStr = JSON.stringify({
    ...payload,
    exp: Date.now() + 86400000 // 24 Hours
  });
  return Buffer.from(dataStr).toString('base64url');
}

export function verifyOfficerToken(token: string): AuthenticatedOfficerPayload | null {
  try {
    const jsonStr = Buffer.from(token, 'base64url').toString('utf8');
    const data = JSON.parse(jsonStr);
    if (data.exp && Date.now() > data.exp) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function authenticateOfficerToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED: Authorization header missing'
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  const decoded = verifyOfficerToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED: Invalid or expired officer token'
    });
  }

  req.officer = decoded;
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.officer) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    }

    if (req.officer.role === 'SYSTEM_ADMIN' || allowedRoles.includes(req.officer.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `FORBIDDEN: Role '${req.officer.role}' does not have permission for this action`
    });
  };
}

export function enforceJurisdiction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.officer) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  // System Admins & State Officers have nationwide access
  if (req.officer.role === 'SYSTEM_ADMIN' || req.officer.role === 'STATE_OFFICER') {
    return next();
  }

  const targetDistrict = req.query.district || req.body.district_name || req.body.district;
  const targetTaluk = req.query.taluk || req.body.subdistrict || req.body.taluk;

  if (targetDistrict && req.officer.district && targetDistrict !== req.officer.district) {
    return res.status(403).json({
      success: false,
      error: `JURISDICTION_DENIED: Officer from '${req.officer.district}' cannot access data for '${targetDistrict}'`
    });
  }

  if (targetTaluk && req.officer.level_rank >= 5 && req.officer.taluk && targetTaluk !== req.officer.taluk) {
    return res.status(403).json({
      success: false,
      error: `JURISDICTION_DENIED: Tahsildar/Officer assigned to '${req.officer.taluk}' Taluk cannot access '${targetTaluk}' Taluk`
    });
  }

  next();
}
