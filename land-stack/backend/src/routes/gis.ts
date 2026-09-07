import { Router } from 'express';
import { getBoundaries, getGisLayers, analyzeLocation } from '../controllers/gisController.js';

const router = Router();

router.get('/boundaries', getBoundaries);
router.get('/layers', getGisLayers);
router.get('/analyze-location', analyzeLocation);
router.post('/analyze-location', analyzeLocation);

export default router;
