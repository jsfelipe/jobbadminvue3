import { api } from '@/services/http'

const CACHE_PREFIX = 'dashboard_cache_'
const TTL_MS = 60 * 60 * 1000 // 1 hora

function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function setCached(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }))
  } catch (_) {}
}

function withCache(key, request) {
  return request().then((res) => {
    setCached(key, res.data)
    return res
  })
}

function cachedGet(key, url) {
  const cached = getCached(key)
  if (cached !== null) return Promise.resolve({ data: cached })
  return withCache(key, () => api.get(url))
}

/**
 * Serviços de dashboard para API jobbadmin (porta 8001).
 * Respostas em cache por 1 hora (localStorage).
 */
export const dashboardAdmin = {
  qtdclientes: () => cachedGet('qtdclientes', '/dashboard/qtdclientes'),

  qtdClientesAtivos: () => cachedGet('qtdClientesAtivos', '/dashboard/qtdclientesativos'),

  qtdLeadsMesAtual: () => cachedGet('qtdLeadsMesAtual', '/dashboard/qtdleadsmesatual'),

  graficoLeadsPorMes: () => cachedGet('graficoLeadsPorMes', '/dashboard/graficoleadspormes'),

  /** Detalhe leads por mês: ?mes=1&ano=2026. Sem cache. */
  leadsDetalheMes: (mes, ano) =>
    api.get('/dashboard/leads-detalhe-mes', { params: { mes, ano } }),

  amountVendasMes: () => cachedGet('amountVendasMes', '/dashboard/vendasmes'),

  graficoVendasMes: () => cachedGet('graficoVendasMes_v2', '/dashboard/graficoanual'),

  /** Top 20 lançamentos. ?mes=1&ano=2026. Sem cache. */
  topLancamentosFaturamento: (mes, ano) =>
    api.get('/dashboard/top-lancamentos-faturamento', { params: { mes, ano } }),

  setupAnual: () => cachedGet('setupAnual', '/dashboard/setupanual'),

  primeirasTransacoesAnual: () => cachedGet('primeirasTransacoesAnual', '/dashboard/primeiras-transacoes-anual'),

  primeirasTransacoesMesAtual: () =>
    cachedGet('primeirasTransacoesMesAtual', '/dashboard/primeiras-transacoes-mes-atual'),

  /** Detalhe por mês: ?mes=1&ano=2026. Sem cache. */
  primeirasTransacoesDetalheMes: (mes, ano) =>
    api.get('/dashboard/primeiras-transacoes-detalhe-mes', { params: { mes, ano } }),

  clientesSemUso: () => cachedGet('clientesSemUso', '/dashboard/clientes-sem-uso'),

  ticketMedio: () => cachedGet('ticketMedio', '/dashboard/ticket-medio'),

  churn: () => cachedGet('churn', '/dashboard/churn'),

  inadimplenciaMedia: () => cachedGet('inadimplenciaMedia', '/dashboard/inadimplencia-media'),

  crescimentoBase: () => cachedGet('crescimentoBase', '/dashboard/crescimento-base'),

  /** Paginado: ?page=1&per_page=10. Sem cache. */
  topClientesAcesso: (page = 1, per_page = 10) =>
    api.get('/dashboard/top-clientes-acesso', { params: { page, per_page } }),

  clientesRiscoAbandono: () => cachedGet('clientesRiscoAbandono', '/dashboard/clientes-risco-abandono')
}

/** Remove todo o cache do dashboard (para forçar nova carga da API). */
export function clearDashboardCache() {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(CACHE_PREFIX)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch (_) {}
}
