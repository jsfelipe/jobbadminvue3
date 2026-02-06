import { api, apiV2 } from '@/services/http'

/**
 * Lista widgets do usuário por perfil (API v1).
 * @param {{ id_perfil?: number|string, removeCommit?: boolean }} params
 * @returns {Promise<object[]>}
 */
export function getWidgets(params = {}) {
  return api.get('/widget/', { params }).then((r) => r.data?.data ?? []).catch((err) => Promise.reject(err?.response ?? err))
}

/**
 * Atualiza widget (habilitar/desabilitar, ordem, principal) (API v1).
 * @param {{ id: number, id_perfil: number|string, habilitar?: boolean, ordem?: number, principal?: boolean, receita_despesa?: boolean }} params
 */
export function editWidgets(params) {
  return api.put('/widget/', params).then((r) => r.data?.data).catch((err) => Promise.reject(err?.response ?? err))
}

/**
 * Atualiza a ordem de todos os widgets do perfil em uma única requisição (API v1).
 * @param {{ id_perfil: number|string, ordem: Array<{ id: number, ordem: number }> }} params
 */
export function editWidgetsOrdemLote(params) {
  return api
    .put('/widget/ordem', params)
    .then((r) => r.data)
    .catch((err) => Promise.reject(err?.response ?? err))
}

/**
 * Dados Receitas x Despesas por mês (API v2).
 * @returns {Promise<{ receitas: Record<string, string>, despesas: Record<string, string> }>}
 */
export function getChartsExpenseRevenue() {
  return apiV2.get('/charts/dashboard-expense-revenue').then((r) => r.data?.data ?? { receitas: {}, despesas: {} }).catch((err) => Promise.reject(err?.response ?? err))
}

/**
 * Faturamento mensal (API v2).
 * @returns {Promise<number[]>}
 */
export function getChartsDashboardRevenue() {
  return apiV2.get('/charts/dashboard-revenue').then((r) => r.data?.revenues ?? []).catch((err) => Promise.reject(err?.response ?? err))
}

/**
 * Atualiza a ordem dos widgets em lote (API v2).
 * @param {{ id_perfil: number|string, widget_ids: number[] }} params
 * @returns {Promise<{ msg: string }>}
 */
export function updateWidgetsLayout(params) {
  return apiV2
    .put('/dashboard/widgets/layout', params)
    .then((r) => r.data)
    .catch((err) => Promise.reject(err?.response ?? err))
}

/**
 * Retorna os tamanhos por widget escolhidos pelo usuário (API v2).
 * @param {{ id_perfil: number|string }} params
 * @returns {Promise<Record<number, string>>} id_widget => PEQUENO|METADE|MEDIO|GRANDE
 */
export function getWidgetTamanhos(params) {
  return apiV2
    .get('/dashboard/widgets/tamanhos', { params })
    .then((r) => r.data?.data ?? {})
    .catch((err) => Promise.reject(err?.response ?? err))
}

/**
 * Salva os tamanhos dos widgets para o perfil (API v2).
 * @param {{ id_perfil: number|string, tamanhos: Record<number, string> }} params - id_widget => PEQUENO|METADE|MEDIO|GRANDE
 * @returns {Promise<{ msg: string }>}
 */
export function updateWidgetTamanhos(params) {
  return apiV2
    .put('/dashboard/widgets/tamanhos', params)
    .then((r) => r.data)
    .catch((err) => Promise.reject(err?.response ?? err))
}
