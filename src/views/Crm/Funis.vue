<template>
  <section class="space-y-4">
    <div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">Funis</h3>
      <p class="mt-1 text-sm text-gray-500">Etapas, probabilidade e funil padrão das oportunidades.</p>
    </div>

    <p v-if="erro" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ erro }}</p>

      <form class="grid gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:grid-cols-4" @submit.prevent="criarFunil">
        <div class="sm:col-span-2">
          <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="novo-funil">Novo funil</label>
          <input id="novo-funil" v-model="novo.nome" type="text" maxlength="120" required :class="campo" />
        </div>
        <label class="flex items-end gap-2 pb-2 text-sm text-gray-700 dark:text-gray-200">
          <input v-model="novo.padrao" type="checkbox" class="rounded border-gray-300" />
          Padrão
        </label>
        <button type="submit" class="h-10 self-end rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60" :disabled="salvando">
          Criar funil
        </button>
      </form>

      <article
        v-for="funil in funis"
        :key="funil.id"
        class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      >
        <div class="grid gap-3 sm:grid-cols-6">
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400">Nome</label>
            <input v-model="funil.nome" type="text" maxlength="120" :class="campo" />
          </div>
          <label class="flex items-end gap-2 pb-2 text-sm text-gray-700 dark:text-gray-200">
            <input v-model="funil.padrao" type="checkbox" class="rounded border-gray-300" />
            Padrão
          </label>
          <label class="flex items-end gap-2 pb-2 text-sm text-gray-700 dark:text-gray-200">
            <input v-model="funil.ativo" type="checkbox" class="rounded border-gray-300" />
            Ativo
          </label>
          <div class="flex items-end gap-2 sm:col-span-2">
            <button
              type="button"
              class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              :disabled="salvando"
              @click="salvarFunil(funil)"
            >
              Salvar
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
              :disabled="salvando || funil.padrao"
              @click="excluirFunil(funil)"
            >
              Excluir
            </button>
            <span class="pb-2 text-xs text-gray-500">{{ funil.oportunidades_count || 0 }} oportunidades</span>
          </div>
        </div>

        <draggable
          v-model="funil.etapas"
          item-key="id"
          handle=".etapa-handle"
          class="mt-4 space-y-2"
          @end="reordenar(funil)"
        >
          <template #item="{ element }">
            <div class="grid items-end gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700 sm:grid-cols-12">
              <button type="button" class="etapa-handle cursor-grab pb-2 text-gray-400 sm:col-span-1" title="Arrastar">::</button>
              <div class="sm:col-span-4">
                <input v-model="element.nome" type="text" maxlength="120" :class="campo" />
              </div>
              <div class="sm:col-span-2">
                <input v-model.number="element.probabilidade" type="number" min="0" max="100" :class="campo" />
              </div>
              <div class="sm:col-span-2">
                <select v-model="element.tipo" :class="campo">
                  <option v-for="(label, tipo) in TIPO_ETAPA_LABEL" :key="tipo" :value="tipo">{{ label }}</option>
                </select>
              </div>
              <div class="flex gap-2 sm:col-span-3">
                <button
                  type="button"
                  class="rounded-lg bg-gray-800 px-3 py-2 text-xs font-semibold text-white"
                  :disabled="salvando"
                  @click="salvarEtapa(funil, element)"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700"
                  :disabled="salvando"
                  @click="excluirEtapa(funil, element)"
                >
                  Excluir
                </button>
              </div>
            </div>
          </template>
        </draggable>

        <form
          v-if="etapasNovas[funil.id]"
          class="mt-3 grid gap-2 sm:grid-cols-12"
          @submit.prevent="criarEtapa(funil)"
        >
          <input v-model="etapasNovas[funil.id].nome" type="text" maxlength="120" placeholder="Nova etapa" required :class="campo + ' sm:col-span-4'" />
          <input v-model.number="etapasNovas[funil.id].probabilidade" type="number" min="0" max="100" placeholder="%" :class="campo + ' sm:col-span-2'" />
          <select v-model="etapasNovas[funil.id].tipo" :class="campo + ' sm:col-span-2'">
            <option v-for="(label, tipo) in TIPO_ETAPA_LABEL" :key="tipo" :value="tipo">{{ label }}</option>
          </select>
          <button type="submit" class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 sm:col-span-2 dark:border-gray-600 dark:text-gray-200" :disabled="salvando">
            Adicionar
          </button>
        </form>
      </article>
    </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import draggable from 'vuedraggable'
