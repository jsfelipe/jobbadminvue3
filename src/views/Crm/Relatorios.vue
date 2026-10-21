<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">CRM - Relatórios</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Atendimentos, desfechos e leads no período selecionado.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <router-link
            to="/admin/crm"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600 dark:text-gray-200"
          >
            Voltar ao CRM
          </router-link>
          <button
            type="button"
            class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="carregando"
            @click="carregar"
          >
            {{ carregando ? 'Atualizando...' : 'Atualizar' }}
          </button>
        </div>
      </div>

      <p
        v-if="erro"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ erro }}
      </p>

      <div class="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-500">Período</label>
          <select
            v-model="preset"
            class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            @change="onPreset"
          >
            <option value="hoje">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-500">De</label>
          <input
            v-model="dataInicio"
            type="date"
            class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            :disabled="preset !== 'custom'"
            @change="onFiltro"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-500">Até</label>
          <input
            v-model="dataFim"
            type="date"
            class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            :disabled="preset !== 'custom'"
            @change="onFiltro"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-500">Fila</label>
          <select
            v-model="tipoFila"
            class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            @change="onFiltro"
          >
            <option value="">Todas</option>
            <option v-for="t in TIPOS_FILA" :key="t" :value="t">{{ FILA_LABEL[t] }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <CrmCounterCard label="Atendimentos" :value="relatorio?.kpis.atendimentos ?? 0" value-class="text-blue-600" />
        <CrmCounterCard label="Clientes únicos" :value="relatorio?.kpis.clientes_unicos ?? 0" />
        <CrmCounterCard label="Resolvidos" :value="relatorio?.kpis.resolvidos ?? 0" value-class="text-emerald-600" />
        <CrmCounterCard label="Encerrados" :value="relatorio?.kpis.encerrados ?? 0" value-class="text-gray-600" />
        <CrmCounterCard label="Leads" :value="relatorio?.kpis.leads ?? 0" value-class="text-violet-600" />
        <CrmCounterCard
          label="Taxa de desfecho"
          :value="`${relatorio?.kpis.taxa_desfecho ?? 0}%`"
          sub-label="resolvidos / (resolvidos + encerrados)"
          :progress="relatorio?.kpis.taxa_desfecho ?? 0"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Atendimentos por dia</h3>
          <VueApexCharts v-if="temSerie" type="area" height="280" :options="optSerie" :series="seriesDiaria" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Funil por fila</h3>
          <VueApexCharts v-if="temFunil" type="bar" height="280" :options="optFunil" :series="seriesFunil" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Por fila</h3>
          <VueApexCharts v-if="temFila" type="donut" height="280" :options="optFila" :series="seriesFila" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Resultado do contato</h3>
          <VueApexCharts v-if="temStatus" type="donut" height="280" :options="optStatus" :series="seriesStatus" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Motivos de encerramento</h3>
          <VueApexCharts v-if="temMotivo" type="donut" height="280" :options="optMotivo" :series="seriesMotivo" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Nenhum encerramento no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Estoque atual de casos</h3>
          <VueApexCharts type="bar" height="280" :options="optEstoque" :series="seriesEstoque" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Resumo das anotações</h3>
          <p v-if="relatorio?.analise_texto.resumo" class="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {{ relatorio.analise_texto.resumo }}
          </p>
          <p v-else-if="relatorio && !relatorio.analise_texto.ia_disponivel" class="text-sm text-gray-500">
            Resumo por IA indisponível. Configure GEMINI_API_KEY no .env da API.
          </p>
          <p v-else class="text-sm text-gray-500">Sem anotações suficientes no período para o resumo.</p>
          <h4 class="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Termos mais usados</h4>
          <div v-if="(relatorio?.analise_texto.termos.length ?? 0) > 0" class="flex flex-wrap gap-2">
            <span
              v-for="t in relatorio?.analise_texto.termos ?? []"
              :key="t.termo"
              class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            >
              {{ t.termo }}
              <span class="text-gray-400">{{ t.total }}</span>
            </span>
          </div>
          <p v-else class="text-sm text-gray-500">Nenhum termo relevante.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">O que aparece nas anotações</h3>
          <VueApexCharts v-if="temCategorias" type="bar" height="280" :options="optCategorias" :series="seriesCategorias" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Nenhuma categoria identificada.</p>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Casos com mais tentativas (abertos)</h3>
        <p v-if="(relatorio?.casos_mais_tentativas.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">
          Nenhum caso aberto com tentativas.
        </p>
        <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
              <th>Cliente</th>
              <th>Fila</th>
              <th>Status</th>
              <th class="text-right">Tentativas</th>
              <th>Prazo</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in relatorio?.casos_mais_tentativas ?? []"
              :key="c.id"
              class="border-t border-gray-100 dark:border-gray-700"
            >
              <td class="font-medium">
                {{ c.nome_cliente || `#${c.id_cliente}` }}
                <span v-if="c.dominio" class="block text-xs font-normal text-gray-500">{{ c.dominio }}</span>
                <span
                  v-if="c.sem_retorno"
                  class="mt-1 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/40 dark:text-orange-100"
                >
                  Sem retorno
                </span>
              </td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="filaBadgeClass(c.tipo_fila)">
                  {{ FILA_LABEL[c.tipo_fila] }}
                </span>
              </td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusBadgeClass(c.status)">
                  {{ statusLabel(c.status, c.tipo_fila) }}
                </span>
              </td>
              <td class="text-right font-semibold">{{ c.tentativas }}</td>
              <td class="whitespace-nowrap text-xs text-gray-600">{{ formatDate(c.prazo_retorno) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            Últimos atendimentos ({{ relatorio?.atendimentos.total ?? 0 }})
          </h3>
          <div class="flex gap-2 text-xs">
            <button
              type="button"
              class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600"
              :disabled="page <= 1 || carregando"
              @click="irPage(page - 1)"
            >
              Anterior
            </button>
            <span class="self-center text-gray-500">{{ page }} / {{ relatorio?.atendimentos.last_page ?? 1 }}</span>
            <button
              type="button"
              class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600"
              :disabled="page >= (relatorio?.atendimentos.last_page ?? 1) || carregando"
              @click="irPage(page + 1)"
            >
              Próxima
            </button>
          </div>
        </div>
        <p v-if="(relatorio?.atendimentos.data.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">
          Nenhum atendimento neste período.
        </p>
        <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
              <th>Quando</th>
              <th>Atendente</th>
              <th>Cliente</th>
              <th>Fila</th>
              <th>Status</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in relatorio?.atendimentos.data ?? []"
              :key="a.id"
              class="border-t border-gray-100 align-top dark:border-gray-700"
            >
              <td class="whitespace-nowrap">{{ formatDateTime(a.created_at) }}</td>
              <td>{{ a.nome_usuario || '—' }}</td>
              <td>
                <span class="font-medium">{{ a.nome_cliente || `#${a.id_cliente}` }}</span>
                <span v-if="a.dominio" class="block text-xs text-gray-500">{{ a.dominio }}</span>
              </td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="filaBadgeClass(a.tipo_fila)">
                  {{ FILA_LABEL[a.tipo_fila] }}
                </span>
              </td>
              <td>
                <span
                  v-if="a.status_novo"
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="statusBadgeClass(a.status_novo)"
                >
                  {{ statusLabel(a.status_novo, a.tipo_fila) }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="max-w-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ a.descricao }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            Casos fechados ({{ relatorio?.casos_fechados.total ?? 0 }})
          </h3>
          <div class="flex gap-2 text-xs">
            <button
              type="button"
              class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600"
              :disabled="pageCasos <= 1 || carregando"
              @click="irPageCasos(pageCasos - 1)"
            >
              Anterior
            </button>
            <span class="self-center text-gray-500">{{ pageCasos }} / {{ relatorio?.casos_fechados.last_page ?? 1 }}</span>
            <button
              type="button"
              class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600"
              :disabled="pageCasos >= (relatorio?.casos_fechados.last_page ?? 1) || carregando"
              @click="irPageCasos(pageCasos + 1)"
            >
              Próxima
            </button>
          </div>
        </div>
        <p v-if="(relatorio?.casos_fechados.data.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">
          Nenhum caso resolvido ou encerrado neste período.
        </p>
        <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
              <th>Fechado em</th>
              <th>Cliente</th>
              <th>Fila</th>
              <th>Status</th>
              <th>Motivo</th>
              <th>Tentativas</th>
              <th>Atendente</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in relatorio?.casos_fechados.data ?? []"
              :key="c.id"
              class="border-t border-gray-100 dark:border-gray-700"
            >
              <td class="whitespace-nowrap">{{ formatDateTime(c.fechado_em) }}</td>
              <td>
                <span class="font-medium">{{ c.nome_cliente || `#${c.id_cliente}` }}</span>
                <span v-if="c.dominio" class="block text-xs text-gray-500">{{ c.dominio }}</span>
              </td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="filaBadgeClass(c.tipo_fila)">
                  {{ FILA_LABEL[c.tipo_fila] }}
                </span>
              </td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusBadgeClass(c.status)">
                  {{ statusLabel(c.status, c.tipo_fila) }}
                </span>
              </td>
              <td class="text-xs text-gray-600">
                {{ c.motivo_encerramento ? MOTIVO_ENCERRAMENTO_LABEL[c.motivo_encerramento] : '-' }}
              </td>
              <td>{{ c.tentativas }}</td>
              <td>{{ c.nome_usuario_ultimo || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ApexOptions } from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { crmService } from '@/services/crm'
import CrmCounterCard from './components/CrmCounterCard.vue'
import {
  CATEGORIA_ANALISE,
  CATEGORIA_ANALISE_LABEL,
  FILA_LABEL,
  MOTIVO_ENCERRAMENTO_LABEL,
  MOTIVOS_ENCERRAMENTO,
  STATUS_CASO,
  STATUS_REGISTRO,
  TIPOS_FILA,
  statusLabel,
  type CrmRelatorio,
  type MotivoEncerramento,
  type StatusCaso,
  type TipoFila,
} from './model/crm.types'
import { filaBadgeClass, formatDate, formatDateTime, statusBadgeClass } from './model/crm.ui'

const hojeIso = () => new Date().toISOString().slice(0, 10)
const diasAtrasIso = (dias: number) => {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

const preset = ref<'hoje' | '7d' | '30d' | 'custom'>('7d')
const dataInicio = ref(diasAtrasIso(6))
const dataFim = ref(hojeIso())
const tipoFila = ref<TipoFila | ''>('')
const page = ref(1)
const pageCasos = ref(1)
const carregando = ref(false)
const erro = ref('')
const relatorio = ref<CrmRelatorio | null>(null)

const statusLabelGeral = (s: StatusCaso): string => {
  if (tipoFila.value) return statusLabel(s, tipoFila.value)
  if (s === 'resolvido') return 'Resolvido'
  return statusLabel(s, 'risco_abandono')
}

const baseChart = (): ApexOptions => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'bottom' },
  grid: { strokeDashArray: 4 },
  noData: { text: 'Sem dados' },
})

const temSerie = computed(() => (relatorio.value?.serie_diaria ?? []).some((d) => d.total > 0))
const seriesDiaria = computed(() => [{ name: 'Atendimentos', data: (relatorio.value?.serie_diaria ?? []).map((d) => d.total) }])
const optSerie = computed<ApexOptions>(() => ({
  ...baseChart(),
  xaxis: {
    categories: (relatorio.value?.serie_diaria ?? []).map((d) => {
      const [y, m, day] = d.data.split('-')
      return `${day}/${m}`
    }),
  },
  colors: ['#2563eb'],
}))

const temFunil = computed(() =>
  TIPOS_FILA.some((t) => (relatorio.value?.funil_por_fila[t]?.atendimentos ?? 0) > 0),
)
const seriesFunil = computed(() => [
  { name: 'Contatos', data: TIPOS_FILA.map((t) => relatorio.value?.funil_por_fila[t]?.atendimentos ?? 0) },
  { name: 'Resolvidos', data: TIPOS_FILA.map((t) => relatorio.value?.funil_por_fila[t]?.resolvidos ?? 0) },
  { name: 'Encerrados', data: TIPOS_FILA.map((t) => relatorio.value?.funil_por_fila[t]?.encerrados ?? 0) },
])
const optFunil = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '55%' } },
  xaxis: { categories: TIPOS_FILA.map((t) => FILA_LABEL[t]) },
  colors: ['#2563eb', '#059669', '#6b7280'],
}))

