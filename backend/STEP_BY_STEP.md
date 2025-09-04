# 🚀 Guia de Implementação - Backend Karaoke System

## 📋 Visão Geral

Este documento detalha o passo a passo para implementar o backend do **Sistema de Karaoke** conforme especificado na arquitetura geral. O backend será construído com Node.js, Express.js, Socket.IO e Redis.

---

## 🏗️ Fase 1: Configuração do Projeto

### 1.1 Estrutura de Diretórios
```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── socket/
│   └── types/
├── tests/
├── docs/
├── package.json
├── tsconfig.json
├── ecosystem.config.js
└── .env.example
```

### 1.2 Dependências Essenciais
```bash
npm init -y
npm install express socket.io redis cors helmet compression joi winston express-rate-limit
npm install -D typescript @types/node @types/express @types/cors ts-node nodemon concurrently
```

### 1.3 Configuração TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## ⚙️ Fase 2: Configurações Base

### 2.1 Configuração do Servidor Express
```typescript
// src/config/express.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

export const configureExpress = (app: express.Application) => {
  // Segurança
  app.use(helmet());
  app.use(compression());

  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });
};
```

### 2.2 Configuração Redis
```typescript
// src/config/redis.ts
import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    process.exit(1);
  }
};
```

### 2.3 Configuração de Ambiente
```bash
# .env.example
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379

# Logs
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🗄️ Fase 3: Modelos de Dados e Tipos

### 3.1 Definição de Tipos
```typescript
// src/types/index.ts
export interface Song {
  id: string;
  youtube_id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail_url: string;
  youtube_url: string;
  added_by: string;
  user_fingerprint: string;
  added_at: string;
  status: 'queued' | 'playing' | 'played';
}

export interface UserSession {
  session_id: string;
  username: string;
  role: 'host' | 'user';
  device_type: 'mobile' | 'desktop' | 'tablet';
  connected_at: string;
  last_activity: string;
  songs_added: number;
}

export interface QueueState {
  current_song: string | null;
  current_song_started_at: string | null;
  queue: string[];
  total_songs: number;
  queue_duration: string;
}

export interface HostKey {
  key: string;
  created_at: string;
  expires_at: string;
}
```

### 3.2 Serviço de Validação
```typescript
// src/utils/validation.ts
import Joi from 'joi';

export const songSchema = Joi.object({
  youtube_url: Joi.string().uri().required(),
  title: Joi.string().min(1).max(200).optional(),
  added_by: Joi.string().required()
});

export const hostKeySchema = Joi.object({
  key: Joi.string().length(32).required()
});
```

---

## 🔧 Fase 4: Serviços Core

### 4.1 Serviço Redis
```typescript
// src/services/redis.service.ts
import { redisClient } from '../config/redis';

export class RedisService {
  private static instance: RedisService;

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // Queue operations
  async addToQueue(songId: string): Promise<void> {
    await redisClient.rPush('karaoke:queue', songId);
  }

  async removeFromQueue(songId: string): Promise<void> {
    await redisClient.lRem('karaoke:queue', 0, songId);
  }

  async getQueue(): Promise<string[]> {
    return await redisClient.lRange('karaoke:queue', 0, -1);
  }

  // Song metadata
  async saveSong(song: Song): Promise<void> {
    await redisClient.hSet(`karaoke:song:${song.id}`, song);
  }

  async getSong(songId: string): Promise<Song | null> {
    const song = await redisClient.hGetAll(`karaoke:song:${songId}`);
    return Object.keys(song).length ? song as Song : null;
  }

  // Host key management
  async setHostKey(key: string, ttl: number = 3600): Promise<void> {
    await redisClient.setEx(`karaoke:host_key`, ttl, key);
  }

  async getHostKey(): Promise<string | null> {
    return await redisClient.get('karaoke:host_key');
  }

  async validateHostKey(key: string): Promise<boolean> {
    const storedKey = await this.getHostKey();
    return storedKey === key;
  }
}
```

### 4.2 Serviço de Queue
```typescript
// src/services/queue.service.ts
import { RedisService } from './redis.service';
import { Song, QueueState } from '../types';

