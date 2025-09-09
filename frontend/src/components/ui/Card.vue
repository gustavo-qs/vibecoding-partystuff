<template>
  <div class="card" :class="cardClasses">
    <!-- Header -->
    <div v-if="$slots.header" class="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      <slot name="header" />
    </div>

    <!-- Content -->
    <div class="flex-1">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  hover?: boolean
  fullHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: 'sm',
  rounded: 'lg',
  border: true,
  hover: false,
  fullHeight: false
})

const cardClasses = computed(() => {
  const classes = [
    'bg-white',
    'dark:bg-gray-800',
    'transition-all',
    'duration-200'
  ]

  // Padding
  const paddingClasses = {
    none: [],
    sm: ['p-3'],
    md: ['p-6'],
    lg: ['p-8']
  }
  classes.push(...paddingClasses[props.padding])

  // Shadow
  if (props.shadow !== 'none') {
    const shadowClasses = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    }
    classes.push(shadowClasses[props.shadow])
  }

  // Rounded
  if (props.rounded !== 'none') {
    const roundedClasses = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl'
    }
    classes.push(roundedClasses[props.rounded])
  }

  // Border
  if (props.border) {
    classes.push('border', 'border-gray-200', 'dark:border-gray-700')
  }

  // Hover effect
  if (props.hover) {
    classes.push('hover:shadow-md', 'hover:-translate-y-0.5')
  }

  // Height
  if (props.fullHeight) {
    classes.push('h-full')
  }

  return classes.join(' ')
})
</script>
