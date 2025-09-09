<template>
  <div class="toast fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
    <TransitionGroup name="toast">
      <div
        v-for="toast in activeToasts"
        :key="toast.id"
        class="toast-content"
        :class="getToastClasses(toast.type)"
      >
        <div class="flex items-start">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <component :is="getToastIcon(toast.type)" class="w-5 h-5" />
          </div>

          <!-- Content -->
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ toast.title }}
            </p>
            <p v-if="toast.message" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close button -->
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeToast(toast.id)"
              class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md p-1 transition-colors duration-200"
            >
              <span class="sr-only">Close</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const uiStore = useUIStore()

const activeToasts = computed(() => {
  // In a real implementation, you'd manage toasts in the UI store
  // For now, we'll return an empty array
  return []
})

const removeToast = (id: string) => {
  // TODO: Implement toast removal
  console.log('Remove toast:', id)
}

const getToastIcon = (type: string) => {
  const icons = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon
  }
  return icons[type as keyof typeof icons] || InformationCircleIcon
}

const getToastClasses = (type: string) => {
  const baseClasses = [
    'flex',
    'p-4',
    'rounded-md',
    'shadow-lg',
    'border',
    'transition-all',
    'duration-300'
  ]

  const typeClasses = {
    success: [
      'bg-green-50',
      'border-green-200',
      'text-green-800',
      'dark:bg-green-900/20',
      'dark:border-green-700',
      'dark:text-green-200'
    ],
    warning: [
      'bg-yellow-50',
      'border-yellow-200',
      'text-yellow-800',
      'dark:bg-yellow-900/20',
      'dark:border-yellow-700',
      'dark:text-yellow-200'
    ],
    error: [
      'bg-red-50',
      'border-red-200',
      'text-red-800',
      'dark:bg-red-900/20',
      'dark:border-red-700',
      'dark:text-red-200'
    ],
    info: [
      'bg-blue-50',
      'border-blue-200',
      'text-blue-800',
      'dark:bg-blue-900/20',
      'dark:border-blue-700',
      'dark:text-blue-200'
    ]
  }

  return [...baseClasses, ...(typeClasses[type as keyof typeof typeClasses] || typeClasses.info)].join(' ')
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
