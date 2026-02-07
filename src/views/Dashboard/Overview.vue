<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <!-- Stats cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="stats in displayedStatsCards"
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
            {{ stats.title === 'Vendas Mês Atual' && !isPerfil1 ? 'Primeiros pgts do cliente no mês' : stats.footerText }}
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="space-y-6">
        <!-- Valor Mensal de faturamento (apenas perfil 1) -->
        <div v-if="isPerfil1" class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
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

        <!-- Leads por Mês e Vendas por mês lado a lado -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

          <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Vendas por mês (Setup + primeira mensalidade)
            </h4>
            <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
              
              <span v-if="!isPerfil1" class="block mt-1 font-medium"></span>
            </p>
            <div class="h-[400px] w-full">
              <VueApexCharts
                v-if="!loadingPrimeiras && primeirasData.length > 0"
                type="area"
                height="400"
                :options="chartOptionsPrimeiras"
                :series="chartSeriesPrimeiras"
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

        <!-- Crescimento da base -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Crescimento da base
          </h4>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Total acumulado de clientes ao fim de cada mês (ano atual).
          </p>
          <div class="h-[300px] w-full">
            <VueApexCharts
              v-if="crescimentoBaseData.length > 0"
              type="area"
              height="300"
              :options="chartOptionsCrescimento"
              :series="chartSeriesCrescimento"
            />
            <div v-else class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
              Carregando...
            </div>
          </div>
        </div>

        <!-- Top clientes por acesso -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Top clientes por acesso
          </h4>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Maior número de acessos no último ano. Máx. 15.
          </p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nome</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Acessos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-if="loadingTopAcesso" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="3" class="px-4 py-6">Carregando...</td>
                </tr>
                <tr v-else-if="!topClientesAcesso.length" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="3" class="px-4 py-6">Nenhum dado.</td>
                </tr>
                <tr
                  v-else
                  v-for="(row, idx) in topClientesAcesso"
                  :key="idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{{ idx + 1 }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ row.nome || '—' }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.total_acessos ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Clientes em risco de abandono (5 a 10 dias sem acesso) -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Clientes em risco de abandono
          </h4>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Sem acesso entre 5 e 10 dias. Máx. 30.
          </p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nome</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Último acesso</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Responsável</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-if="loadingRisco" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="3" class="px-4 py-6">Carregando...</td>
                </tr>
                <tr v-else-if="!clientesRiscoAbandono.length" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="3" class="px-4 py-6">Nenhum cliente em risco no período.</td>
                </tr>
                <tr
                  v-else
                  v-for="(row, idx) in clientesRiscoAbandono"
                  :key="idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ row.nome || '—' }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.ultimo_acesso) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.responsavel || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Clientes sem uso do sistema -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Clientes sem uso do sistema
          </h4>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Clientes sem acesso nos últimos 10 dias. Ordenado por vencimento (decrescente). Máx. 30.
          </p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nome</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Qtd usuários</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Vencimento</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Último acesso</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Responsável</th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-if="loadingSemUso" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="6" class="px-4 py-6">Carregando...</td>
                </tr>
                <tr v-else-if="!clientesSemUso.length" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="6" class="px-4 py-6">Nenhum cliente sem uso no período.</td>
                </tr>
                <tr
                  v-else
                  v-for="(row, idx) in clientesSemUso"
                  :key="idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ row.nome || '—' }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.qtd_usuarios ?? '—' }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.vencimento) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.ultimo_acesso) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.responsavel || '—' }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-right">
                    <a
                      v-if="whatsappUrl(row.telefone)"
                      :href="whatsappUrl(row.telefone)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center rounded p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                      title="Enviar mensagem no WhatsApp para o cliente"
                    >
                      <i class="fab fa-whatsapp text-xl" aria-hidden="true"></i>
                    </a>
                    <span v-else class="text-gray-400 dark:text-gray-500" title="Telefone não cadastrado ou inválido">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import VueApexCharts from 'vue3-apexcharts'
import { dashboardAdmin, clearDashboardCache } from '@/services/dashboard-admin'
import { ElMessage } from 'element-plus'

const store = useStore()
const isPerfil1 = computed(() => {
  const data = store.state.Login?.data
  const id = data?.id_perfil ?? data?.id_usuario_tipo
  return id == 1 || id === '1'
})

const displayedStatsCards = computed(() => {
  let list = statsCards.value
  if (!isPerfil1.value) {
    list = list.filter((s) => s.title !== 'Total Mês Atual' && s.title !== 'Ticket médio')
  }
  return list
})

