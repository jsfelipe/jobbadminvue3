import { api } from '@/services/http'

/**
 * Serviços de dashboard para API jobbadmin (porta 8001)
 */

export const dashboardAdmin = {
  qtdclientes: () => {
    return api.get('/dashboard/qtdclientes')
  },

  qtdClientesAtivos: () => {
    return api.get('/dashboard/qtdclientesativos')
  },

  qtdLeadsMesAtual: () => {
    return api.get('/dashboard/qtdleadsmesatual')
  },

  graficoLeadsPorMes: () => {
    return api.get('/dashboard/graficoleadspormes')
  },

  amountVendasMes: () => {
    return api.get('/dashboard/vendasmes')
  },

  graficoVendasMes: () => {
    return api.get('/dashboard/graficoanual')
  },

  setupAnual: () => {
    return api.get('/dashboard/setupanual')
  },

  primeirasTransacoesAnual: () => {
    return api.get('/dashboard/primeiras-transacoes-anual')
  },

  primeirasTransacoesMesAtual: () => {
    return api.get('/dashboard/primeiras-transacoes-mes-atual')
  },

  clientesSemUso: () => {
    return api.get('/dashboard/clientes-sem-uso')
  },

  ticketMedio: () => api.get('/dashboard/ticket-medio'),
  churn: () => api.get('/dashboard/churn'),
  crescimentoBase: () => api.get('/dashboard/crescimento-base'),
  topClientesAcesso: () => api.get('/dashboard/top-clientes-acesso'),
  clientesRiscoAbandono: () => api.get('/dashboard/clientes-risco-abandono')
}
