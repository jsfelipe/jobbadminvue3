import actions from './actions'
import mutations from './mutations'

const state = {
  permissoesUsuario: [],
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
