const SET_WIDGETS = (state, widgets) => {
  state.widgets = widgets
}

const SET_WIDGET_TAMANHOS = (state, tamanhos) => {
  state.widgetTamanhos = tamanhos
}

const SET_RECEITAS_X_DESPESAS = (state, data) => {
  state.receitasXDespesas = data
}

export default {
  SET_WIDGETS,
  SET_WIDGET_TAMANHOS,
  SET_RECEITAS_X_DESPESAS,
}
