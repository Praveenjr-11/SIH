import { Router } from 'express';
import { authenticateOfficerToken, requireRole } from '../middleware/authMiddleware.js';
import { getOfficers, provisionOfficer, updateOfficerStatus, updateOfficerRole } from '../controllers/adminController.js';

const router = Router();

// Protect all admin routes
router.use(authenticateOfficerToken as any);
router.use(requireRole(['SUPER_ADMIN']));

router.get('/officers', getOfficers as any);
router.post('/officers', provisionOfficer as any);
router.patch('/officers/:id/status', updateOfficerStatus as any);
router.patch('/officers/:id/role', updateOfficerRole as any);

export default router;
