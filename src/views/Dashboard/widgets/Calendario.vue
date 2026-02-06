<template>
  <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-800 dark:text-white">{{ widget?.nome }}</h3>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Configurações Google"
          @click="modalGoogleCalendar = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Atualizar"
          @click="changeIdcalendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <div class="calendar-wrap min-h-[240px] w-full max-w-full">
      <Calendar
        :attributes="attributes"
        :columns="calendarColumns"
        expanded
        title-position="left"
        :first-day-of-week="0"
        @dayclick="dayClicked"
      />
    </div>

    <!-- Modal Config Google -->
    <Teleport to="body">
      <div
        v-if="modalGoogleCalendar"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="modalGoogleCalendar = false"
      >
        <div
          class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          @click.stop
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Configurações do Google Calendar</h3>
          <p v-if="!logadoGoogleCalendar" class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Para integrar sua agenda do Google ao Jobb, clique no botão abaixo. Uma janela abrirá para você autorizar o Jobb.
            <strong class="block mt-1">Sua senha ou dados não são salvos em nosso banco.</strong>
          </p>
          <div class="mb-4">
            <button
              v-if="logadoGoogleCalendar"
              type="button"
              class="flex items-center gap-2 rounded-lg bg-[#3366D6] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              @click="logoutGcalendarApi"
            >
              <img :src="googleBtnPressedUrl" alt="" class="h-8 w-8" onerror="this.style.display='none'" />
              Sair da Conta Google
            </button>
            <button
              v-else
              type="button"
              class="flex items-center gap-2 rounded-lg bg-[#3366D6] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              @click="logarGoogleCalendar"
            >
              <img :src="googleBtnNormalUrl" alt="" class="h-8 w-8" onerror="this.style.display='none'" />
              Entrar com Google
            </button>
          </div>
          <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Agenda Google exibida no Jobb:</p>
          <div v-if="logadoGoogleCalendar && calendarList.length > 0" class="flex flex-wrap items-center gap-2">
            <select
              v-model="calendarId"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="lock"
              @change="changeIdcalendar"
            >
              <option value="">— Sem agenda google —</option>
              <option v-for="cal in calendarList" :key="cal.id" :value="cal.id">{{ cal.summary }}</option>
            </select>
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              :title="lock ? 'Desbloquear' : 'Bloquear'"
              @click="lock = !lock"
            >
              <svg v-if="lock" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              @click="modalGoogleCalendar = false"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Evento (criar/editar Google) -->
    <Teleport to="body">
      <div
        v-if="cadastrarEvento"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModalEvento"
      >
        <div
          class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          @click.stop
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{{ eventIdToEdit ? 'Editar evento' : 'Novo evento' }}</h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
              <input
                v-model="formTarefa.titulo"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Título"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
              <input
                v-model="formTarefa.descricao"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Descrição"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Início (data)</label>
                <input
                  v-model="formTarefa.dataInicioStr"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Hora início</label>
                <input
                  v-model="formTarefa.tempoInicio"
                  type="time"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Fim (data)</label>
                <input
                  v-model="formTarefa.dataFimStr"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Hora fim</label>
                <input
                  v-model="formTarefa.tempoFinal"
                  type="time"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              @click="closeModalEvento"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              @click="eventIdToEdit ? editEvent() : cadastrar()"
            >
              {{ eventIdToEdit ? 'Salvar alterações' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { Calendar } from 'v-calendar'
import 'v-calendar/style.css'
import { api } from '@/services/http'
import { popupwindow } from '@/components/Jobb/Utils/Util.js'

interface Widget {
  nome?: string
  linkData?: string
  [key: string]: unknown
}

interface CalendarItem {
  id: string
  summary?: string
}

interface ApiCalendarEvent {
  id?: string
  bar?: { class?: string; color?: string }
  dates: { start: string; end: string }
  popover?: { label?: string }
  description?: string
}

interface TarefaItem {
  start: string
  end: string
  title: string
}

const props = defineProps<{
  widget: Widget
}>()

// URLs dos ícones Google (public) – uso de variável evita que o Vite trate como import
const googleBtnPressedUrl = '/images/btn_google_light_pressed_ios.svg'
const googleBtnNormalUrl = '/images/btn_google_light_normal_ios.svg'

const store = useStore()
const modalGoogleCalendar = ref(false)
const cadastrarEvento = ref(false)
const logadoGoogleCalendar = ref(false)
const calendarList = ref<CalendarItem[]>([])
const calendarId = ref('')
const lock = ref(true)
const tarefas = ref<TarefaItem[]>([])
const googleEvents = ref<ApiCalendarEvent[]>([])
const eventIdToEdit = ref<string | null>(null)
const intervalGcalendar = ref<ReturnType<typeof setInterval>[]>([])

const formTarefa = reactive({
  titulo: '',
  descricao: '',
  dataInicioStr: '',
  dataFimStr: '',
  tempoInicio: '09:00',
  tempoFinal: '18:00',
  eventId: '',
})

function getLoginId(): number | undefined {
  const data = store.state.Login?.data
  return data?.id_usuario ?? data?.id
}

// Colunas responsivas: 4 → 3 → 2 → 1 conforme largura (como no antigo com $screens)
const calendarColumns = ref(4)
function updateColumns() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280
  if (w >= 1280) calendarColumns.value = 4
  else if (w >= 1024) calendarColumns.value = 3
  else if (w >= 768) calendarColumns.value = 2
  else calendarColumns.value = 1
}

// Atributos no formato v-calendar: bar (cor), dates, popover
interface VCalendarAttr {
  key: string
  bar: string | { color?: string }
  dates: { start: Date | string; end: Date | string }
  popover?: { label?: string }
  customData?: { id?: string; description?: string; source?: string }
}
const attributes = computed<VCalendarAttr[]>(() => {
  const list: VCalendarAttr[] = []
  const cores = ['blue', 'red', 'purple']
  tarefas.value.forEach((t, i) => {
    list.push({
      key: `jobb-${i}-${t.start}`,
      bar: cores[i % 3],
      dates: { start: t.start, end: t.end },
      popover: { label: t.title ?? 'Tarefa' },
      customData: { source: 'jobb' },
    })
  })
  googleEvents.value.forEach((ev, i) => {
    const start = ev.dates?.start ?? ''
    const end = ev.dates?.end ?? start
    list.push({
      key: ev.id ?? `google-${i}-${start}`,
      bar: (ev.bar?.color as string) ?? 'blue',
      dates: { start, end },
      popover: { label: ev.popover?.label ?? ev.description ?? 'Evento' },
      customData: { id: ev.id, description: ev.description, source: 'google' },
    })
  })
  return list
})

function dayClicked(day: { date: Date; attributes?: Array<{ key: string; customData?: { id?: string; source?: string } }> }) {
  const d = day.date
  formTarefa.dataInicioStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  formTarefa.dataFimStr = formTarefa.dataInicioStr
  formTarefa.titulo = ''
  formTarefa.descricao = ''
  formTarefa.tempoInicio = '09:00'
  formTarefa.tempoFinal = '18:00'
  formTarefa.eventId = ''
  eventIdToEdit.value = null
  const dayAttrs = day.attributes ?? []
  const googleAttrs = dayAttrs.filter((a) => a.customData?.source === 'google')
  if (logadoGoogleCalendar.value && googleAttrs.length > 0) {
    const first = googleAttrs[0]
    const ev = googleEvents.value.find((e) => e.id === first.customData?.id || String(first.key))
    if (ev) {
      eventIdToEdit.value = ev.id ?? null
      formTarefa.titulo = ev.popover?.label ?? ev.description ?? ''
      formTarefa.descricao = ev.description ?? ''
      formTarefa.eventId = ev.id ?? ''
      const s = ev.dates?.start ? new Date(ev.dates.start) : null
      const e = ev.dates?.end ? new Date(ev.dates.end) : null
      if (s) {
        formTarefa.dataInicioStr = s.getFullYear() + '-' + String(s.getMonth() + 1).padStart(2, '0') + '-' + String(s.getDate()).padStart(2, '0')
        formTarefa.tempoInicio = String(s.getHours()).padStart(2, '0') + ':' + String(s.getMinutes()).padStart(2, '0')
      }
      if (e) {
        formTarefa.dataFimStr = e.getFullYear() + '-' + String(e.getMonth() + 1).padStart(2, '0') + '-' + String(e.getDate()).padStart(2, '0')
        formTarefa.tempoFinal = String(e.getHours()).padStart(2, '0') + ':' + String(e.getMinutes()).padStart(2, '0')
      }
    }
  }
  cadastrarEvento.value = true
}

async function loadTarefas() {
  const link = props.widget?.linkData
  if (!link) return
  try {
    const res = await api.get(link)
    const data = res.data?.data?.tarefas
    tarefas.value = Array.isArray(data) ? data : []
  } catch {
    tarefas.value = []
  }
}

async function changeIdcalendar() {
  const id_usuario = getLoginId()
  if (!id_usuario) return

  let cid = calendarId.value
  if (cid === '----') cid = ''
  if (cid) localStorage.setItem('calendar-id', cid)
  if (localStorage.getItem('calendar-id')) calendarId.value = localStorage.getItem('calendar-id') ?? ''

  await loadTarefas()

  store.state.ApiGoogle.calendarId = calendarId.value
  const result = await store.dispatch('ApiGoogle/getCalendarReload', {
    id_usuario: Number(id_usuario),
    calendarId: calendarId.value || undefined,
  }) as { calendarList?: CalendarItem[]; calendarId?: string; data?: ApiCalendarEvent[] }

  if (Array.isArray(result?.calendarList)) {
    logadoGoogleCalendar.value = true
    calendarList.value = result.calendarList
    if (result.calendarId !== undefined) calendarId.value = result.calendarId ?? ''
  }
  if (Array.isArray(result?.data)) {
    googleEvents.value = result.data
  }
}

async function logoutGcalendarApi() {
  const id = getLoginId()
  if (!id) return
  const rs = await store.dispatch('ApiGoogle/logoutGcalendarApi', { id_usuario: id }) as { success?: boolean }
  if (rs?.success) {
    logadoGoogleCalendar.value = false
    calendarId.value = ''
    calendarList.value = []
    googleEvents.value = []
    localStorage.removeItem('calendar-id')
    await changeIdcalendar()
  }
  modalGoogleCalendar.value = false
}

function logarGoogleCalendar() {
  const id = getLoginId()
  if (!id) return
  store.dispatch('ApiGoogle/getAuthUrlCalendar', { id_usuario: id }).then((rs: { auth_url?: string }) => {
    if (rs?.auth_url === '') {
      logadoGoogleCalendar.value = true
      changeIdcalendar()
      return
    }
    if (rs?.auth_url) {
      popupwindow(rs.auth_url, '', 1200, 1200)
      intervalExistsGcalendarApi(id)
    }
  })
}

function intervalExistsGcalendarApi(id_usuario: number) {
  const id = setInterval(() => {
    store.dispatch('ApiGoogle/existsGcalendarApi', { id_usuario }).then((rs: { data?: boolean; calendarList?: CalendarItem[] }) => {
      if (rs?.data) {
        logadoGoogleCalendar.value = true
        if (rs.calendarList) calendarList.value = rs.calendarList
        clearInterval(id)
        changeIdcalendar()
      }
    })
  }, 3000)
  intervalGcalendar.value.push(id)
}

async function googleApiGCalendar() {
  const dadosCalendar = store.state.ApiGoogle?.dadosCalendar as { code?: string } | undefined
  if (!dadosCalendar?.code) return
  const id_usuario = getLoginId()
  if (!id_usuario) return
  let cid = store.state.ApiGoogle?.calendarId ?? calendarId.value
  if (cid === '----') cid = ''
  const result = await store.dispatch('ApiGoogle/getCalendar', {
    code: dadosCalendar.code,
    id_usuario: Number(id_usuario),
    calendarId: cid || undefined,
  }) as { calendarList?: CalendarItem[]; calendarId?: string; data?: ApiCalendarEvent[] }
  if (Array.isArray(result?.calendarList)) {
    logadoGoogleCalendar.value = true
    calendarList.value = result.calendarList
    if (result.calendarId !== undefined) calendarId.value = result.calendarId ?? ''
  }
  if (Array.isArray(result?.data)) {
    googleEvents.value = result.data
  }
}

function closeModalEvento() {
  cadastrarEvento.value = false
  eventIdToEdit.value = null
  formTarefa.titulo = ''
  formTarefa.descricao = ''
  formTarefa.dataInicioStr = ''
  formTarefa.dataFimStr = ''
  formTarefa.tempoInicio = '09:00'
  formTarefa.tempoFinal = '18:00'
  formTarefa.eventId = ''
}

function buildInicioFim(): { inicio: string; fim: string } {
  const di = formTarefa.dataInicioStr || new Date().toISOString().slice(0, 10)
  const ti = formTarefa.tempoInicio || '00:00'
  const df = formTarefa.dataFimStr || di
  const tf = formTarefa.tempoFinal || '00:00'
  const inicio = new Date(di + 'T' + ti + ':00').toISOString()
  const fim = new Date(df + 'T' + tf + ':00').toISOString()
  return { inicio, fim }
}

async function cadastrar() {
  const id_usuario = getLoginId()
  if (!id_usuario || !logadoGoogleCalendar.value) return
  const { inicio, fim } = buildInicioFim()
  const payload = {
    id_usuario: Number(id_usuario),
    calendarId: calendarId.value || undefined,
    titulo: formTarefa.titulo,
    descricao: formTarefa.descricao,
    dataInicio: formTarefa.dataInicioStr,
    dataFim: formTarefa.dataFimStr,
    tempoInicio: formTarefa.tempoInicio,
    tempoFinal: formTarefa.tempoFinal,
    inicio,
    fim,
  }
  const rs = await store.dispatch('ApiGoogle/cadastrarEventCalendar', payload) as { success?: boolean }
  if (rs?.success) {
    closeModalEvento()
    await changeIdcalendar()
  }
}

async function editEvent() {
  const id_usuario = getLoginId()
  if (!id_usuario || !logadoGoogleCalendar.value || !eventIdToEdit.value) return
  const { inicio, fim } = buildInicioFim()
  const payload = {
    id_usuario: Number(id_usuario),
    calendarId: calendarId.value || undefined,
    eventId: formTarefa.eventId || eventIdToEdit.value,
    titulo: formTarefa.titulo,
    descricao: formTarefa.descricao,
    dataInicio: formTarefa.dataInicioStr,
    dataFim: formTarefa.dataFimStr,
    tempoInicio: formTarefa.tempoInicio,
    tempoFinal: formTarefa.tempoFinal,
    inicio,
    fim,
  }
  const rs = await store.dispatch('ApiGoogle/editarEventCalendar', payload) as { success?: boolean }
  if (rs?.success) {
    closeModalEvento()
    await changeIdcalendar()
  }
}

onMounted(async () => {
  updateColumns()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateColumns)
  }
  try {
    const res = await api.get('/usuarios/info')
    const cid = res.data?.data?.calendarId_gcalendar
    if (cid) calendarId.value = cid
  } catch {
    if (localStorage.getItem('calendar-id')) calendarId.value = localStorage.getItem('calendar-id') ?? ''
  }
  await loadTarefas()
  await googleApiGCalendar()
  if (!googleEvents.value.length) await changeIdcalendar()
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateColumns)
  }
  intervalGcalendar.value.forEach((id) => clearInterval(id))
})
</script>

<style scoped>
/* v-calendar: compacto como no antigo (4 meses na linha, responsivo 4→3→2→1) */
.calendar-wrap :deep(.vc-container) {
  font-size: 0.8125rem;
  border: none;
}
.calendar-wrap :deep(.vc-header) {
  padding: 0.25rem 0;
  margin-bottom: 0.25rem;
}
.calendar-wrap :deep(.vc-title) {
  font-size: 0.875rem;
  font-weight: 600;
}
.calendar-wrap :deep(.vc-weeks) {
  padding: 0;
}
.calendar-wrap :deep(.vc-weekday) {
  font-size: 0.65rem;
  padding: 0.2rem 0.1rem;
}
.calendar-wrap :deep(.vc-day) {
  min-height: 2rem;
  padding: 0.15rem;
}
.calendar-wrap :deep(.vc-day-content) {
  font-size: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
}
.calendar-wrap :deep(.vc-day-box-center) {
  gap: 0.1rem;
}
</style>
