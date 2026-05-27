<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 class="text-xl font-semibold text-gray-900 dark:text-white">Remover contas Testes</h4>
            <p v-if="cutoff" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Cadastro até {{ formatarData(cutoff) }} e sem acesso após essa data. Total:
              {{ clientes.length }}
            </p>
          </div>
          <el-button @click="voltar">Voltar</el-button>
        </div>

        <div
          v-if="processando"
          class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
        >
          <div class="mb-2 font-medium text-blue-800 dark:text-blue-200">
            Removendo contas teste...
          </div>
          <div class="mb-2 h-8 overflow-hidden rounded bg-blue-200 dark:bg-blue-900">
            <div
              class="flex h-full items-center justify-center bg-blue-500 text-sm font-medium text-white transition-all duration-300"
              :style="{ width: progressoPercentage + '%' }"
            >
              {{ progressoPercentage }}% ({{ progresso.completed }}/{{ progresso.total }})
            </div>
          </div>
          <ul
            v-if="progresso.results.length > 0"
            class="max-h-48 space-y-1 overflow-y-auto text-sm text-gray-700 dark:text-gray-300"
          >
            <li v-for="r in progresso.results" :key="r.id_cliente || r.dbname">
              <span :class="r.action === 'removed' ? 'text-green-600' : 'text-amber-600'">
                {{ r.dbname }}: {{ r.msgDetails }}
              </span>
            </li>
          </ul>
        </div>

        <div v-loading="carregando" class="mb-6">
          <el-table v-if="clientes.length > 0" :data="clientes" stripe border style="width: 100%">
            <el-table-column prop="nome" label="Nome" min-width="200" />
            <el-table-column prop="subdominio" label="Subdomínio" min-width="140" />
            <el-table-column label="Data cadastro" min-width="130">
              <template #default="{ row }">
                {{ formatarData(row.data_cadastro) }}
              </template>
            </el-table-column>
            <el-table-column label="Tipo cliente" width="120" align="center">
              <template #default="{ row }">
                <el-tag type="warning" disable-transitions>{{ row.tipo_cliente }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else-if="!carregando" description="Nenhuma conta teste elegível para remoção" />
        </div>

        <div class="flex gap-2">
          <el-button type="danger" :disabled="processando || clientes.length === 0" @click="confirmar">
            Confirmar remoção
          </el-button>
          <el-button :disabled="processando" @click="voltar">Cancelar</el-button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { api } from '@/services/http'
import { ElMessage, ElMessageBox } from 'element-plus'

interface ContaTesteElegivel {
  id_cliente: number
  nome: string
  subdominio: string | null
  data_cadastro: string | null
  tipo_cliente: string
  db_name: string
}

interface PreviewResponse {
  total: number
  cutoff: string
  clientes: ContaTesteElegivel[]
}

interface ProgressoResult {
  dbname: string
  id_cliente?: number
  status: boolean
  msgDetails: string
  action?: string
  completed?: boolean
}

const router = useRouter()
const carregando = ref(true)
const processando = ref(false)
const cutoff = ref('')
const clientes = ref<ContaTesteElegivel[]>([])
const jobId = ref<string | null>(null)

const progresso = reactive({
  total: 0,
  completed: 0,
  status: '',
  results: [] as ProgressoResult[],
})

let pollingInterval: ReturnType<typeof setInterval> | null = null
let progressoTimeout: ReturnType<typeof setTimeout> | null = null

const progressoPercentage = computed(() => {
  if (progresso.total > 0) {
    return Math.min(Math.round((progresso.completed / progresso.total) * 100), 100)
  }
  return 0
})

function formatarData(valor: string | null | undefined): string {
  if (!valor) return '-'
  const parte = String(valor).substring(0, 10)
  const [ano, mes, dia] = parte.split('-')
  if (ano && mes && dia) return `${dia}/${mes}/${ano}`
  return parte
}

async function carregarLista() {
  carregando.value = true
  try {
    const response = await api.get<PreviewResponse>('/query-database/remover-contas-testes/preview')
    cutoff.value = response.data.cutoff
    clientes.value = response.data.clientes || []
  } catch (error) {
    console.error('Erro ao carregar contas teste:', error)
    ElMessage.error('Erro ao carregar lista de contas teste')
    clientes.value = []
  } finally {
    carregando.value = false
  }
}

function voltar() {
  if (processando.value) {
    ElMessage.warning('Aguarde o processamento ou permaneça nesta tela')
    return
  }
  router.push({ name: 'admin.query-database' })
}

async function confirmar() {
  if (clientes.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `Remover ${clientes.value.length} conta(s) teste? Esta ação é irreversível (base e usuário MySQL).`,
      'Confirmar remoção',
      {
        confirmButtonText: 'Remover',
        cancelButtonText: 'Voltar',
        type: 'warning',
      }
    )
  } catch {
    return
  }

  processando.value = true
  progresso.total = clientes.value.length
  progresso.completed = 0
  progresso.status = 'processing'
  progresso.results = []

  try {
    const response = await api.post<{ job_id: string; total: number }>(
      '/query-database/remover-contas-testes'
    )
    if (response.data.job_id) {
      jobId.value = response.data.job_id
      progresso.total = response.data.total
      ElMessage.success('Remoção iniciada')
      iniciarPolling()
    } else {
      processando.value = false
      ElMessage.error('Resposta inválida ao iniciar remoção')
    }
  } catch (error: unknown) {
    processando.value = false
    console.error('Erro ao remover contas teste:', error)
    const err = error as { response?: { status?: number; data?: { error?: string } } }
    if (err.response?.status === 400) {
      ElMessage.warning(err.response.data?.error || 'Nenhuma conta elegível')
    } else {
      ElMessage.error('Erro ao iniciar remoção')
    }
  }
}

function pararPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

function iniciarPolling() {
  pararPolling()
  progressoTimeout = setTimeout(() => {
    if (pollingInterval) {
      pararPolling()
      processando.value = false
      ElMessage.warning('Tempo máximo de processamento excedido')
    }
  }, 600000)

  pollingInterval = setInterval(() => {
    if (!processando.value) {
      pararPolling()
      return
    }
    verificarProgresso()
  }, 1000)
  verificarProgresso()
}

function verificarProgresso() {
  if (!jobId.value) {
    pararPolling()
    return
  }
  api
    .get(`/query-database/progresso/${jobId.value}`)
    .then((response) => {
      const data = response.data
      progresso.total = parseInt(data.total, 10) || 0
      progresso.completed = parseInt(data.completed, 10) || 0
      progresso.status = data.status || 'processing'
      progresso.results = data.results || []

      if (data.status === 'completed') {
        pararPolling()
        processando.value = false
        ElMessage.success('Remoção de contas teste concluída!')
        carregarLista()
      }
    })
    .catch((error) => {
      console.error('Erro ao verificar progresso:', error)
      if (error.response?.status === 404) {
        pararPolling()
        processando.value = false
        ElMessage.error('Job não encontrado ou expirado')
      }
    })
}

onMounted(() => {
  carregarLista()
})

onBeforeUnmount(() => {
  pararPolling()
  if (progressoTimeout) clearTimeout(progressoTimeout)
})
</script>
