<template>
  <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          © {{ currentYear }} Karaoke System. Made with ❤️ for great music experiences.
        </div>

        <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Powered by Vue 3</span>
          </span>

          <span class="hidden sm:block">•</span>

          <span class="flex items-center space-x-1">
            <div
              class="w-2 h-2 rounded-full"
              :class="connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'"
            ></div>
            <span class="hidden sm:inline">{{ connectionStatusText }}</span>
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'

const wsStore = useWebSocketStore()

const currentYear = computed(() => new Date().getFullYear())

const connectionStatus = computed(() => wsStore.connectionStatus)
const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return 'Real-time'
    case 'connecting': return 'Connecting...'
    case 'disconnected': return 'Offline'
    default: return 'Unknown'
  }
})
</script>
