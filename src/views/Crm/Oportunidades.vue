<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">CRM - Oportunidades</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Quadro e lista do funil. Arraste o card para mudar a etapa.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <router-link
            to="/admin/crm/oportunidades/configuracoes"
            class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            title="Configurações"
            aria-label="Configurações"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.932 6.932 0 0 1 0 .504c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.957 6.957 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.504c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
          </router-link>
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            @click="abrirNova"
          >
            Nova oportunidade
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div>
          <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="filtro-funil">Funil</label>
          <select id="filtro-funil" v-model.number="idFunil" :class="campo" @change="aoMudarFunil">
            <option v-for="funil in funis" :key="funil.id" :value="funil.id">{{ funil.nome }}</option>
          </select>
        </div>
        <div v-if="modo === 'lista'">
          <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="filtro-etapa">Etapa</label>
          <select id="filtro-etapa" v-model="idEtapa" :class="campo" @change="buscar">
            <option value="">Todas</option>
            <option v-for="etapa in etapas" :key="etapa.id" :value="etapa.id">{{ etapa.nome }}</option>
          </select>
        </div>
        <div class="min-w-[220px] flex-1">
          <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="filtro-q">Busca</label>
          <input
            id="filtro-q"
            v-model="busca"
            type="search"
            placeholder="Nome, contato, e-mail ou telefone"
            :class="campo"
            @keyup.enter="buscar"
          />
        </div>
        <button type="button" class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white" @click="buscar">
          Buscar
        </button>
        <div class="flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-semibold"
            :class="modo === 'quadro' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'"
            @click="trocarModo('quadro')"
          >
            Quadro
          </button>
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-semibold"
            :class="modo === 'lista' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'"
            @click="trocarModo('lista')"
          >
            Lista
          </button>
        </div>
      </div>

      <p v-if="erro" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ erro }}</p>
      <p v-if="carregando" class="text-sm text-gray-500">Carregando...</p>

      <div v-if="modo === 'quadro' && !carregando" class="flex gap-3 overflow-x-auto pb-4">
        <section
          v-for="etapa in etapas"
          :key="etapa.id"
          class="flex w-72 shrink-0 flex-col rounded-lg border bg-gray-50 dark:bg-gray-900/40"
          :class="bordaEtapa(etapa.tipo)"
        >
          <header class="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
            <div class="flex items-center justify-between gap-2">
              <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">{{ etapa.nome }}</h3>
              <span class="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {{ (colunas[etapa.id] || []).length }}
              </span>
            </div>
            <p class="text-xs text-gray-500">{{ etapa.probabilidade }}% · {{ brl(soma(colunas[etapa.id] || [])) }}</p>
          </header>
          <draggable
            v-if="colunas[etapa.id]"
            v-model="colunas[etapa.id]"
            group="crm-oportunidades"
            item-key="id"
            class="min-h-[180px] flex-1 space-y-2 p-2"
            :disabled="salvandoOrdem || perdaPendente !== null"
            @start="arrastou = true"
            @end="liberarClique"
            @change="onColunaChange(etapa, $event)"
          >
            <template #item="{ element }">
              <div
                class="w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800"
                @click="abrirCard(element)"
              >
                <div class="flex items-start justify-between gap-2">
                  <p class="min-w-0 truncate text-sm font-semibold text-gray-900 dark:text-white">{{ element.nome }}</p>
                  <button
                    type="button"
                    class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                    @mousedown.stop
                    @click.stop="abrirWhatsapp(element)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 19.5 4.5 21l1.125-3.375A8.25 8.25 0 1 1 12 20.25c-1.35 0-2.62-.324-3.75-.9Z" /></svg>
                  </button>
                </div>
                <p v-if="element.contato" class="truncate text-xs text-gray-500">{{ element.contato }}</p>
                <p v-if="element.telefone" class="truncate text-xs text-gray-500">{{ element.telefone }}</p>
                <div class="mt-2 flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold text-gray-700 dark:text-gray-200">{{ brl(element.valor) }}</span>
                  <span v-if="element.tag" class="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    {{ meta.tags[element.tag] || element.tag }}
                  </span>
                </div>
              </div>
            </template>
          </draggable>
        </section>
        <p v-if="!etapas.length" class="text-sm text-gray-500">Este funil ainda não tem etapas.</p>
      </div>

      <div v-if="modo === 'lista' && !carregando" class="overflow-x-auto rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-900/40">
            <tr>
              <th class="px-3 py-2">Nome</th>
              <th class="px-3 py-2">Contato</th>
              <th class="px-3 py-2">E-mail</th>
              <th class="px-3 py-2">Telefone</th>
              <th class="px-3 py-2">Etapa</th>
              <th class="px-3 py-2">Valor</th>
              <th class="px-3 py-2">Tag</th>
              <th class="px-3 py-2">Responsável</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="item in lista"
              :key="item.id"
              class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
              @click="abrirCard(item)"
            >
              <td class="px-3 py-2 font-medium text-gray-900 dark:text-white">{{ item.nome }}</td>
              <td class="px-3 py-2">{{ item.contato || '—' }}</td>
              <td class="px-3 py-2">{{ item.email || '—' }}</td>
              <td class="px-3 py-2">
                <span class="inline-flex items-center gap-1">
                  {{ item.telefone || '—' }}
                  <button
                    type="button"
                    class="inline-flex h-7 w-7 items-center justify-center rounded-md text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                    @click.stop="abrirWhatsapp(item)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 19.5 4.5 21l1.125-3.375A8.25 8.25 0 1 1 12 20.25c-1.35 0-2.62-.324-3.75-.9Z" /></svg>
                  </button>
                </span>
              </td>
              <td class="px-3 py-2">{{ item.etapa?.nome || '—' }}</td>
              <td class="px-3 py-2">{{ brl(item.valor) }}</td>
              <td class="px-3 py-2">{{ item.tag ? meta.tags[item.tag] || item.tag : '—' }}</td>
              <td class="px-3 py-2">{{ item.nome_responsavel || '—' }}</td>
            </tr>
            <tr v-if="!lista.length">
              <td colspan="8" class="px-3 py-6 text-center text-gray-500">Nenhuma oportunidade.</td>
            </tr>
          </tbody>
        </table>
        <div v-if="lastPage > 1" class="flex items-center justify-between px-3 py-2 text-sm">
          <button type="button" class="rounded border px-3 py-1 disabled:opacity-40" :disabled="page <= 1" @click="irPagina(page - 1)">
            Anterior
          </button>
          <span>{{ page }} / {{ lastPage }}</span>
          <button type="button" class="rounded border px-3 py-1 disabled:opacity-40" :disabled="page >= lastPage" @click="irPagina(page + 1)">
            Próxima
          </button>
        </div>
      </div>

      <ModalOportunidade
        v-if="modalAberto"
        :oportunidade="editando"
        :funis="funis"
        :id-funil="idFunil"
        :usuarios="usuarios"
        :meta="meta"
        @close="modalAberto = false"
        @salvo="aoSalvar"
      />

      <ModalWhatsapp
        v-if="whatsappAlvo"
        :oportunidade="whatsappAlvo"
        @close="whatsappAlvo = null"
        @enviado="whatsappAlvo = null"
      />

      <Modal v-if="perdaPendente" full-screen-backdrop @close="cancelarPerda">
        <template #body>
          <div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Motivo da perda</h3>
            <p class="mt-1 text-sm text-gray-500">{{ perdaPendente.nome }}</p>
            <select v-model="motivoPerda" :class="campo + ' mt-3'">
              <option value="">Selecione</option>
              <option v-for="(label, key) in meta.motivos_perda" :key="key" :value="key">{{ label }}</option>
            </select>
            <p v-if="erroPerda" class="mt-2 text-xs text-red-600">{{ erroPerda }}</p>
            <div class="mt-4 flex justify-end gap-2">
              <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="cancelarPerda">Cancelar</button>
              <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" @click="confirmarPerda">
                Confirmar
              </button>
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import ModalOportunidade from './components/ModalOportunidade.vue'
import ModalWhatsapp from './components/ModalWhatsapp.vue'
import {
  brl,
  mensagemApi,
  type Funil,
  type FunilEtapa,
  type Oportunidade,
  type OportunidadeMeta,
  type TipoEtapa,
  type UsuarioAdmin,
} from './model/oportunidade.types'

