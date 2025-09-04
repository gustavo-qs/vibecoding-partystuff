# 🎤 Arquitetura do Sistema de Karaoke
## Versão Simplificada para Uso Pessoal

---

## 📋 Visão Geral do Projeto

O **Sistema de Karaoke** é uma aplicação web moderna e responsiva desenvolvida para uso pessoal em festas e eventos. A plataforma permite interação colaborativa entre múltiplos usuários através de dispositivos móveis e desktops.

### 🎯 Principais Funcionalidades
- 🔍 **Busca e Adição**: Inserção direta de links do YouTube ou busca integrada
- 📺 **Reprodução Unificada**: Player centralizado com vídeo, áudio e legendas
- 👥 **Experiência Multiusuário**: Fila compartilhada em tempo real
- 🎛️ **Controle Administrativo**: Gerenciamento completo da sessão
- 📱 **Compatibilidade Cross-Device**: Funciona em smartphones, tablets e desktops

### 👤 Tipos de Usuário
| Tipo | Permissões | Interface |
|------|------------|-----------|
| **👤 Usuário** | Adicionar músicas à fila | Busca + botão "Adicionar" |
| **👑 Administrador** | Controle total da sessão | Painel de controle completo |

---

## 📋 Requisitos Funcionais

### ✅ Funcionalidades Core
- [ ] **Busca de Músicas**: Pesquisa integrada no YouTube ou inserção direta de URLs
- [ ] **Reprodução Automática**: Player YouTube IFrame API oficial
- [ ] **Fila Compartilhada**: Sistema FIFO com persistência em Redis
- [ ] **Sincronização Real-time**: Atualizações instantâneas via WebSocket
- [ ] **Controle Administrativo**: Pular, remover e reordenar músicas

### 🎨 Interfaces do Usuário
- [ ] **Interface Usuário**: Campo de busca + botão de adição
- [ ] **Interface ADM**: Lista da fila + controles de gerenciamento
- [ ] **Responsividade**: Design adaptável para todos os dispositivos

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────────┐
│                           🌐 CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐   │
│  │   👤 User UI    │ │   👑 Admin UI   │ │  📱 Mobile/Tablet    │   │
│  │                 │ │                 │ │                       │   │
│  │ • Busca música  │ │ • Controle fila │ │ • Interface responsiva│   │
│  │ • Adiciona fila │ │ • Skip/Remove   │ │ • Touch controls      │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         🎨 FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐   │
│  │   Vue.js SPA    │ │ Socket.IO Client│ │ YouTube IFrame API   │   │
│  │                 │ │                 │ │                       │   │
│  │ • Reactive UI   │ │ • Real-time     │ │ • Video player        │   │
│  │ • State mgmt    │ │ • Broadcasting  │ │ • Controls API        │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ⚙️ BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐   │
│  │ Express.js API  │ │ Socket.IO Server│ │  Queue Manager       │   │
│  │                 │ │                 │ │                       │   │
│  │ • REST routes   │ │ • WebSocket     │ │ • FIFO logic          │   │
│  │ • Validation    │ │ • Broadcasting  │ │ • Redis operations    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────────┘   │
│                                                                     │
│  🔐 Auth Middleware • CORS • Rate Limiting • Error Handling        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         🗄️ DATA LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐   │
│  │   Redis Cache   │ │ Queue Storage   │ │ Session Storage      │   │
│  │     [( )]       │ │                 │ │                       │   │
│  │ • Fast access   │ │ • Song queue    │ │ • User sessions       │   │
│  │ • Persistence   │ │ • Current song  │ │ • Activity tracking   │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      🔗 EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐                           │
│  │ YouTube IFrame  │ │ YouTube Data API│                           │
│  │     Player      │ │  (Optional)      │                           │
│  │                 │ │                 │                           │
│  │ • Video stream  │ │ • Search videos │                           │
│  │ • Audio/lyrics  │ │ • Metadata      │                           │
│  └─────────────────┘ └─────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 🔄 Fluxo de Dados Principal
```
📱 Usuário adiciona música
        ↓
🎨 Frontend captura input
        ↓
⚙️ Backend valida e processa
        ↓
🗄️ Redis armazena na fila
        ↓
📡 WebSocket broadcast para todos
        ↓
👥 Todos os clientes atualizam em tempo real
        ↓
🎵 ADM controla reprodução via YouTube API
```

---

## 🧩 Componentes Principais

### 🎨 1. Frontend (Vue.js)
| Componente | Tecnologia | Responsabilidade |
|------------|------------|------------------|
| **Framework Core** | Vue 3 + Composition API | Estrutura reativa da aplicação |
| **Build Tool** | Vite | Desenvolvimento e bundling otimizado |
| **UI Framework** | Tailwind CSS + Vue Components | Interface moderna e responsiva |
| **Real-time** | Socket.IO Client | Comunicação bidirecional em tempo real |
| **Player** | YouTube IFrame API | Reprodução de vídeo integrada |
| **State Management** | Pinia | Gerenciamento de estado global |
| **Routing** | Vue Router | Navegação SPA |

