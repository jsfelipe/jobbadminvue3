<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Tarefas</h2>
        <button type="button" class="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white" @click="abrirNova">
          Criar tarefa
        </button>
      </div>

      <div class="flex flex-wrap gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          v-for="aba in abas"
          :key="aba.id"
          type="button"
          class="border-b-2 pb-2 text-sm font-medium"
          :class="filtro === aba.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500'"
          @click="trocarFiltro(aba.id)"
        >
          {{ aba.nome }} {{ contagens[aba.id] }}
        </button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <input
            v-model="busca"
            type="search"
            placeholder="Buscar uma tarefa"
            class="w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            @input="aoBuscar"
          />
          <p class="mt-1 text-xs text-gray-500">{{ total }} tasks</p>
        </div>
        <div class="relative">
          <button type="button" class="text-sm font-semibold text-violet-700" @click="colunasAbertas = !colunasAbertas">
            Personalizar colunas
          </button>
          <div v-if="colunasAbertas" class="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-gray-200 bg-white p-3 shadow dark:border-gray-600 dark:bg-gray-800">
            <label v-for="coluna in colunasMeta" :key="coluna.id" class="flex items-center gap-2 py-1 text-sm text-gray-700 dark:text-gray-200">
              <input v-model="colunas[coluna.id]" type="checkbox" :disabled="coluna.id === 'titulo'" @change="salvarColunas" />
              {{ coluna.label }}
            </label>
          </div>
        </div>
      </div>

      <p v-if="erro" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ erro }}</p>
      <p v-if="carregando" class="text-sm text-gray-500">Carregando...</p>

      <div v-else class="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-gray-200 text-xs font-semibold text-gray-500 dark:border-gray-700">
            <tr>
              <th v-if="colunas.acao" class="px-3 py-3">Ação</th>
              <th v-if="colunas.tipo" class="px-3 py-3">Tipo de tarefa</th>
              <th v-if="colunas.titulo" class="px-3 py-3">Título da tarefa</th>
              <th v-if="colunas.prioridade" class="px-3 py-3">Prioridade</th>
              <th v-if="colunas.vencimento" class="px-3 py-3">Data de vencimento</th>
              <th v-if="colunas.contato" class="px-3 py-3">Contato</th>
              <th v-if="colunas.oportunidade" class="px-3 py-3">Oportunidade</th>
              <th v-if="colunas.empresa" class="px-3 py-3">Empresa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!items.length">
              <td class="px-3 py-6 text-gray-500" colspan="8">Nenhuma tarefa.</td>
            </tr>
            <tr v-for="item in items" :key="item.id" class="border-b border-gray-100 last:border-b-0 dark:border-gray-700">
              <td v-if="colunas.acao" class="px-3 py-3">
                <button type="button" class="font-semibold text-violet-700 disabled:opacity-40" :disabled="alterandoId === item.id" @click="alternarFeito(item)">
                  {{ item.feito ? 'Desfazer' : 'Concluir' }}
                </button>
              </td>
              <td v-if="colunas.tipo" class="px-3 py-3 text-gray-700 dark:text-gray-200">{{ item.tipo }}</td>
              <td v-if="colunas.titulo" class="px-3 py-3">
                <button type="button" class="text-left font-medium text-gray-900 hover:underline dark:text-white" @click="editar(item)">
                  {{ item.nome }}
                </button>
              </td>
              <td v-if="colunas.prioridade" class="px-3 py-3 text-gray-600 dark:text-gray-300">{{ item.prioridade ? 'Alta' : '--' }}</td>
              <td v-if="colunas.vencimento" class="px-3 py-3 font-medium" :class="classeVencimento(item)">
                {{ formatarVencimento(item.vencimento) }}
              </td>
              <td v-if="colunas.contato" class="px-3 py-3 text-gray-700 dark:text-gray-200">{{ item.contato_nome || '--' }}</td>
              <td v-if="colunas.oportunidade" class="px-3 py-3">
                <router-link
                  v-if="item.id_oportunidade"
                  :to="`/admin/crm/oportunidades/${item.id_oportunidade}`"
                  class="font-medium text-emerald-700 hover:underline"
                >
                  {{ item.oportunidade }}
                </router-link>
                <span v-else class="text-gray-400">--</span>
              </td>
              <td v-if="colunas.empresa" class="px-3 py-3">
                <router-link
                  v-if="item.id_cliente"
                  :to="`/admin/clientes/alterar/${item.id_cliente}`"
                  class="font-medium text-blue-700 hover:underline"
                >
                  {{ item.cliente }}
                </router-link>
                <span v-else class="text-gray-400">--</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-end gap-3 text-sm text-gray-600 dark:text-gray-300">
        <span>{{ faixa }}</span>
        <button type="button" class="rounded border px-2 py-1 disabled:opacity-40" :disabled="page <= 1" @click="ir(page - 1)">‹</button>
        <span>{{ page }} / {{ paginas }}</span>
        <button type="button" class="rounded border px-2 py-1 disabled:opacity-40" :disabled="page >= paginas" @click="ir(page + 1)">›</button>
      </div>
    </div>

    <PainelTarefa
      v-if="painel"
      :oportunidade="null"
      :cliente-nome="null"
      :tarefa="tarefaEditando"
      @close="fecharPainel"
      @salva="carregar"
    />
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { crmTarefaService } from '@/services/crmTarefa'
import PainelTarefa from './components/PainelTarefa.vue'
import { mensagemApi } from './model/oportunidade.types'
import type { FiltroTarefa, Tarefa, TarefaContagens } from './model/tarefa.types'

