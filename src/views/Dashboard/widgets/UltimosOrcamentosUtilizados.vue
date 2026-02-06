<template>
  <div class="flex flex-col">
    <h3 class="mb-4 mt-1 text-sm font-semibold leading-tight text-gray-800 dark:text-white">
      {{ widget?.nome }}
    </h3>
    <div class="min-h-[80px] overflow-y-auto rounded border border-gray-200 dark:border-gray-700" style="max-height: 360px">
      <table class="w-full table-fixed border-collapse divide-y divide-gray-200 text-xs dark:divide-gray-600">
        <colgroup>
          <col class="w-14">
          <col class="min-w-0">
          <col class="w-[22%]">
          <col class="w-[18%]">
          <col class="w-9">
        </colgroup>
        <thead class="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              N° JOB
            </th>
            <th scope="col" class="px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Título
            </th>
            <th scope="col" class="px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Cliente
            </th>
            <th scope="col" class="px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Agência
            </th>
            <th scope="col" class="relative px-2 py-1.5">
              <span class="sr-only">Ação</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-800/50">
          <tr
            v-for="(orcamento, key) in ultimosOrcamentos"
            :key="key"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="whitespace-nowrap px-2 py-1.5 text-gray-700 dark:text-gray-300">
              {{ orcamento.numOrcamento }}
            </td>
            <td class="max-w-0 overflow-hidden px-2 py-1.5 text-gray-700 dark:text-gray-300">
              <span class="flex min-w-0 items-center gap-1">
                <span v-if="orcamento.flagstatus" v-html="orcamento.flagstatus" class="shrink-0" />
                <span class="min-w-0 truncate" :title="orcamento.titulo">{{ orcamento.titulo }}</span>
              </span>
            </td>
            <td class="overflow-hidden px-2 py-1.5 text-gray-700 dark:text-gray-300">
              <span class="block truncate" :title="orcamento.cliente">{{ orcamento.cliente }}</span>
            </td>
            <td class="overflow-hidden px-2 py-1.5 text-gray-700 dark:text-gray-300">
              <span class="block truncate" :title="orcamento.agencia">{{ orcamento.agencia }}</span>
            </td>
            <td class="whitespace-nowrap px-2 py-1.5 text-right">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded bg-primary-600 p-1 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:bg-primary-500 dark:hover:bg-primary-600"
                title="Editar orçamento"
                @click="irOrcamento(orcamento)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
              Carregando...
            </td>
          </tr>
          <tr v-else-if="!ultimosOrcamentos.length">
            <td colspan="5" class="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
              Nenhum orçamento encontrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export interface OrcamentoUltimo {
  numOrcamento?: string
  titulo?: string
  flagstatus?: string
  cliente?: string
  agencia?: string
  id_orcamento: number
  id_orca_status: number
}

const props = withDefaults(
  defineProps<{
    widget: { nome?: string; linkData?: string; [key: string]: unknown }
    topLocation?: boolean
  }>(),
  { topLocation: false }
)

const store = useStore()
const router = useRouter()
const instance = getCurrentInstance()
const alerta = (instance?.proxy as { $alerta?: (msg: string, type?: string) => void })?.$alerta

const ultimosOrcamentos = ref<OrcamentoUltimo[]>([])
const loading = ref(true)

const param = {
  currentPage: 1,
  perPage: 15,
  order_column: 'id_orcamento',
  order: 'DESC',
}

async function getData() {
  loading.value = true
  try {
    const result = await store.dispatch('Orcamento/listarOrcamentoPublicitario', param) as OrcamentoUltimo[] | { data?: OrcamentoUltimo[] }
    const list = Array.isArray(result) ? result : (result?.data ?? [])
    ultimosOrcamentos.value = list
  } catch {
    ultimosOrcamentos.value = []
    alerta?.('Falha ao buscar dados dos últimos orçamentos.', 'danger')
  } finally {
    loading.value = false
  }
}

function irOrcamento(orcamento: OrcamentoUltimo) {
  const id = orcamento.id_orcamento
  if (orcamento.id_orca_status === 1 || orcamento.id_orca_status === 9) {
    router.push(`/orcamentos/formulario/${id}`)
  } else {
    router.push(`/orcamentos/orcamento_trabalho/formulario/${id}`)
  }
}

onMounted(() => {
  getData()
})
</script>
