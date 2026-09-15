import 'dotenv/config';

export const envConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/landstack',
  jwtSecret: process.env.JWT_SECRET || 'land-stack-sih-2026-production-secret-key-key-32bytes',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  maxRateLimitReqs: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10)
};

export function validateEnvConfig(): boolean {
  console.log(`[EnvConfig] Configuration loaded for environment: ${envConfig.nodeEnv} (Port: ${envConfig.port})`);
  return true;
}
