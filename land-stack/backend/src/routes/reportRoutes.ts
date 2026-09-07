import { Router } from 'express';
import { generateCaseReport } from '../controllers/reportController.js';
import { authenticateOfficerToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:id', authenticateOfficerToken as any, generateCaseReport as any);

export default router;
