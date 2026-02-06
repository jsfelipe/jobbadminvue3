import actions from './actions'
import mutations from './mutations'

const state = {
  permissoesUsuarios: [],
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
