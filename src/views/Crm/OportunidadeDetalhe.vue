<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <router-link to="/admin/crm/oportunidades" class="text-sm font-semibold text-blue-600 hover:underline">
            Oportunidades
          </router-link>
          <h2 class="flex min-w-0 items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
            <span class="truncate">{{ op?.nome || 'Oportunidade' }}</span>
            <span
              v-if="op && badgeTipoJobb(op.tipo_jobb)"
              class="shrink-0 rounded px-2 py-0.5 text-xs font-semibold"
              :class="badgeTipoJobb(op.tipo_jobb)?.classe"
            >
              {{ badgeTipoJobb(op.tipo_jobb)?.label }}
            </span>
          </h2>
        </div>
        <div v-if="op" class="flex flex-wrap items-center gap-1">
          <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" title="Editar contato" aria-label="Editar contato" @click="abrirEdicao">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
          </button>
          <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" title="Anotação" aria-label="Anotação" @click="abrirAcao('nota')">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75H7.5A1.5 1.5 0 0 0 6 5.25v13.5A1.5 1.5 0 0 0 7.5 20.25h9a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5Z" /><path stroke-linecap="round" d="M9 8.25h6M9 12h6M9 15.75h3.5" /></svg>
          </button>
          <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" title="Tarefa" aria-label="Tarefa" @click="abrirAcao('tarefa')">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 11.25 11.25 13.5 15.75 8.25M6.75 4.5h10.5A1.5 1.5 0 0 1 18.75 6v12a1.5 1.5 0 0 1-1.5 1.5H6.75a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Z" /></svg>
          </button>
          <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950" title="WhatsApp" aria-label="WhatsApp" @click="abrirAcao('whatsapp')">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 19.5 4.5 21l1.125-3.375A8.25 8.25 0 1 1 12 20.25c-1.35 0-2.62-.324-3.75-.9Z" /></svg>
          </button>
          <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 dark:text-emerald-400" title="Marcar ganho" aria-label="Marcar ganho" :disabled="salvando || op?.etapa?.tipo === 'ganho'" @click="marcarGanho">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          </button>
          <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40 dark:text-red-400" title="Marcar perdido" aria-label="Marcar perdido" :disabled="salvando || op?.etapa?.tipo === 'perdido'" @click="marcarPerdido">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </div>

      <p v-if="erro" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ erro }}</p>
      <p v-if="carregando" class="text-sm text-gray-500">Carregando...</p>

      <div v-if="op && !carregando" class="grid items-start gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        <aside class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Informações</h3>
          <dl class="mt-3 space-y-3 text-sm">
            <div v-for="campo in campos" :key="campo.rotulo">
              <dt class="text-xs font-semibold text-gray-500">{{ campo.rotulo }}</dt>
              <dd class="mt-0.5 break-words text-gray-900 dark:text-gray-100">{{ campo.valor }}</dd>
            </div>
          </dl>
        </aside>

        <section class="space-y-4">
          <article class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Etapa atual</p>
            <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              {{ indiceEtapa }}/{{ etapas.length }} - {{ op.etapa?.nome || 'Sem etapa' }}
            </p>
            <div class="mt-2 flex h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                v-for="(etapa, index) in etapas"
                :key="etapa.id"
                class="h-full flex-1 border-r border-white last:border-r-0 dark:border-gray-800"
                :class="corTrecho(index)"
              />
            </div>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              na etapa atual há {{ diasEtapa }} {{ diasEtapa === 1 ? 'dia' : 'dias' }} e aberta há {{ diasAberta }}
              {{ diasAberta === 1 ? 'dia' : 'dias' }}.
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">Receita estimada: {{ brl(op.valor) }}</p>
            <div class="mt-3 max-w-xs">
              <label class="text-xs font-semibold text-gray-500" for="alterar-etapa">Alterar etapas</label>
              <select id="alterar-etapa" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" :value="op.id_etapa" :disabled="salvando" @change="pedirEtapa">
                <option v-for="etapa in etapas" :key="etapa.id" :value="etapa.id">{{ etapa.nome }}</option>
              </select>
            </div>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Próximas atividades</h3>
            <p v-if="carregandoPainel" class="mt-3 text-sm text-gray-500">Carregando...</p>
            <p v-else-if="!painel.proximas.length" class="mt-3 text-sm text-gray-500">Nenhuma atividade em aberto.</p>
            <ul v-else class="mt-3 space-y-3">
              <li v-for="item in painel.proximas" :key="item.id" class="rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.titulo }}</p>
                    <p class="text-xs text-gray-500">{{ formatarData(item.prazo || item.quando) }}</p>
                  </div>
                  <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">Aberto</span>
                </div>
                <p v-if="item.texto" class="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{{ item.texto }}</p>
              </li>
            </ul>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Histórico recente</h3>
            <p v-if="painel.erro" class="mt-3 text-sm text-red-600">{{ painel.erro }}</p>
            <p v-else-if="!carregandoPainel && !painel.timeline.length" class="mt-3 text-sm text-gray-500">Nenhum histórico.</p>
            <ol v-else class="mt-4 space-y-4 border-l border-gray-200 pl-4 dark:border-gray-600">
              <li v-for="item in painel.timeline" :key="item.id" class="relative">
                <span class="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-xs font-semibold uppercase text-gray-400">{{ rotuloTipo(item.tipo) }}</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.titulo }}</p>
                  </div>
                  <div v-if="idNotaLocal(item)" class="flex shrink-0">
                    <button type="button" class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200" title="Editar" aria-label="Editar anotação" @click="editarNota(item)">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.1 2.1 0 0 1 2.97 2.97L8.25 19.04 3.75 20.25l1.21-4.5 11.902-11.263Z" /></svg>
                    </button>
                    <button type="button" class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700" title="Excluir" aria-label="Excluir anotação" @click="notaExcluir = item">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 7.5h12M9.75 7.5V6h4.5v1.5M8.25 7.5l.75 12h6l.75-12" /></svg>
                    </button>
                  </div>
                </div>
                <p v-if="item.texto" class="mt-1 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{{ item.texto }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  {{ formatarData(item.quando) }}<span v-if="item.autor"> · {{ item.autor }}</span>
                </p>
              </li>
            </ol>
          </article>
        </section>

        <aside class="space-y-4">
          <article class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Empresas</h3>
            <p v-if="!empresasExibir.length" class="mt-3 text-sm text-gray-500">Não há empresas associadas a este registro</p>
            <ul v-else class="mt-3 space-y-2 text-sm">
              <li v-for="empresa in empresasExibir" :key="empresa.id">
                <router-link
                  v-if="empresa.id_cliente"
                  :to="`/admin/clientes/alterar/${empresa.id_cliente}`"
                  class="font-medium text-blue-700 hover:underline dark:text-blue-300"
                >
                  {{ empresa.nome }}
                </router-link>
                <p v-else class="font-medium text-gray-900 dark:text-white">{{ empresa.nome }}</p>
              </li>
            </ul>
          </article>
          <article class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Contatos</h3>
            <p v-if="!painel.contatos.length" class="mt-3 text-sm text-gray-500">Não há contatos associados a este registro</p>
            <ul v-else class="mt-3 space-y-3 text-sm">
              <li v-for="contato in painel.contatos" :key="contato.id">
                <p class="font-medium text-gray-900 dark:text-white">{{ contato.nome }}</p>
                <p v-if="contato.email" class="text-gray-500">{{ contato.email }}</p>
                <p v-if="contato.telefone" class="text-gray-500">{{ contato.telefone }}</p>
              </li>
            </ul>
          </article>
        </aside>
      </div>

      <Modal v-if="acao && acao !== 'whatsapp'" full-screen-backdrop @close="fecharAcao">
        <template #body>
          <div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ tituloAcao }}</h3>
            <p v-if="acao === 'whatsapp'" class="mt-1 text-sm text-gray-500">Para {{ op?.telefone || 'o telefone do cliente' }}</p>
            <input
              v-if="acao === 'tarefa'"
              v-model="tituloTarefa"
              type="text"
              placeholder="Nome da tarefa"
              class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <input
              v-if="acao === 'tarefa'"
              v-model="prazoTarefa"
              type="datetime-local"
              class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <textarea
              v-model="textoAcao"
              rows="5"
              :placeholder="acao === 'whatsapp' ? 'Mensagem' : acao === 'tarefa' ? 'Observação' : 'Anotação'"
              class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p v-if="erroAcao" class="mt-2 text-xs text-red-600">{{ erroAcao }}</p>
            <div class="mt-4 flex justify-end gap-2">
              <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="fecharAcao">Cancelar</button>
              <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" :disabled="salvandoAcao" @click="confirmarAcao">
                {{ acao === 'whatsapp' ? 'Enviar' : 'Salvar' }}
              </button>
            </div>
          </div>
        </template>
      </Modal>

      <ModalWhatsapp
        v-if="acao === 'whatsapp' && op"
        :oportunidade="op"
        @close="fecharAcao"
        @enviado="aoWhatsapp"
      />

      <ModalOportunidade
        v-if="editando && op"
        :oportunidade="op"
        :funis="funis"
        :id-funil="op.id_funil"
        :usuarios="usuarios"
        :meta="meta"
        @close="editando = false"
        @salvo="aoSalvarEdicao"
      />

      <Modal v-if="notaExcluir" full-screen-backdrop @close="notaExcluir = null">
        <template #body>
          <div class="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Excluir anotação</h3>
            <p class="mt-2 whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">{{ notaExcluir.texto }}</p>
            <p v-if="erroExcluir" class="mt-2 text-xs text-red-600">{{ erroExcluir }}</p>
            <div class="mt-4 flex justify-end gap-2">
              <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="notaExcluir = null">Cancelar</button>
              <button type="button" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" :disabled="salvandoAcao" @click="confirmarExcluirNota">
                Excluir
              </button>
            </div>
          </div>
        </template>
      </Modal>

      <Modal v-if="etapaPerda" full-screen-backdrop @close="etapaPerda = null">
        <template #body>
          <div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Motivo da perda</h3>
            <select v-model="motivoPerda" class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <option value="">Selecione</option>
              <option v-for="(label, key) in meta.motivos_perda" :key="key" :value="key">{{ label }}</option>
            </select>
            <p v-if="erroPerda" class="mt-2 text-xs text-red-600">{{ erroPerda }}</p>
            <div class="mt-4 flex justify-end gap-2">
              <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="etapaPerda = null">Cancelar</button>
              <button type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" @click="confirmarPerda">Confirmar</button>
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import ModalOportunidade from './components/ModalOportunidade.vue'
import ModalWhatsapp from './components/ModalWhatsapp.vue'
import {
  badgeTipoJobb,
  brl,
  mensagemApi,
  QTD_FUNC_LABEL,
  type OportunidadePainel,
  type OportunidadeEvento,
  type ClienteVinculo,
  type Funil,
  type FunilEtapa,
  type Oportunidade,
  type OportunidadeMeta,
  type OportunidadePayload,
  type UsuarioAdmin,
} from './model/oportunidade.types'

