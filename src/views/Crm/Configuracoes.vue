<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Configurações</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Ajustes do quadro de oportunidades.</p>
        </div>
        <router-link
          to="/admin/crm/oportunidades"
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Voltar às oportunidades
        </router-link>
      </div>

      <p v-if="erro" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ erro }}</p>

      <section class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <Funis />
      </section>

      <section class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Mensagens de WhatsApp</h3>
        <p class="mt-1 text-sm text-gray-500">Use {nome} para o contato da oportunidade. Modelos inativos não aparecem no envio.</p>

        <form class="mt-4 grid gap-3 border-b border-gray-200 pb-4 dark:border-gray-700 sm:grid-cols-6" @submit.prevent="criar">
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="novo-tema">Tema</label>
            <select id="novo-tema" v-model="novo.tema" :class="campo">
              <option v-for="(rotulo, tema) in temas" :key="tema" :value="tema">{{ rotulo }}</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="novo-titulo">Título</label>
            <input id="novo-titulo" v-model="novo.titulo" type="text" maxlength="120" required :class="campo" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="novo-texto">Texto</label>
            <textarea id="novo-texto" v-model="novo.texto" rows="3" maxlength="5000" required :class="campo" />
          </div>
          <button type="submit" class="h-10 self-end rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60" :disabled="salvando">
            Adicionar
          </button>
        </form>

        <div v-for="grupo in grupos" :key="grupo.tema" class="mt-4 space-y-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ grupo.rotulo }}</h4>
          <article v-for="modelo in grupo.itens" :key="modelo.id" class="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 sm:grid-cols-6">
            <div class="sm:col-span-2">
              <label class="text-xs font-semibold text-gray-600 dark:text-gray-400">Título</label>
              <input v-model="modelo.titulo" type="text" maxlength="120" :class="campo" />
            </div>
            <div class="sm:col-span-3">
              <label class="text-xs font-semibold text-gray-600 dark:text-gray-400">Texto</label>
              <textarea v-model="modelo.texto" rows="3" maxlength="5000" :class="campo" />
            </div>
            <div class="flex flex-col justify-end gap-2">
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input v-model="modelo.ativo" type="checkbox" class="rounded border-gray-300" />
                Ativo
              </label>
              <button type="button" class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" :disabled="salvando" @click="salvar(modelo)">
                Salvar
              </button>
              <button type="button" class="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60" :disabled="salvando" @click="excluir(modelo)">
                Excluir
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { crmService } from '@/services/crm'
import Funis from './Funis.vue'
import { mensagemApi, TEMA_MENSAGEM, type MensagemModelo } from './model/oportunidade.types'

const campo = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'

const modelos = ref<MensagemModelo[]>([])
const temas = ref<Record<string, string>>({ ...TEMA_MENSAGEM })
const erro = ref('')
const salvando = ref(false)
const novo = reactive({
  tema: 'cadastro_sem_resposta' as MensagemModelo['tema'],
  titulo: '',
  texto: '',
})

const grupos = computed(() => {
  const ordem = Object.keys(temas.value) as MensagemModelo['tema'][]
  return ordem
    .map((tema) => ({
      tema,
      rotulo: temas.value[tema] || TEMA_MENSAGEM[tema] || tema,
      itens: modelos.value.filter((modelo) => modelo.tema === tema),
    }))
    .filter((grupo) => grupo.itens.length > 0)
})

const carregar = async () => {
  const resposta = await crmService.mensagensModeloGestao()
  if (Object.keys(resposta.temas).length) temas.value = resposta.temas
  modelos.value = resposta.modelos.map((modelo) => ({ ...modelo, ativo: modelo.ativo !== false }))
}

const criar = async () => {
  salvando.value = true
  erro.value = ''
  try {
    await crmService.mensagemModeloCriar({
      tema: novo.tema,
      titulo: novo.titulo,
      texto: novo.texto,
      ativo: true,
    })
    novo.titulo = ''
    novo.texto = ''
    await carregar()
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível adicionar o modelo.')
  } finally {
    salvando.value = false
  }
}

const salvar = async (modelo: MensagemModelo) => {
  salvando.value = true
  erro.value = ''
  try {
    await crmService.mensagemModeloAtualizar(modelo.id, {
      tema: modelo.tema,
      titulo: modelo.titulo,
      texto: modelo.texto,
      ativo: modelo.ativo !== false,
    })
    await carregar()
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível salvar o modelo.')
  } finally {
    salvando.value = false
  }
}

const excluir = async (modelo: MensagemModelo) => {
  salvando.value = true
  erro.value = ''
  try {
    await crmService.mensagemModeloExcluir(modelo.id)
    modelos.value = modelos.value.filter((item) => item.id !== modelo.id)
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível excluir o modelo.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    await carregar()
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível carregar as configurações.')
  }
})
</script>
