<template>
  <Modal full-screen-backdrop @close="$emit('close')">
    <template #body>
      <div class="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ titulo }}</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          <span class="font-semibold text-gray-800 dark:text-gray-200">{{ cliente.nome }}</span>
          <span v-if="cliente.dominio"> ({{ cliente.dominio }})</span>
        </p>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="filaBadgeClass(tipoFila)">
            {{ FILA_LABEL[tipoFila] }}
          </span>
          <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusBadgeClass(statusAtual)">
            Atual: {{ statusLabel(statusAtual, tipoFila) }}
          </span>
          <span
            v-if="cliente.caso?.sem_retorno"
            class="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/40 dark:text-orange-100"
          >
            Sem retorno ({{ cliente.caso.tentativas }}x)
          </span>
        </div>

        <div class="mt-4">
          <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="crm-descricao">O que foi feito?</label>
          <textarea
            id="crm-descricao"
            ref="textareaRef"
            v-model="descricao"
            rows="4"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Ex.: Enviei mensagem no WhatsApp lembrando do vencimento."
            :disabled="salvando"
            @keydown.ctrl.enter="salvar"
          ></textarea>
        </div>

        <div class="mt-3">
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Resultado</span>
          <div class="mt-1 grid grid-cols-2 gap-2">
            <label
              v-for="s in STATUS_REGISTRO"
              :key="s"
              class="flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm dark:border-gray-600"
              :class="status === s ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40' : 'border-gray-200'"
            >
              <input v-model="status" type="radio" :value="s" class="mt-0.5" :disabled="salvando" />
              <span>
                <span class="font-semibold text-gray-800 dark:text-gray-100">{{ statusLabel(s, tipoFila) }}</span>
                <span class="block text-xs text-gray-500 dark:text-gray-400">{{ STATUS_HINT[s] }}</span>
              </span>
            </label>
          </div>
        </div>

        <div v-if="status === 'aguardando_retorno'" class="mt-3">
          <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="crm-prazo">Prazo para retorno</label>
          <input
            id="crm-prazo"
            v-model="prazo"
            type="date"
            :min="hojeIso"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :disabled="salvando"
          />
          <p class="mt-1 text-xs text-gray-500">Sem resposta até essa data, o cliente volta para Pendentes com a tag "Sem retorno".</p>
        </div>

        <div v-if="status === 'encerrado'" class="mt-3">
          <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="crm-motivo">Motivo do encerramento</label>
          <select
            id="crm-motivo"
            v-model="motivo"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :disabled="salvando"
          >
            <option :value="null" disabled>Selecione...</option>
            <option v-for="m in motivosDisponiveis" :key="m" :value="m">{{ MOTIVO_ENCERRAMENTO_LABEL[m] }}</option>
          </select>
        </div>

        <p v-if="erro" class="mt-2 text-xs text-red-600">{{ erro }}</p>

        <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Será registrado em <span class="font-semibold">{{ agora }}</span> por
          <span class="font-semibold">{{ nomeUsuario }}</span>
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-gray-200"
            :disabled="salvando"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="!podeSalvar"
            @click="salvar"
          >
            {{ salvando ? 'Salvando...' : 'Registrar' }}
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { toast } from 'vue3-toastify'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import {
  FILA_LABEL,
  MOTIVO_ENCERRAMENTO_LABEL,
  MOTIVOS_ENCERRAMENTO,
  STATUS_REGISTRO,
  statusLabel,
  type ClienteFila,
  type CrmAtendimentoRegistrado,
  type MotivoEncerramento,
  type StatusCaso,
  type StatusRegistro,
  type TipoFila,
} from '../model/crm.types'
import { filaBadgeClass, statusBadgeClass } from '../model/crm.ui'

const props = defineProps<{
  cliente: ClienteFila
  tipoFila: TipoFila
  statusAtual: StatusCaso
  statusInicial: StatusRegistro
  prazoPadrao: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'registrado', registro: CrmAtendimentoRegistrado): void
}>()

interface LoginState {
  data?: { nome?: string; name?: string }
}

const STATUS_HINT: Record<StatusRegistro, string> = {
  aguardando_retorno: 'Mensagem enviada, esperando o cliente',
  em_atendimento: 'Cliente respondeu, caso em andamento',
  resolvido: 'Desfecho positivo',
  encerrado: 'Não contatar mais',
}

const store = useStore()
const descricao = ref('')
const status = ref<StatusRegistro>(props.statusInicial)
const prazo = ref(props.prazoPadrao)
const motivo = ref<MotivoEncerramento | null>(null)
const salvando = ref(false)
const erro = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const agora = ref(new Date().toLocaleString('pt-BR'))
const hojeIso = new Date().toISOString().slice(0, 10)

const titulo = computed(() => (props.statusAtual === 'pendente' ? 'Registrar contato' : 'Registrar retorno'))

const nomeUsuario = computed(() => {
  const login = (store.state as { Login?: LoginState }).Login
  return login?.data?.nome || login?.data?.name || 'usuário logado'
})

const motivosDisponiveis = computed(() =>
  props.tipoFila === 'teste_expirado'
    ? MOTIVOS_ENCERRAMENTO.filter((m) => m !== 'cancelamento')
    : MOTIVOS_ENCERRAMENTO,
)

const podeSalvar = computed(
  () =>
    !salvando.value &&
    descricao.value.trim().length >= 3 &&
    (status.value !== 'encerrado' || motivo.value !== null) &&
    (status.value !== 'aguardando_retorno' || prazo.value !== ''),
)

const salvar = async () => {
  erro.value = ''
  if (descricao.value.trim().length < 3) {
    erro.value = 'Descreva o que foi feito (mínimo 3 caracteres).'
    return
  }
  if (status.value === 'encerrado' && !motivo.value) {
    erro.value = 'Informe o motivo do encerramento.'
    return
  }
  let cancelarCliente = false
  if (
    status.value === 'encerrado' &&
    motivo.value === 'cancelamento' &&
    (props.tipoFila === 'risco_abandono' || props.tipoFila === 'atraso_pagamento')
  ) {
    cancelarCliente = window.confirm('Deseja alterar o tipo do cliente para Cancelado?')
  }
  salvando.value = true
  try {
    const registro = await crmService.registrar({
      id_cliente: props.cliente.id_cliente,
      tipo_fila: props.tipoFila,
      descricao: descricao.value.trim(),
      status: status.value,
      prazo_retorno: status.value === 'aguardando_retorno' ? prazo.value : null,
      motivo_encerramento: status.value === 'encerrado' ? motivo.value : null,
      cancelar_cliente: cancelarCliente,
    })
    toast.success(`Registrado: ${statusLabel(status.value, props.tipoFila)}`)
    emit('registrado', registro)
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string; error?: string } } }
    erro.value = ax.response?.data?.error || ax.response?.data?.message || 'Não foi possível registrar. Tente novamente.'
  } finally {
    salvando.value = false
  }
}

onMounted(() => {
  textareaRef.value?.focus()
})
</script>
