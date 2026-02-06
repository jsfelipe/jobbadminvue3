/**
 * Composable compartilhado para o formulário de Orçamento.
 * Centraliza estado (budget, versões, loading), permissões e carregamento,
 * evitando duplicação entre Formulario.vue e HandsOnTable.vue (quando !embed).
 */
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Budget from '@/services/budget'
import { permissoesDaPagina } from '@/components/Jobb/Utils/Util'

function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      fn.apply(this, args)
    }, ms)
  } as T
}

export interface VersaoItem {
  id_orcamento?: string
  versao?: number
  titulo?: string
  principal?: boolean
  numOrcamento?: string
  num_orcamento?: string
}

export function useOrcamentoForm() {
  const route = useRoute()

  const idOrcamento = computed(() => (route.params.id as string) ?? null)
  /** Id do projeto incentivado quando a rota é orcamento_trabalho-incentivado (params.idIcentivado ou idIcent) */
  const idProjetoIncentivado = computed(
    () => (route.params.idIcentivado as string) ?? (route.params.idIcent as string) ?? null,
  )
  const loadingOrcamento = ref(true)
  const budget = ref<Record<string, unknown> | null>(null)
  const versoes = ref<Record<string, VersaoItem>>({})
  /** Por padrão aberto; só fica fechado se o usuário salvou 'false' no localStorage */
  const showTable = ref(localStorage.getItem('showTable') !== 'false')

  /** true = exibir botão Copiar (igual antigo: permissoesPagina('copiarOrcamento')) */
  const hideCopia = ref(
    permissoesDaPagina('', { descricao: 'copiarOrcamento', module: 'orcamento' }, 'Orçamento') ||
    permissoesDaPagina('', { descricao: 'Copiar orçamento', module: 'orcamento' }, 'Orçamento'),
  )
  /** true = exibir botões Imprimir/Exportar (igual antigo: permissoesPagina('Imprimir Orçamento')) */
  const hideExportar = ref(
    permissoesDaPagina('', { descricao: 'Imprimir Orçamento', module: 'orcamento' }, 'Orçamento'),
  )
  const disabledStatus = ref(
    !permissoesDaPagina('', { descricao: 'Alterar Status', module: 'orcamento' }, 'Orçamento'),
  )
  const habilitarBotaoObs = ref(
    permissoesDaPagina(
      '',
      { descricao: 'Habilitar botao observaçao', module: 'orcamento' },
      'Orçamento',
    ),
  )

  const orcamentoNumero = computed(() => {
    const b = budget.value as { numOrcamento?: string; num_orcamento?: string } | null
    return b?.numOrcamento ?? b?.num_orcamento ?? '-'
  })

  const orcamentoTotal = computed(() => {
    const b = budget.value as { total_orcamento?: number } | null
    return b?.total_orcamento ?? 0
  })

  /** Regra da antiga: total vem de GET budget/calculate/:id. Tenta V2 calculate, V1 calculo/get, sub-total-budget. */
  async function obterTotalRecalculado(id: string): Promise<number | null> {
    const readTotal = (r: Record<string, unknown> | null | undefined): number | null => {
      if (!r || typeof r !== 'object') return null
      const v =
        r.total_orcamento ??
        (r as Record<string, unknown>).totalOrcamento ??
        r.sub_total ??
        (r as Record<string, unknown>).subTotal
      if (v != null && typeof v === 'number' && !Number.isNaN(v)) return v
      if (v != null && typeof v === 'string') {
        const n = Number(v)
        if (!Number.isNaN(n)) return n
      }
      return null
    }
    try {
      const calcV2 = (await Budget.getBudgetCalculate(id)) as Record<string, unknown> & { data?: { budgetCalc?: Record<string, unknown> } }
      const budgetCalc = (calcV2?.data?.budgetCalc ?? calcV2?.budgetCalc) as Record<string, unknown> | undefined
      const t = readTotal(budgetCalc) ?? readTotal(calcV2?.data as Record<string, unknown>) ?? readTotal(calcV2)
      if (t != null) return t
    } catch (_) {
      /* segue para próximo */
    }
    try {
      const calcV1 = (await Budget.getCalculoOrcamentoV1(id)) as Record<string, unknown> & { data?: Record<string, unknown> }
      const data = (calcV1?.data ?? calcV1) as Record<string, unknown>
      const t = readTotal(data)
      if (t != null) return t
    } catch (_) {
      /* segue para próximo */
    }
    try {
      const sub = (await Budget.getSubTotalBudget(id)) as Record<string, unknown>
      const t = readTotal(sub)
      if (t != null) return t
    } catch (_) {
      /* ignora */
    }
    return null
  }

  async function carregarOrcamento() {
    const id = idOrcamento.value
    if (!id) return
    try {
      const currentTotal = budget.value != null ? Number((budget.value as { total_orcamento?: number }).total_orcamento) : 0
      const data = await Budget.getBudget(id)
      const raw = data as { budget?: Record<string, unknown> }
      budget.value = raw?.budget ?? (raw as Record<string, unknown>) ?? null
      if (budget.value) {
        const dataBudget = budget.value as Record<string, unknown>
        // Evitar “mostra total e depois zera”: se a API devolver total 0 mas já tínhamos total válido (ex.: calculado dos grupos), manter
        const apiTotal = Number(dataBudget.total_orcamento)
        if ((apiTotal == null || apiTotal === 0) && currentTotal > 0) {
          dataBudget.total_orcamento = currentTotal
        }
        const b = budget.value as {
          budget_status?: {
            descricao?: string
            id_status?: number
            cor_fundo?: string
            cor?: string
          }
          versoes?: Record<string, unknown>
          id_orca_status?: number
          cor_fundo?: string
          cor?: string
        }
        if (b.budget_status?.descricao) dataBudget.status = b.budget_status.descricao
        if (b.id_orca_status != null) dataBudget.id_orca_status = b.id_orca_status
        else if (b.budget_status?.id_status != null)
          dataBudget.id_orca_status = b.budget_status.id_status
        if (b.budget_status?.cor_fundo != null) dataBudget.cor_fundo = b.budget_status.cor_fundo
        else if (b.cor_fundo != null) dataBudget.cor_fundo = b.cor_fundo
        if (b.budget_status?.cor != null) dataBudget.cor = b.budget_status.cor
        else if (b.cor != null) dataBudget.cor = b.cor
        // Projeto incentivado: mesclar project_incent no budget para o cabeçalho exibir e salvar (igual Vue 2 getBudget)
        if (idProjetoIncentivado.value && dataBudget) {
          const proj = (dataBudget.project_incent ?? dataBudget.projectIncent) as Record<string, unknown> | undefined
          if (proj && typeof proj === 'object') {
            Object.assign(dataBudget, proj)
          }
        }
      }
      // Abas de versões: usar API v1 abas/get (igual ao antigo) para ter Principal + todas as versões com numOrcamento
      const abas = await Budget.getOrcamentoAbas(id).catch(() => null)
      if (abas != null) {
        const arr = Array.isArray(abas) ? abas : (abas as { data?: unknown[] })?.data
        if (Array.isArray(arr) && arr.length > 0) {
          const obj: Record<string, VersaoItem> = {}
          for (const v of arr) {
            const item = v as VersaoItem & { id_orcamento?: string | number }
            const key = String(item.id_orcamento ?? '')
            if (key) obj[key] = { ...item, id_orcamento: String(item.id_orcamento) } as VersaoItem
          }
          versoes.value = obj
        } else if (typeof abas === 'object' && abas !== null && !Array.isArray(abas) && Object.keys(abas as object).length > 0) {
          versoes.value = abas as Record<string, VersaoItem>
        }
      }
      if (Object.keys(versoes.value).length === 0 && budget.value) {
        const b = budget.value as { versoes?: Record<string, unknown> }
        if (b.versoes && typeof b.versoes === 'object') {
          versoes.value = b.versoes as Record<string, VersaoItem>
        }
      }
      // Mesclar valores recalculados (comissao, valor_comissao, etc.) para que o campo "Comissão sobre" no Cálculo orçamento não zere após @saved
      await refreshCalculoParaModal()
    } catch (e) {
      console.error(e)
    }
  }

  /** Versão com debounce para @handle-change e @refresh-budget (evita dezenas de GET /budget/show/:id em sequência). */
  const carregarOrcamentoDebounced = debounce(carregarOrcamento, 400)

  function setTotalOrcamento(total: number) {
    if (budget.value) (budget.value as Record<string, unknown>).total_orcamento = total
  }

  /** Recalcular total pelo back (ao entrar no orçamento ou quando HandsOnTable carrega grupos). Persiste se > 0. */
  async function recalcTotal() {
    const id = idOrcamento.value
    if (!id || !budget.value) return
    const t = await obterTotalRecalculado(id)
    if (t != null) {
      (budget.value as Record<string, unknown>).total_orcamento = t
      if (t > 0) Budget.updateBudget(id, budget.value as Record<string, unknown>).catch(() => {})
    }
  }

  /** Chaves do cálculo que a modal "Cálculo do Orçamento" exibe; ao abrir a modal e após carregar orçamento, mesclamos no budget. */
  const CALCULO_KEYS = [
    'subtotal',
    'subtotal2',
    'total_orcamento',
    'total_direto',
    'total_terceiros',
    'total_custo_interno',
    'total_criacao_planejamento',
    'valor_taxa_produtora',
    'valor_taxa_imposto',
    'valor_taxa_bv',
    'valor_comissao',
    'comissao',
    'desconto',
    'acrescimo',
  ] as const

  /** Atualiza o budget com os valores de cálculo (subtotal, subtotal2, total, etc.) do backend. Deve ser chamado ao abrir a modal "Cálculo do Orçamento". */
  async function refreshCalculoParaModal() {
    const id = idOrcamento.value
    if (!id || !budget.value) return
    const merge = (src: Record<string, unknown> | null | undefined) => {
      if (!src || typeof src !== 'object') return
      const dest = budget.value as Record<string, unknown>
      for (const key of CALCULO_KEYS) {
        if (Object.prototype.hasOwnProperty.call(src, key)) {
          const v = src[key]
          if (v !== undefined) dest[key] = v
        }
      }
    }
    try {
      const calcV2 = (await Budget.getBudgetCalculate(id)) as Record<string, unknown> & {
        data?: { budgetCalc?: Record<string, unknown> }
        budgetCalc?: Record<string, unknown>
      }
      const budgetCalc = calcV2?.data?.budgetCalc ?? calcV2?.budgetCalc ?? calcV2?.data ?? calcV2
      merge(budgetCalc as Record<string, unknown>)
      return
    } catch (_) {
      /* segue para fallback */
    }
    try {
      const calcV1 = (await Budget.getCalculoOrcamentoV1(id)) as Record<string, unknown> & { data?: Record<string, unknown> }
      const data = (calcV1?.data ?? calcV1) as Record<string, unknown>
      merge(data)
    } catch (_) {
      /* ignora */
    }
    try {
      const sub = (await Budget.getSubTotalBudget(id)) as Record<string, unknown>
      merge(sub)
    } catch (_) {
      /* ignora */
    }
  }

  return {
    route,
    idOrcamento,
    idProjetoIncentivado,
    loadingOrcamento,
    budget,
    versoes,
    showTable,
    recalcTotal,
    refreshCalculoParaModal,
    hideCopia,
    hideExportar,
    disabledStatus,
    habilitarBotaoObs,
    orcamentoNumero,
    orcamentoTotal,
    carregarOrcamento,
    carregarOrcamentoDebounced,
    setTotalOrcamento,
  }
}
