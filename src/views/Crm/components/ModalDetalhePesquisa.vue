<template>
  <Modal full-screen-backdrop @close="$emit('close')">
    <template #body>
      <div class="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Resposta da pesquisa</h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              <span class="font-semibold text-gray-800 dark:text-gray-200">{{ row.nome_cliente || `#${row.id_cliente}` }}</span>
              <span v-if="row.dominio"> ({{ row.dominio }})</span>
            </p>
            <p class="text-xs text-gray-500">
              {{ row.nome_usuario || '—' }} · {{ row.email || 'sem e-mail' }} · {{ formatDateTime(row.answered_at || row.created_at) }}
            </p>
          </div>
          <button type="button" class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" @click="$emit('close')">
            ✕
          </button>
        </div>

        <div class="mt-4 flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
          <div class="flex flex-wrap gap-2">
            <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="npsFaixaClass(row.nps_faixa)">
              NPS {{ row.nps ?? '—' }}
            </span>
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold dark:bg-gray-700">
              CSAT {{ row.csat ?? '—' }}
            </span>
            <span v-if="row.frequencia_uso" class="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
              {{ FREQUENCIA_LABEL[row.frequencia_uso] }}
            </span>
          </div>

          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Módulos</h4>
            <p class="mt-1">{{ labelsLista(row.modulos_usados, MODULO_LABEL) }}</p>
          </section>
          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Dificuldades</h4>
            <p class="mt-1">{{ labelsLista(row.dificuldades, DIFICULDADE_LABEL) }}</p>
          </section>
          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Serviços desejados</h4>
            <p class="mt-1">{{ labelsLista(row.servicos_desejados, SERVICO_LABEL) }}</p>
            <ul
              v-if="sugestoesServico.length"
              class="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300"
            >
              <li v-for="item in sugestoesServico" :key="item.chave">
                <span class="font-semibold">{{ item.label }}:</span> {{ item.texto }}
              </li>
            </ul>
          </section>
          <section class="grid gap-2 sm:grid-cols-3">
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Treinamento</h4>
              <span class="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="interesseClass(row.treinamento_interesse)">
                {{ row.treinamento_interesse ? INTERESSE_LABEL[row.treinamento_interesse] : '—' }}
              </span>
            </div>
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Integração</h4>
              <span class="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="interesseClass(row.integracao_interesse)">
                {{ row.integracao_interesse ? INTERESSE_LABEL[row.integracao_interesse] : '—' }}
              </span>
              <p v-if="row.integracao_sistemas.length" class="mt-1 text-xs text-gray-600 dark:text-gray-300">
                {{ labelsLista(row.integracao_sistemas, SISTEMA_LABEL) }}
              </p>
              <p v-if="row.integracao_outro" class="text-xs text-gray-600 dark:text-gray-300">Outro: {{ row.integracao_outro }}</p>
            </div>
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Dashboard</h4>
              <span class="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="interesseClass(row.dashboard_interesse)">
                {{ row.dashboard_interesse ? INTERESSE_LABEL[row.dashboard_interesse] : '—' }}
              </span>
            </div>
          </section>
          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Atendimento</h4>
            <p class="mt-1">{{ row.atendimento_usou ? SIM_NAO_LABEL[row.atendimento_usou] : '—' }}</p>
            <template v-if="row.atendimento_usou === 'sim'">
              <p class="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Canais: {{ labelsLista(row.atendimento_canais || [], CANAL_ATENDIMENTO_LABEL) }}
              </p>
              <p class="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Nível 1 — educação {{ row.n1_educacao ?? '—' }}, tempo {{ row.n1_tempo ?? '—' }},
                resolução {{ row.n1_resolucao ?? '—' }}
              </p>
              <p class="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Nível 2:
                <template v-if="row.atendimento_nivel2 === 'sim'">
                  educação {{ row.n2_educacao ?? '—' }}, tempo {{ row.n2_tempo ?? '—' }},
                  resolução {{ row.n2_resolucao ?? '—' }}
                </template>
                <template v-else>
                  {{ row.atendimento_nivel2 ? SIM_NAO_LABEL[row.atendimento_nivel2] : '—' }}
                </template>
              </p>
            </template>
          </section>
          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Comentário</h4>
            <p class="mt-1 whitespace-pre-wrap text-gray-800 dark:text-gray-200">{{ row.comentario || '—' }}</p>
          </section>
        </div>

        <div class="mt-4 flex justify-end">
          <router-link
            :to="`/admin/clientes/alterar/${row.id_cliente}`"
            class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white dark:bg-gray-700"
          >
            Abrir cliente
          </router-link>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { formatDateTime } from '../model/crm.ui'
import {
  CANAL_ATENDIMENTO_LABEL,
  DIFICULDADE_LABEL,
  FREQUENCIA_LABEL,
  INTERESSE_LABEL,
  MODULO_LABEL,
  SERVICO_LABEL,
  SIM_NAO_LABEL,
  SISTEMA_LABEL,
  interesseClass,
  npsFaixaClass,
  type PesquisaResposta,
  type ServicoDesejado,
} from '../model/pesquisa.types'

const props = defineProps<{ row: PesquisaResposta }>()
defineEmits<{ (e: 'close'): void }>()

const sugestoesServico = computed(() => {
  const mapa = props.row.servicos_sugestoes || {}
  const chaves = Object.keys(mapa) as ServicoDesejado[]
  return chaves
    .filter((chave) => (mapa[chave] || '').trim() !== '')
    .map((chave) => ({
      chave,
      label: SERVICO_LABEL[chave] || chave,
      texto: mapa[chave] || '',
    }))
})

function labelsLista(valores: string[], mapa: Record<string, string>): string {
  if (!valores.length) return '—'
  return valores.map((item) => mapa[item] || item).join(', ')
}
</script>
