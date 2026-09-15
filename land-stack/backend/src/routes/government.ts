import { Router, Response } from 'express';
import { RequestWithId } from '../middleware/requestId.js';

const router = Router();

// GET /api/v1/government/status
router.get('/status', (req: RequestWithId, res: Response) => {
  res.json({
    success: true,
    state: 'Tamil Nadu',
    adapter: 'TamilNaduStateAdapter v2.0',
    integrations: {
      landRecords: { system: 'Tamil Nilam / State RoR', status: 'CONNECTED' },
      registration: { system: 'TN Reginet (SRO)', status: 'CONNECTED' },
      planning: { system: 'DTCP / CMDA Zoning', status: 'CONNECTED' },
      propertyTax: { system: 'State Urban Local Body Tax Portal', status: 'CONNECTED' },
      gisEngine: { system: 'TNGIS GeoServer WFS/WMS', status: 'CONNECTED' }
    },
    requestId: req.requestId
  });
});

export default router;
