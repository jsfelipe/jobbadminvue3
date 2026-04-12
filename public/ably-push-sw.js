/* global self, clients */
self.addEventListener('push', (event) => {
  const fallbackTitle = 'Jobb Admin'
  const fallbackBody = 'Nova atividade em tickets.'

  if (!event.data) {
    event.waitUntil(
      self.registration.showNotification(fallbackTitle, {
        body: fallbackBody,
        tag: 'jobb-ticket',
        data: { path: '/admin/tickets' },
      })
    )
    return
  }

  let raw = {}
  try {
    raw = event.data.json()
  } catch {
    try {
      const t = event.data.text()
      raw = t ? JSON.parse(t) : {}
    } catch {
      raw = {}
    }
  }

  const notification = raw.notification && typeof raw.notification === 'object' ? raw.notification : raw
  const title =
    (notification && typeof notification.title === 'string' && notification.title) ||
    (typeof raw.title === 'string' && raw.title) ||
    fallbackTitle
  const body =
    (notification && typeof notification.body === 'string' && notification.body) ||
    (typeof raw.body === 'string' && raw.body) ||
    fallbackBody

  const notifData =
    notification && typeof notification.data === 'object' && notification.data !== null ? notification.data : {}
  const rawData = typeof raw.data === 'object' && raw.data !== null ? raw.data : {}
  const data = { ...notifData, ...rawData }

  const ticketId = data.ticket_id != null ? String(data.ticket_id) : '0'
  const options = {
    body,
    icon: notification.icon,
    badge: notification.badge,
    tag:
      (typeof notification.tag === 'string' && notification.tag) ||
      `jobb-ticket-${ticketId}`,
    data: {
      ...data,
      path: typeof data.path === 'string' && data.path.length > 0 ? data.path : '/admin/tickets',
    },
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const d = event.notification.data || {}
  const path = typeof d.path === 'string' && d.path.length > 0 ? d.path : '/admin/tickets'
  const url = new URL(path, self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const c = clientList[i]
        if (c.url.startsWith(self.location.origin) && 'focus' in c) {
          return c.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
      return undefined
    })
  )
})
