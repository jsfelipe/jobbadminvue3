<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">CRM - Pesquisas</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Satisfação, demanda, atendimento (Nível 1 / Nível 2) e oportunidades comerciais.
          </p>
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
          <label class="mb-1 block text-xs font-semibold text-gray-500">NPS</label>
          <select
            v-model="npsFaixa"
            class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            @change="onFiltro"
          >
            <option value="">Todas as faixas</option>
            <option v-for="f in NPS_FAIXAS" :key="f" :value="f">{{ NPS_FAIXA_LABEL[f] }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-500">Interesse</label>
          <select
            v-model="interesse"
            class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            @change="onFiltro"
          >
            <option value="">Todos</option>
            <option v-for="t in INTERESSE_TIPOS" :key="t" :value="t">{{ INTERESSE_TIPO_LABEL[t] }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-500">Busca</label>
          <input
            v-model="busca"
            type="search"
            class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            placeholder="Cliente, usuário, domínio"
            @change="onFiltro"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <CrmCounterCard label="Respostas" :value="resumo?.kpis.respostas ?? 0" value-class="text-blue-600" />
        <div class="flex flex-col justify-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-baseline justify-between gap-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Ocultado</p>
            <p class="text-2xl font-bold text-gray-600 dark:text-gray-300">{{ resumo?.kpis.ocultados ?? 0 }}</p>
          </div>
          <div class="flex items-baseline justify-between gap-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Declinado</p>
            <p class="text-2xl font-bold text-gray-600 dark:text-gray-300">{{ resumo?.kpis.declinados ?? 0 }}</p>
          </div>
        </div>
        <CrmCounterCard
          label="NPS"
          hint="Net Promoter Score: chance de indicar o Jobb (0 a 10). Promotores (9–10) menos detratores (0–6), de −100 a +100."
          :value="resumo?.kpis.nps ?? 0"
          :sub-label="`${resumo?.kpis.promotores ?? 0} prom. / ${resumo?.kpis.detratores ?? 0} det.`"
          value-class="text-emerald-600"
        />
        <CrmCounterCard
          label="CSAT médio"
          hint="Customer Satisfaction Score: média de satisfação com o sistema, de 1 a 5."
          :value="resumo?.kpis.csat ?? 0"
        />
        <CrmCounterCard
          label="Treinamento"
          :value="`${resumo?.kpis.pct_treinamento ?? 0}%`"
          :sub-label="`${resumo?.kpis.interesse_treinamento ?? 0} interessados`"
          :progress="resumo?.kpis.pct_treinamento ?? 0"
        />
        <CrmCounterCard
          label="Integração / Dashboard"
          :value="`${resumo?.kpis.pct_integracao ?? 0}%`"
          :sub-label="`Dash ${resumo?.kpis.pct_dashboard ?? 0}%`"
          :progress="resumo?.kpis.pct_integracao ?? 0"
          :progress2="resumo?.kpis.pct_dashboard ?? 0"
          progress2-label="Dashboard"
        />
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CrmCounterCard
          label="Usaram atendimento"
          hint="Percentual de respostas que já usaram ticket, WhatsApp ou Chat/Bot."
          :value="`${resumo?.kpis.pct_atendimento ?? 0}%`"
          :sub-label="`${resumo?.kpis.atendimento_usou ?? 0} sim / ${resumo?.kpis.atendimento_nao ?? 0} não`"
          :progress="resumo?.kpis.pct_atendimento ?? 0"
        />
        <CrmCounterCard
          label="Nível 1 médio"
          hint="Média de educação, tempo de resposta e resolução no atendimento inicial (1 a 5)."
          :value="resumo?.kpis.n1_media ?? 0"
          :sub-label="`${resumo?.kpis.atendimento_usou ?? 0} avaliações`"
        />
        <CrmCounterCard
          label="Nível 2 médio"
          hint="Média quando o caso foi para desenvolvimento ou correção de bugs (1 a 5)."
          :value="resumo?.kpis.n2_media ?? 0"
          :sub-label="`${resumo?.kpis.atendimento_nivel2 ?? 0} casos`"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Distribuição NPS</h3>
          <p class="mb-3 text-xs text-gray-400 dark:text-gray-500">
            Net Promoter Score: nota de 0 a 10 sobre a chance de indicar o Jobb.
          </p>
          <VueApexCharts v-if="temNps" type="bar" height="280" :options="optNps" :series="seriesNps" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">CSAT</h3>
          <p class="mb-3 text-xs text-gray-400 dark:text-gray-500">
            Customer Satisfaction Score: satisfação com o sistema, de 1 a 5.
          </p>
          <VueApexCharts v-if="temCsat" type="donut" height="280" :options="optCsat" :series="seriesCsat" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Módulos mais usados</h3>
          <VueApexCharts v-if="temModulos" type="bar" height="280" :options="optModulos" :series="seriesModulos" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Dificuldades</h3>
          <VueApexCharts v-if="temDores" type="bar" height="280" :options="optDores" :series="seriesDores" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Serviços desejados</h3>
          <VueApexCharts v-if="temServicos" type="bar" height="280" :options="optServicos" :series="seriesServicos" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Ofertas pagas</h3>
          <VueApexCharts v-if="temOfertas" type="bar" height="280" :options="optOfertas" :series="seriesOfertas" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Canais de atendimento</h3>
          <p class="mb-3 text-xs text-gray-400 dark:text-gray-500">
            Ticket, WhatsApp e Chat/Bot — quem já usou o suporte.
          </p>
          <VueApexCharts v-if="temCanais" type="bar" height="280" :options="optCanais" :series="seriesCanais" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Notas do atendimento</h3>
          <p class="mb-3 text-xs text-gray-400 dark:text-gray-500">
            Nível 1 (inicial) vs Nível 2 (desenvolvimento / bugs), de 1 a 5.
          </p>
          <VueApexCharts v-if="temNotasAtend" type="bar" height="280" :options="optNotasAtend" :series="seriesNotasAtend" />
          <p v-else class="py-10 text-center text-sm text-gray-500">Sem dados no período.</p>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            Oportunidades ({{ oportunidades?.total ?? 0 }})
          </h3>
          <div class="flex gap-2 text-xs">
            <button
              type="button"
              class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600"
              :disabled="pageOport <= 1 || carregando"
              @click="irPageOport(pageOport - 1)"
            >
              Anterior
            </button>
            <span class="self-center text-gray-500">{{ pageOport }} / {{ oportunidades?.last_page ?? 1 }}</span>
            <button
              type="button"
              class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600"
              :disabled="pageOport >= (oportunidades?.last_page ?? 1) || carregando"
              @click="irPageOport(pageOport + 1)"
            >
              Próxima
            </button>
          </div>
        </div>
        <p v-if="(oportunidades?.data.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">
          Nenhuma oportunidade no período.
        </p>
        <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
              <th>Data</th>
              <th>Cliente</th>
              <th>Usuário</th>
              <th>Treinamento</th>
              <th>Integração</th>
              <th>Dashboard</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in oportunidades?.data ?? []"
              :key="row.id"
              class="border-t border-gray-100 dark:border-gray-700"
            >
              <td class="whitespace-nowrap">{{ formatDateTime(row.answered_at) }}</td>
              <td>
                <router-link :to="`/admin/clientes/alterar/${row.id_cliente}`" class="font-medium text-blue-700 hover:underline dark:text-blue-300">
                  {{ row.nome_cliente || `#${row.id_cliente}` }}
                </router-link>
                <span v-if="row.dominio" class="block text-xs text-gray-500">{{ row.dominio }}</span>
              </td>
              <td>{{ row.nome_usuario || '—' }}</td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="interesseClass(row.treinamento_interesse)">
                  {{ row.treinamento_interesse ? INTERESSE_LABEL[row.treinamento_interesse] : '—' }}
                </span>
              </td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="interesseClass(row.integracao_interesse)">
                  {{ row.integracao_interesse ? INTERESSE_LABEL[row.integracao_interesse] : '—' }}
                </span>
              </td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="interesseClass(row.dashboard_interesse)">
                  {{ row.dashboard_interesse ? INTERESSE_LABEL[row.dashboard_interesse] : '—' }}
                </span>
              </td>
              <td>
                <button type="button" class="text-sm font-semibold text-blue-700 dark:text-blue-300" @click="detalhe = row">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            Respostas ({{ respostas?.total ?? 0 }})
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
            <span class="self-center text-gray-500">{{ page }} / {{ respostas?.last_page ?? 1 }}</span>
            <button
              type="button"
              class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600"
              :disabled="page >= (respostas?.last_page ?? 1) || carregando"
              @click="irPage(page + 1)"
            >
              Próxima
            </button>
          </div>
        </div>
        <p v-if="(respostas?.data.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">
          Nenhuma resposta no período.
        </p>
        <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
              <th>Data</th>
              <th>Cliente</th>
              <th>Usuário</th>
              <th>NPS</th>
              <th>CSAT</th>
              <th>Comentário</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in respostas?.data ?? []"
              :key="row.id"
              class="border-t border-gray-100 dark:border-gray-700"
            >
              <td class="whitespace-nowrap">{{ formatDateTime(row.answered_at) }}</td>
              <td>
                <span class="font-medium">{{ row.nome_cliente || `#${row.id_cliente}` }}</span>
                <span v-if="row.dominio" class="block text-xs text-gray-500">{{ row.dominio }}</span>
              </td>
              <td>{{ row.nome_usuario || '—' }}</td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="npsFaixaClass(row.nps_faixa)">
                  {{ row.nps ?? '—' }}
                </span>
              </td>
              <td>{{ row.csat ?? '—' }}</td>
              <td class="max-w-xs truncate text-gray-600 dark:text-gray-300">{{ row.comentario || '—' }}</td>
              <td>
                <button type="button" class="text-sm font-semibold text-blue-700 dark:text-blue-300" @click="detalhe = row">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ModalDetalhePesquisa v-if="detalhe" :row="detalhe" @close="detalhe = null" />
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ApexOptions } from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { crmService } from '@/services/crm'
import CrmCounterCard from './components/CrmCounterCard.vue'
import ModalDetalhePesquisa from './components/ModalDetalhePesquisa.vue'
import { formatDateTime } from './model/crm.ui'
import type { Paginated } from './model/crm.types'
import {
  DIFICULDADE_LABEL,
  DIFICULDADES,
  INTERESSE_LABEL,
  INTERESSE_TIPO_LABEL,
  INTERESSE_TIPOS,
  MODULO_LABEL,
  MODULOS,
  NPS_FAIXA_LABEL,
  NPS_FAIXAS,
  CANAIS_ATENDIMENTO,
  CANAL_ATENDIMENTO_LABEL,
  DIMENSAO_ATENDIMENTO_LABEL,
  DIMENSOES_ATENDIMENTO,
  SERVICO_LABEL,
  SERVICOS,
  histAt,
  interesseClass,
  npsFaixaClass,
  type InteresseComercial,
  type InteresseTipo,
  type NpsFaixa,
  type PesquisaResposta,
  type PesquisaResumo,
} from './model/pesquisa.types'

const hojeIso = () => new Date().toISOString().slice(0, 10)
const diasAtrasIso = (dias: number) => {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

const preset = ref<'hoje' | '7d' | '30d' | 'custom'>('30d')
const dataInicio = ref(diasAtrasIso(29))
const dataFim = ref(hojeIso())
const npsFaixa = ref<NpsFaixa | ''>('')
const interesse = ref<InteresseTipo | ''>('')
const busca = ref('')
const page = ref(1)
const pageOport = ref(1)
const carregando = ref(false)
const erro = ref('')
const resumo = ref<PesquisaResumo | null>(null)
const respostas = ref<Paginated<PesquisaResposta> | null>(null)
const oportunidades = ref<Paginated<PesquisaResposta> | null>(null)
const detalhe = ref<PesquisaResposta | null>(null)

const baseChart = (): ApexOptions => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  dataLabels: { enabled: false },
  legend: { position: 'bottom' },
  grid: { strokeDashArray: 4 },
  noData: { text: 'Sem dados' },
})

