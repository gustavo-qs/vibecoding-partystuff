# Sistema de Logging - Karaoke Backend

## Visão Geral

Este projeto implementa um sistema de logging robusto e estruturado usando **Winston** para garantir que o backend esteja funcionando corretamente. O sistema fornece logs detalhados durante toda a inicialização e execução do servidor.

## Funcionalidades do Sistema de Logging

### 🚀 Logs de Inicialização
- **Servidor Express**: Configuração de middlewares, rotas e endpoints
- **Redis**: Conexão, eventos de conexão e desconexão
- **Socket.IO**: Inicialização e configuração de eventos
- **Configurações**: Ambiente, portas, CORS, rate limiting

### 📡 Logs em Tempo Real
- **Requisições HTTP**: Método, URL, status, duração, headers
- **Socket.IO Events**: Conexões, desconexões, mensagens, broadcasts
- **Redis Operations**: Conexões, reconexões, operações de dados

### 🚨 Logs de Erro
- **Erros do Express**: 500 errors, 404 not found
- **Erros do Redis**: Falhas de conexão, timeouts
- **Erros Globais**: Unhandled rejections, uncaught exceptions
- **Erros de Socket**: Conexões perdidas, mensagens malformadas

## Estrutura dos Logs

### Níveis de Log
- **ERROR**: Erros críticos que precisam atenção imediata
- **WARN**: Avisos sobre situações que podem causar problemas
- **INFO**: Informações importantes sobre o estado do sistema
- **HTTP**: Logs de requisições/respostas HTTP
- **DEBUG**: Informações detalhadas para desenvolvimento

### Formato dos Logs
```
YYYY-MM-DD HH:mm:ss:ms LEVEL: Mensagem | Contexto JSON
```

### Exemplo de Log
```
2024-01-15 14:30:25:123 info: 🎤 Karaoke Backend Server successfully started | {"port":3001,"environment":"development","corsEnabled":true}
```

## Arquivos de Log

### Localização
- **Console**: Logs em tempo real no terminal
- **Arquivo**: `logs/error.log` - Apenas erros
- **Arquivo**: `logs/all.log` - Todos os logs

### Configuração
```typescript
// Nível de log configurável via variável de ambiente
LOG_LEVEL=info  // error, warn, info, http, debug
```

## Componentes do Sistema

### 1. Logger Service (`src/utils/logger.ts`)
- Configuração do Winston com cores e formatos
- Função `logWithContext` para logs estruturados
- Stream para integração com Morgan (futuro)

### 2. HTTP Logger Middleware (`src/middleware/http-logger.ts`)
- Intercepta todas as requisições `/api/*`
- Log de entrada e saída com duração
- Detecção automática de erros HTTP

### 3. Configuração Express (`src/config/express.ts`)
- Logs detalhados de cada middleware
- Configuração de segurança, CORS, rate limiting
- Endpoint de health check com logs

### 4. Configuração Redis (`src/config/redis.ts`)
- Logs de eventos de conexão
- Reconexões automáticas
- Tratamento de desconexões

### 5. Socket.IO (`src/socket/socket.ts`)
- Logs de conexões e desconexões
- Eventos de fila e controle do host
- Broadcasts com métricas

## Como Usar

### Logs Básicos
```typescript
import { logWithContext } from './utils/logger';

// Log com contexto
logWithContext.info('Servidor iniciado', {
  port: 3001,
  environment: 'development'
});

// Log de erro
logWithContext.error('Erro na conexão', error, {
  userId: '123',
  action: 'connect'
});
```

### Configuração via Environment
```bash
# .env
NODE_ENV=development
LOG_LEVEL=debug
PORT=3001
REDIS_URL=redis://localhost:6379
```

## Monitoramento

### Health Check
```
GET /health
```
Retorna status do servidor, uptime e versão.

### Logs em Produção
- Arquivos de log são automaticamente criados em `logs/`
- Logs são rotacionados automaticamente (configurável)
- Nível de log pode ser ajustado dinamicamente

## Debugging

### Desenvolvimento
```bash
npm run dev  # Logs detalhados no console
```

### Produção
```bash
LOG_LEVEL=info npm start  # Apenas logs importantes
LOG_LEVEL=debug npm start  # Logs completos para debugging
```

## Benefícios

✅ **Transparência**: Visibilidade completa do estado do sistema
✅ **Debugging**: Logs estruturados facilitam identificação de problemas
✅ **Monitoramento**: Métricas em tempo real sobre performance
✅ **Auditoria**: Rastreamento de todas as operações importantes
✅ **Manutenibilidade**: Fácil localização e correção de bugs

## Próximos Passos

- [ ] Integração com ferramentas de monitoramento (DataDog, New Relic)
- [ ] Alertas automáticos para erros críticos
- [ ] Dashboards de métricas em tempo real
- [ ] Logs estruturados para análise de performance