const route = useRoute()
const op = ref<Oportunidade | null>(null)
const etapas = ref<FunilEtapa[]>([])
const funis = ref<Funil[]>([])
const usuarios = ref<UsuarioAdmin[]>([])
const editando = ref(false)
const meta = ref<OportunidadeMeta>({ motivos_perda: {}, tags: {}, qtd_funcionarios: [] })
const painel = ref<OportunidadePainel>({
  vinculado: false,
  erro: null,
  empresas: [],
  contatos: [],
  proximas: [],
  timeline: [],
})
const cliente = ref<ClienteVinculo | null>(null)
const carregando = ref(true)
const carregandoPainel = ref(false)
const salvando = ref(false)
const erro = ref('')
const etapaPerda = ref<FunilEtapa | null>(null)
const motivoPerda = ref('')
const erroPerda = ref('')
const acao = ref<'nota' | 'tarefa' | 'whatsapp' | null>(null)
const notaEditando = ref<OportunidadeEvento | null>(null)
const notaExcluir = ref<OportunidadeEvento | null>(null)
const erroExcluir = ref('')
const textoAcao = ref('')
const tituloTarefa = ref('')
const prazoTarefa = ref('')
const erroAcao = ref('')
const salvandoAcao = ref(false)

const tituloAcao = computed(() => {
  if (acao.value === 'tarefa') return 'Tarefa'
  if (acao.value === 'whatsapp') return 'WhatsApp'
  if (notaEditando.value) return 'Editar anotação'
  return 'Anotação'
})

