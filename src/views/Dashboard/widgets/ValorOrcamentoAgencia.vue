<template>
  <div>
    <h3 class="mb-4 mt-1 text-sm font-semibold leading-tight text-gray-800 dark:text-white">{{ widget?.nome }}</h3>
    <div class="min-h-[250px]">
      <VueApexCharts
        v-if="!loading && pieSeries.length"
        type="donut"
        height="250"
        :options="chartOptions"
        :series="pieSeries"
      />
      <p v-else-if="loading" class="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
        Carregando...
      </p>
      <p v-else class="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
        Nenhum dado disponível.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue'
import { api } from '@/services/http'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps<{ widget: { nome?: string; linkData?: string; [key: string]: unknown } }>()

const defaultUrl = '/widget/orcamento-por-agencia'
const instance = getCurrentInstance()
const alerta = (instance?.proxy as { $alerta?: (msg: string, type?: string) => void })?.$alerta

const orcamentos = ref<{ name?: string; y?: number }[]>([])
const loading = ref(true)

async function getData() {
  const url = typeof props.widget?.linkData === 'string' && props.widget.linkData
    ? props.widget.linkData
    : defaultUrl
  loading.value = true
  try {
    const r = await api.get(url)
    const data = r.data?.data ?? r.data ?? []
    orcamentos.value = Array.isArray(data)
      ? data.map((d: { name?: string; label?: string; y?: number; value?: number }) => ({
          name: d.name ?? d.label ?? '',
          y: parseInt(String(d.y ?? d.value ?? 0), 10),
        }))
      : []
  } catch {
    orcamentos.value = []
    alerta?.('Falha ao buscar dados Valor orç. agências.', 'danger')
  } finally {
    loading.value = false
  }
}

const pieSeries = computed(() => orcamentos.value.map((d) => d.y ?? 0))

const chartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'Outfit, sans-serif' },
  labels: orcamentos.value.map((d) => d.name || '–'),
  legend: { position: 'bottom' },
  plotOptions: { pie: { donut: { labels: { show: true } } } },
  tooltip: { y: { formatter: (val: number) => `${val?.toLocaleString('pt-BR') ?? ''} (${((val / (pieSeries.value.reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(1)}%)` } },
}))

onMounted(getData)
watch(() => props.widget?.linkData, getData)
</script>
