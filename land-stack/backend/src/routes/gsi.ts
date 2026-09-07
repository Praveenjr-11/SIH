import { Router } from 'express';
import { getGSILayers, getGSIRiskAnalysis } from '../controllers/gsiController.js';

const router = Router();

router.get('/layers', getGSILayers);
router.get('/risk-analysis', getGSIRiskAnalysis);

export default router;
