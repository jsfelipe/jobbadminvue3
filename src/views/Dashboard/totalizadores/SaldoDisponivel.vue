<template>
  <div class="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
      <i class="uil uil-wallet text-2xl" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-gray-600 dark:text-gray-400">{{ widget?.nome }}</p>
      <p class="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">{{ saldoFormatado }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/http'
import numbro from 'numbro'

const props = defineProps<{
  widget: { linkData?: string; nome?: string; [key: string]: unknown }
}>()

const saldo = ref<number>(0)

const saldoFormatado = computed(() =>
  numbro(saldo.value).format({ thousandSeparated: true, mantissa: 2 })
)

onMounted(async () => {
  if (!props.widget?.linkData) return
  try {
    const r = await api.get(props.widget.linkData)
    const data = r.data?.data
    if (Array.isArray(data) && data[0]?.saldoData != null) {
      saldo.value = parseFloat(String(data[0].saldoData))
    }
  } catch {
    // ignore
  }
})
</script>
