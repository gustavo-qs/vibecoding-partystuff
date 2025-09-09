import { ref, onMounted, onUnmounted } from 'vue'
import { config } from '@/utils/config'
import type { Song } from '@/types'

// YouTube Player states
interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  loadVideoById: (videoId: string) => void
  destroy: () => void
}

export function useYouTube() {
  const player = ref<YouTubePlayer | null>(null)
  const isReady = ref(false)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(100)
  const playerState = ref(-1) // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued

  let playerElement: HTMLElement | null = null
  let checkInterval: number | null = null

  // Load YouTube IFrame API
  const loadYouTubeAPI = () => {
    return new Promise<void>((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve()
        return
      }

      // Load the YouTube IFrame API script
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.onload = () => {
        // Wait for YT to be ready
        const checkYT = () => {
          if (window.YT && window.YT.Player) {
            resolve()
          } else {
            setTimeout(checkYT, 100)
          }
        }
        checkYT()
      }
      document.head.appendChild(script)
    })
  }

  // Initialize player
  const initializePlayer = (elementId: string, videoId?: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        playerElement = document.getElementById(elementId)
        if (!playerElement) {
          reject(new Error(`Element with id ${elementId} not found`))
          return
        }

        // @ts-ignore - YT is loaded dynamically
        player.value = new window.YT.Player(elementId, {
          height: '100%',
          width: '100%',
          videoId: videoId || '',
          playerVars: config.YOUTUBE.PLAYER_VARS,
          events: {
            onReady: () => {
              isReady.value = true
              startTimeTracking()
              resolve()
            },
            onStateChange: (event: any) => {
              playerState.value = event.data
              isPlaying.value = event.data === 1 // 1 = playing
            },
            onError: (error: any) => {
              console.error('YouTube player error:', error)
              reject(new Error('YouTube player initialization failed'))
            }
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  // Player controls
  const play = () => {
    if (player.value && isReady.value) {
      player.value.playVideo()
    }
  }

  const pause = () => {
    if (player.value && isReady.value) {
      player.value.pauseVideo()
    }
  }

  const stop = () => {
    if (player.value && isReady.value) {
      player.value.stopVideo()
    }
  }

  const seekTo = (seconds: number) => {
    if (player.value && isReady.value) {
      player.value.seekTo(seconds)
    }
  }

  const setVolume = (vol: number) => {
    if (player.value && isReady.value) {
      volume.value = Math.max(0, Math.min(100, vol))
      // Note: YouTube player doesn't have a direct volume setter
      // You would need to use the YouTube Player API methods
    }
  }

  const loadVideo = (videoId: string) => {
    if (player.value && isReady.value) {
      player.value.loadVideoById(videoId)
    }
  }

  const loadSong = (song: Song) => {
    loadVideo(song.youtube_id)
  }

  // Time tracking
  const startTimeTracking = () => {
    if (checkInterval) return

    checkInterval = window.setInterval(() => {
      if (player.value && isReady.value) {
        currentTime.value = player.value.getCurrentTime()
        duration.value = player.value.getDuration()
      }
    }, 1000)
  }

  const stopTimeTracking = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  // Getters
  const getCurrentTime = (): number => {
    return currentTime.value
  }

  const getDuration = (): number => {
    return duration.value
  }

  const getProgress = (): number => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  }

  const isPlayerReady = (): boolean => {
    return isReady.value
  }

  const getPlayerState = (): number => {
    return playerState.value
  }

  // Cleanup
  const destroy = () => {
    stopTimeTracking()
    if (player.value) {
      player.value.destroy()
      player.value = null
    }
    isReady.value = false
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
  }

  // Lifecycle
  onMounted(() => {
    loadYouTubeAPI()
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    // State
    isReady,
    isPlaying,
    currentTime,
    duration,
    volume,
    playerState,

    // Actions
    initializePlayer,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    loadVideo,
    loadSong,

    // Getters
    getCurrentTime,
    getDuration,
    getProgress,
    isPlayerReady,
    getPlayerState,

    // Cleanup
    destroy
  }
}

// YouTube API global declaration
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}