const temCategorias = computed(() =>
  CATEGORIA_ANALISE.some((k) => (relatorio.value?.analise_texto.categorias[k] ?? 0) > 0),
)
const seriesCategorias = computed(() => [
  { name: 'Ocorrências', data: CATEGORIA_ANALISE.map((k) => relatorio.value?.analise_texto.categorias[k] ?? 0) },
])
const optCategorias = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
  xaxis: { categories: CATEGORIA_ANALISE.map((k) => CATEGORIA_ANALISE_LABEL[k]) },
  colors: ['#7c3aed'],
}))

const temFila = computed(() => Object.values(relatorio.value?.por_fila ?? {}).some((n) => n > 0))
const seriesFila = computed(() => TIPOS_FILA.map((t) => relatorio.value?.por_fila[t] ?? 0))
const optFila = computed<ApexOptions>(() => ({
  ...baseChart(),
  labels: TIPOS_FILA.map((t) => FILA_LABEL[t]),
  colors: ['#d97706', '#dc2626', '#2563eb'],
  dataLabels: { enabled: true },
}))

const temStatus = computed(() => Object.values(relatorio.value?.por_status_novo ?? {}).some((n) => n > 0))
const seriesStatus = computed(() => STATUS_REGISTRO.map((s) => relatorio.value?.por_status_novo[s] ?? 0))
const optStatus = computed<ApexOptions>(() => ({
  ...baseChart(),
  labels: STATUS_REGISTRO.map((s) => statusLabelGeral(s)),
  colors: ['#0284c7', '#7c3aed', '#059669', '#6b7280'],
  dataLabels: { enabled: true },
}))

