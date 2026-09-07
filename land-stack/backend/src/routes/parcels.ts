import { Router } from 'express';
import { getAllParcels, getParcelByUlpin, getParcelGeoJSON } from '../controllers/parcelsController.js';

const router = Router();

router.get('/', getAllParcels);
router.get('/geojson', getParcelGeoJSON);
router.get('/:ulpin', getParcelByUlpin);

export default router;
