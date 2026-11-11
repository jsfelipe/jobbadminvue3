<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">CRM - Academia</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Quem abriu aulas, clicou em assuntos e assistiu vídeos, e o que pediram de conteúdo.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <router-link
            to="/admin/crm/pesquisas"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600 dark:text-gray-200"
          >
            Pesquisas
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
        <div v-if="preset === 'custom'">
          <label class="mb-1 block text-xs font-semibold text-gray-500">De</label>
          <input v-model="dataInicio" type="date" class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700" />
        </div>
        <div v-if="preset === 'custom'">
          <label class="mb-1 block text-xs font-semibold text-gray-500">Até</label>
          <input v-model="dataFim" type="date" class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-500">Evento</label>
          <select v-model="tipo" class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700">
            <option value="">Todos</option>
            <option v-for="item in tipos" :key="item" :value="item">{{ ACADEMIA_TIPO_LABEL[item] }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-500">Ajudou</label>
          <select v-model="ajudou" class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700">
            <option value="">Todos</option>
            <option v-for="item in ajudouOpcoes" :key="item" :value="item">{{ ACADEMIA_AJUDOU_LABEL[item] }}</option>
          </select>
        </div>
        <div class="min-w-[220px] flex-1">
          <label class="mb-1 block text-xs font-semibold text-gray-500">Domínio, usuário ou aula</label>
          <input
            v-model="busca"
            type="search"
            class="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            @keyup.enter="aplicar"
          />
        </div>
        <button type="button" class="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" @click="aplicar">
          Filtrar
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <CrmCounterCard label="Visitantes" :value="resumo?.visitantes ?? 0" />
        <CrmCounterCard label="Aulas abertas" :value="resumo?.aulas_abertas ?? 0" />
        <CrmCounterCard label="Plays" :value="resumo?.plays ?? 0" />
        <CrmCounterCard label="Conclusões" :value="resumo?.conclusoes ?? 0" />
        <CrmCounterCard
          label="Taxa de conclusão"
          :value="`${resumo?.taxa_conclusao ?? 0}%`"
          :progress="resumo?.taxa_conclusao ?? 0"
        />
        <CrmCounterCard
          label="Feedbacks"
          :value="resumo?.feedbacks ?? 0"
          :sub-label="`${resumo?.ajudou.sim ?? 0} sim / ${resumo?.ajudou.parcial ?? 0} parcial / ${resumo?.ajudou.nao ?? 0} não`"
        />
      </div>

      <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Aulas mais abertas</h3>
          <p v-if="(resumo?.top_aulas.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">Sem dados no período.</p>
          <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                <th>Aula</th>
                <th>Aberturas</th>
                <th>Conclusões</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="aula in resumo?.top_aulas ?? []" :key="aula.lesson_id" class="border-t border-gray-100 dark:border-gray-700">
                <td>{{ aula.lesson_title || aula.lesson_id }}</td>
                <td>{{ aula.aberturas }}</td>
                <td>{{ aula.conclusoes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Assuntos pedidos</h3>
          <p v-if="(resumo?.top_assuntos.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">Sem pedidos no período.</p>
          <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                <th>Assunto</th>
                <th>Pedidos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in resumo?.top_assuntos ?? []" :key="item.assunto" class="border-t border-gray-100 dark:border-gray-700">
                <td>{{ item.assunto }}</td>
                <td>{{ item.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Eventos ({{ eventos?.total ?? 0 }})</h3>
          <div class="flex gap-2 text-xs">
            <button type="button" class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600" :disabled="pageEventos <= 1 || carregando" @click="irEventos(pageEventos - 1)">
              Anterior
            </button>
            <span class="self-center text-gray-500">{{ pageEventos }} / {{ eventos?.last_page ?? 1 }}</span>
            <button type="button" class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600" :disabled="pageEventos >= (eventos?.last_page ?? 1) || carregando" @click="irEventos(pageEventos + 1)">
              Próxima
            </button>
          </div>
        </div>
        <p v-if="(eventos?.data.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">Nenhum evento no período.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                <th>Data</th>
                <th>Domínio</th>
                <th>Usuário</th>
                <th>Tipo</th>
                <th>Aula</th>
                <th>Alvo</th>
                <th>Progresso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in eventos?.data ?? []" :key="row.id" class="border-t border-gray-100 dark:border-gray-700">
                <td class="whitespace-nowrap">{{ formatDateTime(row.created_at) }}</td>
                <td>
                  <span class="font-medium">{{ row.nome_cliente || row.dominio || '—' }}</span>
                  <span v-if="row.dominio" class="block text-xs text-gray-500">{{ row.dominio }}</span>
                </td>
                <td>
                  {{ row.nome_usuario || '—' }}
                  <span v-if="row.email" class="block text-xs text-gray-500">{{ row.email }}</span>
                </td>
                <td>{{ ACADEMIA_TIPO_LABEL[row.tipo] }}</td>
                <td>{{ row.lesson_title || row.lesson_id || '—' }}</td>
                <td>{{ row.alvo || '—' }}</td>
                <td>{{ row.progresso === null ? '—' : `${row.progresso}%` }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Pesquisa ({{ feedback?.total ?? 0 }})</h3>
          <div class="flex gap-2 text-xs">
            <button type="button" class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600" :disabled="pageFeedback <= 1 || carregando" @click="irFeedback(pageFeedback - 1)">
              Anterior
            </button>
            <span class="self-center text-gray-500">{{ pageFeedback }} / {{ feedback?.last_page ?? 1 }}</span>
            <button type="button" class="rounded border px-2 py-1 disabled:opacity-40 dark:border-gray-600" :disabled="pageFeedback >= (feedback?.last_page ?? 1) || carregando" @click="irFeedback(pageFeedback + 1)">
              Próxima
            </button>
          </div>
        </div>
        <p v-if="(feedback?.data.length ?? 0) === 0" class="py-6 text-center text-sm text-gray-500">Nenhuma resposta no período.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                <th>Data</th>
                <th>Domínio</th>
                <th>Usuário</th>
                <th>Aula</th>
                <th>Ajudou</th>
                <th>Assunto desejado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in feedback?.data ?? []" :key="row.id" class="border-t border-gray-100 dark:border-gray-700">
                <td class="whitespace-nowrap">{{ formatDateTime(row.created_at) }}</td>
                <td>
                  <span class="font-medium">{{ row.nome_cliente || row.dominio || '—' }}</span>
                  <span v-if="row.dominio" class="block text-xs text-gray-500">{{ row.dominio }}</span>
                </td>
                <td>{{ row.nome_usuario || '—' }}</td>
                <td>{{ row.lesson_title || '—' }}</td>
                <td>{{ row.ajudou ? ACADEMIA_AJUDOU_LABEL[row.ajudou] : '—' }}</td>
                <td class="max-w-xs">
                  {{ row.assunto_desejado || '—' }}
                  <span v-if="row.comentario" class="block text-xs text-gray-500">{{ row.comentario }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { crmService } from '@/services/crm'
import CrmCounterCard from './components/CrmCounterCard.vue'
import { formatDateTime } from './model/crm.ui'
import type { Paginated } from './model/crm.types'
import {
  ACADEMIA_AJUDOU_LABEL,
  ACADEMIA_TIPO_LABEL,
  type AcademiaAjudou,
  type AcademiaEvento,
  type AcademiaEventoTipo,
  type AcademiaFeedback,
  type AcademiaResumo,
} from './model/academia.types'

const tipos: AcademiaEventoTipo[] = [
  'page_view',
  'lesson_open',
  'chapter_click',
  'link_click',
  'video_play',
  'video_progress',
  'video_ended',
]
const ajudouOpcoes: AcademiaAjudou[] = ['sim', 'parcial', 'nao']

const hojeIso = () => new Date().toISOString().slice(0, 10)
const diasAtrasIso = (dias: number) => {
  const data = new Date()
  data.setDate(data.getDate() - dias)
  return data.toISOString().slice(0, 10)
}

const preset = ref<'hoje' | '7d' | '30d' | 'custom'>('30d')
const dataInicio = ref(diasAtrasIso(29))
const dataFim = ref(hojeIso())
const tipo = ref<AcademiaEventoTipo | ''>('')
const ajudou = ref<AcademiaAjudou | ''>('')
const busca = ref('')
const pageEventos = ref(1)
const pageFeedback = ref(1)
const carregando = ref(false)
const erro = ref('')
const resumo = ref<AcademiaResumo | null>(null)
const eventos = ref<Paginated<AcademiaEvento> | null>(null)
const feedback = ref<Paginated<AcademiaFeedback> | null>(null)

function periodo() {
  return { data_inicio: dataInicio.value, data_fim: dataFim.value }
}

async function carregar(): Promise<void> {
  carregando.value = true
  erro.value = ''
  try {
    const q = busca.value.trim() || undefined
    const [resumoData, listaEventos, listaFeedback] = await Promise.all([
      crmService.academiaResumo(periodo()),
      crmService.academiaEventos({
        ...periodo(),
        tipo: tipo.value || undefined,
        q,
        page: pageEventos.value,
        per_page: 20,
      }),
      crmService.academiaFeedback({
        ...periodo(),
        ajudou: ajudou.value || undefined,
        q,
        page: pageFeedback.value,
        per_page: 20,
      }),
    ])
    resumo.value = resumoData
    eventos.value = listaEventos
    feedback.value = listaFeedback
  } catch {
    erro.value = 'Não foi possível carregar a academia.'
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
}

function aplicar(): void {
  pageEventos.value = 1
  pageFeedback.value = 1
  void carregar()
}

function irEventos(pagina: number): void {
  pageEventos.value = pagina
  void carregar()
}

function irFeedback(pagina: number): void {
  pageFeedback.value = pagina
  void carregar()
}

onMounted(() => {
  void carregar()
})
</script>
