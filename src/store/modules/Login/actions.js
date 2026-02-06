import { api } from '@/services/http'

const doLogin = async ({ commit }, params) => {
  try {
    const response = await api.post('/auth/login', {
      email: params.email,
      password: params.password,
    })
    if (!response.data || !response.data.token) throw response
    const token = response.data.token
    localStorage.setItem('auth-jobb', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    commit('SET_LOGIN', token)
    return response.data
  } catch (error) {
    console.error('Erro no login:', error)
    throw error
  }
}

const me = async ({ commit, state: { token } }) => {
  try {
    const response = await api.get('/auth/me')
    const userData = response.data?.data || response.data?.user || response.data
    if (!userData) {
      throw new Error('Resposta do servidor não contém dados do usuário')
    }
    commit('SET_DATA', userData)
    return Promise.resolve(userData)
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    throw error
  }
}

const doLogout = ({ commit }) => {
  localStorage.removeItem('auth-jobb')
  delete api.defaults.headers.common['Authorization']
  commit('SET_LOGOUT')
}

export default {
  doLogin,
  me,
  doLogout,
}