const temMotivo = computed(() => Object.values(relatorio.value?.por_motivo ?? {}).some((n) => n > 0))
const seriesMotivo = computed(() => MOTIVOS_ENCERRAMENTO.map((m) => relatorio.value?.por_motivo[m] ?? 0))
const optMotivo = computed<ApexOptions>(() => ({
  ...baseChart(),
  labels: MOTIVOS_ENCERRAMENTO.map((m: MotivoEncerramento) => MOTIVO_ENCERRAMENTO_LABEL[m]),
  colors: ['#f59e0b', '#ef4444', '#64748b', '#8b5cf6', '#0ea5e9'],
  dataLabels: { enabled: true },
}))

const seriesEstoque = computed(() =>
  STATUS_CASO.map((s) => ({
    name: statusLabelGeral(s),
    data: TIPOS_FILA.map((t) => relatorio.value?.estoque_casos[t]?.[s] ?? 0),
  })),
)
const optEstoque = computed<ApexOptions>(() => ({
  ...baseChart(),
  chart: { ...baseChart().chart, stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { horizontal: false, borderRadius: 3 } },
  xaxis: { categories: TIPOS_FILA.map((t) => FILA_LABEL[t]) },
  colors: ['#f59e0b', '#0284c7', '#7c3aed', '#059669', '#6b7280'],
}))

