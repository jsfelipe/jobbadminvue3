<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 class="text-xl font-semibold text-gray-900 dark:text-white">Exportar E-mails</h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Exporta e-mails de tb_cliente (jobbadmin) pelos filtros. Opcionalmente inclui usuários de cada base.
            </p>
          </div>
          <el-button @click="voltar">Voltar</el-button>
        </div>

        <div
          v-if="processando"
          class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
        >
          <div class="mb-2 font-medium text-blue-800 dark:text-blue-200">
            Exportando e-mails dos usuários das bases...
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
            <li v-for="r in progresso.results" :key="r.dbname">
              <span :class="r.status ? 'text-green-600' : 'text-red-600'">
                {{ r.dbname }}: {{ r.msgDetails }}
              </span>
            </li>
          </ul>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <el-select v-model="filtros.tipo_jobb" placeholder="TODOS (JOBB)" style="width: 200px">
            <el-option label="TODOS (JOBB)" value="" />
            <el-option label="AUDIO" value="A" />
            <el-option label="ESTUDIO" value="E" />
            <el-option label="VIDEO" value="V" />
            <el-option label="J03" value="J03" />
            <el-option label="JOBBLIVE" value="JOBBLIVE" />
          </el-select>
          <el-select v-model="filtros.tipo_cliente" placeholder="TODOS (CLIENTES)" style="width: 200px">
            <el-option label="TODOS (CLIENTES)" value="" />
            <el-option label="CLIENTE" value="C" />
            <el-option label="TESTE" value="T" />
            <el-option label="CANCELADO" value="A" />
          </el-select>
        </div>

        <label class="mb-6 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input v-model="incluirUsuarios" type="checkbox" class="h-4 w-4" />
          Incluir e-mails dos usuários (conecta em cada base)
        </label>

        <div class="flex gap-2">
          <el-button type="success" :disabled="processando" @click="exportar">Exportar</el-button>
          <el-button :disabled="processando" @click="voltar">Cancelar</el-button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { api } from '@/services/http'
import { ElMessage } from 'element-plus'

interface ProgressoResult {
  dbname: string
  status: boolean
  msgDetails: string
}

interface ExportJobResponse {
  job_id: string
  total: number
  status: string
  error?: string
}

const router = useRouter()
const processando = ref(false)
const incluirUsuarios = ref(false)
const jobId = ref<string | null>(null)

const filtros = reactive({
  tipo_jobb: '',
  tipo_cliente: '',
})

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
  if (progresso.status === 'completed') {
    return 100
  }
  return 0
})

function voltar() {
  if (processando.value) {
    ElMessage.warning('Aguarde o processamento ou permaneça nesta tela')
    return
  }
  router.push({ name: 'admin.query-database' })
}

async function exportar() {
  if (processando.value) {
    ElMessage.warning('Já existe um processamento em andamento')
    return
  }

  if (incluirUsuarios.value) {
    await exportarComUsuarios()
    return
  }

  await exportarClientes()
}

async function exportarClientes() {
  try {
    const response = await api.post('/query-database/exportar-emails', {
      tipo_jobb: filtros.tipo_jobb,
      tipo_cliente: filtros.tipo_cliente,
      incluir_usuarios: false,
    }, { responseType: 'blob' })

    if (!baixarBlob(response.data, 'emails')) {
      ElMessage.error(await lerErroBlob(response.data))
      return
    }
    ElMessage.success('Exportação concluída!')
  } catch (error: unknown) {
    console.error('Erro ao exportar e-mails:', error)
    ElMessage.error(await mensagemErroExport(error))
  }
}

async function exportarComUsuarios() {
  processando.value = true
  progresso.total = 0
  progresso.completed = 0
  progresso.status = 'processing'
  progresso.results = []

  try {
    const response = await api.post<ExportJobResponse>('/query-database/exportar-emails', {
      tipo_jobb: filtros.tipo_jobb,
      tipo_cliente: filtros.tipo_cliente,
      incluir_usuarios: true,
    })

    if (!response.data.job_id) {
      processando.value = false
      ElMessage.error('Resposta inválida ao iniciar exportação')
      return
    }

    jobId.value = response.data.job_id
    progresso.total = response.data.total
    ElMessage.success('Exportação iniciada')

    if (response.data.status === 'completed') {
      processando.value = false
      progresso.status = 'completed'
      baixarExportUsuarios()
      return
    }

    iniciarPolling()
  } catch (error: unknown) {
    processando.value = false
    console.error('Erro ao exportar e-mails:', error)
    ElMessage.error(await mensagemErroExport(error))
  }
}

function baixarBlob(data: Blob, prefixo: string): boolean {
  if (data.type && data.type.indexOf('json') !== -1) {
    return false
  }
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${prefixo}-${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  return true
}

async function lerErroBlob(data: Blob): Promise<string> {
  try {
    const texto = await data.text()
    const parsed = JSON.parse(texto) as { error?: string }
    return parsed.error || 'Erro ao exportar e-mails'
  } catch {
    return 'Erro ao exportar e-mails'
  }
}

async function mensagemErroExport(error: unknown): Promise<string> {
  const err = error as { response?: { status?: number; data?: Blob | { error?: string } } }
  if (err.response?.status === 403) {
    return 'Acesso negado. Apenas administradores podem exportar e-mails.'
  }
  if (err.response?.data instanceof Blob) {
    return lerErroBlob(err.response.data)
  }
  if (err.response?.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
    return err.response.data.error || 'Erro ao exportar e-mails'
  }
  return 'Erro ao exportar e-mails'
}

function baixarExportUsuarios(tentativa = 0) {
  if (!jobId.value) {
    ElMessage.error('Job de exportação não encontrado')
    return
  }

  api
    .get(`/query-database/exportar-usuarios/download/${jobId.value}`, { responseType: 'blob' })
    .then((response) => {
      if (!baixarBlob(response.data, 'emails')) {
        ElMessage.error('Arquivo de exportação inválido')
        return
      }
      ElMessage.success('Exportação concluída!')
    })
    .catch((error) => {
      if (error.response && error.response.status === 404 && tentativa < 5) {
        setTimeout(() => baixarExportUsuarios(tentativa + 1), 700)
        return
      }
      console.error('Erro ao baixar exportação:', error)
      ElMessage.error('Erro ao baixar arquivo de exportação')
    })
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
        progresso.completed = progresso.total
        baixarExportUsuarios()
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

onBeforeUnmount(() => {
  pararPolling()
  if (progressoTimeout) clearTimeout(progressoTimeout)
})
</script>
