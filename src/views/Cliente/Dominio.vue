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
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo
              </label>
              <el-select v-model="tipo_jobb" name="tipo_jobb" placeholder="Selecione o tipo" style="width: 100%">
                <el-option value="V" label="Video" />
                <el-option value="40" label="Jobb 4.0" />
                <el-option value="24" label="Gestor" />
                <el-option value="A" label="Audio" />
              </el-select>
            </div>
          </div>

          <div class="mt-6">
            <el-button type="success" native-type="submit" :loading="loading">
              Criar conta
            </el-button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ElMessage } from 'element-plus'
import { clienteService } from '@/services/cliente'

const route = useRoute()
const router = useRouter()

const errors = ref<string[]>([])
const loading = ref(false)
const id_cliente = ref<string | null>(null)
const subdominio = ref('')
const login = ref('')
const senha = ref('')
const tipo_jobb = ref('40')

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

  loading.value = true
  try {
    const response = await clienteService.criarDominio(id_cliente.value, {
      subdominio: subdominio.value,
      login: login.value,
      senha: senha.value,
      tipo_jobb: tipo_jobb.value,
    })

    if (response.data.code === 1) {
      ElMessage.success('Criado com sucesso!')
      router.push({ name: 'admin.clientes' })
    } else {
      ElMessage.error({
        message: `Erro, domínio não criado: ${response.data.msg || 'Falha desconhecida'}`,
        duration: 8000,
      })
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { msg?: string } } }
    const msg = axiosError.response?.data?.msg
    ElMessage.error({
      message: msg ? `Erro, domínio não criado: ${msg}` : 'Erro ao criar domínio. Tente novamente.',
      duration: 8000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  id_cliente.value = String(route.params.id)
})
</script>
