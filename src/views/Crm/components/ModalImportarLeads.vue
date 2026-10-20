<template>
  <Modal full-screen-backdrop @close="onClose">
    <template #body>
      <div class="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Importar leads (Excel)</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Planilha:
          <span class="font-medium text-gray-700 dark:text-gray-300"
            >Empresa, Email, Telefone, Nome, Cargo, Pg, Palavra chave</span
          >
          (.xlsx ou .csv). Contatos já importados são ignorados.
        </p>

        <!-- Formulário -->
        <div v-if="fase === 'form'" class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="imp-produto">Produto *</label>
            <select
              id="imp-produto"
              v-model="produto"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="p in PRODUTOS_LEAD" :key="p" :value="p">{{ PRODUTO_LEAD_LABEL[p] }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="imp-origem">Origem *</label>
            <select
              id="imp-origem"
              v-model="origem"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="o in ORIGENS_LEAD" :key="o" :value="o">{{ ORIGEM_LEAD_LABEL[o] }}</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="imp-arquivo">Arquivo *</label>
            <input
              id="imp-arquivo"
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              class="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 dark:text-gray-300 dark:file:bg-blue-900/40 dark:file:text-blue-100"
              @change="onFile"
            />
            <p v-if="arquivo" class="mt-1 text-xs text-gray-500">{{ arquivo.name }}</p>
          </div>
        </div>

        <!-- Progresso -->
        <div v-else-if="fase === 'progress'" class="mt-6 space-y-4">
          <p class="text-sm text-gray-700 dark:text-gray-200">{{ progresso?.message || 'Processando...' }}</p>
          <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-full rounded-full bg-blue-600 transition-all duration-300"
              :style="{ width: `${Math.min(100, progresso?.percentage ?? 0)}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{{ progresso?.processed ?? 0 }} / {{ progresso?.total ?? 0 }} linhas</span>
            <span class="font-semibold text-blue-600">{{ formatPct(progresso?.percentage ?? 0) }}%</span>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/30">
              <p class="font-bold text-emerald-700 dark:text-emerald-300">{{ progresso?.importados ?? 0 }}</p>
              <p class="text-gray-500">Importados</p>
            </div>
            <div class="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/30">
              <p class="font-bold text-amber-700 dark:text-amber-300">{{ progresso?.duplicados ?? 0 }}</p>
              <p class="text-gray-500">Duplicados</p>
            </div>
            <div class="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
              <p class="font-bold text-gray-700 dark:text-gray-200">{{ progresso?.ignorados ?? 0 }}</p>
              <p class="text-gray-500">Ignorados</p>
            </div>
          </div>
        </div>

        <!-- Resultado -->
        <div v-else class="mt-6 space-y-4">
          <div
            class="rounded-lg border p-4"
            :class="
              progresso?.status === 'failed'
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
                : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
            "
          >
            <p class="text-sm font-semibold" :class="progresso?.status === 'failed' ? 'text-red-700 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-200'">
              {{ progresso?.status === 'failed' ? 'Importação falhou' : 'Importação concluída' }}
            </p>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-300">{{ progresso?.message }}</p>
          </div>

          <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div class="h-full w-full rounded-full bg-emerald-500"></div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="rounded-lg border border-emerald-200 p-3 dark:border-emerald-800">
              <p class="text-2xl font-bold text-emerald-600">{{ progresso?.importados ?? 0 }}</p>
              <p class="text-xs text-gray-500">Importados (novos)</p>
            </div>
            <div class="rounded-lg border border-amber-200 p-3 dark:border-amber-800">
              <p class="text-2xl font-bold text-amber-600">{{ progresso?.duplicados ?? 0 }}</p>
              <p class="text-xs text-gray-500">Já existiam</p>
            </div>
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
              <p class="text-2xl font-bold text-gray-700 dark:text-gray-200">{{ progresso?.ignorados ?? 0 }}</p>
              <p class="text-xs text-gray-500">Inválidos</p>
            </div>
          </div>

          <p class="text-center text-xs text-gray-500">
            Total processado: {{ progresso?.processed ?? 0 }} de {{ progresso?.total ?? 0 }}
          </p>

          <ul
            v-if="progresso?.erros?.length"
            class="max-h-40 list-disc overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 pl-5 text-xs text-amber-800 dark:border-gray-600 dark:bg-gray-900/40 dark:text-amber-200"
          >
            <li v-for="(e, i) in progresso.erros" :key="i">{{ e }}</li>
          </ul>
        </div>

        <p v-if="erro" class="mt-3 text-xs text-red-600">{{ erro }}</p>

        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-gray-200"
            :disabled="fase === 'progress'"
            @click="onClose"
          >
            {{ fase === 'result' ? 'Fechar' : 'Cancelar' }}
          </button>
          <button
            v-if="fase === 'form'"
            type="button"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="!arquivo"
            @click="iniciar"
          >
            Importar
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import {
  ORIGEM_LEAD_LABEL,
  ORIGENS_LEAD,
  PRODUTO_LEAD_LABEL,
  PRODUTOS_LEAD,
  type CrmLeadImportProgress,
  type OrigemLead,
  type ProdutoLead,
} from '../model/crm.types'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'importado', result: CrmLeadImportProgress): void
}>()

