import { Response, NextFunction } from 'express';
import { RequestWithId } from './requestId.js';

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  details?: any;
}

export function standardizedErrorHandler(err: AppError, req: RequestWithId, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 404 ? 'NOT_FOUND' : status === 400 ? 'BAD_REQUEST' : status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_SERVER_ERROR');
  const requestId = req.requestId || 'N/A';

  console.error(`[ErrorMiddleware] [${requestId}] ${code} (${status}): ${err.message}`);

  res.status(status).json({
    success: false,
    error: {
      code,
      message: err.message || 'An unexpected error occurred on LAND STACK API.',
      requestId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack, details: err.details })
    }
  });
}
