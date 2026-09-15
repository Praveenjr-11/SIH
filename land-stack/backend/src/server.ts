import 'dotenv/config';
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
import healthRouter from './routes/health.js';
import docsRouter from './routes/docs.js';
import officersRouter from './routes/officers.js';
import landRouter from './routes/land.js';
import governmentRouter from './routes/government.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { structuredLoggerMiddleware } from './middleware/logger.js';
import { standardizedErrorHandler } from './middleware/errorHandler.js';
import { authenticateOfficerToken } from './middleware/authMiddleware.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { loadTamilNaduOfficers } from './gis/services/officerService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Request ID & Logging Middleware
app.use(requestIdMiddleware);
app.use(structuredLoggerMiddleware);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Officer-Token']
}));

app.use(express.json());

// Public Spatial & System Health Endpoints (Unrestricted)
app.use('/api/gis', phase4GisRouter);
app.use('/api/v1/gis', phase4GisRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1', docsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/auth', authRouter);

// Public citizen parcel search & geoscientific advisory - rate-limited
const publicRateLimiter = createRateLimiter(60, 60000); // 60 req/min per IP
app.use('/api/v1/parcels', publicRateLimiter, parcelsRouter);
app.use('/api/v1/gsi', gsiRouter);

// RESTRICTED GOVERNMENT OFFICER ENDPOINTS — OWASP Deny-by-Default Protection
app.use('/api/v1/officers', authenticateOfficerToken as any, officersRouter);
app.use('/api/v1/land', authenticateOfficerToken as any, landRouter);
app.use('/api/v1/government', authenticateOfficerToken as any, governmentRouter);
app.use('/api/v1/dashboard', authenticateOfficerToken as any, dashboardRouter);
app.use('/api/v1/documents', authenticateOfficerToken as any, documentRouter);
app.use('/api/v1/cases', authenticateOfficerToken as any, caseRouter);
app.use('/api/v1/reports', authenticateOfficerToken as any, reportRouter);
app.use('/api/v1/analytics', authenticateOfficerToken as any, analyticsRouter);
app.use('/api/v1/mutations', authenticateOfficerToken as any, mutationsRouter);

// Aliases for officer endpoints
app.use('/api/officer/dashboard', authenticateOfficerToken as any, dashboardRouter);
app.use('/api/officer/cases', authenticateOfficerToken as any, caseRouter);


// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found on LAND STACK Backend REST API',
      requestId: (req as any).requestId,
      timestamp: new Date().toISOString()
    }
  });
});

// Standardized Global Error Handler
app.use(standardizedErrorHandler);

export { app };

if (process.env.NODE_ENV !== 'test' && !process.env.TEST_MODE) {
  // Warm up officer cache at startup so real officer data is available from the first request.
  // This is async (Postgres first, CSV fallback) and must complete before requests arrive.
  loadTamilNaduOfficers().catch(err =>
    console.error('[Startup] Officer cache warmup failed:', err.message)
  );

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LAND STACK SIH 2026 Backend REST Server Running on Port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`📍 Spatial Analysis API: http://localhost:${PORT}/api/gis/analysis`);
    console.log(`🏛️ Officer Auth API: http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`📊 Officer Dashboard: http://localhost:${PORT}/api/v1/dashboard`);
    console.log(`=======================================================`);
  });
}