const produto = ref<ProdutoLead>('jobblive')
const origem = ref<OrigemLead>('contact_out')
const arquivo = ref<File | null>(null)
const erro = ref('')
const fase = ref<'form' | 'progress' | 'result'>('form')
const progresso = ref<CrmLeadImportProgress | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

const formatPct = (n: number) => (Number.isFinite(n) ? n.toFixed(n % 1 === 0 ? 0 : 1) : '0')

const onFile = (ev: Event) => {
  const input = ev.target as HTMLInputElement
  arquivo.value = input.files && input.files[0] ? input.files[0] : null
  erro.value = ''
}

const stopPoll = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const poll = async (jobId: string) => {
  try {
    const p = await crmService.leadsImportProgress(jobId)
    progresso.value = p
    if (p.status === 'completed' || p.status === 'failed') {
      stopPoll()
      fase.value = 'result'
      if (p.status === 'completed') {
        if (p.importados > 0) {
          toast.success(`${p.importados} lead(s) importado(s)`)
        } else {
          toast.warning('Nenhum lead novo (todos duplicados ou inválidos)')
        }
        emit('importado', p)
      } else {
        toast.error(p.message || 'Falha na importação')
      }
    }
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { error?: string }; status?: number } }
    if (ax.response?.status === 404) {
      stopPoll()
      fase.value = 'result'
      erro.value = 'Job não encontrado. Verifique se o queue worker está rodando.'
      progresso.value = {
        job_id: jobId,
        status: 'failed',
        total: 0,
        processed: 0,
        percentage: 100,
        importados: 0,
        duplicados: 0,
        ignorados: 0,
        erros: [erro.value],
        message: erro.value,
      }
    }
  }
}

const iniciar = async () => {
  erro.value = ''
  if (!arquivo.value) {
    erro.value = 'Selecione o arquivo Excel.'
    return
  }
  fase.value = 'progress'
  progresso.value = {
    job_id: '',
    status: 'pending',
    total: 0,
    processed: 0,
    percentage: 0,
    importados: 0,
    duplicados: 0,
    ignorados: 0,
    erros: [],
    message: 'Enviando arquivo...',
  }
  try {
    const start = await crmService.leadsImportar({
      arquivo: arquivo.value,
      produto: produto.value,
      origem: origem.value,
    })
    progresso.value.message = start.message || 'Na fila...'
    progresso.value.job_id = start.job_id
    await poll(start.job_id)
    stopPoll()
    pollTimer = setInterval(() => {
      void poll(start.job_id)
    }, 1000)
  } catch (e: unknown) {
    fase.value = 'form'
    const ax = e as { response?: { data?: { error?: string; message?: string } } }
    erro.value = ax.response?.data?.error || ax.response?.data?.message || 'Falha ao iniciar importação.'
  }
}

const onClose = () => {
  if (fase.value === 'progress') return
  stopPoll()
  emit('close')
}

onUnmounted(() => {
  stopPoll()
})
</script>
