<template>
  <Teleport to="body">
  <div class="fixed inset-0 z-[99999] flex justify-end">
    <button type="button" class="absolute inset-0 bg-black/30" aria-label="Fechar" @click="fechar" />
    <aside class="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-900">
      <header class="flex items-center justify-between bg-green-400 px-4 py-3 text-gray-900">
        <h3 class="text-base font-semibold">{{ editando ? 'Editar tarefa' : 'Criar uma tarefa' }}</h3>
        <button type="button" class="rounded p-1 hover:bg-green-500/40" aria-label="Fechar" @click="fechar">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </header>
      <form id="form-tarefa" class="flex-1 space-y-4 overflow-y-auto px-4 py-4" @submit.prevent="salvar">
        <label class="block text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-200">Tipo de tarefa</span>
          <select v-model.number="idTipo" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">{{ tipo.nome }}</option>
          </select>
        </label>
        <label class="block text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-200">Nome</span>
          <input v-model="nome" type="text" maxlength="160" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </label>
        <div v-if="oportunidadeFixa" class="text-sm">
          <p class="font-medium text-gray-700 dark:text-gray-200">Oportunidade</p>
          <p class="mt-1 text-gray-900 dark:text-white">{{ oportunidadeFixa.nome }}</p>
        </div>
        <div v-else class="relative text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-200">Oportunidade</span>
          <input
            v-model="buscaOportunidade"
            type="search"
            placeholder="Buscar oportunidade"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            @input="aoBuscarOportunidade"
          />
          <ul v-if="oportunidades.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow dark:border-gray-600 dark:bg-gray-800">
            <li v-for="item in oportunidades" :key="item.id">
              <button type="button" class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700" @click="escolherOportunidade(item)">
                {{ item.nome }}
              </button>
            </li>
          </ul>
          <button v-if="idOportunidade" type="button" class="mt-1 text-xs font-semibold text-gray-500 hover:underline" @click="limparOportunidade">
            Remover oportunidade
          </button>
        </div>
        <div class="relative text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-200">Cliente</span>
          <input
            v-model="buscaCliente"
            type="search"
            placeholder="Buscar cliente"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            @input="aoBuscarCliente"
          />
          <ul v-if="clientes.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow dark:border-gray-600 dark:bg-gray-800">
            <li v-for="item in clientes" :key="item.id_cliente">
              <button type="button" class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700" @click="escolherCliente(item)">
                {{ item.nome }}
              </button>
            </li>
          </ul>
          <button v-if="idCliente" type="button" class="mt-1 text-xs font-semibold text-gray-500 hover:underline" @click="limparCliente">
            Remover cliente
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-200">Data de vencimento</span>
            <input v-model="data" type="date" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
          </label>
          <label class="block text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-200">Hora</span>
            <input v-model="hora" type="time" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
          </label>
        </div>
        <div class="flex items-center justify-between gap-3 text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-200">Definir lembrete</span>
          <button
            type="button"
            class="relative h-6 w-11 rounded-full transition"
            :class="lembrete ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
            :aria-pressed="lembrete"
            @click="alternarLembrete"
          >
            <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition" :class="lembrete ? 'left-5' : 'left-0.5'" />
          </button>
        </div>
        <p v-if="!lembrete" class="-mt-2 text-xs text-gray-500">Sem lembrete</p>
        <div v-else class="grid grid-cols-2 gap-3">
          <input v-model="dataLembrete" type="date" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
          <input v-model="horaLembrete" type="time" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
        <div class="text-sm">
          <p class="font-medium text-gray-700 dark:text-gray-200">Contato</p>
          <p v-if="contatoNome || contatoEmail" class="mt-1 text-gray-900 dark:text-white">
            {{ contatoNome || 'Sem nome' }}
            <span v-if="contatoEmail" class="block text-gray-500">{{ contatoEmail }}</span>
          </p>
          <p v-else class="mt-1 text-gray-500">Nenhum contato</p>
        </div>
        <div class="flex items-center justify-between gap-3 text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-200">Prioridade da tarefa</span>
          <button
            type="button"
            class="relative h-6 w-11 rounded-full transition"
            :class="prioridade ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
            :aria-pressed="prioridade"
            @click="prioridade = !prioridade"
          >
            <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition" :class="prioridade ? 'left-5' : 'left-0.5'" />
          </button>
        </div>
        <p class="-mt-2 text-xs text-gray-500">{{ prioridade ? 'Alta prioridade' : 'Definir como alta prioridade' }}</p>
        <label class="block text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-200">Notas</span>
          <textarea v-model="notas" rows="6" placeholder="Faça anotações aqui..." class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </label>
        <p v-if="erro" class="text-xs text-red-600">{{ erro }}</p>
      </form>
      <footer class="flex justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600" @click="fechar">Cancelar</button>
        <button type="submit" form="form-tarefa" class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" :disabled="salvando">
          {{ editando ? 'Salvar' : 'Criar' }}
        </button>
      </footer>
    </aside>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/services/http'
