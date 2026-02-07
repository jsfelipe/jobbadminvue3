<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h4 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Alterar Databases</h4>

        <form id="formQuery" @submit.prevent="salvar" class="space-y-6">
          <div>
            <label for="query" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Query
            </label>
            <textarea
              id="query"
              v-model="formData.query"
              rows="15"
              placeholder="Digite a query SQL"
              class="w-full resize-y rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div
            v-if="processando"
            class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          >
            <div class="mb-2 font-medium text-blue-800 dark:text-blue-200">
              Processando query nas databases selecionadas...
            </div>
            <div class="mb-2 h-8 overflow-hidden rounded bg-blue-200 dark:bg-blue-900">
              <div
                class="flex h-full items-center justify-center bg-blue-500 text-sm font-medium text-white transition-all duration-300"
                :style="{ width: progressoPercentage + '%' }"
              >
                {{ progressoPercentage }}% ({{ progresso.completed }}/{{ progresso.total }})
              </div>
            </div>
            <div
              v-if="progresso.status === 'completed'"
              class="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200"
            >
              Processamento concluído!
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Databases
            </label>
            <div class="mb-2 flex gap-2">
              <el-button size="small" @click="marcarTodos">Marcar Todos</el-button>
              <el-button size="small" @click="desmarcarTodos">Desmarcar Todos</el-button>
            </div>
            <div class="mb-2 flex flex-wrap gap-2">
              <el-select
                v-model="formData.tipo_jobb"
                placeholder="TODOS (JOBB)"
                style="width: 200px"
                @change="atualizarCheck"
              >
                <el-option label="TODOS (JOBB)" value="" />
                <el-option label="AUDIO" value="A" />
                <el-option label="ESTUDIO" value="E" />
                <el-option label="VIDEO" value="V" />
                <el-option label="J03" value="J03" />
              </el-select>
              <el-select
                v-model="formData.tipo_cliente"
                placeholder="TODOS (CLIENTES)"
                style="width: 200px"
                @change="atualizarCheck"
              >
                <el-option label="TODOS (CLIENTES)" value="" />
                <el-option label="CLIENTE" value="C" />
                <el-option label="TESTE" value="T" />
                <el-option label="CANCELADO" value="A" />
              </el-select>
            </div>
            <div class="mb-2 flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input v-model="formData.addScriptInstalacao" type="radio" value="S" />
                Sim
              </label>
              <label class="flex items-center gap-2">
                <input v-model="formData.addScriptInstalacao" type="radio" value="N" />
                Não
              </label>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Deseja inserir no script de instalação?
              </span>
            </div>
            <div
              id="select_query"
              v-loading="carregando"
              class="max-h-[400px] overflow-y-auto rounded border border-gray-200 p-3 dark:border-gray-600"
              v-html="checkboxesHtml"
            />
          </div>

          <div class="flex gap-2">
            <el-button type="primary" @click="salvar">Salvar</el-button>
            <el-button type="success" @click="exportarUsuarios">Exportar E-mail dos Usuários</el-button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { api } from '@/services/http'
import { ElMessage } from 'element-plus'

const formData = reactive({
  query: '',
  tipo_jobb: '',
  tipo_cliente: '',
  addScriptInstalacao: 'N',
})

const checkboxesHtml = ref('')
const carregando = ref(false)
const databases = ref({})
const processando = ref(false)
const jobId = ref(null)
const progresso = reactive({
  total: 0,
  completed: 0,
  percentage: 0,
  status: '',
  results: [],
})
let pollingInterval = null
let progressoTimeout = null

const progressoPercentage = computed(() => {
  if (progresso.total > 0) {
    return Math.min(Math.round((progresso.completed / progresso.total) * 100), 100)
  }
  return 0
})

async function carregarDatabases() {
  try {
    const response = await api.get('/query-database/databases')
    databases.value = response.data
    montarCheckboxes()
  } catch (error) {
    console.error('Erro ao carregar databases:', error)
    ElMessage.error('Erro ao carregar databases')
  }
}

function montarCheckboxes() {
  let html = ''
  for (const dbName of Object.keys(databases.value)) {
    html += `<label for="db_name-${dbName}" style="display: block; margin-bottom: 5px;">
      <input type="checkbox" value="${dbName}" id="db_name-${dbName}" name="db_name[]" checked="checked">
      ${dbName}
    </label>`
  }
  checkboxesHtml.value = html
}

async function atualizarCheck() {
  carregando.value = true
  try {
    const response = await api.post('/query-database/atualizar-check', {
      tipo_jobb: formData.tipo_jobb,
      tipo_cliente: formData.tipo_cliente,
    })
    checkboxesHtml.value = response.data
  } catch (error) {
    console.error('Erro ao atualizar checkboxes:', error)
    ElMessage.error('Erro ao atualizar checkboxes')
  } finally {
    carregando.value = false
  }
}

function marcarTodos() {
  const checkboxes = document.querySelectorAll('#select_query input[type="checkbox"]')
  checkboxes.forEach((cb) => {
    cb.checked = true
  })
}

function desmarcarTodos() {
  const checkboxes = document.querySelectorAll('#select_query input[type="checkbox"]')
  checkboxes.forEach((cb) => {
    cb.checked = false
  })
}

function getCheckedDatabases() {
  return Array.from(document.querySelectorAll('#select_query input[type="checkbox"]:checked')).map(
    (cb) => cb.value
  )
}

