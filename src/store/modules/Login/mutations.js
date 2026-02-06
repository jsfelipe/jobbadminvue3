const SET_LOGIN = (state, token) => {
  state.token = token
}

const SET_DATA = (state, data) => {
  state.data = data
}

const SET_LOGOUT = (state) => {
  state.token = null
  state.data = null
}

export default {
  SET_LOGIN,
  SET_DATA,
  SET_LOGOUT,
}
