import { Router, Response } from 'express';
import { RequestWithId } from '../middleware/requestId.js';
import { parcelsData } from '../data/db.js';

const router = Router();

// GET /api/v1/land/records
router.get('/records', (req: RequestWithId, res: Response) => {
  res.json({
    success: true,
    total: parcelsData.length,
    records: parcelsData.map(p => ({
      ulpin: p.ulpin,
      surveyNumber: p.surveyNumber,
      village: p.village,
      taluk: p.taluk,
      district: p.district,
      state: p.state,
      ownerName: p.ownerName,
      areaAcres: p.areaAcres,
      landClassification: p.landClassification
    })),
    requestId: req.requestId
  });
});

export default router;
