import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HostKey } from '@/types'

export const useHostStore = defineStore('host', () => {
  // State
  const hostKey = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const isValidating = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isHostMode = computed(() => isAuthenticated.value)
  const hasHostKey = computed(() => !!hostKey.value)

  // Actions
  const setHostKey = (key: string) => {
    hostKey.value = key
    localStorage.setItem('karaoke_host_key', key)
  }

  const clearHostKey = () => {
    hostKey.value = null
    isAuthenticated.value = false
    localStorage.removeItem('karaoke_host_key')
  }

  const setAuthenticated = (authenticated: boolean) => {
    isAuthenticated.value = authenticated
  }

  const setValidating = (validating: boolean) => {
    isValidating.value = validating
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const initializeFromStorage = () => {
    const storedKey = localStorage.getItem('karaoke_host_key')
    if (storedKey) {
      hostKey.value = storedKey
      // Note: In a real app, you'd validate the key with the server here
      // For now, we'll assume it's valid if it exists in localStorage
      isAuthenticated.value = true
    }
  }

  const generateNewKey = async (): Promise<string | null> => {
    try {
      setValidating(true)
      setError(null)

      // This would normally call the API to generate a new key
      // For now, we'll simulate it
      const newKey = `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setHostKey(newKey)
      setAuthenticated(true)

      return newKey
    } catch (err) {
      setError('Failed to generate host key')
      return null
    } finally {
      setValidating(false)
    }
  }

  const validateKey = async (key: string): Promise<boolean> => {
    try {
      setValidating(true)
      setError(null)

      // This would normally call the API to validate the key
      // For now, we'll accept any non-empty key
      if (key && key.length > 0) {
        setHostKey(key)
        setAuthenticated(true)
        return true
      } else {
        setError('Invalid host key')
        return false
      }
    } catch (err) {
      setError('Failed to validate host key')
      return false
    } finally {
      setValidating(false)
    }
  }

  const logout = () => {
    clearHostKey()
    setError(null)
  }

  return {
    // State
    hostKey,
    isAuthenticated,
    isValidating,
    error,

    // Getters
    isHostMode,
    hasHostKey,

    // Actions
    setHostKey,
    clearHostKey,
    setAuthenticated,
    setValidating,
    setError,
    initializeFromStorage,
    generateNewKey,
    validateKey,
    logout
  }
})
