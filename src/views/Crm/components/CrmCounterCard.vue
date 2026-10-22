<template>
  <div
    class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    :class="{ 'cursor-pointer ring-2 ring-blue-500': active, 'hover:border-blue-300 cursor-pointer': clickable && !active }"
    @click="clickable ? $emit('click') : undefined"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ label }}</p>
    <p v-if="hint" class="mt-0.5 text-[11px] font-normal normal-case tracking-normal text-gray-400 dark:text-gray-500">
      {{ hint }}
    </p>
    <div class="mt-2 flex items-baseline gap-2">
      <span class="text-3xl font-bold" :class="valueClass">{{ value }}</span>
      <span v-if="subLabel" class="text-sm text-gray-500 dark:text-gray-400">{{ subLabel }}</span>
    </div>
    <div v-if="progress !== undefined" class="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: `${Math.min(100, progress)}%` }"></div>
    </div>
    <p v-if="progress2Label" class="mt-3 text-xs font-semibold" :class="progress2TextClass">{{ progress2Label }}</p>
    <div v-if="progress2 !== undefined" class="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        class="h-full rounded-full transition-all"
        :class="progress2Class"
        :style="{ width: `${Math.min(100, progress2)}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: number | string
    hint?: string
    subLabel?: string
    progress?: number
    progress2?: number
    progress2Label?: string
    progress2Class?: string
    progress2TextClass?: string
    active?: boolean
    clickable?: boolean
    valueClass?: string
  }>(),
  {
    hint: '',
    subLabel: '',
    progress2Label: '',
    progress2Class: 'bg-emerald-500',
    progress2TextClass: 'text-gray-500',
    active: false,
    clickable: false,
    valueClass: 'text-gray-900 dark:text-white',
  },
)

defineEmits<{ (e: 'click'): void }>()
</script>