#### 📱 Interfaces Implementadas
- **Interface Usuário**: Busca inteligente + preview de vídeo + botão de adição
- **Interface ADM**: Lista ordenada + controles (play/pause/skip/remove) + estatísticas

### ⚙️ 2. Backend (Node.js)
| Componente | Tecnologia | Responsabilidade |
|------------|------------|------------------|
| **Web Framework** | Express.js | API REST e roteamento |
| **Real-time Engine** | Socket.IO | Comunicação WebSocket |
| **Queue Engine** | Redis + Custom Logic | Gerenciamento FIFO da fila |
| **Validation** | Joi/Zod | Validação de dados de entrada |
| **CORS** | cors middleware | Controle de acesso cross-origin |
| **Rate Limiting** | express-rate-limit | Proteção contra abuso |

#### 🔐 Sistema de Autenticação
- **Admin**: Configuração via variável de ambiente (simples para uso pessoal)
- **Users**: Sessão baseada em Socket.IO (sem autenticação complexa)

### 🗄️ 3. Redis (Cache & Storage)
| Uso | Estrutura | Persistência |
|-----|------------|--------------|
| **Queue Storage** | Lista ordenada de Song IDs | Persistente |
| **Song Metadata** | Hash com dados da música | Persistente |
| **Session State** | Estado atual da reprodução | Temporário |
| **User Sessions** | Conexões ativas | Temporário |

---

## 📊 Estrutura de Dados

### 🎵 Música (Song Entity)
```json
{
  "id": "uuid-v4",
  "youtube_id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "channel": "Rick Astley",
  "duration": "00:03:32",
  "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "added_by": "user_session_id",
  "added_at": "2024-01-15T20:30:45.123Z",
  "status": "queued|playing|played"
}
```

### 📋 Estado da Fila (Queue State)
```json
{
  "current_song": "song_uuid_123",
  "current_song_started_at": "2024-01-15T20:30:45.123Z",
  "queue": [
    "song_uuid_456",
    "song_uuid_789",
    "song_uuid_101"
  ],
  "total_songs": 42,
  "queue_duration": "02:15:30"
}
```

### 👤 Sessão do Usuário (User Session)
```json
{
  "session_id": "socket_session_uuid",
  "username": "João Silva",
  "role": "admin|user",
  "device_type": "mobile|desktop|tablet",
  "connected_at": "2024-01-15T20:30:45.123Z",
  "last_activity": "2024-01-15T20:35:12.456Z",
  "songs_added": 5
}
```

---

## 🔧 Tecnologias Recomendadas

### 🎨 Frontend Stack
- **Vue 3**: Framework reativo com Composition API
- **Vite**: Build tool ultra-rápido
- **Tailwind CSS**: Framework CSS utilitário
- **Socket.IO Client**: Cliente WebSocket
- **Axios**: Cliente HTTP para APIs
- **VueUse**: Utilitários Vue compostáveis

### ⚙️ Backend Stack
- **Node.js 18+**: Runtime JavaScript
- **Express.js**: Framework web minimalista
- **Socket.IO**: Engine de comunicação real-time
- **Redis**: Cache e armazenamento de fila
- **Joi**: Validação de dados
- **Helmet**: Segurança HTTP headers
- **Compression**: Compressão de resposta

### 🗄️ Infraestrutura
- **Redis 7+**: Cache e fila persistente
- **PM2**: Process manager para produção
- **Docker**: Containerização (opcional)
- **Nginx**: Proxy reverso (opcional)

### 🔗 Integrações Externas
- **YouTube IFrame API**: Player oficial do YouTube
- **YouTube Data API v3**: Busca de vídeos (opcional)

---

## ⚙️ Considerações Técnicas

### 🎵 Reprodução de Música
- **Player Nativo**: YouTube IFrame API oficial
- **Controles**: Play/Pause/Seek via JavaScript API
- **Sincronização**: Estado compartilhado entre todos os clientes
- **Fallback**: Tratamento de erros e vídeos indisponíveis

### 📋 Gerenciamento da Fila
- **Algoritmo**: FIFO (First In, First Out) simples
- **Persistência**: Redis garante sobrevivência a reinícios
- **Conflitos**: Mutex para operações concorrentes
- **Limites**: Controle de tamanho máximo da fila

### 👥 Multiusuário
- **Conexões Simultâneas**: Suporte a múltiplos dispositivos
- **Broadcast**: Atualizações em tempo real via WebSocket
- **Estado Global**: Sincronização automática do estado
- **Reconexão**: Recuperação automática de conexão perdida

---

## 🔒 Requisitos Não Funcionais

### ⚡ Performance
- **Tempo de resposta**: < 100ms para operações da fila
- **Latência WebSocket**: < 50ms para broadcasts
- **Concurrent Users**: Suporte a 50+ usuários simultâneos
- **Uptime**: 99% disponibilidade

