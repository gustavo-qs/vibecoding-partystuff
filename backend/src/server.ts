import express from 'express';
import { createServer } from 'http';
import { configureExpress } from './config/express';
import { connectRedis } from './config/redis';
import { SocketManager } from './socket/socket';
import { CONFIG } from './config/constants';
import { logWithContext } from './utils/logger';

// Routes
import songRoutes from './routes/songs';
import hostRoutes from './routes/host';

const app = express();
const server = createServer(app);

// Configure Express
configureExpress(app);

// Routes
app.use('/api/songs', songRoutes);
app.use('/api/host', hostRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logWithContext.error('🚨 Express error occurred', err, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    stack: err.stack,
    errorType: err.name,
    statusCode: err.status || 500
  });

  const statusCode = err.status || 500;
  const errorResponse = {
    success: false,
    error: CONFIG.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(CONFIG.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  logWithContext.warn('🚫 Route not found', {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Initialize services
async function startServer() {
  try {
    logWithContext.info('🚀 Starting Karaoke Backend Server...', {
      nodeEnv: CONFIG.NODE_ENV,
      port: CONFIG.PORT,
      corsOrigin: CONFIG.CORS_ORIGIN,
      redisUrl: CONFIG.REDIS_URL ? 'configured' : 'default',
      logLevel: CONFIG.LOG_LEVEL
    });

    // Connect to Redis
    logWithContext.info('🔄 Connecting to Redis...');
    await connectRedis();
    logWithContext.info('✅ Redis connection established successfully');

    // Initialize Socket.IO
    logWithContext.info('📡 Initializing Socket.IO...');
    const socketManager = new SocketManager(server);
    logWithContext.info('✅ Socket.IO initialized and ready');

    // Start server
    server.listen(CONFIG.PORT, () => {
      logWithContext.info(`🎤 Karaoke Backend Server successfully started`, {
        port: CONFIG.PORT,
        environment: CONFIG.NODE_ENV,
        corsEnabled: true,
        healthEndpoint: `http://localhost:${CONFIG.PORT}/health`,
        apiBaseUrl: `http://localhost:${CONFIG.PORT}/api`
      });

      logWithContext.info(`📊 Health check endpoint available`, {
        url: `http://localhost:${CONFIG.PORT}/health`,
        method: 'GET'
      });

      logWithContext.info(`🎵 API endpoints ready`, {
        songsEndpoint: `http://localhost:${CONFIG.PORT}/api/songs`,
        hostEndpoint: `http://localhost:${CONFIG.PORT}/api/host`
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logWithContext.warn('🛑 SIGTERM received, initiating graceful shutdown...', {
        signal: 'SIGTERM'
      });
      server.close(async () => {
        logWithContext.info('✅ Server closed successfully', {
          exitCode: 0
        });
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logWithContext.warn('🛑 SIGINT received, initiating graceful shutdown...', {
        signal: 'SIGINT'
      });
      server.close(async () => {
        logWithContext.info('✅ Server closed successfully', {
          exitCode: 0
        });
        process.exit(0);
      });
    });

  } catch (error) {
    logWithContext.error('❌ Failed to start server', error, {
      nodeEnv: CONFIG.NODE_ENV,
      port: CONFIG.PORT
    });
    process.exit(1);
  }
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logWithContext.error('🚨 Unhandled Rejection at Promise', reason, {
    promise: promise.toString(),
    type: 'unhandledRejection'
  });
  // Don't exit the process in production, just log the error
  if (CONFIG.NODE_ENV === 'development') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logWithContext.error('🚨 Uncaught Exception', error, {
    type: 'uncaughtException',
    stack: error.stack
  });
  // Always exit on uncaught exceptions
  process.exit(1);
});

// Export for testing and manual initialization
export { app, server, startServer };
