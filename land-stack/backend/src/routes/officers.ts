import { Router, Response } from 'express';
import { RequestWithId } from '../middleware/requestId.js';
import { loadTamilNaduOfficers } from '../gis/services/officerService.js';

const router = Router();

// GET /api/v1/officers
router.get('/', async (req: RequestWithId, res: Response) => {
  const officers = await loadTamilNaduOfficers();
  res.json({
    success: true,
    total: officers.length,
    officers: officers.map((o, idx) => ({
      id: `OFF-TN-${idx + 1001}`,
      name: o.officerName,
      title: o.designation,
      department: 'Revenue & Disaster Management',
      jurisdiction: `${o.district}, Tamil Nadu`,
      email: o.officialEmail,
      mobile: o.officialMobile
    })),
    requestId: req.requestId
  });
});

export default router;

