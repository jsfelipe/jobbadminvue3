<template>
  <div
    class="relative flex h-[calc(100vh-140px)] min-h-[480px] gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
  >
    <button
      type="button"
      class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      aria-label="Fechar chat"
      title="Fechar"
      @click="voltar"
    >
      <X class="h-5 w-5" stroke-width="2" />
    </button>
    <aside
      class="flex w-full max-w-md flex-col border-r border-gray-200 dark:border-gray-700 md:w-[360px]"
    >
      <div class="border-b border-gray-200 p-3 dark:border-gray-700">
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Chat Online</h1>
        <div class="mt-2 flex flex-wrap gap-1">
          <button
            v-for="opt in filtroOptions"
            :key="opt.value"
            type="button"
            class="rounded-full px-2.5 py-1 text-xs font-medium transition"
            :class="
              filtro === opt.value
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            "
            @click="setFiltro(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-if="loadingList" class="p-4 text-sm text-gray-500">Carregando…</div>
        <button
          v-for="c in conversas"
          :key="c.id"
          type="button"
          class="flex w-full items-start gap-3 border-b border-gray-100 px-3 py-3 text-left transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
          :class="{ 'bg-brand-50 dark:bg-gray-800': selectedId === c.id }"
          @click="selectConversa(c.id)"
        >
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
          >
            {{ initials(displayClienteNome(c)) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="truncate font-medium text-gray-900 dark:text-white">{{ displayClienteNome(c) }}</span>
              <div class="flex shrink-0 items-center gap-1.5">
                <span
                  v-if="c.last_message_at"
                  class="text-[11px] text-gray-400 dark:text-gray-500"
                >
                  {{ formatTime(c.last_message_at) }}
                </span>
                <span
                  v-if="c.unread_count_atendente > 0"
                  class="inline-flex min-w-[22px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white"
                >
                  {{ c.unread_count_atendente }}
                </span>
              </div>
            </div>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              {{ displayClienteSubtitulo(c) }}
            </p>
            <div v-if="c.fila || c.ia_ativa || resolveChatSiteOrigem(c)" class="mt-1 flex flex-wrap items-center gap-1">
              <span
                v-if="resolveChatSiteOrigem(c)"
                class="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                :class="chatSiteOrigemClass(resolveChatSiteOrigem(c))"
              >
                {{ chatSiteOrigemLabel(resolveChatSiteOrigem(c)) }}
              </span>
              <span
                v-if="c.fila"
                class="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                :class="c.fila === 'comercial' ? 'bg-brand-100 text-brand-800' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
              >
                {{ filaLabel(c.fila) }}
              </span>
              <span
                v-if="c.ia_ativa"
                class="inline-flex rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
              >
                IA
              </span>
            </div>
            <p class="truncate text-sm text-gray-600 dark:text-gray-300">
              {{ c.last_message_preview || '—' }}
            </p>
          </div>
        </button>
        <p v-if="!loadingList && conversas.length === 0" class="p-4 text-sm text-gray-500">
          Nenhuma conversa.
        </p>
      </div>
    </aside>

    <section class="flex min-w-0 flex-1 flex-col">
      <template v-if="selectedId">
        <header
          class="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700"
        >
          <div class="min-w-0">
            <h2 class="truncate font-semibold text-gray-900 dark:text-white">
              {{ selectedConversa ? displayClienteNome(selectedConversa) : '…' }}
            </h2>
            <div
              v-if="selectedConversa && (selectedConversa.status === 'aberta' || selectedConversa.fila || selectedConversa.ia_ativa || resolveChatSiteOrigem(selectedConversa))"
              class="mt-1 flex flex-wrap items-center gap-1"
            >
              <span
                v-if="resolveChatSiteOrigem(selectedConversa)"
                class="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                :class="chatSiteOrigemClass(resolveChatSiteOrigem(selectedConversa))"
              >
                {{ chatSiteOrigemLabel(resolveChatSiteOrigem(selectedConversa)) }}
              </span>
              <template v-if="selectedConversa.status === 'aberta'">
                <button
                  type="button"
                  class="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition"
                  :class="
                    selectedConversa.fila === 'comercial'
                      ? 'bg-brand-500 text-white'
                      : 'bg-brand-100 text-brand-800 hover:bg-brand-200'
                  "
                  :disabled="actionLoading"
                  @click="doAlterarFila('comercial')"
                >
                  Comercial
                </button>
                <button
                  type="button"
                  class="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition"
                  :class="
                    selectedConversa.fila === 'suporte'
                      ? 'bg-slate-700 text-white dark:bg-slate-500'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
                  "
                  :disabled="actionLoading"
                  @click="doAlterarFila('suporte')"
                >
                  Suporte
                </button>
              </template>
              <span
                v-else-if="selectedConversa.fila"
                class="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                :class="selectedConversa.fila === 'comercial' ? 'bg-brand-100 text-brand-800' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
              >
                {{ filaLabel(selectedConversa.fila) }}
              </span>
              <span
                v-if="selectedConversa.ia_ativa"
                class="inline-flex rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
              >
                IA
              </span>
            </div>
            <p class="truncate text-xs text-gray-500">
              {{ selectedConversa ? displayClienteSubtitulo(selectedConversa) : '' }}
              <span v-if="selectedConversa?.nome_atendente"> · {{ selectedConversa.nome_atendente }}</span>
            </p>
          </div>
          <div class="flex shrink-0 gap-2">
            <button
              v-if="selectedConversa?.status === 'aberta' && !selectedConversa.ia_ativa"
              type="button"
              class="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-800 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
              :disabled="actionLoading"
              @click="doReativarIa"
            >
              Devolver à IA
            </button>
            <button
              v-if="selectedConversa && !selectedConversa.id_atendente_responsavel"
              type="button"
              class="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
              :disabled="actionLoading"
              @click="doAssumir"
            >
              Assumir
            </button>
            <button
              v-if="selectedConversa?.status === 'aberta' && isResponsavel"
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              :disabled="actionLoading"
              @click="doFechar"
            >
              Finalizar Atendimento
            </button>
          </div>
        </header>

        <div
          ref="msgScrollRef"
          class="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950/50"
        >
          <div v-if="loadingMsgs" class="text-sm text-gray-500">Carregando mensagens…</div>
          <div
            v-for="m in mensagensOrdered"
            :key="m.id"
            class="flex"
            :class="msgAlignClass(m)"
          >
            <div
              class="max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm"
              :class="msgBubbleClass(m)"
            >
              <p class="text-[10px] opacity-80">
                {{ m.nome_remetente }}
                <span
                  v-if="m.interno"
                  class="ml-1 rounded bg-amber-200 px-1.5 py-0.5 text-[9px] font-semibold text-amber-950"
                >Interno</span>
              </p>
              <p class="whitespace-pre-wrap">{{ m.mensagem }}</p>
              <div v-if="m.tem_anexo && m.anexos?.length" class="mt-2 space-y-1">
                <button
                  v-for="ax in m.anexos"
                  :key="ax.id"
                  type="button"
                  class="block w-full truncate text-left text-xs underline"
                  @click="openAnexo(ax.id)"
                >
                  {{ ax.nome_original }}
                </button>
              </div>
              <p class="mt-1 text-[10px] opacity-70">
                {{ formatTime(m.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <footer class="border-t border-gray-200 p-3 dark:border-gray-700">
          <label class="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <input v-model="comentarioInterno" type="checkbox" class="rounded border-gray-300" />
            Comentário interno
          </label>
          <div class="flex gap-2">
            <textarea
              v-model="draft"
              rows="2"
              class="min-w-0 flex-1 resize-none rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
              :class="
                comentarioInterno
                  ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30'
                  : 'border-gray-300 dark:border-gray-600'
              "
              :placeholder="comentarioInterno ? 'Comentário interno (só atendentes)…' : 'Digite uma mensagem…'"
              @keydown.enter.exact.prevent="sendText"
            />
            <div class="flex flex-col gap-2">
              <label
                class="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-center text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Anexo
                <input type="file" accept="image/*,.pdf" class="hidden" :disabled="comentarioInterno" @change="onFile" />
              </label>
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                :class="comentarioInterno ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-500 hover:bg-brand-600'"
                :disabled="sending || !selectedId"
                @click="sendText"
              >
                {{ comentarioInterno ? 'Salvar' : 'Enviar' }}
              </button>
            </div>
          </div>
        </footer>
      </template>
      <div v-else class="flex flex-1 items-center justify-center text-gray-500">
        Selecione uma conversa à esquerda.
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { X } from 'lucide-vue-next'
import { chatService, type ChatConversaRow, type ChatMensagemRow } from '@/services/chat'
import { subscribeConversationChannel, chatAblyConnected } from '@/composables/useChatAbly'
import { chatBus } from '@/lib/chat-bus'
import { displayClienteNome, displayClienteSubtitulo } from '@/utils/chat-cliente-label'
import {
  chatSiteOrigemClass,
  chatSiteOrigemLabel,
  resolveChatSiteOrigem,
} from '@/utils/chat-site-origem'

interface LoginState {
  data?: { id_usuarios?: number }
}

interface RootState {
  Login?: LoginState
}

const router = useRouter()
const route = useRoute()
const store = useStore()
const rootState = computed(() => store.state as RootState)

function voltar(): void {
  if (window.history.state?.back != null) {
    router.back()
    return
  }
  void router.push({ name: 'admin.overview' })
}
const myUserId = computed(() => Number(rootState.value.Login?.data?.id_usuarios ?? 0))

type ChatFiltro = 'todas' | 'minhas' | 'nao_atribuidas' | 'fechadas' | 'comercial' | 'suporte'

const filtro = ref<ChatFiltro>('todas')
const filtroOptions: { value: ChatFiltro; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'minhas', label: 'Minhas' },
  { value: 'nao_atribuidas', label: 'Não atrib.' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'suporte', label: 'Suporte' },
  { value: 'fechadas', label: 'Fechadas' },
]

const conversas = ref<ChatConversaRow[]>([])
const loadingList = ref(false)
const selectedId = ref<number | null>(null)
const selectedConversa = ref<ChatConversaRow | null>(null)
const mensagens = ref<ChatMensagemRow[]>([])
const loadingMsgs = ref(false)
const draft = ref('')
const comentarioInterno = ref(false)
const sending = ref(false)
const actionLoading = ref(false)
const msgScrollRef = ref<HTMLElement | null>(null)

let unsubConv: (() => void) | null = null

const isResponsavel = computed(() => {
  const c = selectedConversa.value
  if (!c || !c.id_atendente_responsavel) {
    return false
  }
  return c.id_atendente_responsavel === myUserId.value
})

const mensagensOrdered = computed(() => {
  const list = [...mensagens.value]
  return list.sort((a, b) => a.id - b.id)
})

function filaLabel(fila: ChatConversaRow['fila']): string {
  if (fila === 'comercial') {
    return 'Comercial'
  }
  if (fila === 'suporte') {
    return 'Suporte'
  }
  return ''
}

function msgAlignClass(m: ChatMensagemRow | string): string {
  const tipo = typeof m === 'string' ? m : m.remetente_tipo
  const interno = typeof m === 'string' ? false : !!m.interno
  if (interno || tipo === 'atendente' || tipo === 'ia') {
    return 'justify-end'
  }
  if (tipo === 'sistema') {
    return 'justify-center'
  }
  return 'justify-start'
}

function msgBubbleClass(m: ChatMensagemRow): string {
  if (m.interno) {
    return 'rounded-br-md border border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
  }
  const tipo = m.remetente_tipo
  if (tipo === 'atendente') {
    return 'rounded-br-md bg-brand-500 text-white'
  }
  if (tipo === 'ia') {
    return 'rounded-br-md bg-indigo-600 text-white'
  }
  if (tipo === 'sistema') {
    return 'rounded-md bg-gray-500 text-white'
  }
  return 'rounded-bl-md bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100'
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  if (p.length === 0) {
    return '?'
  }
  if (p.length === 1) {
    return p[0].slice(0, 2).toUpperCase()
  }
  return (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

function formatTime(iso: string | null): string {
  if (!iso) {
    return ''
  }
  try {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
  } catch {
    return iso
  }
}

async function loadList() {
  loadingList.value = true
  try {
    const res = await chatService.listar({ filtro: filtro.value, per_page: 50 })
    conversas.value = res.data.data
  } catch {
    conversas.value = []
  } finally {
    loadingList.value = false
  }
}

function setFiltro(v: typeof filtro.value) {
  filtro.value = v
  void loadList()
}

function parseIncomingMessage(raw: unknown): ChatMensagemRow | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const o = raw as Record<string, unknown>
  if (o.type !== 'chat_message' || !o.mensagem || typeof o.mensagem !== 'object') {
    return null
  }
  return o.mensagem as ChatMensagemRow
}

async function selectConversa(id: number) {
  selectedId.value = id
  loadingMsgs.value = true
  mensagens.value = []
  draft.value = ''
  comentarioInterno.value = false
  if (unsubConv) {
    unsubConv()
    unsubConv = null
  }
  try {
    const convRes = await chatService.detalhe(id)
    selectedConversa.value = convRes.data
    const pageRes = await chatService.mensagens(id, { per_page: 80 })
    mensagens.value = pageRes.data.data
    await chatService.marcarLida(id)
    attachConvSubscription(id)
    void loadList()
  } catch {
    selectedConversa.value = null
  } finally {
    loadingMsgs.value = false
  }
}

async function sendText() {
  const id = selectedId.value
  const text = draft.value.trim()
  if (!id || !text || sending.value) {
    return
  }
  sending.value = true
  try {
    const interno = comentarioInterno.value
    const res = await chatService.responder(id, text, { interno })
    if (!mensagens.value.some((x) => x.id === res.data.id)) {
      mensagens.value.push(res.data)
    }
    draft.value = ''
    if (interno) {
      comentarioInterno.value = false
    }
    const det = await chatService.detalhe(id)
    selectedConversa.value = det.data
    void loadList()
  } catch {
    /* noop */
  } finally {
    sending.value = false
  }
}

async function doAlterarFila(fila: 'comercial' | 'suporte') {
  const id = selectedId.value
  if (!id || actionLoading.value) {
    return
  }
  if (selectedConversa.value?.fila === fila) {
    return
  }
  actionLoading.value = true
  try {
    const r = await chatService.alterarFila(id, fila)
    selectedConversa.value = r.data
    void loadList()
  } catch {
    /* noop */
  } finally {
    actionLoading.value = false
  }
}

async function onFile(ev: Event) {
  const id = selectedId.value
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!id || !file || actionLoading.value) {
    return
  }
  actionLoading.value = true
  try {
    const up = await chatService.uploadAnexo(id, file)
    if (!mensagens.value.some((x) => x.id === up.data.mensagem.id)) {
      mensagens.value.push(up.data.mensagem)
    }
    const det = await chatService.detalhe(id)
    selectedConversa.value = det.data
    void loadList()
  } catch {
    /* noop */
  } finally {
    actionLoading.value = false
  }
}

async function openAnexo(anexoId: number) {
  const id = selectedId.value
  if (!id) {
    return
  }
  try {
    const { data } = await chatService.getAnexoDownloadUrl(id, anexoId)
    if (data.url) {
      window.open(data.url, '_blank', 'noopener')
    }
  } catch {
    /* noop */
  }
}

async function doReativarIa() {
  const id = selectedId.value
  if (!id) {
    return
  }
  actionLoading.value = true
  try {
    const r = await chatService.reativarIa(id)
    selectedConversa.value = r.data
    void loadList()
    await selectConversa(id)
  } catch {
    /* noop */
  } finally {
    actionLoading.value = false
  }
}

async function doAssumir() {
  const id = selectedId.value
  if (!id) {
    return
  }
  actionLoading.value = true
  try {
    const r = await chatService.assumir(id)
    selectedConversa.value = r.data
    void loadList()
  } catch {
    /* noop */
  } finally {
    actionLoading.value = false
  }
}

async function doFechar() {
  const id = selectedId.value
  if (!id) {
    return
  }
  actionLoading.value = true
  try {
    const r = await chatService.fechar(id)
    selectedConversa.value = r.data
    void loadList()
  } catch {
    /* noop */
  } finally {
    actionLoading.value = false
  }
}

const onLobbyRefresh = () => {
  void loadList()
}

onMounted(async () => {
  await loadList()
  chatBus.on('chat:unread-refresh', onLobbyRefresh)
  chatBus.on('chat:lobby', onLobbyRefresh)

  const raw = route.query.conversa
  const conversaId = Number(Array.isArray(raw) ? raw[0] : raw)
  if (conversaId > 0) {
    await selectConversa(conversaId)
  }
})

onUnmounted(() => {
  chatBus.off('chat:unread-refresh', onLobbyRefresh)
  chatBus.off('chat:lobby', onLobbyRefresh)
  if (unsubConv) {
    unsubConv()
  }
})

watch(selectedId, (v) => {
  if (v == null) {
    selectedConversa.value = null
    mensagens.value = []
  }
})

function attachConvSubscription(id: number) {
  if (unsubConv) {
    unsubConv()
    unsubConv = null
  }
  unsubConv = subscribeConversationChannel(id, (raw) => {
    const msg = parseIncomingMessage(raw)
    if (!msg || msg.id_conversa !== id) {
      return
    }
    if (!mensagens.value.some((x) => x.id === msg.id)) {
      mensagens.value.push(msg)
    }
  })
}

watch(chatAblyConnected, (ok) => {
  if (ok && selectedId.value) {
    attachConvSubscription(selectedId.value)
  }
})
</script>
