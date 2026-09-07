import express from 'express';
import cors from 'cors';
import parcelsRouter from './routes/parcels.js';
import gsiRouter from './routes/gsi.js';
import mutationsRouter from './routes/mutations.js';
import analyticsRouter from './routes/analytics.js';
import phase4GisRouter from './gis/routes/gisRoutes.js';
import authRouter from './routes/authRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import documentRouter from './routes/documentRoutes.js';
import caseRouter from './routes/caseRoutes.js';
import reportRouter from './routes/reportRoutes.js';
import { getDatabaseHealth } from './gis/config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Phase 4 & 5 PostGIS Spatial API Router (Mounted on /api/gis and /api/v1/gis)
app.use('/api/gis', phase4GisRouter);
app.use('/api/v1/gis', phase4GisRouter);

// SIH 2026 Enterprise API Routers (Standard /api/v1 prefix)
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/cases', caseRouter);
app.use('/api/v1/reports', reportRouter);

// Aliases for /api/auth and /api/officer specification endpoints
app.use('/api/auth', authRouter);
app.use('/api/officer/dashboard', dashboardRouter);
app.use('/api/officer/cases', caseRouter);

// Base Existing API Routes
app.get('/api/v1/health', async (req, res) => {
  const dbHealth = await getDatabaseHealth();
  res.json({
    status: 'HEALTHY',
    platform: 'LAND STACK SIH 2026 REST API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    gsiIntegrationStatus: 'Active - Geoscientific Advisory Connected',
    spatialEngineStatus: 'Active - PostGIS Spatial Location API',
    databaseHealth: dbHealth
  });
});

app.use('/api/v1/parcels', parcelsRouter);
app.use('/api/v1/gsi', gsiRouter);
app.use('/api/v1/mutations', mutationsRouter);
app.use('/api/v1/analytics', analyticsRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found on LAND STACK Backend REST API'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LAND STACK SIH 2026 Backend REST Server Running on Port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`📍 Spatial Analysis API: http://localhost:${PORT}/api/gis/analysis`);
  console.log(`🏛️ Officer Auth API: http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`📊 Officer Dashboard: http://localhost:${PORT}/api/v1/dashboard`);
  console.log(`=======================================================`);
});
