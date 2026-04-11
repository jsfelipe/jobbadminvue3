<template>
  <portal-layout>
    <div class="space-y-4">
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <div class="mb-3">
          <router-link to="/portal/tickets" class="inline-flex items-center rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200">
            Voltar
          </router-link>
        </div>
        <h2 class="text-lg font-semibold">Ticket #{{ ticket?.id }}</h2>
        <p class="mt-2 text-sm">
          <span class="font-semibold">Assunto:</span> {{ ticket?.titulo }}
          <span class="ml-2 text-xs text-gray-500">({{ formatDateTime(ticket?.created_at) }})</span>
        </p>
        <p class="mt-2 text-sm text-gray-700 whitespace-pre-line">
          <span class="font-semibold text-gray-900">Texto completo do cliente:</span>
          {{ ticket?.descricao }}
        </p>
        <div v-if="anexosAbertura.length" class="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
          <p class="mb-1 text-xs font-semibold text-gray-600">Anexos (abertura)</p>
          <ul class="space-y-1 text-sm">
            <li
              v-for="a in anexosAbertura"
              :key="a.id"
              class="flex flex-wrap items-center justify-between gap-2 rounded bg-white px-2 py-1"
            >
              <span class="truncate text-gray-700">{{ a.nome_original }}</span>
              <button type="button" class="shrink-0 text-blue-600 hover:underline" @click="baixarAnexo(a.id)">Baixar</button>
            </li>
          </ul>
        </div>
        <div class="mt-4">
          <p class="mb-2 text-sm font-semibold text-gray-800">Conversa</p>
          <div v-if="respostasOrdenadas.length === 0" class="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            Ainda sem respostas.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="item in respostasOrdenadas"
              :key="item.id"
              class="rounded-lg p-3 text-sm"
              :class="item.autor_tipo === 'atendente' ? 'bg-blue-50' : 'bg-gray-50'"
            >
              <p class="font-semibold text-gray-800">
                {{ item.autor_tipo === 'atendente' ? 'Atendimento' : 'Cliente' }}
              </p>
              <p class="mt-1 whitespace-pre-line text-gray-700">{{ item.mensagem }}</p>
              <ul v-if="anexosDaResposta(item).length" class="mt-2 space-y-1 border-t border-gray-200 pt-2 text-sm">
                <li
                  v-for="ax in anexosDaResposta(item)"
                  :key="ax.id"
                  class="flex flex-wrap items-center justify-between gap-2 rounded bg-white/80 px-2 py-1"
                >
                  <span class="truncate text-gray-700">{{ ax.nome_original }}</span>
                  <button type="button" class="shrink-0 text-blue-600 hover:underline" @click="baixarAnexo(ax.id)">Baixar</button>
                </li>
              </ul>
              <p class="mt-1 text-xs text-gray-500">
                {{ item.autor_tipo === 'atendente' ? 'Respondido em' : 'Enviado em' }}:
                {{ formatDateTime(item.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <textarea
          v-model="mensagem"
          rows="4"
          class="w-full rounded-lg border p-3"
          placeholder="Sua mensagem"
          @paste="onPasteResposta"
        />
        <PortalTicketAnexos ref="anexosRespostaRef" v-model="pendingReplyAttachments" />
        <button class="mt-3 rounded bg-gray-700 px-3 py-2 text-white" @click="responder">Responder</button>
      </div>
    </div>
  </portal-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PortalLayout from '@/components/layout/PortalLayout.vue'
import PortalTicketAnexos from '@/components/tickets/PortalTicketAnexos.vue'
import { ticketsPortalService } from '@/services/tickets-portal'

const route = useRoute()
const router = useRouter()
const ticket = ref<any>(null)
const mensagem = ref('')
const respostasOrdenadas = ref<any[]>([])
const pendingReplyAttachments = ref<File[]>([])
const anexosRespostaRef = ref<InstanceType<typeof PortalTicketAnexos> | null>(null)

const anexosAbertura = computed(() => {
  const list = ticket.value?.anexos_abertura
  return Array.isArray(list) ? list : []
})

const anexosDaResposta = (item: { anexos?: unknown }) => {
  const list = item?.anexos
  return Array.isArray(list) ? list : []
}

const carregar = async () => {
  try {
    const { data } = await ticketsPortalService.detalhe(Number(route.params.id))
    const t = data?.ticket
    if (!t || typeof t !== 'object') {
      ElMessage.error('Ticket não encontrado.')
      ticket.value = null
      respostasOrdenadas.value = []
      return
    }
    ticket.value = t
    const respostas = Array.isArray(t.respostas) ? t.respostas : []
    respostasOrdenadas.value = [...respostas].sort((a: any, b: any) =>
      String(a.created_at).localeCompare(String(b.created_at))
    )
  } catch {
    ElMessage.error('Não foi possível carregar o ticket.')
    ticket.value = null
    respostasOrdenadas.value = []
  }
}

const formatDateTime = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

const baixarAnexo = async (anexoId: number) => {
  try {
    const { data } = await ticketsPortalService.getAnexoDownloadUrl(Number(route.params.id), anexoId)
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

const responder = async () => {
  if (!mensagem.value.trim()) return
  try {
    const { data } = await ticketsPortalService.responder(Number(route.params.id), mensagem.value)
    const respostaId = Number(data.id)
    for (const file of pendingReplyAttachments.value) {
      try {
        await ticketsPortalService.uploadAnexo(Number(route.params.id), file, respostaId)
      } catch {
        ElMessage.error(`Não foi possível enviar o anexo: ${file.name}`)
      }
    }
    pendingReplyAttachments.value = []
    mensagem.value = ''
    ElMessage.success('Mensagem enviada com sucesso!')
    router.push('/portal/tickets')
  } catch {
    ElMessage.error('Não foi possível enviar a mensagem.')
  }
}

onMounted(carregar)
watch(
  () => route.params.id,
  () => {
    carregar()
  }
)
</script>