const params = () => ({
  data_inicio: dataInicio.value,
  data_fim: dataFim.value,
  tipo_fila: tipoFila.value || undefined,
  page: page.value,
  page_casos: pageCasos.value,
  per_page: 50,
})

const carregar = async () => {
  carregando.value = true
  erro.value = ''
  try {
    relatorio.value = await crmService.relatorio(params())
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string; error?: string }; status?: number } }
    erro.value =
      ax.response?.data?.error ||
      ax.response?.data?.message ||
      `Falha ao carregar relatório (HTTP ${ax.response?.status ?? '?'})`
  } finally {
    carregando.value = false
  }
}

const onPreset = () => {
  if (preset.value === 'hoje') {
    dataInicio.value = hojeIso()
    dataFim.value = hojeIso()
  } else if (preset.value === '7d') {
    dataInicio.value = diasAtrasIso(6)
    dataFim.value = hojeIso()
  } else if (preset.value === '30d') {
    dataInicio.value = diasAtrasIso(29)
    dataFim.value = hojeIso()
  }
  onFiltro()
}

const onFiltro = () => {
  page.value = 1
  pageCasos.value = 1
  void carregar()
}

const irPage = (p: number) => {
  page.value = p
  void carregar()
}

const irPageCasos = (p: number) => {
  pageCasos.value = p
  void carregar()
}

onMounted(() => {
  void carregar()
})
</script>