import { crmTarefaService } from '@/services/crmTarefa'
import { mensagemApi } from '../model/oportunidade.types'
import type { ClienteBusca, OportunidadeBusca, Tarefa, TarefaPayload, TarefaTipo } from '../model/tarefa.types'

const props = defineProps<{
  oportunidade: {
    id: number
    nome: string
    id_cliente: number | null
    contato: string | null
    email: string | null
  } | null
  clienteNome: string | null
  tarefa: Tarefa | null
}>()

const emit = defineEmits<{
  close: []
  salva: []
}>()

const tipos = ref<TarefaTipo[]>([])
const idTipo = ref(0)
const nome = ref('')
const notas = ref('')
const data = ref('')
const hora = ref('09:00')
const lembrete = ref(false)
const dataLembrete = ref('')
const horaLembrete = ref('09:00')
const prioridade = ref(false)
const idOportunidade = ref<number | null>(null)
const idCliente = ref<number | null>(null)
const contatoNome = ref('')
const contatoEmail = ref('')
const buscaOportunidade = ref('')
const oportunidades = ref<OportunidadeBusca[]>([])
const buscaCliente = ref('')
const clientes = ref<ClienteBusca[]>([])
const erro = ref('')
const salvando = ref(false)

const editando = computed(() => !!props.tarefa)
const oportunidadeFixa = computed(() => (props.tarefa ? null : props.oportunidade))

const dois = (n: number) => String(n).padStart(2, '0')

const hoje = () => {
  const agora = new Date()
  return `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`
}

const partir = (valor: string | null) => {
  if (!valor) return { data: '', hora: '09:00' }
  const texto = valor.includes('T') ? valor : valor.replace(' ', 'T')
  const [dia, tempo] = texto.split('T')
  return { data: dia || '', hora: (tempo || '09:00').slice(0, 5) }
}

const juntar = (dia: string, tempo: string) => (dia ? `${dia}T${tempo || '09:00'}` : '')

let timerOportunidade = 0
let timerCliente = 0

const aoBuscarOportunidade = () => {
  idOportunidade.value = null
  window.clearTimeout(timerOportunidade)
  timerOportunidade = window.setTimeout(async () => {
    const termo = buscaOportunidade.value.trim()
    if (termo.length < 2) {
      oportunidades.value = []
      return
    }
    try {
      const lista = await crmTarefaService.buscarOportunidades(termo)
      if (buscaOportunidade.value.trim() !== termo) return
      oportunidades.value = Array.isArray(lista) ? lista : []
    } catch {
      oportunidades.value = []
    }
  }, 250)
}

const escolherOportunidade = (item: OportunidadeBusca) => {
  idOportunidade.value = item.id
  buscaOportunidade.value = item.nome
  oportunidades.value = []
  contatoNome.value = item.contato || ''
  contatoEmail.value = item.email || ''
  if (item.id_cliente) {
    idCliente.value = item.id_cliente
    buscaCliente.value = item.cliente || ''
  }
}

