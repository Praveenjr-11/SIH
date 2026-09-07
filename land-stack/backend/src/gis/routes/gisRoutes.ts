import { Router } from 'express';
import multer from 'multer';
import { gisController } from '../controllers/gisController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 }, // 150 MB max zip upload
});

// 1. GET /api/gis/health
router.get('/health', (req, res) => gisController.getHealth(req, res));

// 2. GET /api/gis/search
router.get('/search', (req, res) => gisController.search(req, res));

// 3. GET /api/gis/location
router.get('/location', (req, res) => gisController.getLocation(req, res));

// 4. GET /api/gis/layers
router.get('/layers', (req, res) => gisController.getLayers(req, res));

// 5. GET /api/gis/layer/:layer
router.get('/layer/:layer', (req, res) => gisController.getLayer(req, res));

// 6. GET /api/gis/boundaries
router.get('/boundaries', (req, res) => gisController.getBoundaries(req, res));

// 7. GET /api/gis/nearby/water
router.get('/nearby/water', (req, res) => gisController.getNearbyWater(req, res));

// 8. GET /api/gis/nearby/roads
router.get('/nearby/roads', (req, res) => gisController.getNearbyRoads(req, res));

// 9. GET /api/gis/analysis & /analyze-location
router.get('/analysis', (req, res) => gisController.getAnalysis(req, res));
router.get('/analyze-location', (req, res) => gisController.getAnalysis(req, res));
router.post('/analyze-location', (req, res) => gisController.getAnalysis(req, res));

// ─── Phase 5: Dataset Catalog ───────────────────────────────────

// 10. GET /api/gis/datasets
router.get('/datasets', (req, res) => gisController.getDatasets(req, res));

// 11. GET /api/gis/datasets/:datasetId
router.get('/datasets/:datasetId', (req, res) => gisController.getDatasetById(req, res));

// ─── Village Boundary Data Base of Entire India ─────────────────

// 12. GET /api/gis/villages/stats
router.get('/villages/stats', (req, res) => gisController.getVillageStats(req, res));

// 13. POST /api/gis/datasets/upload-zip
router.post('/datasets/upload-zip', upload.single('file'), (req, res) => gisController.uploadVillageZip(req, res));

// 14. POST /api/gis/villages/import-all
router.post('/villages/import-all', (req, res) => gisController.triggerVillageImporter(req, res));

export default router;
