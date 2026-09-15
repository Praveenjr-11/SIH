import { Response, NextFunction } from 'express';
import { RequestWithId } from './requestId.js';

export function structuredLoggerMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const requestId = req.requestId || 'N/A';

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      method,
      url: originalUrl,
      status: statusCode,
      durationMs: duration,
      clientIp: ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    }));
  });

  next();
}
