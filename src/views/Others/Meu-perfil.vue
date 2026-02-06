<template>
  <admin-layout>
    <div class="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h4 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Meu Perfil
        </h4>

        <form @submit.prevent="updatePerfil">
          <div v-if="errors.length" class="mb-4 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20">
            <b>Por favor, corrija o(s) seguinte(s) erro(s):</b>
            <ul class="ml-4 list-disc">
              <li v-for="error in errors" :key="error">{{ error }}</li>
            </ul>
          </div>

          <div class="space-y-6">
            <!-- Email -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail <span class="text-error-500">*</span>
              </label>
              <el-input
                v-model="formData.email"
                type="email"
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            <!-- Nova senha -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nova Senha
              </label>
              <el-input
                v-model="formData.nova_senha"
                type="password"
                placeholder="Deixe em branco para não alterar"
                show-password
              />
            </div>

            <!-- Confirmar nova senha -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar Nova Senha
              </label>
              <el-input
                v-model="formData.confirmar_senha"
                type="password"
                placeholder="Confirme a nova senha"
                show-password
              />
            </div>
          </div>

          <!-- Botões -->
          <div class="mt-6 flex justify-end gap-4">
            <router-link :to="{ name: 'admin.overview' }">
              <el-button type="default">Cancelar</el-button>
            </router-link>
            <el-button type="primary" native-type="submit" :loading="loading">
              Salvar
            </el-button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { usuarioService } from '@/services/usuario'
import { ElMessage } from 'element-plus'

const store = useStore()
const router = useRouter()

const loading = ref(false)
const errors = ref([])
const formData = ref({
  email: '',
  nova_senha: '',
  confirmar_senha: '',
})

const userData = computed(() => store.state.Login?.data || {})

const updatePerfil = async () => {
  errors.value = []

  // Validações
  if (!formData.value.email) {
    errors.value.push('E-mail é obrigatório.')
  }
  if (formData.value.nova_senha && formData.value.nova_senha !== formData.value.confirmar_senha) {
    errors.value.push('As senhas não coincidem.')
  }
  if (formData.value.nova_senha && formData.value.nova_senha.length < 6) {
    errors.value.push('A nova senha deve ter no mínimo 6 caracteres.')
  }

  if (errors.value.length) {
    return
  }

  loading.value = true
  try {
    const dataToUpdate = {
      email: formData.value.email,
    }

    if (formData.value.nova_senha) {
      dataToUpdate.senha = formData.value.nova_senha
    }

    const resposta = await usuarioService.alterarMeuPerfil(dataToUpdate)

    if (resposta.status) {
      ElMessage.success('Perfil atualizado com sucesso!')
      // Atualiza os dados do usuário no store
      await store.dispatch('Login/me')
      formData.value.nova_senha = ''
      formData.value.confirmar_senha = ''
    } else {
      ElMessage.error(resposta.message || 'Erro ao atualizar perfil')
      if (resposta.errors) {
        errors.value = Object.values(resposta.errors).flat()
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    ElMessage.error('Erro ao atualizar perfil')
    if (error.response?.data?.errors) {
      errors.value = Object.values(error.response.data.errors).flat()
    }
  } finally {
    loading.value = false
  }
}

const carregarDadosUsuario = async () => {
  try {
    // Carrega dados do usuário do store ou busca novamente
    if (!userData.value.email) {
      await store.dispatch('Login/me')
    }
    formData.value.email = userData.value.email || ''
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error)
  }
}

onMounted(() => {
  carregarDadosUsuario()
})
</script>
