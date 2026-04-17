<template>
  <admin-layout>
    <div class="space-y-4">
      <div
        v-if="ticket?.aguardando_devs_atrasado"
        class="rounded-lg border-2 border-orange-600 bg-orange-50 p-4 text-orange-950 shadow-sm dark:border-orange-500 dark:bg-orange-950/40 dark:text-orange-100"
        role="alert"
      >
        <p class="text-sm font-bold">Este ticket está fora do prazo.</p>
        <p class="mt-1 text-sm">
          Permanece em &quot;Aguardando Devs.&quot; há mais de 36 horas sem mudança de status. Priorize o retorno à equipe de atendimento.
        </p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 class="text-lg font-semibold">Ticket #{{ ticket?.id }}</h2>
        <p class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
          <span
            ><span class="font-semibold text-gray-800 dark:text-gray-200">Solicitante:</span>
            {{ ticket?.nome_usuario_externo || '—' }}</span
          >
          <span
            ><span class="font-semibold text-gray-800 dark:text-gray-200">Empresa:</span>
            {{ empresaSolicitante }}</span
          >
          <span
            ><span class="font-semibold text-gray-800 dark:text-gray-200">Aberto em:</span>
            {{ formatDateTime(ticket?.created_at ?? '') }}</span
          >
        </p>
        <div class="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-900/40">
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Responsável</p>
            <div v-if="!ticket?.atendente" class="mt-1 text-sm text-gray-600 dark:text-gray-400">Sem responsável</div>
            <div v-else class="mt-1 flex items-center gap-2">
              <img
                v-if="ticket.atendente.avatar_url"
                :src="ticket.atendente.avatar_url"
                :alt="ticket.atendente.nome"
                class="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div
                v-else
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-800 dark:bg-gray-600 dark:text-gray-100"
              >
                {{ iniciaisAtendente(ticket.atendente.nome) }}
              </div>
              <span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{{ ticket.atendente.nome }}</span>
            </div>
          </div>
          <div class="flex min-w-[12rem] flex-1 flex-col gap-1 sm:max-w-xs">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="responsavel-select">Alterar responsável</label>
            <select
              id="responsavel-select"
              v-model="responsavelSelecionado"
              class="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
              :disabled="salvandoResponsavel"
            >
              <option value="">Sem responsável</option>
              <option v-for="a in atendentesOptions" :key="a.id_usuarios" :value="String(a.id_usuarios)">
                {{ a.nome }}
              </option>
            </select>
            <button
              type="button"
              class="rounded bg-gray-800 px-3 py-1.5 text-xs text-white disabled:opacity-70 dark:bg-gray-700"
              :disabled="salvandoResponsavel"
              @click="salvarResponsavel"
            >
              {{ salvandoResponsavel ? 'Salvando…' : 'Salvar responsável' }}
            </button>
          </div>
        </div>
        <p class="mt-2 text-sm">
          <span class="font-semibold">Assunto:</span> {{ ticket?.titulo }}
        </p>
        <div class="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <p>
            <span class="font-semibold text-gray-900 dark:text-gray-100">Email:</span>
            {{ ticket?.email_contato || '—' }}
          </p>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-900 dark:text-gray-100">Celular:</label>
            <input
              v-model="celularContato"
              class="w-full rounded border px-2 py-1 text-sm"
              placeholder="Celular"
              :disabled="salvandoContato"
            />
            <button
              type="button"
              class="rounded bg-gray-700 px-2 py-1 text-xs text-white disabled:opacity-70"
              :disabled="salvandoContato"
              @click="salvarContato"
            >
              {{ salvandoContato ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
        <p class="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
          <span class="font-semibold text-gray-900 dark:text-gray-100">Texto completo:</span>
          {{ ticket?.descricao }}
        </p>
        <div v-if="anexosAbertura.length" class="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-900/40">
          <p class="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">Anexos (abertura)</p>
          <ul class="space-y-1 text-sm">
            <li
              v-for="a in anexosAbertura"
              :key="a.id"
              class="flex flex-wrap items-center justify-between gap-2 rounded bg-white px-2 py-1 dark:bg-gray-800"
            >
              <span class="truncate text-gray-700 dark:text-gray-200">{{ a.nome_original }}</span>
              <button type="button" class="shrink-0 text-blue-600 hover:underline" @click="baixarAnexo(a.id)">Baixar</button>
            </li>
          </ul>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <h3 class="mb-3 text-base font-semibold">Conversa</h3>
        <div v-if="respostasOrdenadas.length === 0" class="text-sm text-gray-500">
          Sem respostas ainda.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="resposta in respostasOrdenadas"
            :key="resposta.id"
            class="max-w-[85%] rounded-lg px-3 py-2 text-sm"
            :class="bubbleClassResposta(resposta)"
          >
            <p class="font-semibold">
              <span>{{ resposta.nome_autor || resposta.autor_tipo }}</span>
              <span
                v-if="resposta.interno"
                class="ml-1.5 rounded bg-amber-200 px-1.5 py-0.5 text-xs font-semibold text-amber-950 dark:bg-amber-800 dark:text-amber-50"
              >
                Interno
              </span>
            </p>
            <div
              v-if="renderMensagemHtml(resposta)"
              class="ticket-msg-html mt-1 break-words text-sm [&_a]:text-blue-600 [&_a]:underline [&_img]:mt-2 [&_img]:max-h-72 [&_img]:max-w-full [&_img]:rounded [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              v-html="renderMensagemHtml(resposta)"
            />
            <p v-else class="mt-1 whitespace-pre-line">{{ resposta.mensagem }}</p>
            <ul v-if="anexosDaResposta(resposta).length" class="mt-2 space-y-1 border-t border-gray-200 pt-2 text-sm dark:border-gray-600">
              <li
                v-for="ax in anexosDaResposta(resposta)"
                :key="ax.id"
                class="flex flex-wrap items-center justify-between gap-2 rounded bg-white/80 px-2 py-1 dark:bg-gray-800/80"
              >
                <span class="truncate">{{ ax.nome_original }}</span>
                <button type="button" class="shrink-0 text-blue-600 hover:underline" @click="baixarAnexo(ax.id)">Baixar</button>
              </li>
            </ul>
            <p class="mt-1 text-xs opacity-70">{{ formatDateTime(resposta.created_at) }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div class="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <select v-model="statusSelecionado" class="rounded border px-3 py-2 text-sm">
            <option value="">Selecionar status</option>
            <option v-for="item in statusOptions" :key="item.id" :value="item.id">
              {{ item.nome }}
            </option>
          </select>
          <button class="rounded bg-amber-600 px-3 py-2 text-white" @click="alterarStatus">
            Trocar status
          </button>
          <button class="rounded bg-red-600 px-3 py-2 text-white" @click="fechar">
            Finalizar ticket
          </button>
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >Comentário interno</label
          >
          <TicketRichTextarea
            v-model="comentarioInterno"
            placeholder="Visível apenas para o atendimento"
            :disabled="comentarioInternoEnviando"
            @paste="onPasteInterno"
          />
          <div class="mt-2 flex gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded bg-amber-700 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-75"
              :disabled="comentarioInternoEnviando"
              @click="salvarComentarioInterno"
            >
              <svg
                v-if="comentarioInternoEnviando"
                class="h-4 w-4 shrink-0 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ comentarioInternoEnviando ? 'Salvando…' : 'Salvar comentário interno' }}
            </button>
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >Resposta ao cliente</label
          >
          <TicketRichTextarea
            v-model="mensagem"
            placeholder="Resposta"
            :disabled="respostaEnviando"
            @paste="onPasteResposta"
          />
        </div>
        <PortalTicketAnexos ref="anexosRespostaRef" v-model="pendingReplyAttachments" />
        <div class="mt-3 flex gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded bg-blue-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-75"
            :disabled="respostaEnviando"
            @click="responder"
          >
            <svg
              v-if="respostaEnviando"
              class="h-4 w-4 shrink-0 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ respostaEnviando ? 'Salvando e enviando e-mail' : 'Responder' }}
          </button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PortalTicketAnexos from '@/components/tickets/PortalTicketAnexos.vue'
import TicketRichTextarea from '@/components/tickets/TicketRichTextarea.vue'
import { ticketsAdminService } from '@/services/tickets-admin'
import { ticketsBus, type TicketRealtimePayload } from '@/lib/tickets-bus'

interface TicketRespostaItem {
  id: number
  autor_tipo: string
  nome_autor: string
  mensagem: string
  interno?: boolean
  html_formatado?: boolean
  created_at: string
  anexos?: { id: number; nome_original: string }[]
}

interface AtendenteMeta {
  id_usuarios: number
  nome: string
  email?: string
  avatar_url?: string | null
}

interface AdminTicketDetalhe {
  id: number
  titulo: string
  descricao: string
  created_at: string
  email_contato?: string | null
  celular_contato?: string | null
  nome_usuario_externo?: string | null
  unidade_nome?: string | null
  unidade_sigla?: string | null
  unidade_dbname?: string | null
  id_status?: number
  id_atendente_responsavel?: number | null
  aguardando_devs_atrasado?: boolean
  atendente?: AtendenteMeta | null
  anexos_abertura?: { id: number; nome_original: string }[]
  respostas?: TicketRespostaItem[]
}

const route = useRoute()
const ticket = ref<AdminTicketDetalhe | null>(null)
const mensagem = ref('')
const comentarioInterno = ref('')
const comentarioInternoEnviando = ref(false)
const celularContato = ref('')
const salvandoContato = ref(false)
const respostasOrdenadas = ref<TicketRespostaItem[]>([])
const pendingReplyAttachments = ref<File[]>([])
const anexosRespostaRef = ref<InstanceType<typeof PortalTicketAnexos> | null>(null)
const statusSelecionado = ref<string | number>('')
const statusOptions = ref<{ id: number; nome: string }[]>([])
const respostaEnviando = ref(false)
const atendentesOptions = ref<AtendenteMeta[]>([])
const responsavelSelecionado = ref('')
const salvandoResponsavel = ref(false)

const empresaSolicitante = computed(() => {
  const t = ticket.value
  if (!t) return '—'
  const parts: string[] = []
  if (t.unidade_sigla) parts.push(t.unidade_sigla)
  if (t.unidade_nome) parts.push(t.unidade_nome)
  if (parts.length) return parts.join(' — ')
  if (t.unidade_dbname) return t.unidade_dbname
  return '—'
})

const anexosAbertura = computed(() => {
  const list = ticket.value?.anexos_abertura
  return Array.isArray(list) ? list : []
})

const anexosDaResposta = (item: { anexos?: unknown }) => {
  const list = item?.anexos
  return Array.isArray(list) ? list : []
}

const iniciaisAtendente = (nome: string) => {
  const parts = String(nome || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const bubbleClassResposta = (r: TicketRespostaItem) => {
  if (r.interno) {
    return 'mr-auto border border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
  }
  if (r.autor_tipo === 'atendente') {
    return 'ml-auto bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
  }
  return 'mr-auto bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const isSafeUrl = (raw: string) => {
  const value = raw.trim()
  if (!value) return false
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(value)) return true
  if (/^(https?:|mailto:|tel:)/i.test(value)) return true
  return false
}

const sanitizeHtml = (html: string) => {
  if (typeof window === 'undefined') return escapeHtml(html)
  const template = document.createElement('template')
  template.innerHTML = html
  const allowedTags = new Set([
    'a',
    'img',
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'span',
    'div',
  ])
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT)
  const toRemove: Element[] = []
  const allElements: Element[] = []
  let current = walker.nextNode()
  while (current) {
    if (current instanceof Element) {
      allElements.push(current)
      if (!allowedTags.has(current.tagName.toLowerCase())) {
        toRemove.push(current)
      }
    }
    current = walker.nextNode()
  }
  for (const el of toRemove) {
    const parent = el.parentNode
    if (!parent) continue
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
  }
  for (const el of allElements) {
    const tag = el.tagName.toLowerCase()
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on') || name === 'style' || name === 'srcset') {
        el.removeAttribute(attr.name)
        continue
      }
      if (tag === 'a') {
        if (name !== 'href' && name !== 'target' && name !== 'rel') {
          el.removeAttribute(attr.name)
        }
      } else if (tag === 'img') {
        if (name !== 'src' && name !== 'alt' && name !== 'title') {
          el.removeAttribute(attr.name)
        }
      } else if (name === 'class' || name === 'id') {
        el.removeAttribute(attr.name)
      }
    }
    if (tag === 'a') {
      const href = el.getAttribute('href') ?? ''
      if (!isSafeUrl(href)) {
        const parent = el.parentNode
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el)
          parent.removeChild(el)
        }
        continue
      }
      el.setAttribute('target', '_blank')
      el.setAttribute('rel', 'noopener noreferrer')
    }
    if (tag === 'img') {
      const src = el.getAttribute('src') ?? ''
      if (!isSafeUrl(src)) {
        el.remove()
      }
    }
  }
  return template.innerHTML
}

