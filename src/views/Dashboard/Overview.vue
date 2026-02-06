<template>
  <admin-layout>
    <div class="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="stats in statsCards"
          :key="stats.title"
          class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
        >
          <div class="flex items-center">
            <div
              :class="[
                'flex h-12 w-12 items-center justify-center rounded-lg',
                {
                  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400':
                    stats.type === 'warning',
                  'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400':
                    stats.type === 'success',
                  'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400':
                    stats.type === 'info',
                },
              ]"
            >
              <i :class="stats.icon" class="text-xl"></i>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ stats.title }}
              </p>
              <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.value || '—' }}
              </p>
            </div>
          </div>
          <div class="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <i :class="stats.footerIcon" class="mr-1"></i>
            {{ stats.footerText }}
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="space-y-6">
        <!-- Valor Mensal de faturamento -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Valor Mensal de faturamento
          </h4>
          <div class="h-[400px] w-full">
            <VueApexCharts
              v-if="!loading && vendasData.length > 0"
              type="area"
              height="400"
              :options="chartOptionsVendas"
              :series="chartSeriesVendas"
            />
            <div
              v-else
              class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400"
            >
              Carregando...
            </div>
          </div>
        </div>

        <!-- Leads por Mês -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Leads por Mês
          </h4>
          <div class="h-[400px] w-full">
            <VueApexCharts
              v-if="!loadingLeads && leadsData.length > 0"
              type="area"
              height="400"
              :options="chartOptionsLeads"
              :series="chartSeriesLeads"
            />
            <div
              v-else
              class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400"
            >
              Carregando...
            </div>
          </div>
        </div>

        <!-- Entradas de Setup -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Entradas de Setup
          </h4>
          <div class="h-[400px] w-full">
            <VueApexCharts
              v-if="!loadingsetup && setupData.length > 0"
              type="area"
              height="400"
              :options="chartOptionsSetup"
              :series="chartSeriesSetup"
            />
            <div
              v-else
              class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400"
            >
              Carregando...
            </div>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import VueApexCharts from 'vue3-apexcharts'
import { dashboardAdmin } from '@/services/dashboard-admin'

const loading = ref(true)
const loadingLeads = ref(true)
const loadingsetup = ref(true)

const statsCards = ref([
  {
    type: 'warning',
    icon: 'ti-server',
    title: 'QTD de Clientes',
    value: '',
    footerText: 'Updated now',
    footerIcon: 'ti-reload',
  },
  {
    type: 'success',
    icon: 'ti-pulse',
    title: 'Total Mês Atual',
    value: '',
    footerText: 'Updated now',
    footerIcon: 'ti-reload',
  },
  {
    type: 'info',
    icon: 'ti-user',
    title: 'QTD de Leads Mês Atual',
    value: '',
    footerText: 'Updated now',
    footerIcon: 'ti-reload',
  },
])

const vendasData = ref([])
const leadsData = ref([])
const setupData = ref([])

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const chartOptionsVendas = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {},
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
    },
  },
  colors: ['#10b981'],
  tooltip: {
    theme: 'dark',
  },
}))

const chartSeriesVendas = computed(() => [
  {
    name: 'Vendas',
    data: vendasData.value,
  },
])

const chartOptionsLeads = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {},
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
    },
  },
  colors: ['#3b82f6'],
  tooltip: {
    theme: 'dark',
  },
}))

const chartSeriesLeads = computed(() => [
  {
    name: 'Leads',
    data: leadsData.value,
  },
])

const chartOptionsSetup = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {},
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
    },
  },
  colors: ['#10b981'],
  tooltip: {
    theme: 'dark',
  },
}))

const chartSeriesSetup = computed(() => [
  {
    name: 'Setup',
    data: setupData.value,
  },
])

