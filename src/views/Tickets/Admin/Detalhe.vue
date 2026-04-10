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
        <textarea v-model="mensagem" class="w-full rounded-lg border p-3" rows="4" />
        <div class="mt-3 flex gap-2">
          <button class="rounded bg-blue-600 px-3 py-2 text-white" @click="responder">Responder</button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ticketsAdminService } from '@/services/tickets-admin'

const route = useRoute()
const ticket = ref<any>(null)
const mensagem = ref('')
const respostasOrdenadas = ref<any[]>([])
const statusSelecionado = ref<any>('')
const statusOptions = ref<any[]>([])

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

const responder = async () => {
  if (!mensagem.value.trim()) return
  await ticketsAdminService.responder(Number(route.params.id), mensagem.value)
  mensagem.value = ''
  await carregar()
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
