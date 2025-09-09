import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
  const sidebarOpen = ref(false)
  const searchQuery = ref('')
  const currentView = ref<'dashboard' | 'host' | 'search'>('dashboard')

  // Getters
  const isMobile = computed(() => window.innerWidth < 640)
  const isTablet = computed(() => window.innerWidth >= 640 && window.innerWidth < 1024)
  const isDesktop = computed(() => window.innerWidth >= 1024)

  // Actions
  const setLoading = (loading: boolean, message: string = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  const showSuccessToast = (message: string) => {
    toastMessage.value = message
    toastType.value = 'success'
    showToast.value = true
    setTimeout(() => hideToast(), 3000)
  }

  const showErrorToast = (message: string) => {
    toastMessage.value = message
    toastType.value = 'error'
    showToast.value = true
    setTimeout(() => hideToast(), 5000)
  }

  const showWarningToast = (message: string) => {
    toastMessage.value = message
    toastType.value = 'warning'
    showToast.value = true
    setTimeout(() => hideToast(), 4000)
  }

  const showInfoToast = (message: string) => {
    toastMessage.value = message
    toastType.value = 'info'
    showToast.value = true
    setTimeout(() => hideToast(), 3000)
  }

  const hideToast = () => {
    showToast.value = false
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const setSidebarOpen = (open: boolean) => {
    sidebarOpen.value = open
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const clearSearchQuery = () => {
    searchQuery.value = ''
  }

  const setCurrentView = (view: 'dashboard' | 'host' | 'search') => {
    currentView.value = view
  }

  const resetUI = () => {
    isLoading.value = false
    loadingMessage.value = ''
    hideToast()
    sidebarOpen.value = false
    searchQuery.value = ''
    currentView.value = 'dashboard'
  }

  return {
    // State
    isLoading,
    loadingMessage,
    showToast,
    toastMessage,
    toastType,
    sidebarOpen,
    searchQuery,
    currentView,

    // Getters
    isMobile,
    isTablet,
    isDesktop,

    // Actions
    setLoading,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    hideToast,
    toggleSidebar,
    setSidebarOpen,
    setSearchQuery,
    clearSearchQuery,
    setCurrentView,
    resetUI
  }
})
