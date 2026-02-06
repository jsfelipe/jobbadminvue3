import { api } from '@/services/http'

const listarPermissoesUsuarios = async ({ commit }, idUsuarioTipo) => {
  try {
    const response = await api.get(`/perfil/permissoes-usuarios/${idUsuarioTipo}`)
    commit('SET_PERMISSOES_USUARIOS', response.data || [])
    return response.data
  } catch (error) {
    console.error('Erro ao listar permissões de usuários:', error)
    return []
  }
}

export default {
  listarPermissoesUsuarios,
}
