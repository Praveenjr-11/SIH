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

// Official TNGIS live WMS connector (requires deployment-time public portal session).
router.get('/tngis/status', (req, res) => gisController.getTngisStatus(req, res));
router.get('/tngis/wms', (req, res) => gisController.getTngisMap(req, res));
router.get('/tngis/feature-info', (req, res) => gisController.getTngisFeatureInfo(req, res));

// 2. GET /api/gis/search
router.get('/search', (req, res) => gisController.search(req, res));

// 3. GET /api/gis/location
router.get('/location', (req, res) => gisController.getLocation(req, res));

// 4. GET /api/gis/layers
router.get('/layers', (req, res) => gisController.getLayers(req, res));
// Registry-first Phase 5 APIs.  These are intentionally generic so new layers do not need new routes.
router.get('/layers/:layerId', (req, res) => gisController.getLayerMetadata(req, res));
router.get('/features', (req, res) => gisController.getRegistryFeatures(req, res));
router.get('/features/:id', (req, res) => gisController.getRegistryFeatures(req, res));
router.post('/query', (req, res) => gisController.getRegistryFeatures({ ...req, query: { ...req.query, layer_id: req.body?.layer_id || req.query.layer_id, bbox: req.body?.bbox || req.query.bbox } } as any, res));
router.post('/point-query', (req, res) => gisController.pointQuery(req, res));
router.post('/within-distance', (req, res) => gisController.withinDistance(req, res));
// Compatibility aliases for the documented generic administrative API.
router.get('/admin/districts', (req, res) => gisController.listDistricts(req, res));
router.get('/admin/taluks', (req, res) => gisController.listTaluks(req, res));
router.get('/admin/villages', (req, res) => gisController.listVillages(req, res));
router.get('/metadata/:layerId', (req, res) => gisController.getLayerMetadata(req, res));

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

// ─── TNGIS Phase 1: Multi-Layer Spatial Overlay ─────────────────────

// 15. GET /api/gis/parcels/:ulpin/overlay?layers=a,b,c
router.get('/parcels/:ulpin/overlay', (req, res) => gisController.getParcelSpatialOverlay(req, res));

// ─── TNGIS Phase 2: Generic Click-to-Query ──────────────────────────

// 16. GET /api/gis/feature-info?layer=X&lat=Y&lng=Z
router.get('/feature-info', (req, res) => gisController.getFeatureInfo(req, res));

// ─── TNGIS Phase 5: Upload-and-Overlay Preview ─────────────────────

// 17. POST /api/gis/overlay-preview
router.post('/overlay-preview', upload.single('file'), (req, res) => gisController.getOverlayPreview(req, res));

// ─── Hierarchy Drill-Down ───────────────────────────────────────────

// 18. GET /api/gis/hierarchy/districts?state=Tamil+Nadu
router.get('/hierarchy/districts', (req, res) => gisController.listDistricts(req, res));

// 19. GET /api/gis/hierarchy/taluks?state=...&district=...
router.get('/hierarchy/taluks', (req, res) => gisController.listTaluks(req, res));

// 20. GET /api/gis/hierarchy/villages?state=...&district=...&taluk=...
router.get('/hierarchy/villages', (req, res) => gisController.listVillages(req, res));

// 21. GET /api/gis/hierarchy/survey-numbers?state=...&district=...&taluk=...&village=...
router.get('/hierarchy/survey-numbers', (req, res) => gisController.listSurveyNumbers(req, res));

// 22. GET /api/gis/hierarchy/boundary?level=district&district=Kanchipuram
router.get('/hierarchy/boundary', (req, res) => gisController.getBoundaryGeometry(req, res));

export default router;
