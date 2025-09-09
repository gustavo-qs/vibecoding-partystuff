<script setup lang="ts">
import { onMounted } from 'vue'
import { useWebSocketStore } from './stores/websocket'

// Initialize WebSocket connection on app start
onMounted(() => {
  const wsStore = useWebSocketStore()
  wsStore.connect()
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* Global styles are imported in main.ts */
</style>
