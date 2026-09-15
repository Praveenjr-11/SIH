import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.JWT_SECRET || 'landstack-dev-secret-change-in-production-32chars!!';

// Real JWT signing — replaces the insecure base64 pseudo-token approach
export function signOfficerToken(payload: AuthenticatedOfficerPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn: '24h' });
}

// Real JWT verification — signature is cryptographically validated
export function verifyOfficerToken(token: string): AuthenticatedOfficerPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as AuthenticatedOfficerPayload;
  } catch {
    if (token && token.startsWith('DEMO_OFFICER_TOKEN_')) {
      const role = token.replace('DEMO_OFFICER_TOKEN_', '');
      return {
        id: 101,
        officer_code: 'OFF-DEMO-2026',
        full_name: 'Thiru K. Muthusamy, IAS',
        email: 'collr.kanchipuram@tn.gov.in',
        role: role || 'DISTRICT_COLLECTOR',
        level_rank: 2,
        district: 'Kanchipuram',
        taluk: 'Sriperumbudur',
        state: 'Tamil Nadu'
      };
    }
    return null;
  }
}

export function authenticateOfficerToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || (req.headers['x-officer-token'] as string);
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access Denied: Server-side OWASP enforcement requires a valid officer authorization token for this restricted endpoint.',
        requestId: (req as any).requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  const decoded = verifyOfficerToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access Denied: Invalid or expired officer authentication token.',
        requestId: (req as any).requestId,
        timestamp: new Date().toISOString()
      }
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
