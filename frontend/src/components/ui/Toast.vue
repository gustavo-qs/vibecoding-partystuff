<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-content"
        :class="toastClasses(toast.type)"
      >
        <div class="flex items-start">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <component :is="getIcon(toast.type)" class="w-5 h-5" />
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
              class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md p-1"
            >
              <span class="sr-only">Close</span>
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export interface ToastItem {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

const props = defineProps<{
  toasts: ToastItem[]
}>()

const emit = defineEmits<{
  'remove-toast': [id: string]
}>()

const removeToast = (id: string) => {
  emit('remove-toast', id)
}

const getIcon = (type: ToastItem['type']) => {
  const icons = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon
  }
  return icons[type]
}

const toastClasses = (type: ToastItem['type']) => {
  const baseClasses = ['flex', 'p-4', 'rounded-md', 'shadow-lg', 'border']

  const typeClasses = {
    success: ['bg-green-50', 'border-green-200', 'text-green-800'],
    warning: ['bg-yellow-50', 'border-yellow-200', 'text-yellow-800'],
    error: ['bg-red-50', 'border-red-200', 'text-red-800'],
    info: ['bg-blue-50', 'border-blue-200', 'text-blue-800']
  }

  return [...baseClasses, ...typeClasses[type]].join(' ')
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
