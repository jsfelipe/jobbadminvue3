const get = (state) => (key) => {
  return state.data?.[key]
}

export default {
  get,
}