interface DragChange {
  added?: { element: Oportunidade }
  moved?: { element: Oportunidade }
}

const campo =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'

const router = useRouter()

const meta = ref<OportunidadeMeta>({ motivos_perda: {}, tags: {}, qtd_funcionarios: [] })
const funis = ref<Funil[]>([])
const usuarios = ref<UsuarioAdmin[]>([])
const idFunil = ref<number | null>(null)
const idEtapa = ref<number | ''>('')
const busca = ref('')
const modo = ref<'quadro' | 'lista'>('quadro')
const carregando = ref(true)
const salvandoOrdem = ref(false)
const erro = ref('')
const lista = ref<Oportunidade[]>([])
const colunas = reactive<Record<number, Oportunidade[]>>({})
const page = ref(1)
const lastPage = ref(1)
const modalAberto = ref(false)
const whatsappAlvo = ref<Oportunidade | null>(null)
const editando = ref<Oportunidade | null>(null)
const arrastou = ref(false)
const perdaPendente = ref<Oportunidade | null>(null)
const motivoPerda = ref('')
const erroPerda = ref('')

const funilAtual = computed(() => {
  const lista = Array.isArray(funis.value) ? funis.value : []
  return lista.find((funil) => funil.id === idFunil.value) ?? null
})
const etapas = computed(() => funilAtual.value?.etapas ?? [])

const bordaEtapa = (tipo: TipoEtapa): string => {
  if (tipo === 'ganho') return 'border-green-300'
  if (tipo === 'perdido') return 'border-red-300'
  return 'border-gray-200 dark:border-gray-700'
}

const soma = (itens: Oportunidade[]): number => itens.reduce((total, item) => total + (Number(item.valor) || 0), 0)

