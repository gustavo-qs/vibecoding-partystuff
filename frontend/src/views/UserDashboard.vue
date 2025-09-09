<template>
  <Layout>
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">
              Welcome back, {{ userStore.session?.username || 'Guest' }}! 🎵
            </h1>
            <p class="mt-2 text-primary-100">
              Ready to add some music to the queue?
            </p>
          </div>
          <div class="hidden md:block">
            <svg class="w-16 h-16 text-primary-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Search and Add Section -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Add Music to Queue
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Search for a song or paste a YouTube URL
          </p>
        </template>

        <div class="space-y-4">
          <!-- Search Form -->
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <Input
                v-model="searchQuery"
                type="search"
                placeholder="Search for a song or paste YouTube URL..."
                @keyup.enter="handleSearch"
              >
                <template #suffix>
                  <button
                    @click="handleSearch"
                    class="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </template>
              </Input>
            </div>

            <Button
              @click="handleAddSong"
              :disabled="!canAddSong"
              :loading="isAddingSong"
              class="whitespace-nowrap"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add to Queue
            </Button>
          </div>

          <!-- Preview Section (when URL is detected) -->
          <div v-if="detectedSong && !isSearching" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center space-x-4">
              <img
                :src="detectedSong.thumbnail_url"
                :alt="detectedSong.title"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {{ detectedSong.title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ detectedSong.channel }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  Duration: {{ detectedSong.duration }}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                @click="clearDetectedSong"
              >
                Clear
              </Button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isSearching" class="text-center py-8">
            <Loading message="Searching for song..." />
          </div>
        </div>
      </Card>

      <!-- Current Queue Section -->
      <Card>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Current Queue
              </h2>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {{ queueLength }} songs in queue
              </p>
            </div>

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
        </template>

        <div v-if="queueSongs.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No songs in queue
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add some music to get the party started!
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(song, index) in queueSongs"
            :key="song.id"
            class="queue-item"
            :class="{ 'queue-item-current': index === 0 }"
          >
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

            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ song.duration }}
              </span>

              <button
                v-if="canEditSong(song)"
                @click="editSong(song)"
                class="p-1 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                title="Edit song"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Your Songs Section -->
      <Card v-if="userSongs.length > 0">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Your Songs
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Songs you've added to the queue
          </p>
        </template>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="song in userSongs"
            :key="song.id"
            class="song-card"
          >
            <img
              :src="song.thumbnail_url"
              :alt="song.title"
              class="w-full h-32 object-cover rounded-t-lg"
            />
            <div class="p-4">
              <h3 class="font-medium text-gray-900 dark:text-white text-sm truncate">
                {{ song.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                {{ song.channel }}
              </p>
              <div class="mt-2 flex items-center justify-between">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClasses(song.status)"
                >
                  {{ getStatusText(song.status) }}
                </span>
                <button
                  @click="editSong(song)"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Loading from '@/components/ui/Loading.vue'
import { useUserStore } from '@/stores/user'
import { useQueueStore } from '@/stores/queue'
import { useUIStore } from '@/stores/ui'
import { useQueue } from '@/composables/useQueue'
import type { Song } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const queueStore = useQueueStore()
const uiStore = useUIStore()
const { addSong, refreshQueue } = useQueue()

// Reactive data
const searchQuery = ref('')
const detectedSong = ref<Song | null>(null)
const isSearching = ref(false)
const isAddingSong = ref(false)
const isRefreshing = ref(false)

// Computed properties
const queueSongs = computed(() => queueStore.currentQueueSongs)
const queueLength = computed(() => queueStore.queue.length)
const userSongs = computed(() => queueStore.userSongs(userStore.userFingerprint))
const canAddSong = computed(() => {
  return searchQuery.value.trim().length > 0 && !isAddingSong.value
})

// Methods
const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  isSearching.value = true

  try {
    // Check if it's a YouTube URL
    if (isYouTubeUrl(query)) {
      // Extract YouTube info from URL
      const songInfo = await extractYouTubeInfo(query)
      detectedSong.value = songInfo
    } else {
      // TODO: Implement YouTube search API
      uiStore.showInfoToast('YouTube search coming soon! For now, please paste a YouTube URL.')
    }
  } catch (error) {
    uiStore.showErrorToast('Failed to process the URL. Please check and try again.')
  } finally {
    isSearching.value = false
  }
}

const handleAddSong = async () => {
  if (!detectedSong.value && !searchQuery.value.trim()) return

  isAddingSong.value = true

  try {
    let songData

    if (detectedSong.value) {
      songData = {
        youtube_url: detectedSong.value.youtube_url,
        title: detectedSong.value.title,
        added_by: userStore.session?.username || 'Anonymous'
      }
    } else {
      songData = {
        youtube_url: searchQuery.value.trim(),
        added_by: userStore.session?.username || 'Anonymous'
      }
    }

    const addedSong = await addSong(songData)

    // Clear form
    searchQuery.value = ''
    detectedSong.value = null

    uiStore.showSuccessToast(`"${addedSong.title}" added to queue!`)

  } catch (error) {
    uiStore.showErrorToast('Failed to add song to queue. Please try again.')
  } finally {
    isAddingSong.value = false
  }
}

const clearDetectedSong = () => {
  detectedSong.value = null
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

const canEditSong = (song: Song): boolean => {
  return song.user_fingerprint === userStore.userFingerprint
}

const editSong = (song: Song) => {
  // TODO: Implement song editing
  uiStore.showInfoToast('Song editing coming soon!')
}

const getStatusClasses = (status: string): string => {
  const classes = {
    queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    playing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    played: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return classes[status as keyof typeof classes] || classes.queued
}

const getStatusText = (status: string): string => {
  const texts = {
    queued: 'Queued',
    playing: 'Playing',
    played: 'Played'
  }
  return texts[status as keyof typeof texts] || 'Queued'
}

const isYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  return youtubeRegex.test(url)
}

const extractYouTubeInfo = async (url: string): Promise<Song> => {
  // Extract YouTube ID
  const youtubeId = extractYouTubeId(url)

  if (!youtubeId) {
    throw new Error('Invalid YouTube URL')
  }

  // For now, create a basic song object
  // TODO: Implement YouTube Data API integration
  return {
    id: `temp_${Date.now()}`,
    youtube_id: youtubeId,
    title: 'Loading...',
    channel: 'Loading...',
    duration: '00:00:00',
    thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    youtube_url: url,
    added_by: userStore.session?.username || 'Anonymous',
    user_fingerprint: userStore.userFingerprint,
    added_at: new Date().toISOString(),
    status: 'queued'
  }
}

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Lifecycle
onMounted(() => {
  refreshQueueData()
})
</script>
