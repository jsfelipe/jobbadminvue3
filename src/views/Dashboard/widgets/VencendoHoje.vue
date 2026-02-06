<template>
  <div class="flex flex-col">
    <h3 class="mb-4 mt-1 text-sm font-semibold leading-tight text-gray-800 dark:text-white">
      {{ widget?.nome }}
    </h3>
    <div class="min-h-[80px] overflow-y-auto rounded border border-gray-200 dark:border-gray-700" style="max-height: 360px">
      <table class="w-full table-fixed border-collapse divide-y divide-gray-200 text-xs dark:divide-gray-600">
        <thead class="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th scope="col" class="w-12 px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Tipo
            </th>
            <th scope="col" class="px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Nome
            </th>
            <th scope="col" class="w-[22%] px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Observações
            </th>
            <th scope="col" class="w-20 px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Valor
            </th>
            <th scope="col" class="w-20 px-2 py-1.5 text-left font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
              N° Job/Doc
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-800/50">
          <tr
            v-for="(lancamento, key) in lancamentos"
            :key="key"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="whitespace-nowrap px-2 py-1.5">
              <span
                v-if="lancamento.operacao === 'C'"
                class="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
                :class="badgeCreditoClass"
              >
                {{ lancamento.operacao }}
              </span>
              <span
                v-else
                class="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase text-red-700 dark:bg-red-500/20 dark:text-red-300"
                :class="badgeDebitoClass"
              >
                {{ lancamento.operacao }}
              </span>
            </td>
            <td class="overflow-hidden px-2 py-1.5 text-gray-700 dark:text-gray-300">
              <span class="block truncate" :title="lancamento.nome_pessoa">{{ lancamento.nome_pessoa }}</span>
            </td>
            <td class="max-w-0 overflow-hidden px-2 py-1.5 text-gray-700 dark:text-gray-300">
              <span class="block truncate" :title="lancamento.obs">{{ lancamento.obs }}</span>
            </td>
            <td class="whitespace-nowrap px-2 py-1.5 tabular-nums text-gray-700 dark:text-gray-300">
              {{ formatMoney(lancamento.valor) }}
            </td>
            <td class="whitespace-nowrap px-2 py-1.5 text-gray-700 dark:text-gray-300">
              {{ lancamento.num_orcamento }}
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
              Carregando...
            </td>
          </tr>
          <tr v-else-if="!lancamentos.length">
            <td colspan="5" class="px-2 py-4 text-center font-medium text-gray-500 dark:text-gray-400">
              Nenhum lançamento vencendo hoje.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import lancamentosService from '@/services/lancamentos'

export interface LancamentoVencendoHoje {
  operacao: string
  nome_pessoa?: string
  obs?: string
  valor: number
  num_orcamento?: string
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

const lancamentos = ref<LancamentoVencendoHoje[]>([])
const loading = ref(true)

const badgeCreditoClass = computed(() => 'bg-primary-100')
const badgeDebitoClass = computed(() => 'bg-red-100')

function formatMoney(value: number | undefined): string {
  if (value == null) return '–'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

async function getData() {
  loading.value = true
  const today = new Date().toISOString().slice(0, 10)
  const params = {
    dataVencimento: [today, today],
    perPage: 5,
    status: 'PAGAR',
  }
  try {
    const resp = await lancamentosService.listarLancamento(params) as { data?: LancamentoVencendoHoje[] }
    lancamentos.value = resp?.data ?? []
  } catch {
    lancamentos.value = []
    alerta?.('Falha ao buscar dados Vencendo hoje.', 'danger')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getData()
})
</script>
