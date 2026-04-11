import axios from 'axios'

const apiBaseUrl =
  import.meta.env.VITE_API ||
  (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:8001/api')

const portalApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000,
})

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-portal')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const ticketsPortalService = {
  exchange(handoffToken: string) {
    return portalApi.post('/auth/handoff/exchange', { token: handoffToken })
  },
  me() {
    return portalApi.get('/portal/tickets/me')
  },
  meta() {
    return portalApi.get('/portal/tickets/meta')
  },
  listar(params: Record<string, unknown>) {
    return portalApi.get('/portal/tickets', { params })
  },
  criar(payload: Record<string, unknown>) {
    return portalApi.post('/portal/tickets', payload)
  },
  detalhe(id: number) {
    return portalApi.get(`/portal/tickets/${id}`)
  },
  responder(id: number, mensagem: string) {
    return portalApi.post(`/portal/tickets/${id}/responder`, { mensagem })
  },
  uploadAnexo(ticketId: number, file: File, idTicketResposta?: number | null) {
    const fd = new FormData()
    fd.append('arquivo', file)
    if (idTicketResposta != null) {
      fd.append('id_ticket_resposta', String(idTicketResposta))
    }
    return portalApi.post(`/portal/tickets/${ticketId}/anexos`, fd)
  },
  getAnexoDownloadUrl(ticketId: number, anexoId: number) {
    return portalApi.get<{ url: string }>(`/portal/tickets/${ticketId}/anexos/${anexoId}/download`)
  },
}
