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
              <p class="mt-1 text-xs text-gray-500">
                {{ item.autor_tipo === 'atendente' ? 'Respondido em' : 'Enviado em' }}:
                {{ formatDateTime(item.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <textarea v-model="mensagem" rows="4" class="w-full rounded-lg border p-3" />
        <button class="mt-3 rounded bg-gray-700 px-3 py-2 text-white" @click="responder">Responder</button>
      </div>
    </div>
  </portal-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PortalLayout from '@/components/layout/PortalLayout.vue'
import { ticketsPortalService } from '@/services/tickets-portal'

const route = useRoute()
const router = useRouter()
const ticket = ref<any>(null)
const mensagem = ref('')
const respostasOrdenadas = ref<any[]>([])

const carregar = async () => {
  const { data } = await ticketsPortalService.detalhe(Number(route.params.id))
  ticket.value = data.ticket
  const respostas = Array.isArray(data.ticket?.respostas) ? data.ticket.respostas : []
  respostasOrdenadas.value = [...respostas]
    .filter((r: any) => !r.interno)
    .sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at)))
}

const formatDateTime = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

const responder = async () => {
  if (!mensagem.value.trim()) return
  await ticketsPortalService.responder(Number(route.params.id), mensagem.value)
  ElMessage.success('Mensagem enviada com sucesso!')
  router.push('/portal/tickets')
}

onMounted(carregar)
</script>
