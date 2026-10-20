<template>
  <div
    class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    :class="{ 'cursor-pointer ring-2 ring-blue-500': active, 'hover:border-blue-300 cursor-pointer': clickable && !active }"
    @click="clickable ? $emit('click') : undefined"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ label }}</p>
    <div class="mt-2 flex items-baseline gap-2">
      <span class="text-3xl font-bold" :class="valueClass">{{ value }}</span>
      <span v-if="subLabel" class="text-sm text-gray-500 dark:text-gray-400">{{ subLabel }}</span>
    </div>
    <div v-if="progress !== undefined" class="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: `${Math.min(100, progress)}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: number | string
    subLabel?: string
    progress?: number
    active?: boolean
    clickable?: boolean
    valueClass?: string
  }>(),
  { subLabel: '', active: false, clickable: false, valueClass: 'text-gray-900 dark:text-white' },
)

defineEmits<{ (e: 'click'): void }>()
</script>
