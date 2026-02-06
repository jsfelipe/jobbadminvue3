<template>
  <div>
    <h3 v-if="showTitle" class="mb-3 text-base font-semibold text-gray-800 dark:text-white">{{ widget?.nome ?? 'Fluxo de caixa' }}</h3>
    <div class="min-h-[280px]">
      <VueApexCharts v-if="series.length > 0" type="line" height="280" :options="chartOptions" :series="series" />
      <p v-else class="py-8 text-center text-sm text-gray-500">Carregando...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { apiV2 } from '@/services/http'
import VueApexCharts from 'vue3-apexcharts'

export interface FluxoGraficoParams {
  periodo1?: string
  periodo2?: string
  saldo_especifico?: number | string
  datas_sem_movimentacao?: boolean | string
  transferencia?: string
  contabilizar_emaberto?: boolean | string
  exibetransferencia?: boolean | string
  idContaBancaria?: string[] | number[]
  num_jobb?: string
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    widget?: { nome?: string; linkData?: string; [key: string]: unknown }
    /** Se false, não exibe o título (ex.: quando usado na página Fluxo de Caixa) */
    showTitle?: boolean
  }>(),
  { widget: () => ({}), showTitle: true }
)

const dataDias = ref<string[]>([])
const dataOptions = ref({
  /** Soma de receitas (realizada + prevista) por dia */
  totalReceitas: [] as number[],
  /** Soma de despesas (realizada + prevista) em valor absoluto por dia */
  totalDespesas: [] as number[],
  /** Saldo acumulado por dia (linha) */
  saldoPrevisto: [] as number[],
})

function parseNum(s: string | number): number {
  if (typeof s === 'number') return s
  if (s === '-' || !s) return 0
  return parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0
}

/** Formata valor monetário para exibição (R$ 1.234,56) */
function formatValor(value: number): string {
  return (value ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Formata data para exibição no gráfico: dd/mm (sem ano) */
function formatDateShort(value: string): string {
  if (!value) return ''
  const parts = value.includes('-') ? value.split('-') : value.split('/')
  if (parts.length >= 2) {
    const [a, b] = value.includes('-') ? [parts[2], parts[1]] : [parts[0], parts[1]]
    const day = a.padStart(2, '0')
    const month = b.padStart(2, '0')
    return `${day}/${month}`
  }
  return value
}

function defaultParams(): FluxoGraficoParams {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    periodo1: first.toLocaleDateString('pt-BR'),
    periodo2: last.toLocaleDateString('pt-BR'),
    saldo_especifico: 0,
    datas_sem_movimentacao: false,
    transferencia: 'N',
    contabilizar_emaberto: true,
    exibetransferencia: false,
  }
}

async function getData(params?: FluxoGraficoParams | null) {
  const p = params ?? defaultParams()
  try {
    const r = await apiV2.get('reports-financial/cash-flow/agrupado', { params: p })
    const dataCashFlow = r.data?.dataCashFlow?.data ?? {}
    const dias = Object.keys(dataCashFlow).sort()
    dataDias.value = dias
    const receitaRealizada = dias.map((d) => parseNum((dataCashFlow[d] as { recebimentoPago?: string })?.recebimentoPago))
    const receitaPrevista = dias.map((d) => parseNum((dataCashFlow[d] as { recebimentoPrevisto?: string })?.recebimentoPrevisto))
    const despesaRealizada = dias.map((d) => Math.abs(parseNum((dataCashFlow[d] as { pagamentoPago?: string })?.pagamentoPago)))
    const despesaPrevista = dias.map((d) => Math.abs(parseNum((dataCashFlow[d] as { pagamentoPrevisto?: string })?.pagamentoPrevisto)))
    const saldoPrevisto = dias.map((d) => parseNum((dataCashFlow[d] as { saldoAtual?: string })?.saldoAtual))
    dataOptions.value = {
      totalReceitas: receitaRealizada.map((r, i) => r + (receitaPrevista[i] ?? 0)),
      totalDespesas: despesaRealizada.map((d, i) => d + (despesaPrevista[i] ?? 0)),
      saldoPrevisto,
    }
  } catch {
    dataDias.value = []
    dataOptions.value = { totalReceitas: [], totalDespesas: [], saldoPrevisto: [] }
  }
}

const series = computed(() => [
  { name: 'Receitas', type: 'column', data: dataOptions.value.totalReceitas },
  { name: 'Despesas', type: 'column', data: dataOptions.value.totalDespesas },
  { name: 'Saldo', type: 'line', data: dataOptions.value.saldoPrevisto },
])

const categoriesFormatadas = computed(() => dataDias.value.map(formatDateShort))

const chartOptions = computed(() => ({
  chart: { fontFamily: 'Outfit, sans-serif', toolbar: { show: false } },
  stroke: { width: [0, 0, 3], curve: 'smooth' },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
    },
  },
  xaxis: { categories: categoriesFormatadas.value },
  yaxis: {
    labels: {
      formatter: (val: number) => `R$ ${formatValor(val)}`,
    },
  },
  tooltip: {
    y: {
      formatter: (val: number) => `R$ ${formatValor(val)}`,
    },
  },
  legend: { position: 'top' },
  colors: ['#2563eb', '#dc2626', '#16a34a'],
  dataLabels: { enabled: false },
}))

onMounted(() => getData())
watch(() => props.widget, () => getData(), { deep: true })

defineExpose({ getData })
</script>
