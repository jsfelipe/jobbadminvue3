<template>
  <div :class="topLocation ? 'mt-3' : ''">
    <h3 v-if="!topLocation" class="mb-3 text-base font-semibold text-gray-800 dark:text-white">{{ widget?.nome }}</h3>
    <div class="min-h-[250px]">
      <VueApexCharts
        v-if="chartData.length"
        type="area"
        height="250"
        :options="chartOptions"
        :series="[{ name: 'Valor Faturado', data: chartData }]"
      />
      <p v-else class="py-8 text-center text-sm text-gray-500">Carregando...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { apiV2 } from '@/services/http'
import VueApexCharts from 'vue3-apexcharts'

const props = withDefaults(
  defineProps<{
    widget: { nome?: string; [key: string]: unknown }
    topLocation?: boolean
  }>(),
  { topLocation: false }
)

const chartLabels = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

const chartData = ref<number[]>([])

async function loadData() {
  try {
    const r = await apiV2.get('/charts/dashboard-revenue')
    const revenues = r.data?.revenues
    chartData.value = Array.isArray(revenues) ? revenues.map((v) => parseFloat(String(v ?? 0))) : []
  } catch {
    chartData.value = []
  }
}

onMounted(loadData)
watch(() => props.widget, loadData, { immediate: false })

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    fontFamily: 'Outfit, sans-serif',
    toolbar: { show: false },
  },
  title: { text: undefined },
  xaxis: {
    categories: chartLabels,
    labels: {
      style: { colors: props.topLocation ? '#ffffff' : undefined },
    },
  },
  yaxis: {
    labels: {
      style: { colors: props.topLocation ? '#ffffff' : undefined },
    },
  },
  grid: {
    borderColor: props.topLocation ? 'rgba(255,255,255,0.2)' : undefined,
  },
  colors: props.topLocation ? ['#ffffff'] : ['#465FFF'],
  fill: {
    type: 'gradient',
    gradient: { opacityFrom: 0.5, opacityTo: 0.05 },
  },
  stroke: { curve: 'smooth', width: 2 },
  tooltip: { y: { formatter: (v) => (v != null ? `R$ ${Number(v).toFixed(2)}` : '') } },
  dataLabels: { enabled: false },
}))
</script>
