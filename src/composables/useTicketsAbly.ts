import * as Ably from 'ably'
import Push from 'ably/push'
import { ref } from 'vue'
import { api } from '@/services/http'
import { TICKETS_ABLY_CHANNEL, TICKETS_ABLY_EVENT } from '@/constants/tickets-ably'
import { ticketsBus, type TicketRealtimePayload } from '@/lib/tickets-bus'
import { playTicketNotifySound, armTicketNotifyAudioOnUserGesture } from '@/utils/ticket-notify-sound'

export const ticketsAblyConnected = ref(false)

const ABLY_PUSH_ACTIVE_KEY = 'jobbadmin-ably-push-activated'

let client: Ably.Realtime | null = null

async function maybeResubscribeWebPush(): Promise<void> {
  if (typeof localStorage === 'undefined') {
    return
  }
  try {
    if (localStorage.getItem(ABLY_PUSH_ACTIVE_KEY) !== '1') {
      return
    }
  } catch {
    return
  }
  if (!client || client.connection.state !== 'connected') {
    return
  }
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return
  }
  try {
    await client.push.activate()
    await client.channels.get(TICKETS_ABLY_CHANNEL).push.subscribeClient()
    logAblyTickets('Web Push: re-inscrito no canal após conectar')
  } catch (e) {
    logAblyTickets('Web Push: re-inscrever falhou', e)
  }
}

/** Produção: localStorage.setItem('jobbadmin-tickets-ably-debug','1') e F5 */
export function ablyTicketsDebugEnabled(): boolean {
  if (import.meta.env.DEV) {
    return true
  }
  if (typeof localStorage === 'undefined') {
    return false
  }
  try {
    return localStorage.getItem('jobbadmin-tickets-ably-debug') === '1'
  } catch {
    return false
  }
}

function logAblyTickets(...args: unknown[]): void {
  if (!ablyTicketsDebugEnabled()) {
    return
  }
  console.log('[Ably tickets]', ...args)
}

function getPushServiceWorkerUrl(): string {
  if (typeof window === 'undefined') {
    return '/ably-push-sw.js'
  }
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.endsWith('/') ? base : `${base}/`
  return new URL('ably-push-sw.js', window.location.origin + normalized).pathname
}

function parseOptionalUnitField(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s.length > 0 ? s : null
}

function parseTicketRealtimePayload(raw: unknown): TicketRealtimePayload | null {
  let data: unknown = raw
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data) as unknown
    } catch {
      return null
    }
  }
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const type = o.type
  if (type !== 'ticket_created' && type !== 'client_reply') return null

  const tid = o.ticket_id
  let ticketId: number
  if (typeof tid === 'number' && Number.isFinite(tid)) {
    ticketId = Math.trunc(tid)
  } else if (typeof tid === 'string' && /^\d+$/.test(tid.trim())) {
    ticketId = parseInt(tid, 10)
  } else {
    return null
  }

  if (o.preview != null && typeof o.preview !== 'string') return null
  const preview = o.preview == null ? null : (o.preview as string)

  const created = o.created_at
  if (typeof created !== 'string' || created.length === 0) return null

  const titulo = o.titulo == null ? '' : String(o.titulo)

  return {
    type,
    ticket_id: ticketId,
    titulo,
    preview,
    unidade_nome: parseOptionalUnitField(o.unidade_nome),
    unidade_sigla: parseOptionalUnitField(o.unidade_sigla),
    created_at: created,
  }
}

export function connectTicketsAbly(): void {
  if (typeof window === 'undefined') return
  if (client) {
    logAblyTickets('connect ignorado: cliente já existe', client.connection.state)
    return
  }
  if (!localStorage.getItem('auth-jobb')) {
    logAblyTickets('connect ignorado: sem auth-jobb')
    return
  }

  logAblyTickets('iniciando conexão…')

  client = new Ably.Realtime({
    authCallback: (_tokenParams, callback) => {
      api
        .get<Ably.TokenRequest>('/ably/tickets-subscribe-token')
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
          logAblyTickets('token Ably falhou', msg)
          callback(msg, null)
        })
    },
    pushServiceWorkerUrl: getPushServiceWorkerUrl(),
    plugins: { Push },
  })

  client.connection.on('connected', () => {
    ticketsAblyConnected.value = true
    ticketsBus.emit('tickets:ably-connected', true)
    logAblyTickets('conectado', { state: client?.connection.state, id: client?.connection.id })
    armTicketNotifyAudioOnUserGesture()
    void maybeResubscribeWebPush()
  })

  const setDisconnected = (label: string) => () => {
    ticketsAblyConnected.value = false
    ticketsBus.emit('tickets:ably-connected', false)
    logAblyTickets(label, { state: client?.connection.state })
  }

  client.connection.on('disconnected', setDisconnected('desconectado'))
  client.connection.on('failed', setDisconnected('falhou'))
  client.connection.on('suspended', setDisconnected('suspenso'))

  const channel = client.channels.get(TICKETS_ABLY_CHANNEL)
  channel.subscribe((message) => {
    logAblyTickets('mensagem recebida', { name: message.name, data: message.data })
    if (message.name !== TICKETS_ABLY_EVENT) {
      logAblyTickets('ignorada: esperado evento', TICKETS_ABLY_EVENT, 'veio', message.name)
      return
    }
    const payload = parseTicketRealtimePayload(message.data)
    if (!payload) {
      logAblyTickets('mensagem ignorada (payload inválido)', message.data)
      return
    }
    logAblyTickets('emitindo tickets:realtime', payload)
    playTicketNotifySound()
    ticketsBus.emit('tickets:realtime', payload)
    ticketsBus.emit('tickets:pending-refresh')
  })
}

export async function activateAblyTicketsWebPush(): Promise<{ ok: boolean; message: string }> {
  if (!client) {
    return { ok: false, message: 'Cliente Ably indisponível. Aguarde a conexão.' }
  }
  if (client.connection.state !== 'connected') {
    return { ok: false, message: 'Aguarde o Ably conectar antes de ativar o push.' }
  }
  if (typeof Notification === 'undefined') {
    return { ok: false, message: 'Notificações não suportadas neste navegador.' }
  }
  if (!('serviceWorker' in navigator)) {
    return { ok: false, message: 'Service Worker não disponível.' }
  }
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') {
    return { ok: false, message: 'Permissão de notificação negada.' }
  }
  try {
    await client.push.activate()
    await client.channels.get(TICKETS_ABLY_CHANNEL).push.subscribeClient()
    try {
      localStorage.setItem(ABLY_PUSH_ACTIVE_KEY, '1')
    } catch {
      /* noop */
    }
    return { ok: true, message: 'Push Ably ativado (notificações com o site fechado).' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, message: msg }
  }
}

export async function disconnectTicketsAbly(options?: { deactivatePush?: boolean }): Promise<void> {
  const deactivatePush = options?.deactivatePush === true
  const hadClient = client !== null
  if (client) {
    logAblyTickets('encerrando cliente…')
    if (deactivatePush) {
      try {
        if (client.push) {
          await client.push.deactivate()
        }
      } catch {
        /* noop */
      }
      try {
        localStorage.removeItem(ABLY_PUSH_ACTIVE_KEY)
      } catch {
        /* noop */
      }
    }
    client.close()
    client = null
  }
  ticketsAblyConnected.value = false
  ticketsBus.emit('tickets:ably-connected', false)
  if (hadClient) {
    logAblyTickets('desconectado (disconnectTicketsAbly)')
  }
}