const npsKeys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const temNps = computed(() => npsKeys.some((k) => histAt(resumo.value?.nps_histograma, k) > 0))
const seriesNps = computed(() => [{ name: 'Respostas', data: npsKeys.map((k) => histAt(resumo.value?.nps_histograma, k)) }])
const optNps = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
  xaxis: { categories: npsKeys.map(String) },
  colors: ['#059669'],
}))

const csatKeys = [1, 2, 3, 4, 5]
const temCsat = computed(() => csatKeys.some((k) => histAt(resumo.value?.csat_histograma, k) > 0))
const seriesCsat = computed(() => csatKeys.map((k) => histAt(resumo.value?.csat_histograma, k)))
const optCsat = computed<ApexOptions>(() => ({
  ...baseChart(),
  labels: csatKeys.map((k) => `${k}`),
  colors: ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#059669'],
}))

const temModulos = computed(() => MODULOS.some((k) => (resumo.value?.modulos_usados?.[k] ?? 0) > 0))
const seriesModulos = computed(() => [{ name: 'Menções', data: MODULOS.map((k) => resumo.value?.modulos_usados?.[k] ?? 0) }])
const optModulos = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
  xaxis: { categories: MODULOS.map((k) => MODULO_LABEL[k]) },
  colors: ['#2563eb'],
}))