const montarColunas = (itens: Oportunidade[]) => {
  for (const key of Object.keys(colunas)) {
    delete colunas[Number(key)]
  }
  for (const etapa of etapas.value) {
    colunas[etapa.id] = []
  }
  for (const item of itens) {
    if (!colunas[item.id_etapa]) colunas[item.id_etapa] = []
    colunas[item.id_etapa].push(item)
  }
  for (const etapa of etapas.value) {
    colunas[etapa.id].sort((a, b) => a.ordem - b.ordem || a.id - b.id)
  }
}

const carregar = async () => {
  if (!idFunil.value) {
    carregando.value = false
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    const resposta = await crmService.oportunidadesListar({
      id_funil: idFunil.value,
      id_etapa: modo.value === 'lista' ? idEtapa.value : '',
      q: busca.value.trim(),
      modo: modo.value,
      page: page.value,
      per_page: 30,
    })
    if (modo.value === 'quadro') {
      montarColunas(resposta.data)
      lista.value = []
    } else {
      lista.value = resposta.data
      lastPage.value = resposta.last_page || 1
    }
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível carregar as oportunidades.')
  } finally {
    carregando.value = false
  }
}

const buscar = () => {
  page.value = 1
  void carregar()
}

const aoMudarFunil = () => {
  idEtapa.value = ''
  page.value = 1
  void carregar()
}

const trocarModo = (proximo: 'quadro' | 'lista') => {
  if (modo.value === proximo) return
  modo.value = proximo
  page.value = 1
  void carregar()
}

const irPagina = (proxima: number) => {
  page.value = proxima
  void carregar()
}

const abrirNova = () => {
  editando.value = null
  modalAberto.value = true
}

const abrirCard = (item: Oportunidade) => {
  if (arrastou.value) return
  router.push(`/admin/crm/oportunidades/${item.id}`)
}

const abrirWhatsapp = (item: Oportunidade) => {
  whatsappAlvo.value = item
}

const liberarClique = () => {
  window.setTimeout(() => {
    arrastou.value = false
  }, 80)
}

const payloadColunas = () =>
  etapas.value.map((etapa) => ({
    id_etapa: etapa.id,
    ids: (colunas[etapa.id] || []).map((item) => item.id),
  }))

const salvarOrdem = async (motivo?: string | null) => {
  salvandoOrdem.value = true
  erro.value = ''
  try {
    await crmService.oportunidadesReordenar(payloadColunas(), motivo)
    for (const etapa of etapas.value) {
      const cards = colunas[etapa.id] || []
      cards.forEach((item, index) => {
        const mudou = item.id_etapa !== etapa.id
        item.ordem = index + 1
        if (!mudou) return
        item.id_etapa = etapa.id
        if (etapa.tipo === 'perdido') item.motivo_perda = motivo || item.motivo_perda
        if (etapa.tipo !== 'perdido') item.motivo_perda = null
        if (etapa.tipo === 'ganho' && !item.data_fechamento) {
          item.data_fechamento = new Date().toISOString().slice(0, 10)
        }
        if (etapa.tipo !== 'ganho') item.data_fechamento = null
      })
    }
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível mover a oportunidade.')
    await carregar()
  } finally {
    salvandoOrdem.value = false
  }
}

const onColunaChange = (etapa: FunilEtapa, evt: DragChange) => {
  if (!evt.added && !evt.moved) return
  if (evt.added && etapa.tipo === 'perdido') {
    perdaPendente.value = evt.added.element
    motivoPerda.value = ''
    erroPerda.value = ''
    return
  }
  void salvarOrdem()
}

const cancelarPerda = async () => {
  perdaPendente.value = null
  motivoPerda.value = ''
  await carregar()
}

const confirmarPerda = async () => {
  if (!motivoPerda.value) {
    erroPerda.value = 'Informe o motivo da perda.'
    return
  }
  const motivo = motivoPerda.value
  perdaPendente.value = null
  await salvarOrdem(motivo)
}

const aoSalvar = async () => {
  modalAberto.value = false
  await carregar()
}

onMounted(async () => {
  carregando.value = true
  try {
    const [listaFunis, metaResp, listaUsuarios] = await Promise.all([
      crmService.funisListar(),
      crmService.oportunidadeMeta(),
      crmService.usuariosAdmin(),
    ])
    if (!Array.isArray(listaFunis)) {
      const status = (listaFunis as { status?: string } | null)?.status
      erro.value = status || 'Não foi possível carregar os funis.'
      carregando.value = false
      return
    }
    funis.value = listaFunis
    if (metaResp && Array.isArray(metaResp.qtd_funcionarios)) {
      meta.value = metaResp
    }
    usuarios.value = Array.isArray(listaUsuarios) ? listaUsuarios : []
    const padrao = listaFunis.find((funil) => funil.padrao && funil.ativo) || listaFunis[0]
    idFunil.value = padrao?.id ?? null
    await carregar()
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível abrir as oportunidades.')
    carregando.value = false
  }
})
</script>
