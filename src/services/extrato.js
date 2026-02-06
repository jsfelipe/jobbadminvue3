import { api } from '@/services/http'

/**
 * Serviços de extrato para API jobbadmin (porta 8001)
 */

export const extratoService = {
  filtrar: (from, to, tipo, usuario) => {
    return api.get('/extrato', {
      params: {
        period_from: from,
        period_to: to,
        plan_payment_method: tipo,
        usuario: usuario,
      },
    })
  },
}
