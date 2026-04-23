import * as Ably from 'ably'
import { ref } from 'vue'
import { api } from '@/services/http'
import {
  CHAT_ABLY_LOBBY_CHANNEL,
  CHAT_ABLY_LOBBY_EVENT,
  CHAT_ABLY_CONV_EVENT,
  chatConvChannelName,
} from '@/constants/chat-ably'
import { chatBus, type ChatLobbyPayload } from '@/lib/chat-bus'

export const chatAblyConnected = ref(false)

let client: Ably.Realtime | null = null

function parseLobbyData(raw: unknown): ChatLobbyPayload | null {
  let data: unknown = raw
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data) as unknown
    } catch {
      return null
    }
  }
  if (!data || typeof data !== 'object') {
    return null
  }
  return data as ChatLobbyPayload
}

export function connectChatAbly(): void {
  if (typeof window === 'undefined') {
    return
  }
  if (client) {
    return
  }
  if (!localStorage.getItem('auth-jobb')) {
    return
  }

  client = new Ably.Realtime({
    authCallback: (_tokenParams, callback) => {
      api
        .get<Ably.TokenRequest>('/ably/chat-subscribe-token')
        .then((res: { data: Ably.TokenRequest }) => {
          callback(null, res.data)
        })
        .catch((err: unknown) => {
          let msg = 'auth failed'
          if (typeof err === 'object' && err !== null && 'response' in err) {
            const r = (err as { response?: { data?: unknown } }).response?.data
            if (r && typeof r === 'object' && r !== null && 'error' in r) {
              msg = String((r as { error?: string }).error)
            } else if (err instanceof Error) {
              msg = err.message
            }
          } else if (err instanceof Error) {
            msg = err.message
          }
          callback(msg, null)
        })
    },
  })

  const lobbyCh = client.channels.get(CHAT_ABLY_LOBBY_CHANNEL)
  lobbyCh.subscribe(CHAT_ABLY_LOBBY_EVENT, (message) => {
    const payload = parseLobbyData(message.data)
    if (payload) {
      chatBus.emit('chat:lobby', payload)
      chatBus.emit('chat:unread-refresh')
    }
  })

  client.connection.on('connected', () => {
    chatAblyConnected.value = true
    chatBus.emit('chat:ably-connected', true)
  })

  const setDisconnected = () => {
    chatAblyConnected.value = false
    chatBus.emit('chat:ably-connected', false)
  }

  client.connection.on('disconnected', setDisconnected)
  client.connection.on('failed', setDisconnected)
  client.connection.on('suspended', setDisconnected)
}

export function disconnectChatAbly(): void {
  if (client) {
    client.close()
    client = null
  }
  chatAblyConnected.value = false
  chatBus.emit('chat:ably-connected', false)
}

export function subscribeConversationChannel(
  conversaId: number,
  onMessage: (raw: unknown) => void
): () => void {
  if (!client || client.connection.state !== 'connected') {
    return () => {
      /* noop */
    }
  }
  const name = chatConvChannelName(conversaId)
  const channel = client.channels.get(name)
  const handler = (message: { name?: string; data?: unknown }) => {
    if (message.name !== CHAT_ABLY_CONV_EVENT) {
      return
    }
    onMessage(message.data)
    chatBus.emit('chat:conv-message', { conversaId, raw: message.data })
  }
  channel.subscribe(CHAT_ABLY_CONV_EVENT, handler)
  return () => {
    channel.unsubscribe(CHAT_ABLY_CONV_EVENT, handler)
  }
}