const indiceEtapa = computed(() => {
  if (!op.value) return 0
  const index = etapas.value.findIndex((etapa) => etapa.id === op.value?.id_etapa)
  return index < 0 ? 0 : index + 1
})

const diasEtapa = computed(() => dias(op.value?.etapa_atualizada_em || op.value?.created_at || null))
const diasAberta = computed(() => dias(op.value?.created_at || null))

const empresasExibir = computed(() => {
  const lista = painel.value.empresas.map((empresa) => ({ ...empresa }))
  const atual = cliente.value
  if (!atual) return lista
  const repetida = lista.some((empresa) => empresa.nome.toLowerCase() === atual.nome.toLowerCase())
  if (!repetida) {
    lista.unshift({
      id: `cliente-${atual.id_cliente}`,
      nome: atual.nome,
      id_cliente: atual.id_cliente,
    })
  } else {
    const existente = lista.find((empresa) => empresa.nome.toLowerCase() === atual.nome.toLowerCase())
    if (existente) existente.id_cliente = atual.id_cliente
  }
  return lista
})

const campos = computed(() => {
  const atual = op.value
  if (!atual) return []
  const tag = atual.tag ? meta.value.tags[atual.tag] || atual.tag : ''
  const qtd = atual.qtd_funcionarios ? QTD_FUNC_LABEL[atual.qtd_funcionarios] || atual.qtd_funcionarios : ''
  const motivo = atual.motivo_perda ? meta.value.motivos_perda[atual.motivo_perda] || atual.motivo_perda : ''
  return [
    { rotulo: 'Nome', valor: atual.nome || '—' },
    { rotulo: 'Descrição da oportunidade', valor: atual.descricao || '—' },
    { rotulo: 'Tag', valor: tag || '—' },
    { rotulo: 'Contato', valor: atual.contato || '—' },
    { rotulo: 'Telefone', valor: atual.telefone || '—' },
    { rotulo: 'E-mail', valor: atual.email || '—' },
    { rotulo: 'UF', valor: atual.uf || '—' },
    { rotulo: 'Qtd. funcionários', valor: qtd || '—' },
    { rotulo: 'Interesse', valor: atual.interesse || '—' },
    { rotulo: 'Código promocional', valor: atual.codigo_promocao || '—' },
    { rotulo: 'Responsável', valor: atual.nome_responsavel || '—' },
    { rotulo: 'Motivo da perda', valor: motivo || '—' },
  ]
})