export class QueueService {
  private redis = RedisService.getInstance();

  async addSong(song: Song): Promise<void> {
    await this.redis.saveSong(song);
    await this.redis.addToQueue(song.id);
  }

  async removeSong(songId: string): Promise<void> {
    await this.redis.removeFromQueue(songId);
  }

  async getCurrentSong(): Promise<Song | null> {
    const queue = await this.redis.getQueue();
    if (queue.length === 0) return null;

    const currentSongId = queue[0];
    return await this.redis.getSong(currentSongId);
  }

  async skipCurrentSong(): Promise<Song | null> {
    const currentSong = await this.getCurrentSong();
    if (currentSong) {
      await this.redis.removeFromQueue(currentSong.id);
    }
    return await this.getCurrentSong();
  }

  async getQueueState(): Promise<QueueState> {
    const queue = await this.redis.getQueue();
    const totalSongs = queue.length;
    let queueDuration = '00:00:00';

    // Calculate total duration (simplified)
    // In real implementation, you'd sum up all song durations

    return {
      current_song: queue.length > 0 ? queue[0] : null,
      current_song_started_at: null, // Would be set when song starts playing
      queue: queue,
      total_songs: totalSongs,
      queue_duration: queueDuration
    };
  }
}
```

### 4.3 Serviço de Host
```typescript
// src/services/host.service.ts
import { RedisService } from './redis.service';
import crypto from 'crypto';

export class HostService {
  private redis = RedisService.getInstance();

  generateHostKey(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  async createHostKey(ttl: number = 3600): Promise<string> {
    const key = this.generateHostKey();
    await this.redis.setHostKey(key, ttl);
    return key;
  }

  async validateHostKey(key: string): Promise<boolean> {
    return await this.redis.validateHostKey(key);
  }

  async getCurrentHostKey(): Promise<string | null> {
    return await this.redis.getHostKey();
  }
}
```

---

## 🌐 Fase 5: Rotas da API

### 5.1 Rotas de Música
```typescript
// src/routes/songs.ts
import { Router } from 'express';
import { SongController } from '../controllers/song.controller';

const router = Router();
const songController = new SongController();

// Add song to queue
router.post('/', songController.addSong);

// Get queue status
router.get('/queue', songController.getQueue);

// Get specific song
router.get('/:id', songController.getSong);

// Remove song (host only)
router.delete('/:id', songController.removeSong);

export default router;
```

### 5.2 Rotas de Host
```typescript
// src/routes/host.ts
import { Router } from 'express';
import { HostController } from '../controllers/host.controller';

const router = Router();
const hostController = new HostController();

// Generate new host key
router.post('/key', hostController.generateKey);

// Validate host key
router.post('/validate', hostController.validateKey);

// Host controls
router.post('/skip', hostController.skipSong);
router.post('/remove/:songId', hostController.removeSong);

export default router;
```

---

## 🎮 Fase 6: Controladores

### 6.1 Controlador de Música
```typescript
// src/controllers/song.controller.ts
import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service';
import { Song } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SongController {
  private queueService = new QueueService();

  async addSong(req: Request, res: Response): Promise<void> {
    try {
      const { youtube_url, title } = req.body;
      const added_by = req.body.added_by || 'anonymous';

      // Extract YouTube ID from URL
      const youtube_id = this.extractYouTubeId(youtube_url);
      if (!youtube_id) {
        res.status(400).json({ error: 'Invalid YouTube URL' });
        return;
      }

      const song: Song = {
        id: uuidv4(),
        youtube_id,
        title: title || 'Unknown Title',
        channel: 'Unknown Channel',
        duration: '00:00:00',
        thumbnail_url: `https://img.youtube.com/vi/${youtube_id}/maxresdefault.jpg`,
        youtube_url,
        added_by,
        user_fingerprint: req.body.user_fingerprint || '',
        added_at: new Date().toISOString(),
        status: 'queued'
      };

      await this.queueService.addSong(song);

      res.status(201).json({
        success: true,
        song,
        message: 'Song added to queue'
      });
    } catch (error) {
      console.error('Error adding song:', error);
      res.status(500).json({ error: 'Failed to add song' });
    }
  }

  async getQueue(req: Request, res: Response): Promise<void> {
    try {
      const queueState = await this.queueService.getQueueState();
      res.json(queueState);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get queue' });
    }
  }

  async getSong(req: Request, res: Response): Promise<void> {
    // Implementation for getting specific song
  }

  async removeSong(req: Request, res: Response): Promise<void> {
    // Implementation for removing song (host only)
  }

  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
}
```

### 6.2 Controlador de Host
```typescript
// src/controllers/host.controller.ts
import { Request, Response } from 'express';
import { HostService } from '../services/host.service';
import { QueueService } from '../services/queue.service';

export class HostController {
  private hostService = new HostService();
  private queueService = new QueueService();

