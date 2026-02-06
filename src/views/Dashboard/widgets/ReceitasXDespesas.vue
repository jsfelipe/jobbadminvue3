<template>
  <div :class="topLocation ? 'mt-3' : ''">
    <h3 v-if="!topLocation" class="mb-3 text-base font-semibold text-gray-800 dark:text-white">{{ widget?.nome }}</h3>
    <div class="min-h-[250px]">
      <VueApexCharts
        v-if="series.length"
        type="area"
        height="250"
        :options="chartOptions"
        :series="series"
      />
      <p v-else class="py-8 text-center text-sm text-gray-500">Carregando...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import VueApexCharts from 'vue3-apexcharts'

const props = withDefaults(
  defineProps<{
    widget: { nome?: string; [key: string]: unknown }
    topLocation?: boolean
  }>(),
  { topLocation: false }
)

const store = useStore()

const chartLabels = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

const dataReceitas = computed(() => {
  const receitas = store.state.Dashboard?.receitas ?? {}
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1
    const v = receitas[mes]
    return v != null ? parseFloat(String(v)) : 0
  })
})

const dataDespesas = computed(() => {
  const despesas = store.state.Dashboard?.despesas ?? {}
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1
    const v = despesas[mes]
    return v != null ? parseFloat(String(v)) : 0
  })
})

const series = computed(() => [
  { name: 'Receitas', data: dataReceitas.value },
  { name: 'Despesas', data: dataDespesas.value },
])

const chartOptions = computed(() => {
  const isTop = props.topLocation
  return {
    chart: {
      type: 'area',
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    title: { text: undefined },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: isTop ? '#64748b' : undefined,
      },
    },
    xaxis: {
      categories: chartLabels,
      labels: {
        style: {
          colors: isTop ? '#64748b' : undefined,
          fontSize: '11px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: isTop ? '#64748b' : undefined,
          fontSize: '11px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      borderColor: isTop ? '#e2e8f0' : undefined,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    colors: ['#465FFF', '#ef4444'],
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.4, opacityTo: 0.06 },
    },
    stroke: { curve: 'smooth', width: 2 },
    tooltip: { shared: true },
    dataLabels: { enabled: false },
  }
})

watch(
  () => props.widget,
  () => {},
  { immediate: true }
)
</script>
