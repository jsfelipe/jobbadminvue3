import { createStore } from 'vuex'
import Login from './modules/Login'
import Perfil from './modules/Perfil'
import Permissoes from './modules/Permissoes'
import Dashboard from './modules/Dashboard'
import Orcamento from './modules/Orcamento'

export default createStore({
  modules: {
    Login,
    Perfil,
    Permissoes,
    Dashboard,
    Orcamento,
  },
})
