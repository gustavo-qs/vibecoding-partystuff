import { ref, onMounted, onUnmounted } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { useQueueStore } from '@/stores/queue'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'
import { config } from '@/utils/config'
import type { QueueState, Song } from '@/types'

export function useWebSocket() {
  const wsStore = useWebSocketStore()
  const queueStore = useQueueStore()
  const userStore = useUserStore()
  const uiStore = useUIStore()

  const isConnected = ref(false)
  const connectionStatus = ref('disconnected')
  const lastMessage = ref<Date | null>(null)

  // Initialize WebSocket connection
  const connect = () => {
    wsStore.connect(config.WS_URL)

    // Listen for connection events
    if (wsStore.socket) {
      wsStore.socket.on('connect', () => {
        isConnected.value = true
        connectionStatus.value = 'connected'
        lastMessage.value = new Date()

        // Join queue room
        wsStore.joinQueue(userStore.session?.session_id || 'anonymous')

        uiStore.showSuccessToast('Connected to server')
      })

      wsStore.socket.on('disconnect', () => {
        isConnected.value = false
        connectionStatus.value = 'disconnected'
        uiStore.showWarningToast('Disconnected from server')
      })

      wsStore.socket.on('connect_error', (error) => {
        connectionStatus.value = 'error'
        uiStore.showErrorToast('Connection failed: ' + error.message)
      })

      // Listen for queue updates
      wsStore.socket.on('queue-update', (data: { queueState: QueueState; songs: Song[]; timestamp: string }) => {
        console.log('Queue update received:', data)
        queueStore.updateQueueState(data.queueState)
        queueStore.setSongs(data.songs)
        lastMessage.value = new Date()
      })

      // Listen for song additions
      wsStore.socket.on('song-added', (data: { userId: string; song: Song }) => {
        if (data.userId !== userStore.session?.session_id) {
          uiStore.showInfoToast('New song added to queue')
          // Refresh queue if needed
          wsStore.requestQueueUpdate()
        }
      })

      // Listen for host controls
      wsStore.socket.on('host-control', (data: { action: string; songId?: string }) => {
        console.log('Host control:', data)
        if (data.action === 'skip') {
          queueStore.skipToNext()
          uiStore.showInfoToast('Song skipped by host')
        } else if (data.action === 'remove' && data.songId) {
          queueStore.removeSong(data.songId)
          uiStore.showInfoToast('Song removed by host')
        }
      })

      // Listen for heartbeat
      wsStore.socket.on('heartbeat', () => {
        lastMessage.value = new Date()
      })
    }
  }

  const disconnect = () => {
    wsStore.disconnect()
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }

  const sendHeartbeat = () => {
    wsStore.sendHeartbeat()
  }

  const notifySongAdded = (userId: string) => {
    wsStore.notifySongAdded(userId)
  }

  const sendHostControl = (action: string, songId?: string) => {
    wsStore.sendHostControl(action, songId)
  }

  const requestQueueUpdate = () => {
    wsStore.requestQueueUpdate()
  }

  // Connection health check
  const isConnectionHealthy = (): boolean => {
    if (!lastMessage.value) return false
    const now = new Date()
    const diff = now.getTime() - lastMessage.value.getTime()
    return diff < 30000 // 30 seconds
  }

  // Auto-reconnect logic
  let reconnectInterval: number | null = null

  const startAutoReconnect = () => {
    if (reconnectInterval) return

    reconnectInterval = window.setInterval(() => {
      if (!isConnected.value && !wsStore.isConnecting) {
        console.log('Attempting to reconnect...')
        connect()
      }
    }, 5000) // Try to reconnect every 5 seconds
  }

  const stopAutoReconnect = () => {
    if (reconnectInterval) {
      clearInterval(reconnectInterval)
      reconnectInterval = null
    }
  }

  // Lifecycle
  onMounted(() => {
    connect()
    startAutoReconnect()

    // Send periodic heartbeats
    const heartbeatInterval = setInterval(() => {
      if (isConnected.value) {
        sendHeartbeat()
      }
    }, 10000) // Every 10 seconds

    // Cleanup heartbeat on unmount
    onUnmounted(() => {
      clearInterval(heartbeatInterval)
    })
  })

  onUnmounted(() => {
    stopAutoReconnect()
    disconnect()
  })

  return {
    // State
    isConnected,
    connectionStatus,
    lastMessage,

    // Actions
    connect,
    disconnect,
    notifySongAdded,
    sendHostControl,
    requestQueueUpdate,

    // Utilities
    isConnectionHealthy
  }
}
