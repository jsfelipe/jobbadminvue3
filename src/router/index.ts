import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: '/signin',
    },
    // Rotas de autenticação
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/auth/signin.vue'),
      meta: {
        title: 'Acessar',
      },
    },
    {
      path: '/login',
      redirect: '/signin',
    },
    {
      path: '/esqueci-senha',
      name: 'EsqueciSenha',
      component: () => import('../views/auth/forgot-password.vue'),
      meta: {
        title: 'Esqueci a senha',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/auth/signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
    {
      path: '/logout',
      name: 'Logout',
      component: () => import('../views/auth/Logout.vue'),
      meta: {
        title: 'Sair',
      },
    },
    // Rotas do menu atual
    {
      path: '/admin',
      redirect: '/admin/overview',
    },
    {
      path: '/admin/overview',
      name: 'admin.overview',
      component: () => import('../views/Dashboard/Overview.vue'),
      meta: {
        title: 'Dashboard',
      },
    },
    {
      path: '/admin/stats',
      name: 'admin.stats',
      redirect: '/meu-perfil',
    },
    {
      path: '/admin/clientes',
      name: 'admin.clientes',
      component: () => import('../views/Cliente/Listar.vue'),
      meta: {
        title: 'Meus Clientes',
      },
    },
    {
      path: '/admin/clientes/boletos/:id',
      name: 'admin.clientes.boletos',
      component: () => import('../views/Cliente/Boletos.vue'),
      meta: {
        title: 'Boletos',
      },
    },
    {
      path: '/admin/clientes/dominio/:id',
      name: 'admin.clientes.dominio',
      component: () => import('../views/Cliente/Dominio.vue'),
      meta: {
        title: 'Domínio',
      },
    },
    {
      path: '/admin/clientes/notas/:id',
      name: 'admin.clientes.notas',
      component: () => import('../views/Cliente/NotasFiscais.vue'),
      meta: {
        title: 'Notas',
      },
    },
    {
      path: '/admin/clientes/alterar/:id',
      name: 'admin.clientes.alterar',
      component: () => import('../views/Cliente/Alterar.vue'),
      meta: {
        title: 'Alterar Cliente',
      },
    },
    {
      path: '/admin/desbloqueio',
      name: 'admin.desbloqueio',
      component: () => import('../views/Cliente/DesbloqueioListar.vue'),
      meta: {
        title: 'Desbloqueio',
      },
    },
    {
      path: '/admin/desbloqueio/alterar/:id',
      name: 'admin.desbloqueio.alterar',
      component: () => import('../views/Cliente/DesbloqueioAlterar.vue'),
      meta: {
        title: 'Alterar',
      },
    },
    {
      path: '/admin/extrato',
      name: 'admin.extrato',
      component: () => import('../views/Extrato/Listar.vue'),
      meta: {
        title: 'Extrato Mensal',
      },
    },
    {
      path: '/admin/usuarios',
      name: 'admin.usuarios',
      component: () => import('../views/Usuario/Listar.vue'),
      meta: {
        title: 'Usuários',
      },
    },
    {
      path: '/admin/usuarios/alterar/:id',
      name: 'admin.usuarios.alterar',
      component: () => import('../views/Usuario/Alterar.vue'),
      meta: {
        title: 'Alterar Usuário',
      },
    },
    {
      path: '/admin/query-database',
      name: 'admin.query-database',
      component: () => import('../views/QueryDatabase/QueryDatabase.vue'),
      meta: {
        title: 'Alterar Databases',
      },
    },
    {
      path: '/meu-perfil',
      name: 'MeuPerfil',
      component: () => import('../views/Others/Meu-perfil.vue'),
      meta: {
        title: 'Meu perfil',
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  const title = (to.meta.title as string) ?? 'Sistema Jobb- Admin'
  document.title = title ? `${title} | Sistema Jobb- Admin` : 'Sistema Jobb- Admin'
  next()
})
