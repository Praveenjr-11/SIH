import { Router, Request, Response } from 'express';
import { getDatabaseHealth } from '../gis/config/db.js';
import { gisService } from '../gis/services/gisService.js';
import { envConfig } from '../config/envConfig.js';
import { RequestWithId } from '../middleware/requestId.js';

const router = Router();

// 1. GET /api/v1/health
router.get('/', async (req: RequestWithId, res: Response) => {
  const dbHealth = await getDatabaseHealth();
  res.json({
    status: 'HEALTHY',
    platform: 'LAND STACK SIH 2026 REST API',
    version: '2.0.0',
    apiVersion: envConfig.apiPrefix,
    environment: envConfig.nodeEnv,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    services: {
      apiGateway: 'HEALTHY',
      spatialEngine: 'HEALTHY',
      database: dbHealth.postgisConnected ? 'HEALTHY' : 'DEGRADED'
    }
  });
});

// 2. GET /api/v1/health/database
router.get('/database', async (req: RequestWithId, res: Response) => {
  const dbHealth = await getDatabaseHealth();
  res.json({
    status: dbHealth.postgisConnected ? 'HEALTHY' : 'DEGRADED',
    provider: 'PostgreSQL + PostGIS',
    requestId: req.requestId,
    details: dbHealth,
    timestamp: new Date().toISOString()
  });
});

// 3. GET /api/v1/health/spatial
router.get('/spatial', async (req: RequestWithId, res: Response) => {
  const gisHealth = await gisService.getHealth();
  res.json({
    status: gisHealth.postgisConnected ? 'HEALTHY' : 'DEGRADED',
    engine: 'PostGIS Spatial Engine & TNGIS WFS Client',
    requestId: req.requestId,
    details: gisHealth,
    timestamp: new Date().toISOString()
  });
});

export default router;
