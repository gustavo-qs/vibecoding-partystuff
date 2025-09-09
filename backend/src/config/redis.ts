import { createClient, RedisClientType } from 'redis';
import { logWithContext } from '../utils/logger';
import { CONFIG } from './constants';

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logWithContext.error('❌ Redis Client Error', err, {
    redisUrl: CONFIG.REDIS_URL || 'redis://localhost:6379'
  });
});

redisClient.on('connect', () => {
  logWithContext.info('🔗 Redis client connected to server', {
    redisUrl: CONFIG.REDIS_URL || 'redis://localhost:6379'
  });
});

redisClient.on('ready', () => {
  logWithContext.info('🚀 Redis client ready and authenticated', {
    redisUrl: CONFIG.REDIS_URL || 'redis://localhost:6379'
  });
});

redisClient.on('end', () => {
  logWithContext.warn('🔌 Redis connection ended');
});

redisClient.on('reconnecting', () => {
  logWithContext.warn('🔄 Redis attempting to reconnect...');
});

export const connectRedis = async (): Promise<void> => {
  try {
    logWithContext.info('🔄 Attempting to connect to Redis...', {
      redisUrl: CONFIG.REDIS_URL || 'redis://localhost:6379',
      timeout: 5000
    });

    await redisClient.connect();

    logWithContext.info('✅ Redis connection established successfully', {
      redisUrl: CONFIG.REDIS_URL || 'redis://localhost:6379',
      connectionStatus: 'connected'
    });
  } catch (err) {
    logWithContext.error('❌ Redis connection failed', err, {
      redisUrl: CONFIG.REDIS_URL || 'redis://localhost:6379',
      action: 'connection_attempt'
    });
    process.exit(1);
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    logWithContext.info('🔌 Disconnecting from Redis...');
    await redisClient.disconnect();
    logWithContext.info('✅ Redis disconnected successfully');
  } catch (err) {
    logWithContext.error('❌ Redis disconnection error', err);
  }
};
