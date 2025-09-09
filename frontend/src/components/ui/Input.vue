<template>
  <div class="relative">
    <input
      :id="id"
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :minlength="minlength"
      :class="inputClasses"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleChange"
    />

    <!-- Prefix slot -->
    <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <slot name="prefix" />
    </div>

    <!-- Suffix slot -->
    <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <slot name="suffix" />
    </div>

    <!-- Error message -->
    <p v-if="error && showError" class="mt-1 text-sm text-error-600 dark:text-error-400">
      {{ error }}
    </p>

    <!-- Helper text -->
    <p v-if="helperText && !error" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ helperText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  helperText?: string
  showError?: boolean
  maxlength?: number
  minlength?: number
  id?: string
  name?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  error: '',
  helperText: '',
  showError: true,
  id: '',
  name: '',
  autocomplete: 'off'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  change: [event: Event]
}>()

const inputRef = ref<HTMLInputElement>()

const hasPrefix = computed(() => !!props.$slots?.prefix)
const hasSuffix = computed(() => !!props.$slots?.suffix)

const inputClasses = computed(() => {
  const baseClasses = [
    'block',
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-lg',
    'shadow-sm',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:border-primary-500',
    'dark:bg-gray-800',
    'dark:border-gray-600',
    'dark:text-white',
    'dark:placeholder-gray-400',
    'transition-colors',
    'duration-200'
  ]

  // State-based classes
  const stateClasses = []

  if (props.disabled) {
    stateClasses.push('bg-gray-50', 'text-gray-500', 'cursor-not-allowed', 'dark:bg-gray-900', 'dark:text-gray-400')
  } else if (props.readonly) {
    stateClasses.push('bg-gray-50', 'cursor-not-allowed', 'dark:bg-gray-900')
  } else {
    stateClasses.push('bg-white', 'dark:bg-gray-800')
  }

  // Error state
  if (props.error) {
    stateClasses.push(
      'border-error-300',
      'text-error-900',
      'placeholder-error-300',
      'focus:ring-error-500',
      'focus:border-error-500',
      'dark:border-error-600',
      'dark:text-error-100'
    )
  } else {
    stateClasses.push('border-gray-300', 'dark:border-gray-600')
  }

  // Padding adjustments for prefix/suffix
  if (hasPrefix.value) {
    stateClasses.push('pl-10')
  }
  if (hasSuffix.value) {
    stateClasses.push('pr-10')
  }

  return [...baseClasses, ...stateClasses].join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value

  if (props.type === 'number') {
    value = target.valueAsNumber || 0
  }

  emit('update:modelValue', value)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

// Expose methods for parent components
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
})
</script>
