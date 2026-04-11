<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 class="text-lg font-semibold">Ticket #{{ ticket?.id }}</h2>
        <p class="mt-2 text-sm">
          <span class="font-semibold">Assunto:</span> {{ ticket?.titulo }}
        </p>
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
            :class="
              resposta.autor_tipo === 'atendente'
                ? 'ml-auto bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
                : 'mr-auto bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
            "
          >
            <p class="font-semibold">{{ resposta.nome_autor || resposta.autor_tipo }}</p>
            <p class="mt-1 whitespace-pre-line">{{ resposta.mensagem }}</p>
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
        <textarea
          v-model="mensagem"
          class="w-full rounded-lg border p-3"
          rows="4"
          placeholder="Resposta"
          @paste="onPasteResposta"
        />
        <PortalTicketAnexos ref="anexosRespostaRef" v-model="pendingReplyAttachments" />
        <div class="mt-3 flex gap-2">
          <button class="rounded bg-blue-600 px-3 py-2 text-white" @click="responder">Responder</button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PortalTicketAnexos from '@/components/tickets/PortalTicketAnexos.vue'
import { ticketsAdminService } from '@/services/tickets-admin'

const route = useRoute()
const ticket = ref<any>(null)
const mensagem = ref('')
const respostasOrdenadas = ref<any[]>([])
const pendingReplyAttachments = ref<File[]>([])
const anexosRespostaRef = ref<InstanceType<typeof PortalTicketAnexos> | null>(null)
const statusSelecionado = ref<any>('')
const statusOptions = ref<any[]>([])

const anexosAbertura = computed(() => {
  const list = ticket.value?.anexos_abertura
  return Array.isArray(list) ? list : []
})

const anexosDaResposta = (item: { anexos?: unknown }) => {
  const list = item?.anexos
  return Array.isArray(list) ? list : []
}

const carregar = async () => {
  const { data } = await ticketsAdminService.detalhe(Number(route.params.id))
  ticket.value = data.ticket
  statusSelecionado.value = data.ticket?.id_status || ''
  const respostas = Array.isArray(data.ticket?.respostas) ? data.ticket.respostas : []
  respostasOrdenadas.value = [...respostas].sort((a: any, b: any) =>
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

const responder = async () => {
  if (!mensagem.value.trim()) return
  try {
    const { data } = await ticketsAdminService.responder(Number(route.params.id), mensagem.value)
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

onMounted(async () => {
  const { data } = await ticketsAdminService.meta()
  statusOptions.value = data.status || []
  await carregar()
})
</script>
