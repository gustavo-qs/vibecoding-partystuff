<template>
  <div class="flex flex-col items-center justify-center" :class="containerClasses">
    <!-- Spinner -->
    <div
      v-if="type === 'spinner'"
      :class="spinnerClasses"
      role="status"
      :aria-label="ariaLabel"
    >
      <span class="sr-only">{{ ariaLabel }}</span>
    </div>

    <!-- Dots -->
    <div v-else-if="type === 'dots'" class="loading-dots" role="status" :aria-label="ariaLabel">
      <div></div>
      <div></div>
      <div></div>
      <span class="sr-only">{{ ariaLabel }}</span>
    </div>

    <!-- Pulse -->
    <div v-else-if="type === 'pulse'" class="animate-pulse" role="status" :aria-label="ariaLabel">
      <div class="bg-gray-300 dark:bg-gray-600 rounded" :class="pulseClasses"></div>
      <span class="sr-only">{{ ariaLabel }}</span>
    </div>

    <!-- Skeleton -->
    <div v-else-if="type === 'skeleton'" class="animate-pulse space-y-3" role="status" :aria-label="ariaLabel">
      <div v-for="n in skeletonLines" :key="n" class="bg-gray-300 dark:bg-gray-600 rounded h-4" :class="skeletonWidth"></div>
      <span class="sr-only">{{ ariaLabel }}</span>
    </div>

    <!-- Custom loader -->
    <div v-else-if="type === 'custom'" role="status" :aria-label="ariaLabel">
      <slot />
    </div>

    <!-- Message -->
    <p
      v-if="message"
      class="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center"
      :class="{ 'sr-only': hideMessageFromScreenReaders }"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'custom'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  message?: string
  hideMessageFromScreenReaders?: boolean
  skeletonLines?: number
  skeletonWidth?: string
  fullScreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'md',
  color: 'primary',
  message: '',
  hideMessageFromScreenReaders: false,
  skeletonLines: 3,
  skeletonWidth: 'w-full',
  fullScreen: false
})

const ariaLabel = computed(() => {
  if (props.message) return props.message
  return 'Loading...'
})

const containerClasses = computed(() => {
  const classes = ['loading-container']

  if (props.fullScreen) {
    classes.push('fixed', 'inset-0', 'bg-white', 'dark:bg-gray-900', 'z-50', 'flex', 'flex-col')
  }

  return classes.join(' ')
})

const spinnerClasses = computed(() => {
  const baseClasses = ['loading-spinner']

  // Size classes
  const sizeClasses = {
    xs: ['w-3', 'h-3'],
    sm: ['w-4', 'h-4'],
    md: ['w-6', 'h-6'],
    lg: ['w-8', 'h-8'],
    xl: ['w-12', 'h-12']
  }

  // Color classes
  const colorClasses = {
    primary: ['border-primary-600'],
    secondary: ['border-secondary-600'],
    white: ['border-white'],
    gray: ['border-gray-400', 'dark:border-gray-500']
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...colorClasses[props.color]
  ].join(' ')
})

const pulseClasses = computed(() => {
  const sizeClasses = {
    xs: ['w-8', 'h-8'],
    sm: ['w-12', 'h-12'],
    md: ['w-16', 'h-16'],
    lg: ['w-24', 'h-24'],
    xl: ['w-32', 'h-32']
  }

  return sizeClasses[props.size].join(' ')
})
</script>

<style scoped>
.loading-spinner {
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-dots div {
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots div:nth-child(1) { animation-delay: -0.32s; }
.loading-dots div:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
}
</style>
