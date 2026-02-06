import { api } from '@/services/http'

/** Item de link do menu retornado pela API (subitem) */
export interface SidebarLinkItem {
  name: string
  path: string
}

/** Item de menu retornado pela API (backend aplica permissões). links pode vir como array ou objeto com índices. */
export interface SidebarMenuItemApi {
  name: string
  icon: string
  path?: string
  links?: SidebarLinkItem[] | Record<string | number, SidebarLinkItem>
}

/** Resposta do endpoint GET /menu/sidebar */
export interface SidebarMenuResponse {
  data: SidebarMenuItemApi[]
  id_plano_jobbgestor?: number
}

/**
 * Obtém o menu lateral do usuário (itens filtrados por permissão no backend).
 * GET /menu/sidebar - Removido, usando menu estático do projeto antigo.
 */
export async function getSidebarMenu(): Promise<{
  items: SidebarMenuItemApi[]
  idPlanoJobbGestor?: number
}> {
  // Menu estático - não usa mais API V2
  return {
    items: [],
    idPlanoJobbGestor: undefined,
  }
}