### 🛡️ Segurança
- **CORS**: Controle de origens permitidas
- **Rate Limiting**: Proteção contra abuso
- **Input Validation**: Sanitização de URLs e dados
- **HTTPS**: Criptografia em trânsito

### 📱 Usabilidade
- **Responsivo**: Funciona em todos os dispositivos
- **Intuitivo**: Interface simples e clara
- **Acessível**: Suporte a navegação por teclado
- **Offline-ready**: Graceful degradation

---

## 🚀 Estratégia de Deploy

### 🌐 Ambiente de Produção
- **Servidor**: VPS ou serviço cloud (DigitalOcean, AWS Lightsail)
- **Proxy Reverso**: Nginx para servir frontend estático
- **Process Manager**: PM2 para gerenciar processos Node.js
- **SSL**: Certificado Let's Encrypt gratuito

### 🐳 Docker (Opcional)
```dockerfile
# Multi-stage build para otimização
FROM node:18-alpine AS builder
# Build do frontend

FROM node:18-alpine AS runtime
# Runtime do backend + Redis
```

### 📊 Monitoramento
- **Logs**: Winston para logging estruturado
- **Health Checks**: Endpoint de saúde da aplicação
- **Metrics**: Contadores de uso básico
- **Alertas**: Notificações de falhas críticas

---

## 🧪 Estratégia de Testes

### 🔬 Testes Unitários
- **Frontend**: Vitest + Vue Test Utils
- **Backend**: Jest + Supertest
- **Cobertura**: > 80% de cobertura de código

### 🔧 Testes de Integração
- **API Endpoints**: Testes end-to-end das rotas
- **WebSocket**: Testes de comunicação real-time
- **Redis Operations**: Testes de persistência de fila

### 🎭 Testes E2E
- **Cypress**: Testes completos do fluxo do usuário
- **Cenários**: Adição de música, controle ADM, sincronização

---

## 📅 Roadmap de Desenvolvimento

### 🎯 Fase 1: MVP (2-3 semanas)
- [ ] **Backend Core**: API REST + WebSocket + Redis
- [ ] **Frontend Básico**: Vue 3 setup + routing
- [ ] **Queue System**: Adição e remoção básica
- [ ] **YouTube Integration**: Player funcional
- [ ] **Real-time Sync**: Broadcast de atualizações

### 🚀 Fase 2: Funcionalidades Essenciais (1-2 semanas)
- [ ] **Admin Controls**: Skip, remove, reorder
- [ ] **User Interface**: Busca e preview de vídeos
- [ ] **Queue Persistence**: Sobrevivência a reinícios
- [ ] **Error Handling**: Tratamento robusto de erros
- [ ] **Mobile Optimization**: Interface responsiva

### ✨ Fase 3: Polimento e Otimização (1 semana)
- [ ] **UI/UX**: Design moderno com Tailwind
- [ ] **Performance**: Otimização de carregamento
- [ ] **Security**: Headers de segurança + rate limiting
- [ ] **Monitoring**: Logs e métricas básicas
- [ ] **Documentation**: README e guias de uso

### 🔮 Fase 4: Funcionalidades Avançadas (Futura)
- [ ] **YouTube Search API**: Busca integrada
- [ ] **User Authentication**: Sistema de usuários
- [ ] **Song History**: Histórico de reproduções
- [ ] **Playlist Import**: Importar playlists
- [ ] **Lyrics Sync**: Sincronização de legendas

---

## 🛠️ Configuração do Ambiente de Desenvolvimento

### 📋 Pré-requisitos
- Node.js 18+ e npm
- Redis Server
- Git
- VS Code (recomendado)

### 🚀 Setup Rápido
```bash
# Clonar repositório
git clone <repo-url>
cd karaoke-system

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (novo terminal)
cd frontend
npm install
npm run dev

# Redis (se não estiver rodando)
redis-server
```

### 🔧 Scripts Disponíveis
```json
{
  "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
  "build": "npm run build:frontend && npm run build:backend",
  "start": "pm2 start ecosystem.config.js",
  "test": "npm run test:backend && npm run test:frontend"
}
```

---

## 🔍 Possíveis Desafios e Soluções

### 🎵 Problemas com YouTube
- **Solução**: Fallback para vídeos alternativos
- **Rate Limits**: Implementar cache de metadados
- **Copyright**: Avisos sobre restrições de direitos

### 👥 Sincronização Multi-usuário
- **Race Conditions**: Mutex Redis para operações críticas
- **Network Issues**: Reconexão automática + estado offline
- **Large Queues**: Paginação e lazy loading

### 📱 Performance em Mobile
- **Battery Drain**: Otimização de polling WebSocket
- **Slow Networks**: Compressão + cache inteligente
- **Memory Usage**: Cleanup de listeners não utilizados

---

## 📚 Referências e Documentação

- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Redis Commands](https://redis.io/commands)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Tailwind CSS](https://tailwindcss.com/docs)

---