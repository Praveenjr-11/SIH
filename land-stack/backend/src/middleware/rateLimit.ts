/**
 * Simple in-memory rate limiter for public (unauthenticated) endpoints.
 * Uses a sliding window: resets the request count after `windowMs` milliseconds.
 *
 * No external dependency — plain Map-based implementation.
 *
 * Usage in server.ts:
 *   import { createRateLimiter } from './middleware/rateLimit.js';
 *   app.use('/api/v1/parcels', createRateLimiter(60, 60000), parcelsRouter);
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean stale entries to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60000);

/**
 * @param maxRequests Maximum requests per IP per window
 * @param windowMs Window size in milliseconds (default: 60 seconds)
 */
export function createRateLimiter(maxRequests = 60, windowMs = 60000) {
  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      // First request in this window
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded: ${maxRequests} requests per ${windowMs / 1000}s. Retry after ${retryAfterSec}s.`
      });
    }

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(maxRequests - entry.count));
    next();
  };
}
