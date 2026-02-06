import { api } from '@/services/http'

const listarOrcamentoPublicitario = async ({ commit }, params) => {
  try {
    const response = await api.get('/orcamentos/publicitario', { params })
    commit('SET_ORCAMENTOS', response.data || [])
    return response.data
  } catch (error) {
    console.error('Erro ao listar orçamentos publicitários:', error)
    return []
  }
}

export default {
  listarOrcamentoPublicitario,
}
