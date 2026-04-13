<template>
  <portal-layout>
    <div class="space-y-4">
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-gray-600">
            Usuário: <span class="font-semibold text-gray-800">{{ sessao.nome_usuario || '-' }}</span>
            | Unidade:
            <span class="font-semibold text-gray-800">
              {{ sessao.unidade_nome || sessao.unidade_dbname || '-' }}
            </span>
          </p>
          <a
            href="https://api.whatsapp.com/send?phone=5581998504107"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600"
            aria-label="Abrir WhatsApp"
            title="Abrir WhatsApp"
          >
            <svg viewBox="0 0 32 32" class="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M19.11 17.21c-.26-.13-1.53-.75-1.76-.84-.24-.09-.41-.13-.58.13-.17.26-.67.84-.82 1.01-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.52-1.44-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.5-.43-.43-.58-.44-.15-.01-.32-.01-.49-.01s-.45.06-.69.32c-.24.26-.9.88-.9 2.14 0 1.26.92 2.48 1.05 2.65.13.17 1.8 2.75 4.35 3.86.61.26 1.09.42 1.46.53.61.2 1.16.17 1.59.1.49-.07 1.53-.62 1.75-1.22.22-.6.22-1.11.15-1.22-.06-.11-.24-.17-.5-.3z"/>
              <path d="M16.03 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.47 1.72 6.41L3.2 28.8l6.58-1.72a12.74 12.74 0 006.25 1.61h.01c7.06 0 12.8-5.74 12.8-12.8S23.1 3.2 16.03 3.2zm0 23.36h-.01a10.58 10.58 0 01-5.38-1.47l-.39-.23-3.9 1.02 1.04-3.8-.25-.39a10.61 10.61 0 01-1.64-5.67c0-5.86 4.76-10.62 10.62-10.62 2.83 0 5.49 1.1 7.49 3.11a10.53 10.53 0 013.1 7.5c0 5.86-4.76 10.62-10.62 10.62z"/>
            </svg>
          </a>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">Novo chamado</h2>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input v-model="form.assunto" required class="rounded-lg border px-3 py-2" placeholder="Assunto" />
          <input v-model="form.email_contato" required class="rounded-lg border px-3 py-2" placeholder="E-mail" />
          <input v-model="form.celular_contato" class="rounded-lg border px-3 py-2" placeholder="Celular" />
          <select v-model="form.id_prioridade" required class="rounded-lg border px-3 py-2">
            <option value="">Prioridade</option>
            <option v-for="item in meta.prioridades" :key="item.id" :value="item.id">
              {{ prioridadeSelectLabel(item) }}
            </option>
          </select>
          <select v-model="form.id_categoria" required class="rounded-lg border px-3 py-2">
            <option value="">Categoria</option>
            <option v-for="item in meta.categorias" :key="item.id" :value="item.id">{{ item.nome }}</option>
          </select>
        </div>
        <div v-if="prioridadeSelecionada" class="mt-2">
          <span
            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="prioridadeBadgeClass(prioridadeSelecionada.cor)"
          >
            {{ prioridadeSelecionada.nome }}
          </span>
        </div>
        <textarea
          v-model="form.descricao"
          rows="4"
          required
          class="mt-3 w-full rounded-lg border p-3"
          placeholder="Descrição"
          @paste="onPasteDescricao"
        />
        <PortalTicketAnexos ref="anexosRef" v-model="pendingAttachments" />
        <button
          type="button"
          class="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="abrindoTicket"
          @click="criar"
        >
          <Loader2 v-if="abrindoTicket" class="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          {{ abrindoTicket ? 'Abrindo…' : 'Abrir ticket' }}
        </button>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm">
        <table class="w-full text-sm">
          <thead><tr class="text-left"><th>ID</th><th>Assunto</th><th>Prioridade</th><th>Data/Hora</th><th>Status</th><th></th></tr></thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.id" class="border-t">
              <td>{{ ticket.id }}</td>
              <td>{{ ticket.titulo }}</td>
              <td>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="prioridadeBadgeClass(ticket.prioridade?.cor)"
                >
                  {{ ticket.prioridade?.nome || '-' }}
                </span>
              </td>
              <td>{{ formatDateTime(ticket.created_at) }}</td>
              <td>{{ ticket.status?.nome }}</td>
              <td><router-link :to="`/portal/tickets/${ticket.id}`" class="text-blue-600">Ver</router-link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </portal-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loader2 } from 'lucide-vue-next'
import PortalLayout from '@/components/layout/PortalLayout.vue'
import PortalTicketAnexos from '@/components/tickets/PortalTicketAnexos.vue'
import { ticketsPortalService } from '@/services/tickets-portal'
import { prioridadeSelectLabel } from '@/utils/ticket-prioridade-label'

const route = useRoute()
const router = useRouter()
const tickets = ref<any[]>([])
const sessao = reactive({
  nome_usuario: '',
  unidade_nome: '',
  unidade_dbname: '',
})
const meta = reactive({ prioridades: [], categorias: [] } as any)
const form = reactive({
  assunto: '',
  descricao: '',
  email_contato: '',
  celular_contato: '',
  id_prioridade: '',
  id_categoria: '',
})
const pendingAttachments = ref<File[]>([])
const anexosRef = ref<InstanceType<typeof PortalTicketAnexos> | null>(null)
const abrindoTicket = ref(false)

