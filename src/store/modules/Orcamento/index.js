import actions from './actions'
import mutations from './mutations'

const state = {
  orcamentos: [],
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
