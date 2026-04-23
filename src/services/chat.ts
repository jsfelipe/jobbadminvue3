import { api } from './http'

export interface ChatConversaRow {
  id: number
  id_cliente_jobbadmin: number
  nome_usuario: string
  email: string
  unidade_nome: string | null
  unidade_sigla: string | null
  status: string
  last_message_at: string | null
  last_message_preview: string | null
  unread_count_atendente: number
  id_atendente_responsavel: number | null
  nome_atendente: string | null
}

export interface ChatMensagemRow {
  id: number
  id_conversa: number
  remetente_tipo: string
  id_remetente: number | null
  nome_remetente: string | null
  mensagem: string | null
  tem_anexo: boolean
  anexos: Array<{
    id: number
    nome_original: string
    mime: string
    tamanho_bytes: number
  }>
  created_at: string | null
}

export const chatService = {
  unreadCount() {
    return api.get<{ count: number }>('/chat/unread-count')
  },
  listar(params: Record<string, string | number | undefined>) {
    return api.get<{
      data: ChatConversaRow[]
      current_page: number
      last_page: number
      per_page: number
      total: number
    }>('/chat/conversas', { params })
  },
  detalhe(id: number) {
    return api.get<ChatConversaRow>(`/chat/conversas/${id}`)
  },
  mensagens(id: number, params: { page?: number; per_page?: number }) {
    return api.get<{
      data: ChatMensagemRow[]
      current_page: number
      last_page: number
      per_page: number
      total: number
    }>(`/chat/conversas/${id}/mensagens`, { params })
  },
  responder(id: number, mensagem: string) {
    return api.post<ChatMensagemRow>(`/chat/conversas/${id}/mensagens`, { mensagem })
  },
  uploadAnexo(id: number, file: File, mensagem?: string) {
    const fd = new FormData()
    fd.append('arquivo', file)
    if (mensagem != null && mensagem !== '') {
      fd.append('mensagem', mensagem)
    }
    return api.post<{ mensagem: ChatMensagemRow }>(`/chat/conversas/${id}/anexos`, fd)
  },
  getAnexoDownloadUrl(conversaId: number, anexoId: number) {
    return api.get<{ url: string }>(`/chat/conversas/${conversaId}/anexos/${anexoId}/download`)
  },
  assumir(id: number) {
    return api.post<ChatConversaRow>(`/chat/conversas/${id}/assumir`)
  },
  marcarLida(id: number) {
    return api.post<{ ok: boolean }>(`/chat/conversas/${id}/ler`)
  },
  fechar(id: number) {
    return api.post<ChatConversaRow>(`/chat/conversas/${id}/fechar`)
  },
}
