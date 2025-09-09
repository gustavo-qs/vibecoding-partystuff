import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import styles
import './assets/styles/main.css'

// Import stores
import { useUserStore } from './stores/user'
import { useHostStore } from './stores/host'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores
const userStore = useUserStore()
const hostStore = useHostStore()

// Initialize user session
userStore.initializeUser()
hostStore.initializeFromStorage()

app.mount('#app')
