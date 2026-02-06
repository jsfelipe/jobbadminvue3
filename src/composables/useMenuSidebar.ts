import { ref, computed, onMounted, type Component } from 'vue'
import { useStore } from 'vuex'
import { getSidebarMenu, type SidebarMenuItemApi, type SidebarLinkItem } from '@/services/menu'
import {
  GridIcon,
  CalenderIcon,
  PageIcon,
  UserCircleIcon,
  PieChartIcon,
  SettingsIcon,
  BoxIcon,
  UserGroupIcon,
} from '@/icons'

/** Subitem do menu no formato do AppSidebar */
export interface MenuSubItem {
  name: string
  path: string
  pro?: boolean
}

/** Item do menu no formato do AppSidebar (com ícone como componente) */
export interface MenuItemWithIcon {
  icon: Component
  name: string
  path?: string
  subItems?: MenuSubItem[]
  requiresProfile?: number // Perfil necessário para exibir o item (ex: 1 = apenas admin)
}

/** Grupo do menu (título + itens) */
export interface MenuGroup {
  title: string
  items: MenuItemWithIcon[]
}

/** Mapeia ícone da API (string) para componente Vue. */
function iconFromApi(iconStr: string, itemName: string): Component {
  const lower = (iconStr || '').toLowerCase()
  const name = (itemName || '').toUpperCase()
  if (lower.includes('grid') || name === 'DASHBOARD') return GridIcon
  if (lower.includes('file') || lower.includes('landscape') || name === 'CADASTROS') return PageIcon
  if (lower.includes('user') || lower.includes('profile') || name === 'MEU PERFIL') return UserCircleIcon
  if (lower.includes('usergroup') || lower.includes('group') || name === 'MEUS CLIENTES' || name === 'CLIENTES') return UserGroupIcon
  if (lower.includes('chart') || lower.includes('pie') || name === 'RELATÓRIOS' || name === 'EXTRATO MENSAL' || name === 'RELATÓRIO') return PieChartIcon
  if (lower.includes('cog') || lower.includes('setting') || name === 'CONFIGURAÇÕES' || name === 'DESBLOQUEIO') return SettingsIcon
  if (lower.includes('box') || name === 'EQUIPAMENTOS' || name === 'EQUIPAMENTO') return BoxIcon
  return CalenderIcon
}

