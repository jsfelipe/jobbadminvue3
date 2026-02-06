import { api } from '@/services/http'

/**
 * Serviços de dashboard para API jobbadmin (porta 8001)
 */

export const dashboardAdmin = {
  qtdclientes: () => {
    return api.get('/dashboard/qtdclientes')
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
  }
}
