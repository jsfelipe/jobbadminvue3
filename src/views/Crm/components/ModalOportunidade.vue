<template>
  <Modal full-screen-backdrop @close="emit('close')">
    <template #body>
      <div class="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ oportunidade ? 'Editar oportunidade' : 'Nova oportunidade' }}
        </h3>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-nome">Nome *</label>
            <input id="op-nome" v-model="form.nome" type="text" maxlength="160" :class="campo" :disabled="salvando" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-funil">Funil *</label>
            <select id="op-funil" v-model.number="form.id_funil" :class="campo" :disabled="salvando" @change="aoMudarFunil">
              <option v-for="funil in funis" :key="funil.id" :value="funil.id">{{ funil.nome }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-etapa">Etapa *</label>
            <select id="op-etapa" v-model.number="form.id_etapa" :class="campo" :disabled="salvando">
              <option v-for="etapa in etapas" :key="etapa.id" :value="etapa.id">
                {{ etapa.nome }} ({{ etapa.probabilidade }}%)
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-contato">Contato</label>
            <input id="op-contato" v-model="form.contato" type="text" maxlength="160" :class="campo" :disabled="salvando" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-email">E-mail</label>
            <input id="op-email" v-model="form.email" type="email" maxlength="160" :class="campo" :disabled="salvando" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-telefone">Telefone</label>
            <input id="op-telefone" v-model="form.telefone" type="text" maxlength="40" :class="campo" :disabled="salvando" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-uf">UF</label>
            <input id="op-uf" v-model="form.uf" type="text" maxlength="8" :class="campo" :disabled="salvando" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-qtd">Qtd. funcionários</label>
            <select id="op-qtd" v-model="form.qtd_funcionarios" :class="campo" :disabled="salvando">
              <option :value="null">—</option>
              <option
                v-if="form.qtd_funcionarios && !meta.qtd_funcionarios.includes(form.qtd_funcionarios)"
                :value="form.qtd_funcionarios"
              >
                {{ form.qtd_funcionarios }}
              </option>
              <option v-for="qtd in meta.qtd_funcionarios" :key="qtd" :value="qtd">
                {{ QTD_FUNC_LABEL[qtd] || qtd }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-tag">Tag</label>
            <select id="op-tag" v-model="form.tag" :class="campo" :disabled="salvando">
              <option :value="null">—</option>
              <option v-if="form.tag && !meta.tags[form.tag]" :value="form.tag">{{ form.tag }}</option>
              <option v-for="(label, key) in meta.tags" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-valor">Valor</label>
            <input id="op-valor" v-model.number="form.valor" type="number" min="0" step="0.01" :class="campo" :disabled="salvando" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-promo">Código promoção</label>
            <input id="op-promo" v-model="form.codigo_promocao" type="text" maxlength="80" :class="campo" :disabled="salvando" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-cliente">ID do cliente</label>
            <input id="op-cliente" v-model="idCliente" type="number" min="1" :class="campo" :disabled="salvando" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-resp">Responsável</label>
            <select id="op-resp" v-model="idUsuario" :class="campo" :disabled="salvando">
              <option value="">—</option>
              <option v-for="usuario in usuarios" :key="usuario.id_usuarios" :value="String(usuario.id_usuarios)">
                {{ usuario.nome }}
              </option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-interesse">Interesse</label>
            <input id="op-interesse" v-model="form.interesse" type="text" maxlength="255" :class="campo" :disabled="salvando" />
          </div>
          <div v-if="etapaAtual?.tipo === 'perdido'" class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-motivo">Motivo da perda *</label>
            <select id="op-motivo" v-model="form.motivo_perda" :class="campo" :disabled="salvando">
              <option :value="null">Selecione</option>
              <option v-for="(label, key) in meta.motivos_perda" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div v-if="etapaAtual?.tipo === 'ganho'">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-fechamento">Data de fechamento</label>
            <input id="op-fechamento" v-model="form.data_fechamento" type="date" :class="campo" :disabled="salvando" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="op-desc">Descrição</label>
            <textarea id="op-desc" v-model="form.descricao" rows="3" :class="campo" :disabled="salvando"></textarea>
          </div>
        </div>

        <p v-if="etapaAtual" class="mt-2 text-xs text-gray-500">
          Etapa {{ TIPO_ETAPA_LABEL[etapaAtual.tipo] }} · {{ etapaAtual.probabilidade }}%
        </p>
        <p v-if="erro" class="mt-3 text-xs text-red-600">{{ erro }}</p>

        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200"
            :disabled="salvando"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="salvando"
            @click="salvar"
          >
            {{ salvando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import {
  QTD_FUNC_LABEL,
  TIPO_ETAPA_LABEL,
  mensagemApi,
  type Funil,
  type Oportunidade,
  type OportunidadeMeta,
  type OportunidadePayload,
  type UsuarioAdmin,
} from '../model/oportunidade.types'

const props = defineProps<{
  oportunidade: Oportunidade | null
  funis: Funil[]
  idFunil: number | null
  usuarios: UsuarioAdmin[]
  meta: OportunidadeMeta
}>()

const emit = defineEmits<{
  close: []
  salvo: []
}>()

const campo =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'

const funilInicial = props.oportunidade?.id_funil || props.idFunil || props.funis[0]?.id || 0
const etapasIniciais = props.funis.find((funil) => funil.id === funilInicial)?.etapas ?? []

const form = ref<OportunidadePayload>({
  nome: props.oportunidade?.nome ?? '',
  id_funil: funilInicial,
  id_etapa: props.oportunidade?.id_etapa || etapasIniciais[0]?.id || 0,
  id_cliente: props.oportunidade?.id_cliente ?? null,
  id_usuario_responsavel: props.oportunidade?.id_usuario_responsavel ?? null,
  contato: props.oportunidade?.contato ?? '',
  email: props.oportunidade?.email ?? '',
  telefone: props.oportunidade?.telefone ?? '',
  uf: props.oportunidade?.uf ?? '',
  qtd_funcionarios: props.oportunidade?.qtd_funcionarios ?? null,
  interesse: props.oportunidade?.interesse ?? '',
  codigo_promocao: props.oportunidade?.codigo_promocao ?? '',
  tag: props.oportunidade?.tag ?? null,
  descricao: props.oportunidade?.descricao ?? '',
  valor: props.oportunidade?.valor ?? 0,
  motivo_perda: props.oportunidade?.motivo_perda ?? null,
  data_fechamento: props.oportunidade?.data_fechamento
    ? props.oportunidade.data_fechamento.slice(0, 10)
    : null,
})

const idCliente = ref(props.oportunidade?.id_cliente ? String(props.oportunidade.id_cliente) : '')
const idUsuario = ref(
  props.oportunidade?.id_usuario_responsavel ? String(props.oportunidade.id_usuario_responsavel) : '',
)
const salvando = ref(false)
const erro = ref('')

const etapas = computed(() => props.funis.find((funil) => funil.id === Number(form.value.id_funil))?.etapas ?? [])
const etapaAtual = computed(() => etapas.value.find((etapa) => etapa.id === Number(form.value.id_etapa)) ?? null)

const aoMudarFunil = () => {
  if (!etapas.value.some((etapa) => etapa.id === Number(form.value.id_etapa))) {
    form.value.id_etapa = etapas.value[0]?.id ?? 0
  }
}

const salvar = async () => {
  erro.value = ''
  if (!form.value.nome.trim()) {
    erro.value = 'Nome é obrigatório.'
    return
  }
  if (!form.value.id_etapa) {
    erro.value = 'Selecione a etapa.'
    return
  }
  if (etapaAtual.value?.tipo === 'perdido' && !form.value.motivo_perda) {
    erro.value = 'Informe o motivo da perda.'
    return
  }
  salvando.value = true
  const payload: OportunidadePayload = {
    ...form.value,
    nome: form.value.nome.trim(),
    id_funil: Number(form.value.id_funil),
    id_etapa: Number(form.value.id_etapa),
    id_cliente: idCliente.value ? Number(idCliente.value) : null,
    id_usuario_responsavel: idUsuario.value ? Number(idUsuario.value) : null,
    contato: form.value.contato || null,
    email: form.value.email || null,
    telefone: form.value.telefone || null,
    uf: form.value.uf || null,
    interesse: form.value.interesse || null,
    codigo_promocao: form.value.codigo_promocao || null,
    descricao: form.value.descricao || null,
    valor: form.value.valor === null ? 0 : Number(form.value.valor),
    motivo_perda: etapaAtual.value?.tipo === 'perdido' ? form.value.motivo_perda : null,
    data_fechamento: etapaAtual.value?.tipo === 'ganho' ? form.value.data_fechamento : null,
  }
  try {
    if (props.oportunidade) {
      await crmService.oportunidadeAtualizar(props.oportunidade.id, payload)
    } else {
      await crmService.oportunidadeCriar(payload)
    }
    emit('salvo')
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível salvar a oportunidade.')
  } finally {
    salvando.value = false
  }
}
</script>
