# 🎵 Karaoke Backend API Documentation

## 📋 Visão Geral

Esta documentação descreve a API REST do backend do sistema de karaoke. A API permite adicionar músicas à fila, gerenciar a fila, controlar reprodução (host) e comunicação em tempo real via WebSocket.

## 🚀 Endpoints da API

### 🎵 Songs API

#### POST /api/songs
Adiciona uma música à fila.

**Request Body:**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Never Gonna Give You Up",
  "added_by": "João Silva",
  "user_fingerprint": "unique-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-generated",
    "youtube_id": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up",
    "channel": "Rick Astley",
    "duration": "00:03:32",
    "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "added_by": "João Silva",
    "user_fingerprint": "unique-user-id",
    "added_at": "2024-01-15T20:30:45.123Z",
    "status": "queued"
  },
  "message": "Song added to queue successfully"
}
```

#### GET /api/songs/queue
Obtém o estado atual da fila.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_song": "song-uuid-1",
    "current_song_started_at": null,
    "queue": ["song-uuid-2", "song-uuid-3"],
    "total_songs": 3,
    "queue_duration": "00:00:00"
  }
}
```

#### GET /api/songs
Obtém todas as músicas na fila.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "song-uuid-1",
      "youtube_id": "dQw4w9WgXcQ",
      "title": "Never Gonna Give You Up",
      "channel": "Rick Astley",
      "duration": "00:03:32",
      "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "added_by": "João Silva",
      "user_fingerprint": "unique-user-id",
      "added_at": "2024-01-15T20:30:45.123Z",
      "status": "queued"
    }
  ]
}
```

#### GET /api/songs/:id
Obtém uma música específica por ID.

#### DELETE /api/songs/:id
Remove uma música da fila (host only).

### 🎛️ Host API

#### POST /api/host/key
Gera uma nova chave de host.

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "a1b2c3d4e5f6789012345678901234567890"
  },
  "message": "Host key generated successfully"
}
```

#### GET /api/host/key
Obtém a chave de host atual.

#### PUT /api/host/key
Renova a chave de host atual.

#### POST /api/host/validate
Valida uma chave de host.

**Request Body:**
```json
{
  "key": "a1b2c3d4e5f6789012345678901234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true
  },
  "message": "Valid host key"
}
```

#### POST /api/host/skip
Pula para a próxima música (host only).

#### DELETE /api/host/songs/:songId
Remove uma música específica (host only).

## 🔌 WebSocket Events

### 📡 Client to Server Events

#### `join-queue`
Entra na sala de atualização da fila.
```javascript
socket.emit('join-queue', { userId: 'user-123' });
```

#### `song-added`
Notifica que uma música foi adicionada.
```javascript
socket.emit('song-added', { userId: 'user-123' });
```

#### `host-control`
Envia comandos de controle do host.
```javascript
socket.emit('host-control', {
  action: 'skip',
  songId: 'song-uuid' // optional
});
```

#### `request-queue-update`
Solicita atualização da fila.
```javascript
socket.emit('request-queue-update');
```

### 📡 Server to Client Events

#### `queue-update`
Atualização do estado da fila.
```javascript
socket.on('queue-update', (data) => {
  console.log('Queue updated:', data);
  // data: { queueState, songs, timestamp }
});
```

## 🛠️ Como Usar

### 1. Iniciar o Servidor
```bash
cd backend
npm install
npm run dev
```

### 2. Adicionar Música via cURL
```bash
curl -X POST http://localhost:3001/api/songs \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "added_by": "Test User"
  }'
```

### 3. Obter Estado da Fila
```bash
curl http://localhost:3001/api/songs/queue
```

### 4. Gerar Chave de Host
```bash
curl -X POST http://localhost:3001/api/host/key
```

## 📊 Health Check

### GET /health
Verifica se o servidor está funcionando.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T20:30:45.123Z",
  "uptime": 3600.123
}
```

## ⚠️ Tratamento de Erros

Todos os endpoints retornam erros no formato:
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Códigos de Status HTTP
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `404` - Recurso não encontrado
- `429` - Rate limit excedido
- `500` - Erro interno do servidor

## 🔒 Segurança

- Rate limiting configurado (100 requests/15min por IP)
- CORS configurado para origem específica
- Helmet para headers de segurança
- Validação de entrada com Joi
- URLs do YouTube validadas antes do processamento

## 📝 Formato de Dados

### 🎵 Música (Song)
```typescript
interface Song {
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
```

### 📋 Estado da Fila (Queue State)
```typescript
interface QueueState {
  current_song: string | null;
  current_song_started_at: string | null;
  queue: string[];
  total_songs: number;
  queue_duration: string;
}
```

## 🚀 Próximos Passos

1. Implementar autenticação/autorização
2. Adicionar integração com YouTube Data API v3
3. Implementar sistema de sessões de usuário
4. Adicionar métricas e monitoramento
5. Criar testes unitários e de integração