const limparOportunidade = () => {
  idOportunidade.value = null
  buscaOportunidade.value = ''
  oportunidades.value = []
  contatoNome.value = ''
  contatoEmail.value = ''
}

const aoBuscarCliente = () => {
  idCliente.value = null
  window.clearTimeout(timerCliente)
  timerCliente = window.setTimeout(async () => {
    const termo = buscaCliente.value.trim()
    if (termo.length < 2) {
      clientes.value = []
      return
    }
    try {
      const { data: lista } = await api.get<ClienteBusca[]>('/clientes/autocomplete', {
        params: { q: termo, sem_filtro_responsavel: 1 },
      })
      if (buscaCliente.value.trim() !== termo) return
      clientes.value = Array.isArray(lista) ? lista : []
    } catch {
      clientes.value = []
    }
  }, 250)
}

const escolherCliente = (item: ClienteBusca) => {
  idCliente.value = item.id_cliente
  buscaCliente.value = item.nome
  clientes.value = []
}

const limparCliente = () => {
  idCliente.value = null
  buscaCliente.value = ''
  clientes.value = []
}

const alternarLembrete = () => {
  lembrete.value = !lembrete.value
  if (lembrete.value && !dataLembrete.value) {
    dataLembrete.value = data.value || hoje()
    horaLembrete.value = hora.value || '09:00'
  }
}

const fechar = () => {
  if (salvando.value) return
  emit('close')
}

const salvar = async () => {
  if (!nome.value.trim() || !data.value) {
    erro.value = 'Informe o nome e a data da tarefa.'
    return
  }
  if (!idTipo.value) {
    erro.value = 'Informe o tipo da tarefa.'
    return
  }
  salvando.value = true
  erro.value = ''
  const payload: TarefaPayload = {
    id_tipo: idTipo.value,
    nome: nome.value.trim(),
    notas: notas.value.trim() || null,
    vencimento: juntar(data.value, hora.value),
    lembrete_em: lembrete.value ? juntar(dataLembrete.value || data.value, horaLembrete.value || hora.value) : null,
    prioridade: prioridade.value,
    id_oportunidade: oportunidadeFixa.value ? oportunidadeFixa.value.id : idOportunidade.value,
    id_cliente: idCliente.value,
    contato_nome: contatoNome.value.trim() || null,
    contato_email: contatoEmail.value.trim() || null,
  }
  try {
    if (props.tarefa) {
      await crmTarefaService.atualizar(props.tarefa.id, payload)
    } else {
      await crmTarefaService.criar(payload)
    }
    emit('salva')
    emit('close')
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível salvar a tarefa.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  data.value = hoje()
  if (props.tarefa) {
    const atual = props.tarefa
    idTipo.value = atual.id_tipo
    nome.value = atual.nome
    notas.value = atual.notas
    const venc = partir(atual.vencimento)
    data.value = venc.data || hoje()
    hora.value = venc.hora
    const lem = partir(atual.lembrete_em)
    lembrete.value = !!atual.lembrete_em
    dataLembrete.value = lem.data
    horaLembrete.value = lem.hora
    prioridade.value = atual.prioridade
    idOportunidade.value = atual.id_oportunidade
    buscaOportunidade.value = atual.oportunidade || ''
    idCliente.value = atual.id_cliente
    buscaCliente.value = atual.cliente || ''
    contatoNome.value = atual.contato_nome
    contatoEmail.value = atual.contato_email
  } else if (props.oportunidade) {
    idOportunidade.value = props.oportunidade.id
    idCliente.value = props.oportunidade.id_cliente
    buscaCliente.value = props.clienteNome || ''
    contatoNome.value = props.oportunidade.contato || ''
    contatoEmail.value = props.oportunidade.email || ''
  }
  try {
    const lista = await crmTarefaService.tipos()
    tipos.value = Array.isArray(lista) ? lista : []
    if (!idTipo.value && tipos.value[0]) idTipo.value = tipos.value[0].id
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível carregar os tipos.')
  }
})
</script>
