// Application Configuration

export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',

  // WebSocket Configuration
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3001',

  // YouTube API (Optional)
  YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || '',

  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',

  // App Info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Karaoke System',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // CORS (for development)
  CORS_ORIGIN: import.meta.env.VITE_CORS_ORIGIN || 'http://localhost:5173',

  // Feature Flags
  ENABLE_YOUTUBE_SEARCH: import.meta.env.VITE_ENABLE_YOUTUBE_SEARCH === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',

  // Timeouts
  API_TIMEOUT: 10000,
  WS_RECONNECT_DELAY: 1000,
  WS_RECONNECT_ATTEMPTS: 5,

  // Limits
  MAX_QUEUE_SIZE: 100,
  MAX_SONGS_PER_USER: 10,
  SEARCH_DEBOUNCE_MS: 300,

  // Local Storage Keys
  STORAGE_KEYS: {
    USER_FINGERPRINT: 'karaoke_user_fingerprint',
    USERNAME: 'karaoke_username',
    HOST_KEY: 'karaoke_host_key',
    THEME: 'karaoke_theme',
  },

  // YouTube Configuration
  YOUTUBE: {
    PLAYER_VARS: {
      autoplay: 0,
      controls: 1,
      disablekb: 0,
      enablejsapi: 1,
      fs: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
    },
  },
} as const

export type Config = typeof config