const temDores = computed(() => DIFICULDADES.some((k) => (resumo.value?.dificuldades?.[k] ?? 0) > 0))
const seriesDores = computed(() => [{ name: 'Menções', data: DIFICULDADES.map((k) => resumo.value?.dificuldades?.[k] ?? 0) }])
const optDores = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
  xaxis: { categories: DIFICULDADES.map((k) => DIFICULDADE_LABEL[k]) },
  colors: ['#dc2626'],
}))

const temServicos = computed(() => SERVICOS.some((k) => (resumo.value?.servicos_desejados?.[k] ?? 0) > 0))
const seriesServicos = computed(() => [{ name: 'Menções', data: SERVICOS.map((k) => resumo.value?.servicos_desejados?.[k] ?? 0) }])
const optServicos = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
  xaxis: { categories: SERVICOS.map((k) => SERVICO_LABEL[k]) },
  colors: ['#7c3aed'],
}))

function mapaInteresse(tipo: InteresseTipo): Record<InteresseComercial, number> {
  const vazio: Record<InteresseComercial, number> = { interesse: 0, nao: 0, contratar: 0, valores: 0 }
  if (!resumo.value) return vazio
  if (tipo === 'treinamento') return { ...vazio, ...resumo.value.treinamento_interesse }
  if (tipo === 'integracao') return { ...vazio, ...resumo.value.integracao_interesse }
  return { ...vazio, ...resumo.value.dashboard_interesse }
}

