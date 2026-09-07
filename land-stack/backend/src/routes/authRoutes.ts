import { Router } from 'express';
import { loginOfficer, getCurrentOfficerProfile, logoutOfficer } from '../controllers/authController.js';
import { authenticateOfficerToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', loginOfficer);
router.post('/officer/login', loginOfficer);
router.post('/logout', logoutOfficer);
router.get('/me', authenticateOfficerToken as any, getCurrentOfficerProfile as any);

export default router;
