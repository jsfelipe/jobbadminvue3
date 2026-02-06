import actions from './actions'
import mutations from './mutations'

const state = {
  widgets: [],
  widgetTamanhos: {},
  receitasXDespesas: null,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
