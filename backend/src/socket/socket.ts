import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { RedisService } from '../services/redis.service';
import { QueueService } from '../services/queue.service';
import { CONFIG } from '../config/constants';

interface SocketData {
  userId?: string;
  sessionId?: string;
}

export class SocketManager {
  private io: SocketServer;
  private redis = RedisService.getInstance();
  private queueService = new QueueService();

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: CONFIG.CORS_ORIGIN,
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Join queue room for updates
      socket.on('join-queue', (data: SocketData) => {
        socket.join('queue-room');
        console.log(`👤 User ${socket.id} joined queue room`);
        this.broadcastQueueUpdate();
      });

      // Handle song addition
      socket.on('song-added', (data: SocketData) => {
        console.log(`🎵 Song added by user ${socket.id}`);
        this.broadcastQueueUpdate();
      });

      // Handle host controls
      socket.on('host-control', (data: { action: string; songId?: string }) => {
        console.log(`🎛️ Host control: ${data.action} by ${socket.id}`);

        if (data.action === 'skip') {
          this.broadcastQueueUpdate();
        } else if (data.action === 'remove' && data.songId) {
          this.broadcastQueueUpdate();
        }
      });

      // Handle queue updates request
      socket.on('request-queue-update', () => {
        this.broadcastQueueUpdate();
      });

      // Handle user activity
      socket.on('user-activity', (data: SocketData) => {
        // Update user session activity
        console.log(`📱 User activity from ${socket.id}`);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
        socket.leave('queue-room');
      });
    });
  }

  async broadcastQueueUpdate(): Promise<void> {
    try {
      const queueState = await this.queueService.getQueueState();
      const songs = await this.queueService.getAllSongs();

      this.io.to('queue-room').emit('queue-update', {
        queueState,
        songs,
        timestamp: new Date().toISOString()
      });

      console.log('📡 Queue update broadcasted to all clients');
    } catch (error) {
      console.error('❌ Error broadcasting queue update:', error);
    }
  }

  // Method to emit custom events
  emitToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  // Method to get connected clients count
  getConnectedClientsCount(): number {
    return this.io.sockets.sockets.size;
  }

  // Method to get IO server instance
  getIO(): SocketServer {
    return this.io;
  }
}
