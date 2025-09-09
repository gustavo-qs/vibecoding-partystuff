import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { RedisService } from '../services/redis.service';
import { QueueService } from '../services/queue.service';
import { CONFIG } from '../config/constants';
import { logWithContext } from '../utils/logger';

interface SocketData {
  userId?: string;
  sessionId?: string;
}

export class SocketManager {
  private io: SocketServer;
  private redis = RedisService.getInstance();
  private queueService = new QueueService();

  constructor(server: HttpServer) {
    logWithContext.info('🔧 Initializing Socket.IO server...', {
      corsOrigin: CONFIG.CORS_ORIGIN,
      allowedMethods: ['GET', 'POST']
    });

    this.io = new SocketServer(server, {
      cors: {
        origin: CONFIG.CORS_ORIGIN,
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
    logWithContext.info('✅ Socket.IO server initialized with event handlers');
  }

  private setupSocketHandlers(): void {
    logWithContext.debug('🎧 Setting up Socket.IO event handlers');

    this.io.on('connection', (socket: Socket) => {
      logWithContext.info(`🔌 New user connected`, {
        socketId: socket.id,
        userAgent: socket.handshake.headers['user-agent'],
        ip: socket.handshake.address,
        totalConnections: this.getConnectedClientsCount()
      });

      // Join queue room for updates
      socket.on('join-queue', (data: SocketData) => {
        socket.join('queue-room');
        logWithContext.debug(`👤 User joined queue room`, {
          socketId: socket.id,
          userId: data.userId,
          sessionId: data.sessionId,
          room: 'queue-room'
        });
        this.broadcastQueueUpdate();
      });

      // Handle song addition
      socket.on('song-added', (data: SocketData) => {
        logWithContext.info(`🎵 Song added by user`, {
          socketId: socket.id,
          userId: data.userId,
          sessionId: data.sessionId,
          event: 'song-added'
        });
        this.broadcastQueueUpdate();
      });

      // Handle host controls
      socket.on('host-control', (data: { action: string; songId?: string }) => {
        logWithContext.info(`🎛️ Host control action`, {
          socketId: socket.id,
          action: data.action,
          songId: data.songId,
          event: 'host-control'
        });

        if (data.action === 'skip') {
          logWithContext.debug('⏭️ Host skipped song', { socketId: socket.id, songId: data.songId });
          this.broadcastQueueUpdate();
        } else if (data.action === 'remove' && data.songId) {
          logWithContext.debug('🗑️ Host removed song', { socketId: socket.id, songId: data.songId });
          this.broadcastQueueUpdate();
        }
      });

      // Handle queue updates request
      socket.on('request-queue-update', () => {
        logWithContext.debug(`📡 Queue update requested`, {
          socketId: socket.id,
          event: 'request-queue-update'
        });
        this.broadcastQueueUpdate();
      });

      // Handle user activity
      socket.on('user-activity', (data: SocketData) => {
        logWithContext.debug(`📱 User activity detected`, {
          socketId: socket.id,
          userId: data.userId,
          sessionId: data.sessionId,
          event: 'user-activity'
        });
      });

      socket.on('disconnect', () => {
        logWithContext.info(`🔌 User disconnected`, {
          socketId: socket.id,
          totalConnections: this.getConnectedClientsCount() - 1,
          reason: 'client_disconnect'
        });
        socket.leave('queue-room');
      });
    });
  }

  async broadcastQueueUpdate(): Promise<void> {
    try {
      logWithContext.debug('📡 Broadcasting queue update to clients');

      const queueState = await this.queueService.getQueueState();
      const songs = await this.queueService.getAllSongs();

      const updateData = {
        queueState,
        songs,
        timestamp: new Date().toISOString()
      };

      this.io.to('queue-room').emit('queue-update', updateData);

      logWithContext.debug('✅ Queue update broadcasted successfully', {
        room: 'queue-room',
        clientsInRoom: this.io.sockets.adapter.rooms.get('queue-room')?.size || 0,
        songsCount: songs.length,
        currentSong: songs.find(song => song.id === queueState.current_song)?.title || null
      });
    } catch (error) {
      logWithContext.error('❌ Error broadcasting queue update', error, {
        room: 'queue-room',
        action: 'broadcast_queue_update'
      });
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
