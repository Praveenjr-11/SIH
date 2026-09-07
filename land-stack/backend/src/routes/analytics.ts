import { Router } from 'express';
import { getAnalytics, getArchitectureSpecs } from '../controllers/analyticsController.js';

const router = Router();

router.get('/dashboard', getAnalytics);
router.get('/architecture-specs', getArchitectureSpecs);

export default router;
