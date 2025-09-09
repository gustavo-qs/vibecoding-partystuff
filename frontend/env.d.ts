/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_YOUTUBE_API_KEY?: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_NODE_ENV: string
  readonly VITE_CORS_ORIGIN?: string
  readonly VITE_ENABLE_YOUTUBE_SEARCH?: string
  readonly VITE_ENABLE_DEBUG_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// YouTube API global types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// Socket.IO types
declare module 'socket.io-client' {
  export * from 'socket.io-client/dist/socket.io-client'
}

// Vue Router meta types
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresHost?: boolean
  }
}