<template>
  <Layout>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <div class="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Become a Host
          </h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your host key to access the control panel
          </p>
        </div>

        <!-- Form -->
        <Card class="shadow-xl">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="hostKey" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Host Key
              </label>
              <div class="mt-1">
                <Input
                  id="hostKey"
                  v-model="hostKey"
                  type="password"
                  placeholder="Enter your host key"
                  :error="error"
                  :disabled="isValidating"
                  required
                />
              </div>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Don't have a host key?
                <button
                  type="button"
                  @click="generateNewKey"
                  :disabled="isGenerating"
                  class="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200"
                >
                  Generate one
                </button>
              </p>
            </div>

            <div class="space-y-4">
              <Button
                type="submit"
                :full-width="true"
                :loading="isValidating"
                :disabled="!hostKey.trim() || isValidating"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Access Host Panel
              </Button>

              <Button
                type="button"
                variant="ghost"
                :full-width="true"
                @click="goBack"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Button>
            </div>
          </form>
        </Card>

        <!-- Info Section -->
        <Card>
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              What can you do as a host?
            </h3>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Control music playback
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Skip or remove songs
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Reorder the queue
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Monitor session stats
              </div>
            </div>
          </div>
        </Card>

        <!-- Loading Modal -->
        <Modal :is-open="showGeneratingModal" @close="showGeneratingModal = false">
          <template #header>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Generating Host Key
            </h3>
          </template>

          <div class="text-center py-6">
            <Loading size="lg" message="Creating your host key..." />
            <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
              This may take a few seconds. Please wait...
            </p>
          </div>
        </Modal>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Loading from '@/components/ui/Loading.vue'
import { useHostStore } from '@/stores/host'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const hostStore = useHostStore()
const userStore = useUserStore()
const uiStore = useUIStore()

// Reactive data
const hostKey = ref('')
const error = ref('')
const isValidating = ref(false)
const isGenerating = ref(false)
const showGeneratingModal = ref(false)

// Methods
const handleSubmit = async () => {
  if (!hostKey.value.trim()) return

  isValidating.value = true
  error.value = ''

  try {
    const isValid = await hostStore.validateKey(hostKey.value.trim())

    if (isValid) {
      userStore.setHostRole()
      uiStore.showSuccessToast('Welcome to the host panel!')
      router.push('/host')
    } else {
      error.value = 'Invalid host key. Please check and try again.'
    }
  } catch (err) {
    error.value = 'Failed to validate host key. Please try again.'
    console.error('Host validation error:', err)
  } finally {
    isValidating.value = false
  }
}

const generateNewKey = async () => {
  isGenerating.value = true
  showGeneratingModal.value = true

  try {
    const newKey = await hostStore.generateNewKey()

    if (newKey) {
      hostKey.value = newKey
      uiStore.showSuccessToast('Host key generated successfully!')
      uiStore.showInfoToast('Save this key securely - you\'ll need it to access the host panel again.')
    } else {
      uiStore.showErrorToast('Failed to generate host key. Please try again.')
    }
  } catch (err) {
    uiStore.showErrorToast('Failed to generate host key. Please try again.')
    console.error('Host key generation error:', err)
  } finally {
    isGenerating.value = false
    showGeneratingModal.value = false
  }
}

const goBack = () => {
  router.push('/')
}
</script>