const normalizeHref = (value: string) => {
  const raw = value.trim()
  if (/^www\./i.test(raw)) return `https://${raw}`
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(raw)) return `mailto:${raw}`
  return raw
}

const urlToHtml = (url: string) => {
  const href = normalizeHref(url)
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(url)
  if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(href)) {
    return `<img src="${safeHref}" alt="Imagem enviada na conversa" loading="lazy" />`
  }
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`
}

const linkifyTexto = (mensagem: string) => {
  const escaped = escapeHtml(mensagem)
  const withLinks = escaped.replace(
    /((?:https?:\/\/|www\.)[^\s<>"']+|mailto:[^\s<>"']+|tel:[^\s<>"']+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi,
    (match) => urlToHtml(match)
  )
  return withLinks.replace(/\n/g, '<br>')
}

const renderMensagemHtml = (resposta: TicketRespostaItem) => {
  const mensagem = String(resposta.mensagem || '')
  if (!mensagem.trim()) return ''
  if (resposta.html_formatado || /<\/?[a-z][\s\S]*>/i.test(mensagem)) {
    return sanitizeHtml(mensagem)
  }
  if (/(https?:\/\/|www\.|mailto:|tel:|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i.test(mensagem)) {
    return linkifyTexto(mensagem)
  }
  return ''
}

const carregar = async () => {
  const { data } = await ticketsAdminService.detalhe(Number(route.params.id))
  ticket.value = data.ticket
  celularContato.value = String(data.ticket?.celular_contato || '')
  statusSelecionado.value = data.ticket?.id_status || ''
  const rid = data.ticket?.id_atendente_responsavel
  responsavelSelecionado.value = rid != null && rid !== '' ? String(rid) : ''
  const respostas = Array.isArray(data.ticket?.respostas) ? data.ticket.respostas : []
  respostasOrdenadas.value = [...respostas].sort((a, b) =>
    String(a.created_at).localeCompare(String(b.created_at))
  )
}

const formatDateTime = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

const baixarAnexo = async (anexoId: number) => {
  try {
    const { data } = await ticketsAdminService.getAnexoDownloadUrl(Number(route.params.id), anexoId)
    window.open(data.url, '_blank', 'noopener,noreferrer')
  } catch {
    ElMessage.error('Não foi possível gerar o link do anexo.')
  }
}

const onPasteResposta = (e: ClipboardEvent) => {
  const list = e.clipboardData?.files
  if (!list?.length) return
  e.preventDefault()
  anexosRespostaRef.value?.addFiles(Array.from(list))
}

const onPasteInterno = (e: ClipboardEvent) => {
  const list = e.clipboardData?.files
  if (!list?.length) return
  e.preventDefault()
}

const salvarComentarioInterno = async () => {
  if (comentarioInternoEnviando.value || !comentarioInterno.value.trim()) return
  comentarioInternoEnviando.value = true
  try {
    await ticketsAdminService.responder(Number(route.params.id), comentarioInterno.value, true)
    comentarioInterno.value = ''
    await carregar()
    ElMessage.success('Comentário interno salvo.')
  } catch {
    ElMessage.error('Não foi possível salvar o comentário interno.')
  } finally {
    comentarioInternoEnviando.value = false
  }
}

const responder = async () => {
  if (respostaEnviando.value || !mensagem.value.trim()) return
  respostaEnviando.value = true
  try {
    const { data } = await ticketsAdminService.responder(Number(route.params.id), mensagem.value, false)
    const respostaId = Number(data.id)
    for (const file of pendingReplyAttachments.value) {
      try {
        await ticketsAdminService.uploadAnexo(Number(route.params.id), file, respostaId)
      } catch {
        ElMessage.error(`Não foi possível enviar o anexo: ${file.name}`)
      }
    }
    pendingReplyAttachments.value = []
    mensagem.value = ''
    await carregar()
  } catch {
    ElMessage.error('Não foi possível enviar a resposta.')
  } finally {
    respostaEnviando.value = false
  }
}

const fechar = async () => {
  await ticketsAdminService.fechar(Number(route.params.id))
  await carregar()
}

const alterarStatus = async () => {
  if (!statusSelecionado.value) return
  await ticketsAdminService.atualizar(Number(route.params.id), {
    id_status: Number(statusSelecionado.value),
  })
  await carregar()
}

const salvarResponsavel = async () => {
  if (!ticket.value?.id || salvandoResponsavel.value) return
  salvandoResponsavel.value = true
  try {
    const raw = responsavelSelecionado.value
    const idAtendente = raw === '' ? null : Number(raw)
    await ticketsAdminService.atualizar(Number(ticket.value.id), {
      id_atendente_responsavel: idAtendente,
    })
    await carregar()
    ElMessage.success('Responsável atualizado.')
  } catch {
    ElMessage.error('Não foi possível atualizar o responsável.')
  } finally {
    salvandoResponsavel.value = false
  }
}

const salvarContato = async () => {
  if (!ticket.value?.id || salvandoContato.value) return
  salvandoContato.value = true
  try {
    await ticketsAdminService.atualizar(Number(ticket.value.id), {
      celular_contato: celularContato.value || null,
    })
    await carregar()
    ElMessage.success('Contato atualizado.')
  } catch {
    ElMessage.error('Não foi possível atualizar o celular.')
  } finally {
    salvandoContato.value = false
  }
}

const ticketId = computed(() => Number(route.params.id))

const onTicketRealtime = (p: TicketRealtimePayload) => {
  if (p.ticket_id === ticketId.value) {
    void carregar()
  }
}

onMounted(async () => {
  ticketsBus.on('tickets:realtime', onTicketRealtime)
  const { data } = await ticketsAdminService.meta()
  statusOptions.value = data.status || []
  atendentesOptions.value = Array.isArray(data.atendentes) ? data.atendentes : []
  await carregar()
})

onUnmounted(() => {
  ticketsBus.off('tickets:realtime', onTicketRealtime)
})
</script>
