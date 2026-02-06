<template>
  <div :class="topLocation ? 'mt-3' : ''">
    <h3 v-if="!topLocation" class="mb-3 text-base font-semibold text-gray-800 dark:text-white">{{ widget?.nome }}</h3>
    <div class="min-h-[250px]">
      <VueApexCharts v-if="chartData.length" type="bar" height="250" :options="chartOptions" :series="[{ name: 'Venda do mês', data: chartData }]" />
      <p v-else class="py-8 text-center text-sm text-gray-500">Carregando...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/services/http'
import VueApexCharts from 'vue3-apexcharts'

const props = withDefaults(
  defineProps<{ widget: { nome?: string; linkData?: string; [key: string]: unknown }; topLocation?: boolean }>(),
  { topLocation: false }
)

const chartData = ref<number[]>([])
const chartLabels = ref<string[]>([])

async function getData() {
  if (!props.widget?.linkData) return
  try {
    const r = await api.get(props.widget.linkData)
    const data = r.data?.data ?? []
    chartData.value = Array.isArray(data) ? data.map((d) => parseFloat(String(d.y ?? d.value ?? 0))) : []
    chartLabels.value = Array.isArray(data) ? data.map((d) => String(d.name ?? d.x ?? '')) : []
  } catch {
    chartData.value = []
    chartLabels.value = []
  }
}

onMounted(getData)
watch(() => props.widget?.linkData, getData)

const chartOptions = computed(() => ({
  chart: { fontFamily: 'Outfit, sans-serif', toolbar: { show: false } },
  title: { text: undefined },
  xaxis: {
    categories: chartLabels.value,
    labels: { style: { colors: props.topLocation ? '#ffffff' : undefined } },
  },
  yaxis: { labels: { style: { colors: props.topLocation ? '#ffffff' : undefined } } },
  grid: { borderColor: props.topLocation ? 'rgba(255,255,255,0.2)' : undefined },
  colors: ['#4caf50'],
  plotOptions: { bar: { borderRadius: 4 } },
  dataLabels: { enabled: false },
}))
</script>