const loading = ref(true)
const loadingLeads = ref(true)
const loadingsetup = ref(true)
const loadingPrimeiras = ref(true)
const refreshing = ref(false)

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
    type: 'info',
    icon: 'ti-target',
    title: 'Clientes Ativos',
    value: '',
    footerText: 'Com pelo menos 1 acesso (últimos 2 meses)',
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
    footerText: 'Total de clientes cadastrados no mês',
    footerIcon: 'ti-reload',
  },
  {
    type: 'success',
    icon: 'ti-wallet',
    title: 'Vendas Mês Atual',
    value: '',
    footerText: 'Primeiras transações (setup + 1ª mensalidade)',
    footerIcon: 'ti-reload',
  },
  {
    type: 'info',
    icon: 'ti-currency-dollar',
    title: 'Ticket médio',
    value: '',
    footerText: 'Média valor/dia (Período Plano). Apenas perfil 1.',
    footerIcon: 'ti-reload',
  },
  {
    type: 'warning',
    icon: 'ti-user-off',
    title: 'Churn',
    value: '',
    footerText: 'Mais de 60 dias sem pagar',
    footerIcon: 'ti-reload',
  },
])

const vendasData = ref([])
const leadsData = ref([])
const setupData = ref([])
const primeirasData = ref([])
const clientesSemUso = ref([])
const loadingSemUso = ref(true)
const crescimentoBaseData = ref([])
const topClientesAcesso = ref([])
const loadingTopAcesso = ref(true)
const clientesRiscoAbandono = ref([])
const loadingRisco = ref(true)

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const formatBr = (val) => 'R$ ' + (Number(val) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (d) => {
  if (!d) return '—'
  const [y, m, day] = String(d).split(/[-T]/)
  if (!y || !m || !day) return d
  return `${day}/${m}/${y}`
}

const MSG_WHATSAPP_SEM_USO = 'Olá! Notamos que faz um tempo que você não acessa o Jobb. Está tudo bem? Precisa de algum suporte ou tem alguma dúvida? Estamos à disposição!'
/** Normaliza telefone para wa.me: só dígitos; se já começar com 55, mantém; senão se 10 ou 11 dígitos (DDD+numero BR), adiciona 55. Retorna null se inválido. */
const normalizarTelefoneWhatsApp = (telefone) => {
  if (!telefone) return null
  const num = String(telefone).replace(/\D/g, '')
  if (num.length < 10) return null
  const full = num.startsWith('55') ? num : (num.length <= 11 ? '55' + num : num)
  return full
}
const whatsappUrl = (telefone) => {
  const full = normalizarTelefoneWhatsApp(telefone)
  if (!full) return null
  return `https://wa.me/${full}?text=${encodeURIComponent(MSG_WHATSAPP_SEM_USO)}`
}

const chartOptionsVendas = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {
    labels: {
      formatter: (val) => formatBr(val),
    },
  },
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
    y: {
      formatter: (val) => formatBr(val),
    },
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

const chartOptionsPrimeiras = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {
    labels: {
      formatter: (val) => formatBr(val),
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
    },
  },
  colors: ['#8b5cf6'],
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => formatBr(val),
    },
  },
}))

const chartSeriesPrimeiras = computed(() => [
  {
    name: 'Primeiras transações',
    data: primeirasData.value,
  },
])

