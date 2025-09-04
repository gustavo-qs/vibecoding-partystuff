import express from 'express';
import { createServer } from 'http';
import { configureExpress } from './config/express';
import { connectRedis } from './config/redis';
import { SocketManager } from './socket/socket';
import { CONFIG } from './config/constants';

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
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Initialize services
async function startServer() {
  try {
    console.log('🚀 Starting Karaoke Backend Server...');

    // Connect to Redis
    await connectRedis();

    // Initialize Socket.IO
    const socketManager = new SocketManager(server);
    console.log('📡 Socket.IO initialized');

    // Start server
    server.listen(CONFIG.PORT, () => {
      console.log(`🎤 Karaoke Backend Server running on port ${CONFIG.PORT}`);
      console.log(`📊 Health check available at: http://localhost:${CONFIG.PORT}/health`);
      console.log(`🎵 API endpoints available at: http://localhost:${CONFIG.PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(async () => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Export for testing
export { app, server };