function salvar() {
  const checkedDatabases = getCheckedDatabases()
  if (checkedDatabases.length === 0) {
    ElMessage.warning('Selecione pelo menos uma database')
    return
  }
  if (!formData.query.trim()) {
    ElMessage.warning('Digite uma query')
    return
  }
  if (processando.value) {
    ElMessage.warning('Já existe um processamento em andamento')
    return
  }

  processando.value = true
  progresso.total = checkedDatabases.length
  progresso.completed = 0
  progresso.percentage = 0
  progresso.status = 'processing'
  progresso.results = []

  const payload = {
    query: formData.query,
    db_name: checkedDatabases,
    tipo_jobb: formData.tipo_jobb,
    tipo_cliente: formData.tipo_cliente,
    addScriptInstalacao: formData.addScriptInstalacao,
  }

  api
    .post('/query-database/atualizar-databases', payload)
    .then((response) => {
      if (response.data.job_id) {
        jobId.value = response.data.job_id
        progresso.total = response.data.total
        ElMessage.success('Processamento iniciado')
        iniciarPolling()
      } else {
        processando.value = false
        const data = response.data
        if (data[0] && data[0].dbname === 'noDb') {
          ElMessage.success(data[0].msgDetails)
        } else {
          processarResultados(data)
        }
      }
    })
    .catch((error) => {
      processando.value = false
      console.error('Erro ao executar query:', error)
      if (error.response && error.response.status === 403) {
        ElMessage.error('Acesso negado. Apenas administradores podem executar queries.')
      } else {
        ElMessage.error('Erro ao executar query')
      }
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
      if (data.jobs_pending > 0 && data.completed === 0) {
        console.warn('Há jobs pendentes na fila. O worker pode não estar rodando.')
      }
      let percentage = data.percentage || 0
      if (data.status === 'completed') percentage = 100
      progresso.total = parseInt(data.total) || 0
      progresso.completed = parseInt(data.completed) || 0
      progresso.percentage = parseFloat(percentage) || 0
      progresso.status = data.status || 'processing'
      progresso.results = data.results || []

      if (data.results && data.results.length > 0) {
        atualizarResultadosNaTela(data.results)
      }
      if (data.status === 'completed') {
        pararPolling()
        processando.value = false
        progresso.percentage = 100
        ElMessage.success('Processamento concluído!')
      }
    })
    .catch((error) => {
      console.error('Erro ao verificar progresso:', error)
      if (error.response && error.response.status === 404) {
        pararPolling()
        processando.value = false
        ElMessage.error('Job não encontrado ou expirado')
      }
    })
}

function atualizarResultadosNaTela(results) {
  results.forEach((line) => {
    if (!line.completed) return
    const checkbox = document.querySelector(`#db_name-${line.dbname}`)
    if (checkbox && checkbox.parentElement) {
      const parent = checkbox.parentElement
      const existingMsg = parent.querySelector('.query-result')
      if (existingMsg) existingMsg.remove()
      const textSituation = line.status
        ? '<span class="query-result" style="color:green"> [EXECUTADO COM SUCESSO!]</span>'
        : `<span class="query-result" style="color:red"> [ERRO AO EXECUTAR COMANDO!] error: ${line.msgDetails}</span>`
      parent.insertAdjacentHTML('beforeend', textSituation)
    }
  })
}

function processarResultados(data) {
  data.forEach((line) => {
    const checkbox = document.querySelector(`#db_name-${line.dbname}`)
    if (checkbox && checkbox.parentElement) {
      const parent = checkbox.parentElement
      const existingMsg = parent.querySelector('.query-result')
      if (existingMsg) existingMsg.remove()
      const textSituation = line.status
        ? '<span class="query-result" style="color:green"> [EXECUTADO COM SUCESSO!]</span>'
        : `<span class="query-result" style="color:red"> [ERRO AO EXECUTAR COMANDO!] error: ${line.msgDetails}</span>`
      parent.insertAdjacentHTML('beforeend', textSituation)
    }
  })
  ElMessage.success('Query executada')
}

function exportarUsuarios() {
  const checkedDatabases = getCheckedDatabases()
  if (checkedDatabases.length === 0) {
    ElMessage.warning('Verifique se há pelo menos uma database selecionada.')
    return
  }
  carregando.value = true
  api
    .post('/query-database/listar-usuarios', { db_name: checkedDatabases })
    .then((response) => {
      carregando.value = false
      const emails = response.data
      if (emails === '1' || !emails) {
        ElMessage.success('Query executada com sucesso')
      } else {
        const baseUrl = (import.meta.env.VITE_API || '').replace(/\/$/, '') || window.location.origin + '/api'
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = `${baseUrl}/query-database/result-export-email`
        form.target = '_blank'
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'emails'
        input.value = emails
        form.appendChild(input)
        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)
      }
    })
    .catch((error) => {
      carregando.value = false
      console.error('Erro ao exportar usuários:', error)
      ElMessage.error('Erro ao exportar usuários')
    })
}

onMounted(() => {
  carregarDatabases()
  atualizarCheck()
})

onBeforeUnmount(() => {
  pararPolling()
  if (progressoTimeout) clearTimeout(progressoTimeout)
})
</script>

<style scoped>
#select_query :deep(label) {
  display: block;
  margin-bottom: 5px;
  padding: 5px;
}
#select_query :deep(label:hover) {
  background-color: #f5f5f5;
}
.dark #select_query :deep(label:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
