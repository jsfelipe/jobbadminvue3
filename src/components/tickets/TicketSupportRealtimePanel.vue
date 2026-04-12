<template>
  <div
    v-show="panelVisible"
    class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
  >
    <div
      class="pointer-events-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
    >
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-700">
        <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">Tickets</span>
        <div class="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
          <button
            v-if="setupComplete"
            type="button"
            class="text-xs text-gray-500 hover:underline dark:text-gray-400"
            @click="ocultarPainel"
          >
            Ocultar
          </button>
          <button
            type="button"
            class="text-xs text-blue-600 hover:underline dark:text-blue-400"
            @click="requestDesktopNotifications"
          >
            {{ notifyButtonLabel }}
          </button>
          <button
            type="button"
            class="text-xs text-violet-600 hover:underline dark:text-violet-400"
            @click="onAblyPushClick"
          >
            Push Ably (site fechado)
          </button>
        </div>
      </div>
      <p v-if="ablyPushFeedback" class="px-3 pt-1 text-[10px] text-gray-600 dark:text-gray-300">
        {{ ablyPushFeedback }}
      </p>
      <p
        v-if="!setupComplete"
        class="px-3 pb-2 pt-1 text-[10px] leading-tight text-gray-500 dark:text-gray-400"
      >
        Ative &quot;Push Ably&quot; após configurar Push no dashboard Ably (namespace do canal). Com isso, o navegador pode avisar mesmo com o site fechado.
      </p>
      <div v-if="items.length === 0" class="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
        Nenhum alerta recente
      </div>
      <ul v-else class="max-h-[70vh] overflow-y-auto">
        <li
          v-for="item in items"
          :key="item.key"
          class="border-t border-gray-100 first:border-t-0 dark:border-gray-700"
        >
          <button
            type="button"
            class="flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-sm"
            @click="toggle(item.key)"
          >
            <span>
              <span class="font-medium text-gray-900 dark:text-gray-100">{{
                labelTipo(item.payload.type)
              }}</span>
              <span class="mt-0.5 block text-xs text-gray-600 dark:text-gray-300">{{
                item.payload.titulo
              }}</span>
              <span class="mt-0.5 block text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                {{ unidadeLabel(item.payload) }} · {{ formatDataHora(item.payload.created_at) }}
              </span>
            </span>
            <span class="shrink-0 text-gray-400">{{ item.expanded ? '▲' : '▼' }}</span>
          </button>
          <div
            v-show="item.expanded"
            class="border-t border-gray-50 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50"
          >
            <p v-if="item.payload.preview" class="mb-2 whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300">
              {{ item.payload.preview }}
            </p>
            <router-link
              :to="`/admin/tickets/${item.payload.ticket_id}`"
              class="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              @click="remove(item.key)"
            >
              Abrir ticket
            </router-link>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ticketsBus, type TicketRealtimePayload } from '@/lib/tickets-bus'
import { activateAblyTicketsWebPush } from '@/composables/useTicketsAbly'

const STORAGE_SETUP = 'tickets-support-panel-setup-v1'

interface StackItem {
  key: string
  expanded: boolean
  payload: TicketRealtimePayload
}

function readSetupComplete(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (localStorage.getItem(STORAGE_SETUP) === '1') return true
  } catch {
    /* noop */
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') return true
  return false
}

const setupComplete = ref(readSetupComplete())
const panelVisible = ref(!setupComplete.value)
const items = ref<StackItem[]>([])
const ablyPushFeedback = ref('')
let hideAfterAblyOkTimer: ReturnType<typeof setTimeout> | null = null

function persistSetupComplete(): void {
  if (setupComplete.value) {
    panelVisible.value = false
    return
  }
  setupComplete.value = true
  try {
    localStorage.setItem(STORAGE_SETUP, '1')
  } catch {
    /* noop */
  }
  panelVisible.value = false
}

function ocultarPainel(): void {
  panelVisible.value = false
}

const notifyButtonLabel = computed(() => {
  if (typeof Notification === 'undefined') return 'Alertas indisponíveis'
  if (Notification.permission === 'granted') return 'Alertas ativos'
  if (Notification.permission === 'denied') return 'Alertas bloqueados'
  return 'Ativar alertas do navegador'
})

function labelTipo(t: TicketRealtimePayload['type']): string {
  return t === 'ticket_created' ? 'Novo ticket' : 'Resposta do cliente'
}

function unidadeLabel(p: TicketRealtimePayload): string {
  const n = p.unidade_nome?.trim()
  const s = p.unidade_sigla?.trim()
  if (n && s) return `${n} (${s})`
  if (n) return n
  if (s) return s
  return '—'
}

function formatDataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function maybeDesktopNotify(payload: TicketRealtimePayload): void {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  if (!document.hidden) return
  const title = labelTipo(payload.type)
  const unit = unidadeLabel(payload)
  const unitLine = unit !== '—' ? `${unit} · ` : ''
  const body =
    payload.preview && payload.preview.length > 0
      ? `${unitLine}${payload.titulo} — ${payload.preview}`
      : `${unitLine}${payload.titulo}`
  try {
    const n = new Notification(title, { body, tag: `ticket-${payload.ticket_id}` })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    /* noop */
  }
}

async function requestDesktopNotifications(): Promise<void> {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'denied') return
  try {
    await Notification.requestPermission()
    if (Notification.permission === 'granted') {
      persistSetupComplete()
    }
  } catch {
    /* noop */
  }
}

async function onAblyPushClick(): Promise<void> {
  if (hideAfterAblyOkTimer !== null) {
    clearTimeout(hideAfterAblyOkTimer)
    hideAfterAblyOkTimer = null
  }
  ablyPushFeedback.value = ''
  const r = await activateAblyTicketsWebPush()
  ablyPushFeedback.value = r.message
  if (r.ok) {
    hideAfterAblyOkTimer = setTimeout(() => {
      persistSetupComplete()
      hideAfterAblyOkTimer = null
    }, 2200)
  }
}

function toggle(key: string): void {
  const row = items.value.find((i) => i.key === key)
  if (row) row.expanded = !row.expanded
}

function remove(key: string): void {
  items.value = items.value.filter((i) => i.key !== key)
}

function pushPayload(payload: TicketRealtimePayload): void {
  maybeDesktopNotify(payload)
  panelVisible.value = true
  const key = `${Date.now()}-${payload.ticket_id}`
  items.value = [{ key, expanded: false, payload }, ...items.value].slice(0, 8)
}

const onRealtime = (payload: TicketRealtimePayload) => {
  pushPayload(payload)
}

onMounted(() => {
  if (readSetupComplete()) {
    setupComplete.value = true
    try {
      localStorage.setItem(STORAGE_SETUP, '1')
    } catch {
      /* noop */
    }
    panelVisible.value = false
  }
  ticketsBus.on('tickets:realtime', onRealtime)
})

onUnmounted(() => {
  if (hideAfterAblyOkTimer !== null) {
    clearTimeout(hideAfterAblyOkTimer)
  }
  ticketsBus.off('tickets:realtime', onRealtime)
})
</script>
