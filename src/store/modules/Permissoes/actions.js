import { api } from '@/services/http'

const listarPermissaoUsuario = async ({ commit }, user) => {
  try {
    const response = await api.get(`/permissoes/usuario/${user.id_usuario || user.id}`)
    commit('SET_PERMISSOES_USUARIO', response.data || [])
    return response.data
  } catch (error) {
    console.error('Erro ao listar permissões do usuário:', error)
    return []
  }
}

export default {
  listarPermissaoUsuario,
}
