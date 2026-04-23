const envLobby = import.meta.env.VITE_CHAT_ABLY_LOBBY_CHANNEL
const envLobbyEv = import.meta.env.VITE_CHAT_ABLY_LOBBY_EVENT
const envConvEv = import.meta.env.VITE_CHAT_ABLY_CONV_EVENT
const envPrefix = import.meta.env.VITE_CHAT_ABLY_CONV_PREFIX

export const CHAT_ABLY_LOBBY_CHANNEL =
  typeof envLobby === 'string' && envLobby.length > 0 ? envLobby : 'chat:admin:lobby'

export const CHAT_ABLY_LOBBY_EVENT =
  typeof envLobbyEv === 'string' && envLobbyEv.length > 0 ? envLobbyEv : 'chat_lobby_event'

export const CHAT_ABLY_CONV_EVENT =
  typeof envConvEv === 'string' && envConvEv.length > 0 ? envConvEv : 'chat_conv_event'

const rawPrefix =
  typeof envPrefix === 'string' && envPrefix.length > 0 ? envPrefix : 'chat:conv:'
export const CHAT_ABLY_CONV_PREFIX = rawPrefix.endsWith(':') ? rawPrefix : `${rawPrefix}:`

export function chatConvChannelName(conversaId: number): string {
  return `${CHAT_ABLY_CONV_PREFIX}${conversaId}`
}
