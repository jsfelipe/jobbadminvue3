<template>
  <Modal full-screen-backdrop @close="emit('close')">
    <template #body>
      <div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">WhatsApp</h3>
        <p class="mt-1 text-sm text-gray-500">Para {{ oportunidade.telefone || 'o telefone do cliente' }}</p>
        <p class="text-sm text-gray-700 dark:text-gray-200">De {{ remetente }}</p>
        <select v-if="linhas.length > 1" v-model="idLinha" class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
          <option v-for="linha in linhas" :key="linha.id" :value="linha.id">{{ linha.nome }} · {{ formatarTelefone(linha.telefone) }}</option>
        </select>
        <select v-model="idModelo" class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" @change="aplicarModelo">
          <option value="">Mensagem em branco</option>
          <optgroup v-for="grupo in grupos" :key="grupo.tema" :label="grupo.rotulo">
            <option v-for="modelo in grupo.itens" :key="modelo.id" :value="modelo.id">{{ modelo.titulo }}</option>
          </optgroup>
        </select>
        <textarea
          v-model="texto"
          rows="6"
          placeholder="Mensagem"
          class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p v-if="erro" class="mt-2 text-xs text-red-600">{{ erro }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="emit('close')">Cancelar</button>
          <button type="button" class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" :disabled="enviando" @click="enviar">
            Enviar
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import { mensagemApi, TEMA_MENSAGEM, type MensagemModelo, type OportunidadeEvento, type WhatsappLinha } from '../model/oportunidade.types'

const props = defineProps<{
  oportunidade: {
    id: number
    nome: string
    contato?: string | null
    telefone?: string | null
  }
}>()

const emit = defineEmits<{
  close: []
  enviado: [evento: OportunidadeEvento]
}>()

const modelos = ref<MensagemModelo[]>([])
const linhas = ref<WhatsappLinha[]>([])
const idLinha = ref('')
const idModelo = ref<number | ''>('')
const texto = ref('')
const erro = ref('')
const enviando = ref(false)

const linhaAtual = computed(() => linhas.value.find((linha) => linha.id === idLinha.value) || linhas.value[0] || null)

const formatarTelefone = (valor: string): string => {
  const digitos = valor.replace(/\D/g, '')
  if (digitos.length === 13) return `+${digitos.slice(0, 2)} (${digitos.slice(2, 4)}) ${digitos.slice(4, 9)}-${digitos.slice(9)}`
  if (digitos.length === 12) return `+${digitos.slice(0, 2)} (${digitos.slice(2, 4)}) ${digitos.slice(4, 8)}-${digitos.slice(8)}`
  return valor || 'número não configurado'
}

const remetente = computed(() => {
  const linha = linhaAtual.value
  if (!linha) return 'linha não configurada'
  const telefone = formatarTelefone(linha.telefone)
  return linha.nome ? `${linha.nome} · ${telefone}` : telefone
})

const grupos = computed(() => {
  const ordem: MensagemModelo['tema'][] = ['cadastro_sem_resposta', 'pos_apresentacao', 'pos_proposta']
  return ordem
    .map((tema) => ({
      tema,
      rotulo: TEMA_MENSAGEM[tema],
      itens: modelos.value.filter((modelo) => modelo.tema === tema),
    }))
    .filter((grupo) => grupo.itens.length > 0)
})

const aplicarModelo = () => {
  const modelo = modelos.value.find((item) => item.id === Number(idModelo.value))
  if (!modelo) {
    texto.value = ''
    return
  }
  const nome = (props.oportunidade.contato || props.oportunidade.nome || '').trim()
  texto.value = modelo.texto.replace(/\{nome\}/g, nome || 'tudo bem')
}

const enviar = async () => {
  const mensagem = texto.value.trim()
  if (!mensagem) {
    erro.value = 'Digite a mensagem.'
    return
  }
  enviando.value = true
  erro.value = ''
  try {
    const evento = await crmService.oportunidadeWhatsapp(props.oportunidade.id, mensagem, idLinha.value || linhas.value[0]?.id || '')
    emit('enviado', evento)
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível enviar.')
  } finally {
    enviando.value = false
  }
}

onMounted(async () => {
  const [listaModelos, listaLinhas] = await Promise.all([
    crmService.mensagensModelo(),
    crmService.whatsappLinhas(),
  ])
  modelos.value = listaModelos
  linhas.value = listaLinhas
  idLinha.value = listaLinhas[0]?.id || ''
})
</script>