const chartOptionsCrescimento = computed(() => ({
  chart: { type: 'area', height: 300, toolbar: { show: false } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {},
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 90, 100] },
  },
  colors: ['#0ea5e9'],
  tooltip: { theme: 'dark' },
}))
const chartSeriesCrescimento = computed(() => [
  { name: 'Total clientes (acum.)', data: crescimentoBaseData.value },
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

const dadosPrimeirasTransacoes = async () => {
  try {
    const resposta = await dashboardAdmin.primeirasTransacoesAnual()
    const dados = Array.isArray(resposta.data)
      ? resposta.data
      : (resposta.data?.data || resposta.data || [])
    const mesesComDados = Array(12).fill(0)
    dados.forEach((valor, index) => {
      if (index < 12) {
        mesesComDados[index] = parseFloat(valor) || 0
      }
    })
    primeirasData.value = mesesComDados
  } catch (error) {
    console.error('Erro ao carregar primeiras transações:', error)
    primeirasData.value = Array(12).fill(0)
  } finally {
    loadingPrimeiras.value = false
  }
}

async function carregarDashboard() {
  if (store.state.Login?.token && !store.state.Login?.data) {
    try {
      await store.dispatch('Login/me')
    } catch (_) {}
  }

  loading.value = true
  loadingLeads.value = true
  loadingsetup.value = true
  loadingPrimeiras.value = true
  loadingSemUso.value = true
  loadingTopAcesso.value = true
  loadingRisco.value = true

  const promises = [graficoLeadsPorMes(), dadosSetup(), dadosPrimeirasTransacoes()]
  if (isPerfil1.value) promises.unshift(graficoVendasAnual())
  await Promise.allSettled(promises)

  try {
    const res = await dashboardAdmin.clientesSemUso()
    const list = res.data?.data ?? res.data ?? []
    clientesSemUso.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Erro ao carregar clientes sem uso:', err)
    clientesSemUso.value = []
  } finally {
    loadingSemUso.value = false
  }

  try {
    const res = await dashboardAdmin.crescimentoBase()
    const list = res.data?.data ?? res.data ?? []
    crescimentoBaseData.value = Array.isArray(list) && list.length >= 12 ? list.slice(0, 12) : Array(12).fill(0)
  } catch (err) {
    console.error('Erro ao carregar crescimento da base:', err)
    crescimentoBaseData.value = Array(12).fill(0)
  }

  try {
    const res = await dashboardAdmin.topClientesAcesso()
    const list = res.data?.data ?? res.data ?? []
    topClientesAcesso.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Erro ao carregar top clientes acesso:', err)
    topClientesAcesso.value = []
  } finally {
    loadingTopAcesso.value = false
  }

  try {
    const res = await dashboardAdmin.clientesRiscoAbandono()
    const list = res.data?.data ?? res.data ?? []
    clientesRiscoAbandono.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Erro ao carregar clientes em risco:', err)
    clientesRiscoAbandono.value = []
  } finally {
    loadingRisco.value = false
  }

  if (isPerfil1.value) {
    try {
      const res = await dashboardAdmin.ticketMedio()
      const val = res.data?.data ?? res.data
      statsCards.value[5].value = val != null ? 'R$ ' + Number(val).toFixed(2).replace('.', ',') + '/dia' : '—'
    } catch (err) {
      statsCards.value[5].value = '—'
    }
  }

  try {
    const res = await dashboardAdmin.churn()
    statsCards.value[6].value = res.data?.data ?? res.data ?? 0
  } catch (err) {
    console.error('Erro ao carregar churn:', err)
    statsCards.value[6].value = 0
  }

  try {
    const qtdClientesRes = await dashboardAdmin.qtdclientes()
    statsCards.value[0].value = qtdClientesRes.data?.data || qtdClientesRes.data || 0
  } catch (error) {
    console.error('Erro ao carregar quantidade de clientes:', error)
    statsCards.value[0].value = 0
  }

  try {
    const ativosRes = await dashboardAdmin.qtdClientesAtivos()
    statsCards.value[1].value = ativosRes.data?.data ?? ativosRes.data ?? 0
  } catch (error) {
    console.error('Erro ao carregar clientes ativos:', error)
    statsCards.value[1].value = 0
  }

  if (isPerfil1.value) {
    try {
      const vendasRes = await dashboardAdmin.amountVendasMes()
      const result = vendasRes.data?.data || vendasRes.data || []
      if (Array.isArray(result)) {
        const totalMes = result.reduce((soma, item) => soma + parseFloat(item.amount || 0), 0)
        statsCards.value[2].value = 'R$ ' + totalMes.toFixed(2).replace('.', ',')
      } else {
        statsCards.value[2].value = 'R$ 0,00'
      }
    } catch (error) {
      console.error('Erro ao carregar vendas do mês:', error)
      statsCards.value[2].value = 'R$ 0,00'
    }
  }

  try {
    const leadsRes = await dashboardAdmin.qtdLeadsMesAtual()
    statsCards.value[3].value = leadsRes.data?.data || leadsRes.data || 0
  } catch (error) {
    console.error('Erro ao carregar quantidade de leads:', error)
    statsCards.value[3].value = 0
  }

  try {
    const vendasMesRes = await dashboardAdmin.primeirasTransacoesMesAtual()
    const total = Number(vendasMesRes.data?.data ?? vendasMesRes.data ?? 0)
    statsCards.value[4].value = 'R$ ' + total.toFixed(2).replace('.', ',')
  } catch (error) {
    console.error('Erro ao carregar vendas mês atual (primeiras):', error)
    statsCards.value[4].value = 'R$ 0,00'
  }
}

async function limparCacheERecarregar() {
  refreshing.value = true
  clearDashboardCache()
  try {
    await carregarDashboard()
    ElMessage.success('Cache limpo e dados atualizados')
  } finally {
    refreshing.value = false
  }
}

function onDashboardRefresh() {
  limparCacheERecarregar()
}

onMounted(() => {
  carregarDashboard()
  window.addEventListener('dashboard-refresh', onDashboardRefresh)
})
onUnmounted(() => {
  window.removeEventListener('dashboard-refresh', onDashboardRefresh)
})
</script>

<style scoped>
:deep(.apexcharts-tooltip) {
  color: #fff !important;
}
:deep(.apexcharts-tooltip span),
:deep(.apexcharts-tooltip .apexcharts-tooltip-title) {
  color: #fff !important;
}
</style>