  async generateKey(req: Request, res: Response): Promise<void> {
    try {
      const key = await this.hostService.createHostKey();
      res.json({
        success: true,
        key,
        message: 'Host key generated successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate host key' });
    }
  }

  async validateKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.body;
      const isValid = await this.hostService.validateHostKey(key);

      res.json({
        valid: isValid,
        message: isValid ? 'Valid host key' : 'Invalid host key'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate host key' });
    }
  }

  async skipSong(req: Request, res: Response): Promise<void> {
    try {
      const nextSong = await this.queueService.skipCurrentSong();
      res.json({
        success: true,
        next_song: nextSong,
        message: 'Song skipped'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to skip song' });
    }
  }

  async removeSong(req: Request, res: Response): Promise<void> {
    // Implementation for removing specific song
  }
}
```

---

## 🔌 Fase 7: Socket.IO - Comunicação Real-time

### 7.1 Configuração do Socket Server
```typescript
// src/socket/socket.ts
import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { RedisService } from '../services/redis.service';

export class SocketManager {
  private io: SocketServer;
  private redis = RedisService.getInstance();

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join room for queue updates
      socket.on('join-queue', () => {
        socket.join('queue-room');
        this.broadcastQueueUpdate();
      });

      // Handle song addition
      socket.on('song-added', (data) => {
        this.broadcastQueueUpdate();
      });

      // Handle host controls
      socket.on('host-control', (data) => {
        if (data.action === 'skip') {
          this.broadcastQueueUpdate();
        }
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  async broadcastQueueUpdate(): Promise<void> {
    try {
      const queueState = await this.redis.getQueue();
      this.io.to('queue-room').emit('queue-update', {
        queue: queueState,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error broadcasting queue update:', error);
    }
  }

  getIO(): SocketServer {
    return this.io;
  }
}
```

---

## 🚀 Fase 8: Servidor Principal

### 8.1 Arquivo Principal
```typescript
// src/server.ts
import express from 'express';
import { createServer } from 'http';
import { configureExpress } from './config/express';
import { connectRedis } from './config/redis';
import { SocketManager } from './socket/socket';

// Routes
import songRoutes from './routes/songs';
import hostRoutes from './routes/host';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Configure Express
configureExpress(app);

// Routes
app.use('/api/songs', songRoutes);
app.use('/api/host', hostRoutes);

// Initialize services
async function startServer() {
  try {
    // Connect to Redis
    await connectRedis();

    // Initialize Socket.IO
    const socketManager = new SocketManager(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Socket.IO ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### 8.2 Arquivo de Entrada
```typescript
// src/index.ts
import 'dotenv/config';
import { server } from './server';
```

---

## 🧪 Fase 9: Testes

### 9.1 Testes Unitários
```typescript
// tests/services/queue.service.test.ts
import { QueueService } from '../../src/services/queue.service';
import { RedisService } from '../../src/services/redis.service';

describe('QueueService', () => {
  let queueService: QueueService;

  beforeEach(() => {
    queueService = new QueueService();
  });

  it('should add song to queue', async () => {
    const song = {
      id: 'test-id',
      youtube_id: 'test-youtube-id',
      title: 'Test Song',
      // ... other song properties
    };

    await queueService.addSong(song);
    const queue = await queueService.getQueue();
    expect(queue).toContain(song.id);
  });
});
```

---

## 📊 Fase 10: Monitoramento e Logging

### 10.1 Configuração de Logs
```typescript
// src/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'karaoke-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
```

---

## 🚀 Fase 11: Scripts e Configurações Finais

### 11.1 Package.json
```json
{
  "name": "karaoke-backend",
  "version": "1.0.0",
  "description": "Backend for Karaoke System",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "redis": "^4.6.8",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "joi": "^17.9.2",
    "winston": "^3.8.2",
    "express-rate-limit": "^6.10.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.4.5",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/uuid": "^9.0.2",
    "typescript": "^5.1.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "jest": "^29.6.1",
    "@types/jest": "^29.5.3",
    "eslint": "^8.45.0",
    "@typescript-eslint/eslint-plugin": "^6.2.0",
    "@typescript-eslint/parser": "^6.2.0"
  }
}
```

### 11.2 PM2 Configuração
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'karaoke-backend',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

---

## 📋 Checklist de Implementação

### ✅ Configuração Inicial
- [ ] Estrutura de diretórios criada
- [ ] Dependências instaladas
- [ ] TypeScript configurado
- [ ] Arquivo .env criado

### ✅ Configurações Base
- [ ] Express configurado com middlewares
- [ ] Redis conectado
- [ ] CORS configurado
- [ ] Rate limiting implementado

### ✅ Modelos e Tipos
- [ ] Interfaces TypeScript definidas
- [ ] Schemas de validação criados
- [ ] Tipos de erro definidos

### ✅ Serviços Core
- [ ] RedisService implementado
- [ ] QueueService implementado
- [ ] HostService implementado
- [ ] Validação de entrada

### ✅ API REST
- [ ] Rotas de músicas criadas
- [ ] Rotas de host criadas
- [ ] Middlewares de autenticação
- [ ] Tratamento de erros

### ✅ WebSocket
- [ ] Socket.IO configurado
- [ ] Handlers de eventos implementados
- [ ] Broadcasting funcionando
- [ ] Reconexão automática

### ✅ Testes
- [ ] Testes unitários escritos
- [ ] Testes de integração criados
- [ ] Cobertura de código > 80%

### ✅ Produção
- [ ] Logging configurado
- [ ] PM2 configurado
- [ ] Docker setup (opcional)
- [ ] Documentação atualizada

---

## 🔧 Próximos Passos

1. **Comece pela Fase 1**: Configure o projeto e instale dependências
2. **Fase 2**: Configure Express, Redis e middlewares básicos
3. **Fase 3**: Defina tipos e modelos de dados
4. **Fase 4**: Implemente os serviços core (Redis, Queue, Host)
5. **Fase 5-6**: Crie rotas e controladores da API
6. **Fase 7**: Implemente Socket.IO para comunicação real-time
7. **Fase 8**: Integre tudo no servidor principal
8. **Fase 9**: Escreva testes abrangentes
9. **Fase 10**: Configure logging e monitoramento
10. **Fase 11**: Prepare para produção

---

## 🔍 Pontos de Atenção

### Segurança
- Sempre valide entrada do usuário
- Use prepared statements para Redis
- Implemente rate limiting adequado
- Configure CORS corretamente

### Performance
- Use Redis para cache
- Implemente paginação para grandes filas
- Otimize queries Redis
- Monitore uso de memória

### Escalabilidade
- Considere clustering para múltiplas instâncias
- Implemente horizontal scaling
- Use Redis Cluster se necessário
- Monitore métricas de performance

### Monitoramento
- Configure logging estruturado
- Implemente health checks
- Monitore erros e performance
- Configure alertas

---

## 📚 Referências

- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Redis Documentation](https://redis.io/documentation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
