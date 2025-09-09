import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Song, QueueState } from '@/types'

export const useQueueStore = defineStore('queue', () => {
  // State
  const songs = ref<Song[]>([])
  const currentSong = ref<Song | null>(null)
  const queue = ref<string[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const queueState = computed<QueueState>(() => ({
    current_song: currentSong.value?.id || null,
    current_song_started_at: currentSong.value?.added_at || null,
    queue: queue.value,
    total_songs: songs.value.length,
    queue_duration: calculateTotalDuration()
  }))

  const currentQueueSongs = computed(() =>
    queue.value
      .map(songId => songs.value.find(song => song.id === songId))
      .filter(song => song !== undefined) as Song[]
  )

  const userSongs = computed(() => (userFingerprint: string) =>
    songs.value.filter(song => song.user_fingerprint === userFingerprint)
  )

  // Actions
  const setSongs = (newSongs: Song[]) => {
    songs.value = newSongs
  }

  const addSong = (song: Song) => {
    songs.value.push(song)
    if (!queue.value.includes(song.id)) {
      queue.value.push(song.id)
    }
  }

  const removeSong = (songId: string) => {
    const index = queue.value.indexOf(songId)
    if (index > -1) {
      queue.value.splice(index, 1)
    }
    songs.value = songs.value.filter(song => song.id !== songId)
  }

  const setCurrentSong = (song: Song | null) => {
    currentSong.value = song
  }

  const skipToNext = (): Song | null => {
    if (queue.value.length === 0) {
      setCurrentSong(null)
      return null
    }

    const nextSongId = queue.value[0]
    const nextSong = songs.value.find(song => song.id === nextSongId)

    if (nextSong) {
      setCurrentSong(nextSong)
      queue.value.shift()
      // Mark previous song as played
      if (currentSong.value) {
        const prevSong = songs.value.find(s => s.id === currentSong.value!.id)
        if (prevSong) {
          prevSong.status = 'played'
        }
      }
      nextSong.status = 'playing'
    }

    return nextSong || null
  }

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= queue.value.length || toIndex >= queue.value.length) {
      return
    }

    const [moved] = queue.value.splice(fromIndex, 1)
    queue.value.splice(toIndex, 0, moved)
  }

  const updateQueueState = (newQueueState: QueueState) => {
    queue.value = newQueueState.queue
    if (newQueueState.current_song) {
      const song = songs.value.find(s => s.id === newQueueState.current_song)
      if (song) {
        setCurrentSong(song)
      }
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Helper functions
  const calculateTotalDuration = (): string => {
    // Simplified duration calculation
    // In a real implementation, you'd parse and sum up all song durations
    return '00:00:00'
  }

  const findSongById = (songId: string): Song | undefined => {
    return songs.value.find(song => song.id === songId)
  }

  const findSongByYouTubeId = (youtubeId: string): Song | undefined => {
    return songs.value.find(song => song.youtube_id === youtubeId)
  }

  return {
    // State
    songs,
    currentSong,
    queue,
    isLoading,
    error,

    // Getters
    queueState,
    currentQueueSongs,
    userSongs,

    // Actions
    setSongs,
    addSong,
    removeSong,
    setCurrentSong,
    skipToNext,
    reorderQueue,
    updateQueueState,
    setLoading,
    setError,
    clearError,

    // Helpers
    findSongById,
    findSongByYouTubeId
  }
})
