<template>
  <div class="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <i :class="['fas', widget?.icone || 'fa-check', 'text-2xl']" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-gray-600 dark:text-gray-400">{{ widget?.nome }}</p>
      <p class="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">{{ totalGeral }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/http'
import numbro from 'numbro'

const props = defineProps<{
  widget: { linkData?: string; nome?: string; icone?: string; [key: string]: unknown }
}>()

const orcamentos = ref<{ total_orcamento?: string | number }[]>([])

const totalGeral = computed(() => {
  const sum = orcamentos.value.reduce((acc, el) => acc + parseFloat(String(el.total_orcamento || 0)), 0)
  return numbro(sum).format({ thousandSeparated: true, mantissa: 2 })
})

onMounted(async () => {
  if (!props.widget?.linkData) return
  try {
    const r = await api.get(props.widget.linkData)
    orcamentos.value = Array.isArray(r.data?.data) ? r.data.data : []
  } catch {
    orcamentos.value = []
  }
})
</script>