type ColunaId = 'acao' | 'tipo' | 'titulo' | 'prioridade' | 'vencimento' | 'contato' | 'oportunidade' | 'empresa'

const colunasMeta: { id: ColunaId; label: string }[] = [
  { id: 'acao', label: 'Ação' },
  { id: 'tipo', label: 'Tipo de tarefa' },
  { id: 'titulo', label: 'Título da tarefa' },
  { id: 'prioridade', label: 'Prioridade' },
  { id: 'vencimento', label: 'Data de vencimento' },
  { id: 'contato', label: 'Contato' },
  { id: 'oportunidade', label: 'Oportunidade' },
  { id: 'empresa', label: 'Empresa' },
]

const abas: { id: FiltroTarefa; nome: string }[] = [
  { id: 'todos', nome: 'Todos' },
  { id: 'atrasada', nome: 'Atrasada' },
  { id: 'hoje', nome: 'Hoje' },
  { id: 'semana', nome: 'Para esta semana' },
]

const padrao = (): Record<ColunaId, boolean> => ({
  acao: true,
  tipo: true,
  titulo: true,
  prioridade: true,
  vencimento: true,
  contato: true,
  oportunidade: true,
  empresa: true,
})

const lerColunas = (): Record<ColunaId, boolean> => {
  const base = padrao()
  const bruto = localStorage.getItem('crm-tarefas-colunas')
  if (!bruto) return base
  try {
    const json: unknown = JSON.parse(bruto)
    if (!json || typeof json !== 'object') return base
    const entrada = json as Record<string, unknown>
    colunasMeta.forEach((coluna) => {
      if (typeof entrada[coluna.id] === 'boolean') base[coluna.id] = entrada[coluna.id] as boolean
    })
  } catch {
    return padrao()
  }
  base.titulo = true
  return base
}

const filtro = ref<FiltroTarefa>('semana')
const busca = ref('')
const page = ref(1)
const perPage = 50
const total = ref(0)
const items = ref<Tarefa[]>([])
const contagens = ref<TarefaContagens>({ todos: 0, atrasada: 0, hoje: 0, semana: 0 })
const carregando = ref(true)
const erro = ref('')
const alterandoId = ref<number | null>(null)
const painel = ref(false)
const tarefaEditando = ref<Tarefa | null>(null)
const colunasAbertas = ref(false)
const colunas = reactive(lerColunas())

const paginas = computed(() => Math.max(1, Math.ceil(total.value / perPage)))
const faixa = computed(() => {
  if (!total.value) return '0'
  const inicio = (page.value - 1) * perPage + 1
  const fim = Math.min(page.value * perPage, total.value)
  return `${inicio}-${fim} de ${total.value}`
})

const parseData = (valor: string) => {
  const texto = valor.includes('T') ? valor : valor.replace(' ', 'T')
  return new Date(texto)
}

const formatarVencimento = (valor: string) => {
  const data = parseData(valor)
  if (Number.isNaN(data.getTime())) return valor
  const agora = new Date()
  if (data.toDateString() === agora.toDateString()) {
    return `Hoje às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const classeVencimento = (item: Tarefa) => {
  if (item.feito) return 'text-gray-400 line-through'
  const data = parseData(item.vencimento)
  if (Number.isNaN(data.getTime())) return 'text-gray-800 dark:text-gray-100'
  const agora = new Date()
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  if (data < inicioHoje) return 'text-red-600'
  if (data.toDateString() === agora.toDateString()) return 'text-orange-500'
  return 'text-gray-800 dark:text-gray-100'
}

const salvarColunas = () => {
  colunas.titulo = true
  localStorage.setItem('crm-tarefas-colunas', JSON.stringify(colunas))
}

const carregar = async () => {
  carregando.value = true
  erro.value = ''
  try {
    const resposta = await crmTarefaService.listar({
      filtro: filtro.value,
      q: busca.value.trim(),
      page: page.value,
      per_page: perPage,
    })
    if (!resposta || !Array.isArray(resposta.items) || !resposta.contagens) {
      throw new Error('resposta')
    }
    items.value = Array.isArray(resposta.items) ? resposta.items : []
    total.value = resposta.total || 0
    if (resposta.contagens) contagens.value = resposta.contagens
    if (page.value > paginas.value) page.value = paginas.value
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível carregar as tarefas.')
    items.value = []
  } finally {
    carregando.value = false
  }
}

const trocarFiltro = (id: FiltroTarefa) => {
  filtro.value = id
  page.value = 1
  void carregar()
}

let timerBusca = 0
const aoBuscar = () => {
  window.clearTimeout(timerBusca)
  timerBusca = window.setTimeout(() => {
    page.value = 1
    void carregar()
  }, 300)
}

const ir = (proxima: number) => {
  page.value = proxima
  void carregar()
}

const abrirNova = () => {
  tarefaEditando.value = null
  painel.value = true
}

const editar = (item: Tarefa) => {
  tarefaEditando.value = item
  painel.value = true
}

const fecharPainel = () => {
  painel.value = false
  tarefaEditando.value = null
}

const alternarFeito = async (item: Tarefa) => {
  alterandoId.value = item.id
  erro.value = ''
  try {
    await crmTarefaService.atualizar(item.id, { feito: !item.feito })
    await carregar()
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível atualizar a tarefa.')
  } finally {
    alterandoId.value = null
  }
}

onMounted(() => {
  void carregar()
})
</script>
