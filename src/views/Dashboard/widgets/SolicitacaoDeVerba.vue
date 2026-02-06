<template>
  <div class="flex flex-col">
    <h3 class="mb-4 mt-1 text-sm font-semibold leading-tight text-gray-800 dark:text-white">
      {{ widget?.nome }}
    </h3>
    <div class="min-h-[80px] overflow-y-auto rounded border border-gray-200 dark:border-gray-700" style="max-height: 372px">
      <template v-if="loading">
        <div class="px-3 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Carregando...
        </div>
      </template>
      <template v-else-if="!solicitacoes.length">
        <div class="px-3 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Nenhuma solicitação de verba.
        </div>
      </template>
      <ul v-else class="divide-y divide-gray-200 dark:divide-gray-600">
        <li
          v-for="(solicitacao, index) in solicitacoes"
          :key="index"
          class="flex cursor-pointer flex-col gap-1 px-3 py-2 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
          @click="openScreen(solicitacao)"
        >
          <p class="mb-0 leading-snug text-gray-700 dark:text-gray-300">
            <button
              type="button"
              class="font-medium text-primary-600 hover:underline dark:text-primary-400"
              @click.stop="openScreen(solicitacao)"
            >
              {{ solicitacao.usuario }}
            </button>
            solicitou
            <span class="tabular-nums font-medium">{{ formatMoney(solicitacao.valorDisp) }}</span>
            de {{ solicitacao.descricao_verba }} para o job N°
            <button
              type="button"
              class="font-medium text-primary-600 hover:underline dark:text-primary-400"
              @click.stop="openScreen(solicitacao)"
            >
              {{ solicitacao.numOrcamento }} - {{ solicitacao.titulo }}
            </button>
          </p>
          <div class="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ formatFromNow(solicitacao.data_liberado) }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { api } from '@/services/http'

export interface SolicitacaoVerba {
  usuario?: string
  valorDisp: number
  descricao_verba?: string
  numOrcamento?: string
  titulo?: string
  data_liberado?: string
  id_orcamento: number
}

const props = withDefaults(
  defineProps<{
    widget: { nome?: string; linkData?: string; [key: string]: unknown }
    topLocation?: boolean
  }>(),
  { topLocation: false }
)

const instance = getCurrentInstance()
const alerta = (instance?.proxy as { $alerta?: (msg: string, type?: string) => void })?.$alerta

const solicitacoes = ref<SolicitacaoVerba[]>([])
const loading = ref(true)

const defaultUrl = '/widget/solicitacoes-verba'

function formatMoney(value: number | string | undefined): string {
  if (value == null || value === '-') return '–'
  const n = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value)
  if (Number.isNaN(n)) return '–'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function formatFromNow(value: string | undefined): string {
  if (!value) return '–'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  if (diffSec < 60) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffHour < 24) return `há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`
  if (diffDay < 7) return `há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function openScreen(row: SolicitacaoVerba) {
  const path = row.id_orcamento ? `/verba-de-producao/${row.id_orcamento}` : '/verba-de-producao'
  window.open(path, '_blank', 'noopener,noreferrer')
}

async function getData() {
  loading.value = true
  const url = typeof props.widget?.linkData === 'string' && props.widget.linkData
    ? props.widget.linkData
    : defaultUrl
  try {
    const resp = await api.get<{ data?: SolicitacaoVerba[] }>(url)
    const data = resp.data?.data ?? resp.data
    solicitacoes.value = Array.isArray(data) ? data : []
  } catch {
    solicitacoes.value = []
    alerta?.('Falha ao buscar dados solicitações.', 'danger')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getData()
})
</script>
