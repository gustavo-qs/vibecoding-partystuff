# YouTube Data API v3 Setup

## Para corrigir o problema de "Unknown Title" e "Unknown Channel"

O sistema agora suporta a extração de metadados reais dos vídeos do YouTube através da YouTube Data API v3.

## Passos para configurar:

### 1. Criar uma conta no Google Cloud Console
- Acesse: https://console.cloud.google.com/
- Crie um novo projeto ou selecione um existente

### 2. Habilitar a YouTube Data API v3
- No menu lateral, vá para "APIs & Services" > "Library"
- Procure por "YouTube Data API v3"
- Clique em "Enable"

### 3. Criar uma chave de API
- Vá para "APIs & Services" > "Credentials"
- Clique em "Create Credentials" > "API Key"
- Copie a chave gerada

### 4. Configurar no backend
Crie um arquivo `.env` na pasta `backend/` (se não existir):

```env
# ... outras configurações ...

# YouTube Data API v3 Configuration
YOUTUBE_API_KEY=sua_chave_api_aqui
```

### 5. Reiniciar o servidor
```bash
cd backend
npm run dev
```

## Como funciona:

1. Quando um usuário adiciona um vídeo do YouTube
2. O sistema extrai o ID do vídeo da URL
3. Faz uma chamada para a YouTube Data API v3
4. Obtém o título, canal e duração reais do vídeo
5. Salva na fila com os metadados corretos

## Sem a chave da API:

- O sistema ainda funciona normalmente
- Mas os vídeos aparecerão como "Unknown Title" e "Unknown Channel"
- A duração será mostrada como "00:00:00"

## Limites da API gratuita:

- 10.000 unidades por dia (cada chamada consome 1 unidade)
- Cada vídeo adicionado consome 1 unidade
- Para uso pessoal, deve ser suficiente

## Testando:

Após configurar, teste com qualquer vídeo do YouTube:
- https://youtu.be/Hjx9TJQlBsM
- https://www.youtube.com/watch?v=dQw4w9WgXcQ

Os metadados devem aparecer corretamente na fila.
