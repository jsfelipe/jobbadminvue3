import mitt from 'mitt'

export interface ChatLobbyPayload {
  type: string
  conversa_id?: number
  [key: string]: unknown
}

export type ChatBusEvents = {
  'chat:lobby': ChatLobbyPayload
  'chat:unread-refresh': void
  'chat:conv-message': { conversaId: number; raw: unknown }
  'chat:ably-connected': boolean
}

export const chatBus = mitt<ChatBusEvents>()