const corTrecho = (index: number): string => {
  const atual = indiceEtapa.value - 1
  if (index > atual) return 'bg-gray-200 dark:bg-gray-600'
  const tipo = op.value?.etapa?.tipo
  if (index === atual && tipo === 'perdido') return 'bg-red-500'
  if (index === atual && tipo === 'ganho') return 'bg-emerald-500'
  return index === atual ? 'bg-blue-700' : 'bg-blue-400'
}

const dias = (valor: string | null): number => {
  if (!valor) return 0
  const data = new Date(valor.includes('T') ? valor : valor.replace(' ', 'T'))
  if (Number.isNaN(data.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - data.getTime()) / 86400000))
}

const formatarData = (valor: string): string => {
  if (!valor) return ''
  const data = new Date(valor.includes('T') ? valor : valor.replace(' ', 'T'))
  if (Number.isNaN(data.getTime())) return valor
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const rotuloTipo = (tipo: OportunidadePainel['timeline'][number]['tipo']): string => {
  if (tipo === 'tarefa') return 'Tarefa'
  if (tipo === 'nota') return 'Anotação'
  if (tipo === 'whatsapp') return 'WhatsApp'
  if (tipo === 'etapa') return 'Atividade da oportunidade'
  return 'Oportunidade'
}

const payload = (idEtapa: number, motivo: string | null): OportunidadePayload => {
  const atual = op.value
  if (!atual) {
    return {
      nome: '',
      id_funil: 0,
      id_etapa: idEtapa,
      id_cliente: null,
      id_usuario_responsavel: null,
      contato: null,
      email: null,
      telefone: null,
      uf: null,
      qtd_funcionarios: null,
      interesse: null,
      codigo_promocao: null,
      tag: null,
      descricao: null,
      valor: null,
      motivo_perda: motivo,
      data_fechamento: null,
    }
  }
  return {
    nome: atual.nome,
    id_funil: atual.id_funil,
    id_etapa: idEtapa,
    id_cliente: atual.id_cliente,
    id_usuario_responsavel: atual.id_usuario_responsavel,
    contato: atual.contato,
    email: atual.email,
    telefone: atual.telefone,
    uf: atual.uf,
    qtd_funcionarios: atual.qtd_funcionarios,
    interesse: atual.interesse,
    codigo_promocao: atual.codigo_promocao,
    tag: atual.tag,
    descricao: atual.descricao,
    valor: atual.valor,
    motivo_perda: motivo,
    data_fechamento: atual.data_fechamento,
  }
}

const incluirEvento = (evento: OportunidadeEvento) => {
  const existe = painel.value.timeline.some((item) => item.id === evento.id)
  if (existe) {
    painel.value.timeline = painel.value.timeline.map((item) => (item.id === evento.id ? evento : item))
    return
  }
  painel.value.timeline = [evento, ...painel.value.timeline]
  if (evento.tipo === 'tarefa' && !evento.feito) {
    painel.value.proximas = [...painel.value.proximas, evento]
  }
}

const aoWhatsapp = (evento: OportunidadeEvento) => {
  if (evento && evento.id) incluirEvento(evento)
}

const idNotaLocal = (item: OportunidadeEvento): number | null => {
  if (item.tipo !== 'nota' || !item.id.startsWith('local-')) return null
  const id = Number(item.id.slice(6))
  return id > 0 ? id : null
}

const abrirAcao = (tipo: 'nota' | 'tarefa' | 'whatsapp') => {
  notaEditando.value = null
  acao.value = tipo
  textoAcao.value = ''
  tituloTarefa.value = ''
  prazoTarefa.value = ''
  erroAcao.value = ''
}

const editarNota = (item: OportunidadeEvento) => {
  notaEditando.value = item
  acao.value = 'nota'
  textoAcao.value = item.texto
  erroAcao.value = ''
}

const fecharAcao = () => {
  if (salvandoAcao.value) return
  acao.value = null
  notaEditando.value = null
}

const confirmarAcao = async () => {
  if (!op.value || !acao.value) return
  salvandoAcao.value = true
  erroAcao.value = ''
  try {
    let evento: OportunidadeEvento
    if (acao.value === 'nota') {
      const idNota = notaEditando.value ? idNotaLocal(notaEditando.value) : null
      evento = idNota
        ? await crmService.oportunidadeNotaAtualizar(op.value.id, idNota, textoAcao.value)
        : await crmService.oportunidadeNota(op.value.id, textoAcao.value)
    } else if (acao.value === 'tarefa') {
      evento = await crmService.oportunidadeTarefa(op.value.id, tituloTarefa.value, textoAcao.value, prazoTarefa.value)
    } else {
      return
    }
    if (evento && evento.id) incluirEvento(evento)
    acao.value = null
    notaEditando.value = null
  } catch (err) {
    erroAcao.value = mensagemApi(err, 'Não foi possível salvar.')
  } finally {
    salvandoAcao.value = false
  }
}

const confirmarExcluirNota = async () => {
  if (!op.value || !notaExcluir.value) return
  const idNota = idNotaLocal(notaExcluir.value)
  if (!idNota) return
  salvandoAcao.value = true
  erroExcluir.value = ''
  try {
    await crmService.oportunidadeNotaExcluir(op.value.id, idNota)
    const id = notaExcluir.value.id
    painel.value.timeline = painel.value.timeline.filter((item) => item.id !== id)
    notaExcluir.value = null
  } catch (err) {
    erroExcluir.value = mensagemApi(err, 'Não foi possível excluir.')
  } finally {
    salvandoAcao.value = false
  }
}

const marcarGanho = () => {
  const etapa = etapas.value.find((item) => item.tipo === 'ganho')
  if (!etapa) return
  void salvarEtapa(etapa.id, null)
}

const marcarPerdido = () => {
  const etapa = etapas.value.find((item) => item.tipo === 'perdido')
  if (!etapa || !op.value) return
  etapaPerda.value = etapa
  motivoPerda.value = op.value.motivo_perda || ''
  erroPerda.value = ''
}

const pedirEtapa = (event: Event) => {
  const alvo = event.target
  if (!(alvo instanceof HTMLSelectElement) || !op.value) return
  const id = Number(alvo.value)
  const etapa = etapas.value.find((item) => item.id === id)
  if (!etapa) return
  if (etapa.tipo === 'perdido') {
    etapaPerda.value = etapa
    motivoPerda.value = op.value.motivo_perda || ''
    erroPerda.value = ''
    alvo.value = String(op.value.id_etapa)
    return
  }
  void salvarEtapa(id, null)
}

const confirmarPerda = () => {
  if (!etapaPerda.value) return
  if (!motivoPerda.value) {
    erroPerda.value = 'Informe o motivo da perda.'
    return
  }
  const id = etapaPerda.value.id
  etapaPerda.value = null
  void salvarEtapa(id, motivoPerda.value)
}

const abrirEdicao = async () => {
  erro.value = ''
  try {
    if (!funis.value.length || !usuarios.value.length) {
      const [listaFunis, listaUsuarios] = await Promise.all([
        crmService.funisListar(),
        crmService.usuariosAdmin(),
      ])
      if (!Array.isArray(listaFunis) || !Array.isArray(listaUsuarios)) {
        erro.value = 'Não foi possível abrir a edição.'
        return
      }
      funis.value = listaFunis
      usuarios.value = listaUsuarios
    }
    editando.value = true
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível abrir a edição.')
  }
}

const aoSalvarEdicao = async () => {
  editando.value = false
  if (!op.value) return
  try {
    const detalhe = await crmService.oportunidadeObter(op.value.id)
    if (detalhe && detalhe.oportunidade) {
      op.value = detalhe.oportunidade
      etapas.value = Array.isArray(detalhe.etapas) ? detalhe.etapas : etapas.value
      cliente.value = detalhe.cliente && detalhe.cliente.id_cliente ? detalhe.cliente : null
    }
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível atualizar a oportunidade.')
  }
}

const salvarEtapa = async (idEtapa: number, motivo: string | null) => {
  if (!op.value) return
  salvando.value = true
  erro.value = ''
  try {
    op.value = await crmService.oportunidadeAtualizar(op.value.id, payload(idEtapa, motivo))
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível alterar a etapa.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) {
    erro.value = 'Oportunidade inválida.'
    carregando.value = false
    return
  }
  try {
    const [detalhe, metas] = await Promise.all([
      crmService.oportunidadeObter(id),
      crmService.oportunidadeMeta(),
    ])
    if (!detalhe || !detalhe.oportunidade) {
      const status = (detalhe as { status?: string } | null)?.status
      erro.value = status || 'Não foi possível abrir a oportunidade.'
      carregando.value = false
      return
    }
    op.value = detalhe.oportunidade
    etapas.value = Array.isArray(detalhe.etapas) ? detalhe.etapas : []
    cliente.value = detalhe.cliente && detalhe.cliente.id_cliente ? detalhe.cliente : null
    if (metas && metas.tags && metas.motivos_perda) meta.value = metas
  } catch (err) {
    erro.value = mensagemApi(err, 'Não foi possível abrir a oportunidade.')
    carregando.value = false
    return
  }
  carregando.value = false
  carregandoPainel.value = true
  try {
    const resposta = await crmService.oportunidadePainel(id)
    if (resposta && Array.isArray(resposta.timeline)) painel.value = resposta
  } catch (err) {
    painel.value = {
      vinculado: true,
      erro: mensagemApi(err, 'Não foi possível ler o histórico.'),
      empresas: [],
      contatos: [],
      proximas: [],
      timeline: [],
    }
  } finally {
    carregandoPainel.value = false
  }
})
</script>
