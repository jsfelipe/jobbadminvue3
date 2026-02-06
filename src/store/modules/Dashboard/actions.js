import { api } from '@/services/http'

const getWidgets = async ({ commit }, params) => {
  try {
    const response = await api.get('/dashboard/widgets', { params })
    commit('SET_WIDGETS', response.data || [])
    return response.data
  } catch (error) {
    console.error('Erro ao buscar widgets:', error)
    return []
  }
}

const getWidgetTamanhos = async ({ commit }, idPerfil) => {
  try {
    const response = await api.get(`/dashboard/widget-tamanhos/${idPerfil}`)
    commit('SET_WIDGET_TAMANHOS', response.data || {})
    return response.data
  } catch (error) {
    console.error('Erro ao buscar tamanhos de widgets:', error)
    return {}
  }
}

const updateWidgetTamanhos = async ({ commit }, params) => {
  try {
    const response = await api.put('/dashboard/widget-tamanhos', params)
    commit('SET_WIDGET_TAMANHOS', response.data || {})
    return response.data
  } catch (error) {
    console.error('Erro ao atualizar tamanhos de widgets:', error)
    throw error
  }
}

const editWidgets = async ({ commit }, params) => {
  try {
    const response = await api.put('/dashboard/widgets', params)
    commit('SET_WIDGETS', response.data || [])
    return response.data
  } catch (error) {
    console.error('Erro ao editar widgets:', error)
    throw error
  }
}

const getDataReceitasXDespesas = async ({ commit }) => {
  try {
    const response = await api.get('/dashboard/receitas-x-despesas')
    commit('SET_RECEITAS_X_DESPESAS', response.data)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar receitas x despesas:', error)
    return null
  }
}

export default {
  getWidgets,
  getWidgetTamanhos,
  updateWidgetTamanhos,
  editWidgets,
  getDataReceitasXDespesas,
}
