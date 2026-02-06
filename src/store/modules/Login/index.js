import actions from './actions'
import mutations from './mutations'
import getters from './getters'

const state = {
  token: localStorage.getItem('auth-jobb') || null,
  data: null,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
