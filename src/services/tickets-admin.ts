import { api } from './http'

export const ticketsAdminService = {
  meta() {
    return api.get('/tickets/meta')
  },
  dashboard() {
    return api.get('/tickets/dashboard/resumo')
  },
  updates(since?: string) {
    return api.get('/tickets/updates', { params: { since } })
  },
  pendingSupportCount() {
    return api.get('/tickets/pending-support-count')
  },
  listar(params: Record<string, unknown>) {
    return api.get('/tickets', { params })
  },
  criar(payload: Record<string, unknown>) {
    return api.post('/tickets', payload)
  },
  detalhe(id: number) {
    return api.get(`/tickets/${id}`)
  },
  atualizar(id: number, payload: Record<string, unknown>) {
    return api.put(`/tickets/${id}`, payload)
  },
  responder(id: number, mensagem: string, interno = false) {
    return api.post(`/tickets/${id}/responder`, { mensagem, interno })
  },
  fechar(id: number) {
    return api.post(`/tickets/${id}/fechar`)
  },
  reabrir(id: number) {
    return api.post(`/tickets/${id}/reabrir`)
  },
  uploadAnexo(ticketId: number, file: File, idTicketResposta?: number | null) {
    const fd = new FormData()
    fd.append('arquivo', file)
    if (idTicketResposta != null) {
      fd.append('id_ticket_resposta', String(idTicketResposta))
    }
    return api.post(`/tickets/${ticketId}/anexos`, fd)
  },
  getAnexoDownloadUrl(ticketId: number, anexoId: number) {
    return api.get<{ url: string }>(`/tickets/${ticketId}/anexos/${anexoId}/download`)
  },
}
