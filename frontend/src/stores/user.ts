import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserSession } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const session = ref<UserSession | null>(null)
  const isConnected = ref(false)
  const userFingerprint = ref<string>('')

  // Getters
  const isHost = computed(() => session.value?.role === 'host')
  const isUser = computed(() => session.value?.role === 'user')
  const deviceType = computed(() => {
    const width = window.innerWidth
    if (width < 640) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  })

  // Actions
  const initializeUser = () => {
    // Generate or retrieve user fingerprint from localStorage
    let fingerprint = localStorage.getItem('karaoke_user_fingerprint')
    if (!fingerprint) {
      fingerprint = generateFingerprint()
      localStorage.setItem('karaoke_user_fingerprint', fingerprint)
    }
    userFingerprint.value = fingerprint

    // Create initial session
    session.value = {
      session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: localStorage.getItem('karaoke_username') || 'Anonymous User',
      role: 'user',
      device_type: deviceType.value,
      connected_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      songs_added: 0
    }
  }

  const setUsername = (username: string) => {
    if (session.value) {
      session.value.username = username
      localStorage.setItem('karaoke_username', username)
    }
  }

  const setHostRole = () => {
    if (session.value) {
      session.value.role = 'host'
    }
  }

  const setUserRole = () => {
    if (session.value) {
      session.value.role = 'user'
    }
  }

  const updateLastActivity = () => {
    if (session.value) {
      session.value.last_activity = new Date().toISOString()
    }
  }

  const incrementSongsAdded = () => {
    if (session.value) {
      session.value.songs_added++
    }
  }

  const setConnected = (connected: boolean) => {
    isConnected.value = connected
    if (connected && session.value) {
      session.value.connected_at = new Date().toISOString()
    }
  }

  const clearSession = () => {
    session.value = null
    isConnected.value = false
    // Keep fingerprint and username in localStorage
  }

  // Helper functions
  const generateFingerprint = (): string => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0.01)'
      ctx.fillRect(0, 0, 10, 10)
    }
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      !!window.indexedDB,
      canvas?.toDataURL()
    ].join('|')

    // Simple hash function
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }

  return {
    // State
    session,
    isConnected,
    userFingerprint,

    // Getters
    isHost,
    isUser,
    deviceType,

    // Actions
    initializeUser,
    setUsername,
    setHostRole,
    setUserRole,
    updateLastActivity,
    incrementSongsAdded,
    setConnected,
    clearSession
  }
})