function qtdInteresse(mapa: Record<InteresseComercial, number>): number {
  return (mapa.interesse ?? 0) + (mapa.contratar ?? 0) + (mapa.valores ?? 0)
}

const temOfertas = computed(() =>
  INTERESSE_TIPOS.some((t) => qtdInteresse(mapaInteresse(t)) > 0 || mapaInteresse(t).nao > 0),
)
const seriesOfertas = computed(() => [
  { name: INTERESSE_LABEL.interesse, data: INTERESSE_TIPOS.map((t) => qtdInteresse(mapaInteresse(t))) },
  { name: INTERESSE_LABEL.nao, data: INTERESSE_TIPOS.map((t) => mapaInteresse(t).nao) },
])
const optOfertas = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '55%' } },
  xaxis: { categories: INTERESSE_TIPOS.map((t) => INTERESSE_TIPO_LABEL[t]) },
  colors: ['#059669', '#6b7280'],
}))

const temCanais = computed(() => CANAIS_ATENDIMENTO.some((k) => (resumo.value?.atendimento_canais?.[k] ?? 0) > 0))
const seriesCanais = computed(() => [{
  name: 'Menções',
  data: CANAIS_ATENDIMENTO.map((k) => resumo.value?.atendimento_canais?.[k] ?? 0),
}])
const optCanais = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
  xaxis: { categories: CANAIS_ATENDIMENTO.map((k) => CANAL_ATENDIMENTO_LABEL[k]) },
  colors: ['#0d9488'],
}))

const temNotasAtend = computed(() =>
  DIMENSOES_ATENDIMENTO.some((k) => (resumo.value?.atendimento_n1?.[k] ?? 0) > 0 || (resumo.value?.atendimento_n2?.[k] ?? 0) > 0),
)
const seriesNotasAtend = computed(() => [
  { name: 'Nível 1', data: DIMENSOES_ATENDIMENTO.map((k) => resumo.value?.atendimento_n1?.[k] ?? 0) },
  { name: 'Nível 2', data: DIMENSOES_ATENDIMENTO.map((k) => resumo.value?.atendimento_n2?.[k] ?? 0) },
])
const optNotasAtend = computed<ApexOptions>(() => ({
  ...baseChart(),
  plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '55%' } },
  xaxis: { categories: DIMENSOES_ATENDIMENTO.map((k) => DIMENSAO_ATENDIMENTO_LABEL[k]) },
  yaxis: { min: 0, max: 5, tickAmount: 5 },
  colors: ['#ea580c', '#7c3aed'],
}))

function periodoParams() {
  return { data_inicio: dataInicio.value, data_fim: dataFim.value }
}

function listParams(pagina: number, oportunidadesFlag: boolean) {
  return {
    ...periodoParams(),
    nps_faixa: npsFaixa.value || undefined,
    interesse: interesse.value || undefined,
    q: busca.value.trim() || undefined,
    page: pagina,
    per_page: 20,
    oportunidades: oportunidadesFlag ? 1 : undefined,
  }
}

async function carregar(): Promise<void> {
  carregando.value = true
  erro.value = ''
  try {
    const [resumoData, lista, oport] = await Promise.all([
      crmService.pesquisaResumo(periodoParams()),
      crmService.pesquisasListar(listParams(page.value, false)),
      crmService.pesquisasListar(listParams(pageOport.value, true)),
    ])
    resumo.value = resumoData
    respostas.value = lista
    oportunidades.value = oport
  } catch {
    erro.value = 'Não foi possível carregar as pesquisas.'
  } finally {
    carregando.value = false
  }
}

function onPreset(): void {
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
  if (preset.value !== 'custom') {
    onFiltro()
  }
}

function onFiltro(): void {
  page.value = 1
  pageOport.value = 1
  void carregar()
}

function irPage(next: number): void {
  page.value = next
  void carregar()
}

function irPageOport(next: number): void {
  pageOport.value = next
  void carregar()
}

onMounted(() => {
  void carregar()
})
</script>