/** Mapeia paths retornados pela API para as rotas do Vue Router (jobbvue3). */
function normalizePathForRouter(apiPath: string | undefined | null): string {
  if (apiPath == null || typeof apiPath !== 'string' || !apiPath.trim()) return '/'
  const path = ('/' + apiPath.replace(/^\/*|\/*$/g, '').trim()).replace(/\/+/g, '/')
  const pathMap: Record<string, string> = {
    '/empresas/listar': '/unidades',
    '/pessoas/listar': '/pessoas',
    '/usuarios/listar': '/usuarios',
    '/permissoes/listar': '/permissoes',
    '/produtos/listar': '/produtos',
    '/servicos/listar': '/servicos',
    '/equipamento/listar': '/equipamento/listar',
    '/financeiro/lancamentos/listar': '/financeiro/lancamentos/listar',
    '/financeiro/contas-pagar/listar': '/financeiro/contas-pagar/listar',
    '/financeiro/contas-pagar/solicitacao': '/financeiro/contas-pagar/listar',
    '/financeiro/contas-receber/listar': '/contas-a-receber',
    '/financeiro/relacao-pagamento': '/relacao-de-pagamentos',
    '/financeiro/faturas': '/financeiro/faturas',
    '/financeiro/verba-producao': '/verba-de-producao',
    '/verba-producao': '/verba-de-producao',
    '/financeiro/plano-de-contas': '/financeiro/plano-contas',
    '/financeiro/contas-bancarias': '/financeiro/contas-bancarias',
    '/financeiro/centro-custos': '/financeiro/centro-custos',
    '/configuracoes/modelo-email/listar': '/configuracoes/modelo-email/listar',
    // Rotas do projeto Vue 2 (jobbadmin-vue)
    '/admin/overview': '/',
    '/admin/stats': '/meu-perfil',
    '/admin/clientes': '/admin/clientes',
    '/admin/desbloqueio': '/admin/desbloqueio',
    '/admin/extrato': '/admin/extrato',
    '/admin/relatorio': '/admin/relatorio',
    '/admin/usuarios': '/usuarios',
    '/admin/query-database': '/admin/query-database',
  }
  return pathMap[path] ?? path
}

/** Normaliza links da API (pode vir como array ou objeto com índices). */
function normalizeLinks(
  links: SidebarMenuItemApi['links']
): SidebarLinkItem[] {
  if (!links) return []
  if (Array.isArray(links)) return links
  if (typeof links === 'object' && links !== null) return Object.values(links)
  return []
}

/** Item fixo Dashboard (não retornado pela API; exibido para todos os usuários). */
const dashboardMenuItem: MenuItemWithIcon = {
  icon: GridIcon,
  name: 'Dashboard',
  path: '/',
}

/** Converte itens da API para o formato do AppSidebar (paths normalizados para o Vue Router). */
function mapApiItemsToMenuGroups(apiItems: SidebarMenuItemApi[]): MenuGroup[] {
  const itemsFromApi: MenuItemWithIcon[] = apiItems.map((api) => {
    const linksArray = normalizeLinks(api.links)
    const hasLinks = linksArray.length > 0
    const subItems: MenuSubItem[] | undefined = hasLinks
      ? linksArray.map((link) => ({
          name: link.name,
          path: normalizePathForRouter(link.path),
          pro: false,
        }))
      : undefined
    const topPath = api.path ? normalizePathForRouter(api.path) : undefined
    return {
      icon: iconFromApi(api.icon, api.name),
      name: api.name,
      path: hasLinks ? undefined : topPath,
      subItems,
    }
  })
  // Dashboard sempre como primeiro item do menu para todos os usuários
  const items = [dashboardMenuItem, ...itemsFromApi]
  return [{ title: 'Menu', items }]
}

/** Menu estático de fallback (quando API falha ou ainda não carregou) - igual ao projeto antigo */
const defaultMenuItems: MenuItemWithIcon[] = [
  { icon: GridIcon, name: 'Dashboard', path: '/admin/overview' },
  { icon: UserGroupIcon, name: 'Meus Clientes', path: '/admin/clientes' },
  { icon: SettingsIcon, name: 'Desbloqueio', path: '/admin/desbloqueio' },
  { icon: PieChartIcon, name: 'Extrato Mensal', path: '/admin/extrato' },
  { icon: SettingsIcon, name: 'Alterar Databases', path: '/admin/query-database', requiresProfile: 1 },
  { icon: UserCircleIcon, name: 'Usuário', path: '/admin/usuarios' },
]

const defaultMenuGroups: MenuGroup[] = [
  {
    title: 'Menu',
    items: defaultMenuItems,
  },
]

const loading = ref(false)
const apiMenuGroups = ref<MenuGroup[] | null>(null)
const idPlanoJobbGestor = ref<number | undefined>(undefined)


/**
 * Filtra itens do menu baseado no perfil do usuário (igual ao projeto antigo)
 */
function filterMenuByProfile(items: MenuItemWithIcon[], userProfile: number | null | undefined): MenuItemWithIcon[] {
  // Se não tem perfil definido, mostra todos os itens sem restrição
  // (igual ao projeto antigo: quando userProfile é null, mostra itens sem requiresProfile)
  if (userProfile === null || userProfile === undefined) {
    return items.filter(item => !item.requiresProfile)
  }
  // Se tem perfil, filtra baseado no requiresProfile
  return items.filter(item => {
    if (!item.requiresProfile) return true // Itens sem restrição sempre aparecem
    return userProfile === item.requiresProfile // Itens com restrição só aparecem se o perfil corresponder
  })
}

/**
 * Composável para carregar o menu lateral pela API (respeitando permissões).
 * Retorna menuGroups reativo: usa itens da API quando disponíveis, senão fallback estático.
 * Aplica filtro por perfil igual ao projeto antigo.
 */
export function useMenuSidebar() {
  const store = useStore()
  
  // Obtém o perfil do usuário do store (igual ao projeto antigo: id_perfil)
  const userProfile = computed(() => {
    const userData = store.state.Login?.data || {}
    return userData.id_perfil ?? userData.id_usuario_tipo ?? null
  })

  const menuGroups = computed<MenuGroup[]>(() => {
    let groups: MenuGroup[] = []
    
    if (apiMenuGroups.value && apiMenuGroups.value.length > 0) {
      groups = apiMenuGroups.value
    } else {
      groups = defaultMenuGroups
    }
    
    // Aplica filtro por perfil em cada grupo
    const filteredGroups = groups.map(group => {
      const filteredItems = filterMenuByProfile(group.items, userProfile.value)
      return {
        ...group,
        items: filteredItems,
      }
    })
    
    return filteredGroups
  })

  async function loadMenu() {
    loading.value = true
    apiMenuGroups.value = null
    try {
      const { items, idPlanoJobbGestor: idPlano } = await getSidebarMenu()
      apiMenuGroups.value = mapApiItemsToMenuGroups(items)
      idPlanoJobbGestor.value = idPlano
    } catch (err) {
      console.error('[useMenuSidebar] Erro ao carregar menu:', err)
      // Mantém fallback (defaultMenuGroups)
    } finally {
      loading.value = false
    }
  }

  // Inicializa com menu estático imediatamente
  // loadMenu será chamado quando necessário (mas não bloqueia a exibição do menu)

  return {
    menuGroups,
    loading,
    idPlanoJobbGestor,
    loadMenu,
  }
}
