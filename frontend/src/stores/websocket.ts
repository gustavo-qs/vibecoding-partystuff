import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { QueueState, Song } from '@/types'

export const useWebSocketStore = defineStore('websocket', () => {
  // State
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)
  const lastHeartbeat = ref<Date | null>(null)

  // Getters
  const connectionStatus = computed(() => {
    if (isConnecting.value) return 'connecting'
    if (isConnected.value) return 'connected'
    return 'disconnected'
  })

  // Actions
  const connect = (url: string = 'http://localhost:3001') => {
    if (socket.value?.connected) return

    try {
      isConnecting.value = true
      connectionError.value = null

      socket.value = io(url, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      })

      socket.value.on('connect', () => {
        isConnected.value = true
        isConnecting.value = false
        lastHeartbeat.value = new Date()
        console.log('WebSocket connected')
      })

      socket.value.on('disconnect', (reason) => {
        isConnected.value = false
        isConnecting.value = false
        console.log('WebSocket disconnected:', reason)
      })

      socket.value.on('connect_error', (error) => {
        isConnecting.value = false
        connectionError.value = error.message
        console.error('WebSocket connection error:', error)
      })

      socket.value.on('queue-update', (data: { queueState: QueueState; songs: Song[]; timestamp: string }) => {
        // This will be handled by the queue store
        console.log('Queue update received:', data)
      })

      socket.value.on('reconnect', (attemptNumber) => {
        console.log('WebSocket reconnected after', attemptNumber, 'attempts')
        lastHeartbeat.value = new Date()
      })

      socket.value.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection failed:', error)
      })

    } catch (error) {
      isConnecting.value = false
      connectionError.value = error instanceof Error ? error.message : 'Connection failed'
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      isConnecting.value = false
    }
  }

  const joinQueue = (userId: string) => {
    if (socket.value?.connected) {
      socket.value.emit('join-queue', { userId })
    }
  }

  const leaveQueue = () => {
    if (socket.value?.connected) {
      socket.value.emit('leave-queue')
    }
  }

  const notifySongAdded = (userId: string) => {
    if (socket.value?.connected) {
      socket.value.emit('song-added', { userId })
    }
  }

  const sendHostControl = (action: string, songId?: string) => {
    if (socket.value?.connected) {
      socket.value.emit('host-control', { action, songId })
    }
  }

  const requestQueueUpdate = () => {
    if (socket.value?.connected) {
      socket.value.emit('request-queue-update')
    }
  }

  const sendHeartbeat = () => {
    if (socket.value?.connected) {
      socket.value.emit('heartbeat')
      lastHeartbeat.value = new Date()
    }
  }

  const setConnectionError = (error: string | null) => {
    connectionError.value = error
  }

  // Helper functions
  const isConnectionHealthy = (): boolean => {
    if (!lastHeartbeat.value) return false
    const now = new Date()
    const diff = now.getTime() - lastHeartbeat.value.getTime()
    return diff < 30000 // 30 seconds
  }

  const getConnectionInfo = () => {
    return {
      connected: isConnected.value,
      connecting: isConnecting.value,
      error: connectionError.value,
      healthy: isConnectionHealthy(),
      lastHeartbeat: lastHeartbeat.value
    }
  }

  return {
    // State
    socket,
    isConnected,
    isConnecting,
    connectionError,
    lastHeartbeat,

    // Getters
    connectionStatus,

    // Actions
    connect,
    disconnect,
    joinQueue,
    leaveQueue,
    notifySongAdded,
    sendHostControl,
    requestQueueUpdate,
    sendHeartbeat,
    setConnectionError,

    // Helpers
    isConnectionHealthy,
    getConnectionInfo
  }
})