const decodeHandoffPayload = (token: string) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

const carregar = async () => {
  const { data } = await ticketsPortalService.listar({})
  tickets.value = data.data || []
}

const formatDateTime = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

const prioridadeSelecionada = computed(() => {
  if (form.id_prioridade === '' || form.id_prioridade === null || form.id_prioridade === undefined) {
    return undefined
  }
  const id = Number(form.id_prioridade)
  if (Number.isNaN(id)) {
    return undefined
  }
  return meta.prioridades.find((p: { id: string | number }) => Number(p.id) === id)
})

const prioridadeBadgeClass = (cor: string) => {
  const c = String(cor || '').toLowerCase()
  if (c === 'red') return 'bg-red-100 text-red-700'
  if (c === 'yellow') return 'bg-yellow-100 text-yellow-700'
  if (c === 'green') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

const onPasteDescricao = (e: ClipboardEvent) => {
  const list = e.clipboardData?.files
  if (!list?.length) return
  e.preventDefault()
  anexosRef.value?.addFiles(Array.from(list))
}

const criar = async () => {
  if (abrindoTicket.value) return
  if (!form.assunto.trim() || !form.email_contato.trim() || !form.descricao.trim()) {
    ElMessage.error('Preencha assunto, e-mail e descrição.')
    return
  }
  if (form.id_prioridade === '' || form.id_categoria === '') {
    ElMessage.error('Selecione prioridade e categoria.')
    return
  }
  abrindoTicket.value = true
  try {
    const { data } = await ticketsPortalService.criar({
      titulo: form.assunto,
      descricao: form.descricao,
      email_contato: form.email_contato,
      celular_contato: form.celular_contato,
      id_prioridade: form.id_prioridade,
      id_categoria: form.id_categoria,
    })
    const ticketId = Number(data.id)
    for (const file of pendingAttachments.value) {
      try {
        await ticketsPortalService.uploadAnexo(ticketId, file)
      } catch {
        ElMessage.error(`Não foi possível enviar o anexo: ${file.name}`)
      }
    }
    pendingAttachments.value = []
    form.assunto = ''
    form.descricao = ''
    form.celular_contato = ''
    ElMessage.success('Ticket aberto com sucesso.')
    await carregar()
  } catch {
    ElMessage.error('Não foi possível abrir o ticket. Verifique os campos.')
  } finally {
    abrindoTicket.value = false
  }
}

onMounted(async () => {
  const handoff = String(route.query.handoff || '')
  const handoffPayload = handoff ? decodeHandoffPayload(handoff) : null
  if (handoffPayload) {
    sessao.nome_usuario = handoffPayload.nome || ''
    sessao.unidade_nome = handoffPayload.unidade_nome || ''
    sessao.unidade_dbname = handoffPayload.dbname || ''
    if (handoffPayload.email) {
      form.email_contato = String(handoffPayload.email)
    }
    if (handoffPayload.celular) {
      form.celular_contato = String(handoffPayload.celular)
    } else if (handoffPayload.telefone) {
      form.celular_contato = String(handoffPayload.telefone)
    }
  }

  if (handoff) {
    const { data } = await ticketsPortalService.exchange(handoff)
    localStorage.setItem('auth-portal', data.portal_token)
    localStorage.setItem('portal-ticket-user', JSON.stringify(data.user || {}))
    const u = data.user as { email?: string; celular?: string; telefone?: string } | undefined
    if (u?.email) {
      form.email_contato = String(u.email)
    }
    if (u?.celular) {
      form.celular_contato = String(u.celular)
    } else if (u?.telefone) {
      form.celular_contato = String(u.telefone)
    }
    router.replace('/portal/tickets')
  }
  if (!localStorage.getItem('auth-portal')) {
    return
  }

  const sessaoLocal = localStorage.getItem('portal-ticket-user')
  if (sessaoLocal) {
    try {
      const local = JSON.parse(sessaoLocal) as {
        nome?: string
        unidade_nome?: string
        unidade_dbname?: string
        email?: string
        celular?: string
        telefone?: string
      }
      sessao.nome_usuario = local.nome || ''
      sessao.unidade_nome = local.unidade_nome || ''
      sessao.unidade_dbname = local.unidade_dbname || ''
      if (local.email) {
        form.email_contato = String(local.email)
      }
      if (local.celular) {
        form.celular_contato = String(local.celular)
      } else if (local.telefone) {
        form.celular_contato = String(local.telefone)
      }
    } catch (e) {
      // noop
    }
  }

  try {
    const meResp = await ticketsPortalService.me()
    sessao.nome_usuario = meResp.data.nome_usuario || sessao.nome_usuario
    sessao.unidade_nome = meResp.data.unidade_nome || sessao.unidade_nome
    sessao.unidade_dbname = meResp.data.unidade_dbname || sessao.unidade_dbname
    if (meResp.data.email) {
      form.email_contato = String(meResp.data.email)
    }
    if (meResp.data.celular) {
      form.celular_contato = String(meResp.data.celular)
    } else if (meResp.data.telefone) {
      form.celular_contato = String(meResp.data.telefone)
    }
  } catch (e) {
    // mantém fallback local
  }
  const metaResp = await ticketsPortalService.meta()
  meta.prioridades = metaResp.data.prioridades || []
  meta.categorias = metaResp.data.categorias || []
  await carregar()
})
</script>