import { crmService } from '@/services/crm'
import {
  TIPO_ETAPA_LABEL,
  mensagemApi,
  type EtapaPayload,
  type Funil,
  type FunilEtapa,
  type TipoEtapa,
} from './model/oportunidade.types'

const campo =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'

const funis = ref<Funil[]>([])
const erro = ref('')
const salvando = ref(false)
const novo = reactive({ nome: '', padrao: false })
const etapasNovas = reactive<Record<number, EtapaPayload>>({})

const garantirEtapaNova = (idFunil: number) => {
  if (!etapasNovas[idFunil]) {
    etapasNovas[idFunil] = { nome: '', probabilidade: 10, tipo: 'aberto' }
  }
}

const carregar = async () => {
  erro.value = ''
  funis.value = await crmService.funisListar()
  if (!Array.isArray(funis.value)) {
    erro.value = 'Não foi possível carregar os funis.'
    funis.value = []
    return
  }
  funis.value.forEach((funil) => garantirEtapaNova(funil.id))
}

const aplicar = (atualizado: Funil) => {
  const idx = funis.value.findIndex((funil) => funil.id === atualizado.id)
  if (idx >= 0) funis.value[idx] = atualizado
}

const criarFunil = async () => {
  salvando.value = true
  erro.value = ''
  try {
    const criado = await crmService.funilCriar({
      nome: novo.nome.trim(),
      padrao: novo.padrao,
      ativo: true,
    })
    novo.nome = ''
    novo.padrao = false
    if (criado.padrao) {
      funis.value = funis.value.map((funil) => ({ ...funil, padrao: false }))
    }
    funis.value.push(criado)
    garantirEtapaNova(criado.id)
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível criar o funil.')
  } finally {
    salvando.value = false
  }
}

const salvarFunil = async (funil: Funil) => {
  salvando.value = true
  erro.value = ''
  try {
    const atualizado = await crmService.funilAtualizar(funil.id, {
      nome: funil.nome.trim(),
      padrao: funil.padrao,
      ativo: funil.ativo,
      ordem: funil.ordem,
    })
    if (atualizado.padrao) {
      funis.value = funis.value.map((item) => (item.id === atualizado.id ? atualizado : { ...item, padrao: false }))
    } else {
      aplicar(atualizado)
    }
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível salvar o funil.')
    await carregar()
  } finally {
    salvando.value = false
  }
}

const excluirFunil = async (funil: Funil) => {
  if (!window.confirm(`Excluir o funil ${funil.nome}?`)) return
  salvando.value = true
  erro.value = ''
  try {
    await crmService.funilExcluir(funil.id)
    funis.value = funis.value.filter((item) => item.id !== funil.id)
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível excluir o funil.')
  } finally {
    salvando.value = false
  }
}

const salvarEtapa = async (funil: Funil, etapa: FunilEtapa) => {
  salvando.value = true
  erro.value = ''
  try {
    aplicar(await crmService.etapaAtualizar(funil.id, etapa.id, {
      nome: etapa.nome.trim(),
      probabilidade: Number(etapa.probabilidade) || 0,
      tipo: etapa.tipo,
    }))
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível salvar a etapa.')
    await carregar()
  } finally {
    salvando.value = false
  }
}

const excluirEtapa = async (funil: Funil, etapa: FunilEtapa) => {
  if (!window.confirm(`Excluir a etapa ${etapa.nome}?`)) return
  salvando.value = true
  erro.value = ''
  try {
    aplicar(await crmService.etapaExcluir(funil.id, etapa.id))
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível excluir a etapa.')
  } finally {
    salvando.value = false
  }
}

const criarEtapa = async (funil: Funil) => {
  garantirEtapaNova(funil.id)
  const dados = etapasNovas[funil.id]
  if (!dados) return
  salvando.value = true
  erro.value = ''
  try {
    aplicar(await crmService.etapaCriar(funil.id, {
      nome: dados.nome.trim(),
      probabilidade: Number(dados.probabilidade) || 0,
      tipo: dados.tipo as TipoEtapa,
    }))
    dados.nome = ''
    dados.probabilidade = 10
    dados.tipo = 'aberto'
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível criar a etapa.')
  } finally {
    salvando.value = false
  }
}

const reordenar = async (funil: Funil) => {
  erro.value = ''
  try {
    aplicar(await crmService.etapasReordenar(funil.id, funil.etapas.map((etapa) => etapa.id)))
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível reordenar as etapas.')
    await carregar()
  }
}

onMounted(async () => {
  try {
    await carregar()
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível carregar os funis.')
  }
})
</script>
