<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-6">
          <input v-model="filtro.q" class="rounded-lg border px-3 py-2" placeholder="Buscar" />
          <select v-model="filtro.id_status" class="rounded-lg border px-3 py-2">
            <option value="">Status</option>
            <option v-for="item in meta.status" :key="item.id" :value="item.id">{{ item.nome }}</option>
          </select>
          <div>
            <select v-model="filtro.id_prioridade" class="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
              <option value="">Prioridade</option>
              <option v-for="item in meta.prioridades" :key="item.id" :value="item.id">
                {{ prioridadeSelectLabel(item) }}
              </option>
            </select>
            <div v-if="prioridadeFiltroSelecionada" class="mt-2">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="prioridadeBadgeClass(prioridadeFiltroSelecionada.cor)"
              >
                {{ prioridadeFiltroSelecionada.nome }}
              </span>
            </div>
          </div>
          <select v-model="filtro.id_categoria" class="rounded-lg border px-3 py-2">
            <option value="">Categoria</option>
            <option v-for="item in meta.categorias" :key="item.id" :value="item.id">{{ item.nome }}</option>
          </select>
          <button class="rounded-lg bg-gray-700 px-3 py-2 text-white" @click="carregar">Filtrar</button>
          <router-link to="/admin/tickets/novo" class="rounded-lg bg-blue-600 px-3 py-2 text-center text-white">
            Criar ticket
          </router-link>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <table class="w-full text-sm [&_td]:px-5 [&_td]:py-2.5 [&_th]:px-5 [&_th]:py-2.5">
          <thead>
            <tr class="text-left">
              <th>ID</th><th>Data/Hora</th><th>Usuário</th><th>Unidade</th><th>Assunto</th><th>Msg</th><th>Prioridade</th><th>Status</th><th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.id" class="border-t">
              <td>{{ ticket.id }}</td>
              <td>{{ formatDateTime(ticket.created_at) }}</td>
              <td>{{ ticket.nome_usuario_externo || '-' }}</td>
              <td>{{ ticket.unidade_nome || ticket.unidade_dbname || '-' }}</td>
              <td>{{ ticket.titulo }}</td>
              <td>{{ resumirDescricao(ticket.descricao) }}</td>
              <td>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="prioridadeBadgeClass(ticket.prioridade?.cor)"
                >
                  {{ ticket.prioridade?.nome || '-' }}
                </span>
              </td>
              <td>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="statusBadgeClass(ticket.status)"
                >
                  {{ ticket.status?.nome || '-' }}
                </span>
              </td>
              <td><router-link :to="`/admin/tickets/${ticket.id}`" class="text-blue-600">Abrir</router-link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ticketsAdminService } from '@/services/tickets-admin'
import { prioridadeSelectLabel } from '@/utils/ticket-prioridade-label'

const tickets = ref<any[]>([])
const meta = reactive({ status: [], prioridades: [], categorias: [] } as any)
const filtro = reactive({ q: '', id_status: '', id_prioridade: '', id_categoria: '' })
const ultimoEvento = ref('')
let pollingId: number | null = null

const prioridadeFiltroSelecionada = computed(() => {
  if (filtro.id_prioridade === '' || filtro.id_prioridade === null || filtro.id_prioridade === undefined) {
    return undefined
  }
  const id = Number(filtro.id_prioridade)
  if (Number.isNaN(id)) {
    return undefined
  }
  return meta.prioridades.find((p: { id: number }) => Number(p.id) === id)
})

const prioridadeBadgeClass = (cor: string) => {
  const c = String(cor || '').toLowerCase()
  if (c === 'red') return 'bg-red-100 text-red-700'
  if (c === 'yellow') return 'bg-yellow-100 text-yellow-700'
  if (c === 'green') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

const resumirDescricao = (descricao: string) => {
  const texto = String(descricao || '')
  return texto.length > 100 ? `${texto.slice(0, 100)}...` : texto
}

const formatDateTime = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

const statusBadgeClass = (status: any) => {
  const slug = String(status?.slug || '').toLowerCase()
  if (slug === 'aberto') return 'bg-red-100 text-red-700 animate-pulse'
  if (slug === 'em_atendimento') return 'bg-amber-100 text-amber-700'
  if (slug === 'aguardando_cliente') return 'bg-blue-100 text-blue-700'
  if (slug === 'resolvido') return 'bg-emerald-100 text-emerald-700'
  if (slug === 'fechado') return 'bg-gray-100 text-gray-700'
  return 'bg-gray-100 text-gray-700'
}

const carregar = async () => {
  const { data } = await ticketsAdminService.listar(filtro as unknown as Record<string, unknown>)
  tickets.value = data.data || []
}

const tocarSino = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch (e) {
    // noop
  }
}

const checarAtualizacoes = async (inicial = false) => {
  const { data } = await ticketsAdminService.updates(ultimoEvento.value || undefined)
  if (!inicial && data.has_updates) {
    tocarSino()
    await carregar()
  }
  if (data.latest_event_at) {
    ultimoEvento.value = data.latest_event_at
  }
}

onMounted(async () => {
  const metaResp = await ticketsAdminService.meta()
  meta.status = metaResp.data.status || []
  meta.prioridades = metaResp.data.prioridades || []
  meta.categorias = metaResp.data.categorias || []
  await carregar()
  await checarAtualizacoes(true)
  pollingId = window.setInterval(() => {
    checarAtualizacoes(false)
  }, 30000)
})

onUnmounted(() => {
  if (pollingId) {
    window.clearInterval(pollingId)
    pollingId = null
  }
})
</script>
