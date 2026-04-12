import mitt from 'mitt'

export interface TicketRealtimePayload {
  type: 'ticket_created' | 'client_reply'
  ticket_id: number
  titulo: string
  preview: string | null
  unidade_nome: string | null
  unidade_sigla: string | null
  created_at: string
}

export type TicketsBusEvents = {
  'tickets:pending-refresh': void
  'tickets:realtime': TicketRealtimePayload
  'tickets:ably-connected': boolean
}

export const ticketsBus = mitt<TicketsBusEvents>()
