<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h4 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Cadastro Domínio
        </h4>

        <form @submit.prevent="checkForm">
          <div v-if="errors.length" class="mb-4 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20">
            <b>Por favor, corrija o(s) seguinte(s) erro(s):</b>
            <ul class="ml-4 list-disc">
              <li v-for="error in errors" :key="error">{{ error }}</li>
            </ul>
          </div>

          <div
            v-if="processando"
            class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          >
            <div class="mb-2 font-medium text-blue-800 dark:text-blue-200">
              {{ progresso.message || 'Processando criação da conta...' }}
            </div>
            <div class="mb-2 h-8 overflow-hidden rounded bg-blue-200 dark:bg-blue-900">
              <div
                class="flex h-full items-center justify-center bg-blue-500 text-sm font-medium text-white transition-all duration-300"
                :style="{ width: Math.max(progresso.percentage, 4) + '%' }"
              >
                {{ progresso.percentage }}%
              </div>
            </div>
            <div
              v-if="progresso.status === 'completed'"
              class="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200"
            >
              Conta criada com sucesso!
            </div>
            <div
              v-if="progresso.status === 'failed'"
              class="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
            >
              {{ progresso.message || 'Falha ao criar conta.' }}
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                ID (Código)
              </label>
              <el-input
                v-model="id_cliente"
                name="id_cliente"
                placeholder=""
                disabled
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Endereço (domínio)
              </label>
              <div class="flex items-center gap-2">
                <el-input
                  v-model="subdominio"
                  name="subdominio"
                  placeholder="minhaempresa"
                  class="flex-1"
                  :disabled="processando"
                />
                <span class="text-lg font-bold text-gray-700 dark:text-gray-300">
                  .sistemajobb.com.br
                </span>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Login
              </label>
              <el-input
                v-model="login"
                name="login"
                placeholder="admin"
                :disabled="processando"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <el-input
                v-model="senha"
                name="senha"
                type="password"
                show-password
                :disabled="processando"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo
              </label>
              <el-select
                v-model="tipo_jobb"
                name="tipo_jobb"
                placeholder="Selecione o tipo"
                style="width: 100%"
                :disabled="processando"
              >
                <el-option value="V" label="Video" />
                <el-option value="J03" label="Jobb 4.0" />
                <el-option value="24" label="Gestor" />
                <el-option value="A" label="Audio" />
              </el-select>
            </div>
          </div>

          <div class="mt-6">
            <el-button type="success" native-type="submit" :loading="processando" :disabled="processando">
              Criar conta
            </el-button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ElMessage } from 'element-plus'
import { clienteService } from '@/services/cliente'

interface ProgressoDominio {
  status: string
  percentage: number
  step: string
  message: string
  subdominio: string | null
  link: string | null
}

const route = useRoute()
const router = useRouter()

const errors = ref<string[]>([])
const processando = ref(false)
const id_cliente = ref<string | null>(null)
const subdominio = ref('')
const login = ref('')
const senha = ref('')
const tipo_jobb = ref('J03')
const jobId = ref<string | null>(null)

const progresso = reactive<ProgressoDominio>({
  status: '',
  percentage: 0,
  step: '',
  message: '',
  subdominio: null,
  link: null,
})

let pollingInterval: ReturnType<typeof setInterval> | null = null
let progressoTimeout: ReturnType<typeof setTimeout> | null = null

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
  if (progressoTimeout) {
    clearTimeout(progressoTimeout)
    progressoTimeout = null
  }
}

const verificarProgresso = async () => {
  if (!jobId.value) {
    return
  }

  try {
    const response = await clienteService.progressoDominio(jobId.value)
    const data = response.data as ProgressoDominio

    progresso.status = data.status || 'processing'
    progresso.percentage = data.status === 'completed' ? 100 : (Number(data.percentage) || 0)
    progresso.step = data.step || ''
    progresso.message = data.message || ''
    progresso.subdominio = data.subdominio || null
    progresso.link = data.link || null

    if (data.status === 'completed') {
      stopPolling()
      processando.value = false
      ElMessage.success('Criado com sucesso!')
      router.push({ name: 'admin.clientes' })
      return
    }

    if (data.status === 'failed') {
      stopPolling()
      processando.value = false
      ElMessage.error({
        message: `Erro, domínio não criado: ${data.message || 'Falha desconhecida'}`,
        duration: 8000,
      })
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: { status?: string; msg?: string } } }
    if (axiosError.response?.status === 404) {
      stopPolling()
      processando.value = false
      ElMessage.error('Job não encontrado ou expirado.')
    }
  }
}

const iniciarPolling = () => {
  stopPolling()
  progressoTimeout = setTimeout(() => {
    if (pollingInterval) {
      stopPolling()
      processando.value = false
      ElMessage.error('Tempo esgotado ao criar domínio. Verifique o status do cliente.')
    }
  }, 600000)

  pollingInterval = setInterval(() => {
    void verificarProgresso()
  }, 1000)
  void verificarProgresso()
}

const checkForm = async (e: Event) => {
  e.preventDefault()
  errors.value = []

  if (!subdominio.value) {
    errors.value.push('O subdominio é obrigatório.')
  }
  if (!login.value) {
    errors.value.push('O login é obrigatório.')
  }
  if (!senha.value) {
    errors.value.push('A senha é obrigatória.')
  }
  if (!tipo_jobb.value) {
    errors.value.push('O tipo é obrigatório.')
  }

  if (errors.value.length || !id_cliente.value) {
    return
  }

  processando.value = true
  progresso.status = 'processing'
  progresso.percentage = 0
  progresso.message = 'Enfileirando criação da conta...'
  progresso.step = 'queued'
  progresso.subdominio = null
  progresso.link = null

  try {
    const response = await clienteService.criarDominio(id_cliente.value, {
      subdominio: subdominio.value,
      login: login.value,
      senha: senha.value,
      tipo_jobb: tipo_jobb.value,
    })

    if (response.data.code !== 1 || !response.data.job_id) {
      processando.value = false
      ElMessage.error({
        message: `Erro, domínio não criado: ${response.data.msg || 'Falha desconhecida'}`,
        duration: 8000,
      })
      return
    }

    jobId.value = String(response.data.job_id)
    progresso.message = response.data.message || 'Processando criação da conta...'
    iniciarPolling()
  } catch (error: unknown) {
    processando.value = false
    const axiosError = error as { response?: { data?: { msg?: string } } }
    const msg = axiosError.response?.data?.msg
    ElMessage.error({
      message: msg ? `Erro, domínio não criado: ${msg}` : 'Erro ao criar domínio. Tente novamente.',
      duration: 8000,
    })
  }
}

onMounted(() => {
  id_cliente.value = String(route.params.id)
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>
