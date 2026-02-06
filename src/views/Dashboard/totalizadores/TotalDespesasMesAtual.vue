<template>
  <div class="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
      <i class="uil uil-usd-square text-2xl" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-gray-600 dark:text-gray-400">{{ widget?.nome }}</p>
      <p class="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">{{ totalGeral }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import numbro from 'numbro'

defineProps<{
  widget: { nome?: string; [key: string]: unknown }
}>()

const store = useStore()

const totalGeral = computed(() => {
  const month = new Date().getMonth() + 1
  const despesas = store.state.Dashboard?.despesas
  const val = despesas?.[month]
  if (val == null) return '0,00'
  return numbro(parseFloat(String(val))).format({ thousandSeparated: true, mantissa: 2 })
})
</script>
