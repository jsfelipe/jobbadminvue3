<template>
  <div>
    <h3 class="mb-3 text-base font-semibold text-gray-800 dark:text-white">{{ widget?.nome }}</h3>
    <div class="min-h-[250px]">
      <VueApexCharts v-if="pieSeries.length" type="pie" height="250" :options="chartOptions" :series="pieSeries" />
      <p v-else class="py-8 text-center text-sm text-gray-500">Carregando...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/services/http'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps<{ widget: { nome?: string; linkData?: string; [key: string]: unknown } }>()

const orcamentos = ref<{ name?: string; y?: number }[]>([])

async function getData() {
  if (!props.widget?.linkData) return
  try {
    const r = await api.get(props.widget.linkData)
    const data = r.data?.data ?? []
    orcamentos.value = Array.isArray(data)
      ? data.map((d) => ({ name: d.name ?? d.label, y: parseInt(String(d.y ?? d.value ?? 0), 10) }))
      : []
  } catch {
    orcamentos.value = []
  }
}

const pieSeries = computed(() => orcamentos.value.map((d) => d.y ?? 0))

const chartOptions = computed(() => ({
  chart: { type: 'pie', fontFamily: 'Outfit, sans-serif' },
  labels: orcamentos.value.map((d) => d.name),
  legend: { position: 'bottom' },
  tooltip: { y: { formatter: (v) => `${v}%` } },
}))

onMounted(getData)
watch(() => props.widget?.linkData, getData)
</script>
