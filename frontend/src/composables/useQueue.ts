import { computed, watch } from 'vue'
import { useQueueStore } from '@/stores/queue'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'
import { apiClient } from '@/utils/api'
import type { Song, AddSongRequest } from '@/types'

export function useQueue() {
  const queueStore = useQueueStore()
  const userStore = useUserStore()
  const uiStore = useUIStore()

  // Computed properties
  const songs = computed(() => queueStore.songs)
  const currentSong = computed(() => queueStore.currentSong)
  const queue = computed(() => queueStore.queue)
  const queueState = computed(() => queueStore.queueState)
  const currentQueueSongs = computed(() => queueStore.currentQueueSongs)
  const userSongs = computed(() => queueStore.userSongs(userStore.userFingerprint))
  const isLoading = computed(() => queueStore.isLoading)
  const error = computed(() => queueStore.error)

  // Actions
  const loadQueue = async () => {
    try {
      queueStore.setLoading(true)
      queueStore.setError(null)

      const [queueState, songs] = await Promise.all([
        apiClient.getQueue(),
        apiClient.getSongs()
      ])

      queueStore.setSongs(songs)
      queueStore.updateQueueState(queueState)

      uiStore.showSuccessToast('Queue loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load queue'
      queueStore.setError(errorMessage)
      uiStore.showErrorToast(errorMessage)
    } finally {
      queueStore.setLoading(false)
    }
  }

  const addSong = async (songData: Omit<AddSongRequest, 'user_fingerprint'>) => {
    try {
      uiStore.setLoading(true, 'Adding song to queue...')

      const requestData: AddSongRequest = {
        ...songData,
        user_fingerprint: userStore.userFingerprint
      }

      const newSong = await apiClient.addSong(requestData)
      queueStore.addSong(newSong)
      userStore.incrementSongsAdded()

      uiStore.showSuccessToast('Song added to queue!')
      return newSong
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add song'
      uiStore.showErrorToast(errorMessage)
      throw err
    } finally {
      uiStore.setLoading(false)
    }
  }

  const removeSong = async (songId: string, isHost: boolean = false) => {
    try {
      uiStore.setLoading(true, 'Removing song...')

      if (isHost) {
        await apiClient.removeSongAsHost(songId)
      } else {
        await apiClient.removeSong(songId)
      }

      queueStore.removeSong(songId)
      uiStore.showSuccessToast('Song removed from queue')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove song'
      uiStore.showErrorToast(errorMessage)
      throw err
    } finally {
      uiStore.setLoading(false)
    }
  }

  const skipSong = async () => {
    try {
      uiStore.setLoading(true, 'Skipping song...')

      const nextSong = await apiClient.skipSong()
      if (nextSong) {
        queueStore.skipToNext()
        uiStore.showSuccessToast('Song skipped')
      } else {
        uiStore.showInfoToast('No more songs in queue')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to skip song'
      uiStore.showErrorToast(errorMessage)
      throw err
    } finally {
      uiStore.setLoading(false)
    }
  }

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    queueStore.reorderQueue(fromIndex, toIndex)
    uiStore.showSuccessToast('Queue reordered')
  }

  const findSongById = (songId: string): Song | undefined => {
    return queueStore.findSongById(songId)
  }

  const findSongByYouTubeId = (youtubeId: string): Song | undefined => {
    return queueStore.findSongByYouTubeId(youtubeId)
  }

  const clearError = () => {
    queueStore.clearError()
  }

  const refreshQueue = () => {
    loadQueue()
  }

  // Watch for changes and auto-refresh if needed
  watch(
    () => queueStore.error,
    (newError) => {
      if (newError) {
        console.error('Queue error:', newError)
      }
    }
  )

  return {
    // State
    songs,
    currentSong,
    queue,
    queueState,
    currentQueueSongs,
    userSongs,
    isLoading,
    error,

    // Actions
    loadQueue,
    addSong,
    removeSong,
    skipSong,
    reorderQueue,
    findSongById,
    findSongByYouTubeId,
    clearError,
    refreshQueue
  }
}
