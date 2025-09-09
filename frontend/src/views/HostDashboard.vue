<template>
  <Layout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">
              Host Control Panel 🎛️
            </h1>
            <p class="mt-2 text-purple-100">
              You have full control over the karaoke session
            </p>
          </div>
          <div class="hidden md:block">
            <svg class="w-16 h-16 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- YouTube Player Section -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            YouTube Player
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Current song: {{ currentSong?.title || 'No song playing' }}
          </p>
        </template>

        <div class="space-y-4">
          <!-- Player Container -->
          <div class="aspect-video bg-black rounded-lg overflow-hidden">
            <div
              id="youtube-player"
              class="w-full h-full"
            ></div>
          </div>

          <!-- Player Controls -->
          <div class="flex items-center justify-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Button
              @click="previousSong"
              variant="secondary"
              :disabled="!hasPreviousSong"
              title="Previous Song"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Button>

            <Button
              @click="togglePlayback"
              :disabled="!currentSong"
              class="px-8"
            >
              <svg v-if="!isPlaying" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H14a1 1 0 011 1v2a1 1 0 01-1 1h-1.586a1 1 0 01-.707-.293l-.707-.707A1 1 0 0010.586 12H9a1 1 0 01-1-1v-2a1 1 0 011-1z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />
              </svg>
            </Button>

            <Button
              @click="nextSong"
              variant="secondary"
              :disabled="!hasNextSong"
              title="Next Song"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          <!-- Player Info -->
          <div v-if="currentSong" class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center space-x-4">
              <span>Duration: {{ currentSong.duration }}</span>
              <span>Added by: {{ currentSong.added_by }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span>Progress: {{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Queue Management Section -->
      <Card>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Queue Management
              </h2>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {{ queueLength }} songs in queue
              </p>
            </div>

            <div class="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                @click="refreshQueue"
                :loading="isRefreshing"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </template>

        <div v-if="queueSongs.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Queue is empty
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Users can add songs from their devices
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(song, index) in queueSongs"
            :key="song.id"
            class="queue-item"
            :class="{ 'queue-item-current': index === 0 }"
          >
            <div class="flex items-center space-x-3 flex-1">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium">
                  {{ index + 1 }}
                </span>
              </div>

              <img
                :src="song.thumbnail_url"
                :alt="song.title"
                class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />

              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ song.title }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {{ song.channel }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  Added by {{ song.added_by }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ song.duration }}
              </span>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-1">
                <button
                  @click="playSong(song)"
                  class="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                  title="Play this song"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H14a1 1 0 011 1v2a1 1 0 01-1 1h-1.586a1 1 0 01-.707-.293l-.707-.707A1 1 0 0010.586 12H9a1 1 0 01-1-1v-2a1 1 0 011-1z" />
                  </svg>
                </button>

                <button
                  @click="removeSong(song)"
                  :disabled="isRemovingSong"
                  class="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  title="Remove from queue"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Session Stats Section -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {{ totalSongs }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Total Songs
            </div>
          </div>
        </Card>

        <Card>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ playedSongs }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Songs Played
            </div>
          </div>
        </Card>

        <Card>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ queueLength }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              In Queue
            </div>
          </div>
        </Card>

        <Card>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ activeUsers }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Active Users
            </div>
          </div>
        </Card>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { useQueueStore } from '@/stores/queue'
import { useHostStore } from '@/stores/host'
import { useUIStore } from '@/stores/ui'
import { useQueue } from '@/composables/useQueue'
import { useYouTube } from '@/composables/useYouTube'
import type { Song } from '@/types'

const router = useRouter()
const queueStore = useQueueStore()
const hostStore = useHostStore()
const uiStore = useUIStore()
const { skipSong, removeSong: removeSongFromQueue, refreshQueue } = useQueue()
const {
  isReady,
  isPlaying,
  currentTime,
  duration,
  loadSong,
  play,
  pause
} = useYouTube()

// Reactive data
const isRefreshing = ref(false)
const isRemovingSong = ref(false)

// Computed properties
const currentSong = computed(() => queueStore.currentSong)
const queueSongs = computed(() => queueStore.currentQueueSongs)
const queueLength = computed(() => queueStore.queue.length)
const hasNextSong = computed(() => queueLength.value > 1)
const hasPreviousSong = computed(() => false) // For now, no previous song functionality

// Stats (mock data for now)
const totalSongs = computed(() => queueStore.songs.length)
const playedSongs = computed(() => queueStore.songs.filter(s => s.status === 'played').length)
const activeUsers = ref(1) // TODO: Implement real user tracking

// Methods
const togglePlayback = () => {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

const nextSong = async () => {
  try {
    await skipSong()
    uiStore.showSuccessToast('Skipped to next song')
  } catch (error) {
    uiStore.showErrorToast('Failed to skip song')
  }
}

const previousSong = () => {
  // TODO: Implement previous song functionality
  uiStore.showInfoToast('Previous song functionality coming soon!')
}

const playSong = (song: Song) => {
  loadSong(song)
  uiStore.showSuccessToast(`Playing: ${song.title}`)
}

const removeSong = async (song: Song) => {
  if (confirm(`Are you sure you want to remove "${song.title}" from the queue?`)) {
    isRemovingSong.value = true
    try {
      await removeSongFromQueue(song.id, true)
      uiStore.showSuccessToast('Song removed from queue')
    } catch (error) {
      uiStore.showErrorToast('Failed to remove song')
    } finally {
      isRemovingSong.value = false
    }
  }
}

const refreshQueueData = async () => {
  isRefreshing.value = true
  try {
    await refreshQueue()
  } catch (error) {
    uiStore.showErrorToast('Failed to refresh queue')
  } finally {
    isRefreshing.value = false
  }
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Initialize YouTube player
onMounted(async () => {
  // Check if user is authenticated as host
  if (!hostStore.isAuthenticated) {
    router.push('/host-auth')
    return
  }

  // Refresh queue data
  await refreshQueueData()

  // Initialize YouTube player
  try {
    await loadYouTubePlayer()
  } catch (error) {
    console.error('Failed to initialize YouTube player:', error)
    uiStore.showErrorToast('Failed to load YouTube player')
  }
})

const loadYouTubePlayer = async () => {
  // TODO: Initialize YouTube player with proper video ID
  if (currentSong.value) {
    loadSong(currentSong.value)
  }
}

// Check authentication on mount
onMounted(() => {
  if (!hostStore.isAuthenticated) {
    router.push('/host-auth')
  }
})
</script>
