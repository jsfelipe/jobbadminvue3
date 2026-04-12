const envChannel = import.meta.env.VITE_TICKETS_ABLY_CHANNEL
const envEvent = import.meta.env.VITE_TICKETS_ABLY_EVENT

/** Deve coincidir com ABLY_TICKETS_CHANNEL / ABLY event em config/ably.php */
export const TICKETS_ABLY_CHANNEL =
  typeof envChannel === 'string' && envChannel.length > 0 ? envChannel : 'jobbadmin'

export const TICKETS_ABLY_EVENT =
  typeof envEvent === 'string' && envEvent.length > 0 ? envEvent : 'ticket_event'