const graficoVendasAnual = async () => {
  try {
    const resposta = await dashboardAdmin.graficoVendasMes()
    // Tenta diferentes estruturas de resposta
    // O backend pode retornar diretamente um array ou dentro de data
    const dados = Array.isArray(resposta.data) 
      ? resposta.data 
      : (resposta.data?.data || resposta.data || [])
    
    // Garante que seja um array com 12 elementos (um para cada mês)
    const mesesComDados = Array(12).fill(0)
    dados.forEach((valor, index) => {
      if (index < 12) {
        mesesComDados[index] = parseFloat(valor) || 0
      }
    })
    
    vendasData.value = mesesComDados
    loading.value = false
  } catch (error) {
    // Backend tem bug quando não há vendas (Undefined variable: valores)
    // Trata silenciosamente e inicializa com zeros
    vendasData.value = Array(12).fill(0)
    loading.value = false
  }
}

const graficoLeadsPorMes = async () => {
  try {
    const resposta = await dashboardAdmin.graficoLeadsPorMes()
    // Tenta diferentes estruturas de resposta
    const dados = Array.isArray(resposta.data) 
      ? resposta.data 
      : (resposta.data?.data || resposta.data || [])
    
    // Garante que seja um array com 12 elementos (um para cada mês)
    const mesesComDados = Array(12).fill(0)
    dados.forEach((valor, index) => {
      if (index < 12) {
        mesesComDados[index] = parseFloat(valor) || 0
      }
    })
    
    leadsData.value = mesesComDados
    loadingLeads.value = false
  } catch (error) {
    console.error('Erro ao carregar gráfico de leads:', error)
    leadsData.value = Array(12).fill(0)
    loadingLeads.value = false
  }
}

const dadosSetup = async () => {
  try {
    const resposta = await dashboardAdmin.setupAnual()
    // Tenta diferentes estruturas de resposta
    const dados = Array.isArray(resposta.data) 
      ? resposta.data 
      : (resposta.data?.data || resposta.data || [])
    
    // Garante que seja um array com 12 elementos (um para cada mês)
    const mesesComDados = Array(12).fill(0)
    dados.forEach((valor, index) => {
      if (index < 12) {
        mesesComDados[index] = parseFloat(valor) || 0
      }
    })
    
    setupData.value = mesesComDados
    loadingsetup.value = false
  } catch (error) {
    console.error('Erro ao carregar dados de setup:', error)
    setupData.value = Array(12).fill(0)
    loadingsetup.value = false
  }
}

onMounted(async () => {
  // Carrega os gráficos em paralelo, mas trata erros individualmente
  // O gráfico de vendas pode falhar devido a bug no backend, então não bloqueia os outros
  Promise.allSettled([
    graficoVendasAnual(),
    graficoLeadsPorMes(),
    dadosSetup(),
  ])

  try {
    const qtdClientesRes = await dashboardAdmin.qtdclientes()
    statsCards.value[0].value = qtdClientesRes.data?.data || qtdClientesRes.data || 0
  } catch (error) {
    console.error('Erro ao carregar quantidade de clientes:', error)
    statsCards.value[0].value = 0
  }

  try {
    const vendasRes = await dashboardAdmin.amountVendasMes()
    const result = vendasRes.data?.data || vendasRes.data || []
    if (Array.isArray(result)) {
      const totalMes = result.reduce((soma, item) => {
        return soma + parseFloat(item.amount || 0)
      }, 0)
      statsCards.value[1].value = 'R$ ' + totalMes.toFixed(2).replace('.', ',')
    } else {
      statsCards.value[1].value = 'R$ 0,00'
    }
  } catch (error) {
    console.error('Erro ao carregar vendas do mês:', error)
    statsCards.value[1].value = 'R$ 0,00'
  }

  try {
    const leadsRes = await dashboardAdmin.qtdLeadsMesAtual()
    statsCards.value[2].value = leadsRes.data?.data || leadsRes.data || 0
  } catch (error) {
    console.error('Erro ao carregar quantidade de leads:', error)
    statsCards.value[2].value = 0
  }
})
</script>

