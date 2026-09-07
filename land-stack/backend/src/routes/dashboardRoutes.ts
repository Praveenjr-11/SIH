import { Router } from 'express';
import { getOfficerDashboard } from '../controllers/dashboardController.js';
import { authenticateOfficerToken, enforceJurisdiction } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateOfficerToken as any, enforceJurisdiction as any, getOfficerDashboard as any);

export default router;
