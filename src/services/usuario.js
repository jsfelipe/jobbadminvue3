import { api } from '@/services/http'

/**
 * Serviços de usuário para API jobbadmin (porta 8001)
 */

export const usuarioService = {
  listar: () => {
    return api.get('/users')
  },

  listarId: (id) => {
    return api.get(`/user/${id}`)
  },

  alterar: async (data) => {
    try {
      const response = await api.put(`/user/${data.id_usuarios}`, data)
      return { ...response, status: true }
    } catch (error) {
      return { ...error.response?.data, status: false }
    }
  },

  alterarMeuPerfil: async (data) => {
    try {
      const response = await api.put('/auth/me', data)
      return { ...response, status: true }
    } catch (error) {
      return { ...error.response?.data, status: false }
    }
  },
}
