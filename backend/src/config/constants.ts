// Default configuration constants
export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || ''
};
