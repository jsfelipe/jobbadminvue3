<template>
  <admin-layout>
    <div class="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h4 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Alterar Usuário</h4>

        <form @submit.prevent="updateUsuario">
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome
              </label>
              <el-input v-model="data.nome" disabled />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <el-input v-model="data.email" disabled />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Perfil
              </label>
              <el-select
                v-model="data.id_perfil"
                placeholder="Selecione o perfil"
                style="width: 100%"
              >
                <el-option
                  v-for="perfil in perfis"
                  :key="perfil.value"
                  :label="perfil.label"
                  :value="perfil.value"
                />
              </el-select>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <el-input
                v-model="data.password"
                type="password"
                placeholder="Deixe em branco para não alterar"
                show-password
              />
            </div>
          </div>

          <div class="flex justify-center gap-4">
            <el-button type="primary" @click="updateUsuario" :loading="loading">
              Salvar
            </el-button>
            <el-button @click="voltar">Voltar</el-button>
          </div>
        </form>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { usuarioService } from '@/services/usuario'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const id = ref(route.params.id)
const data = ref({
  id_usuarios: null,
  nome: '',
  email: '',
  password: '',
  id_perfil: null,
})

const perfis = [
  { value: 1, label: 'Supadm' },
  { value: 2, label: 'Adm' },
  { value: 3, label: 'Usuário' },
  { value: 4, label: 'Visitante' },
  { value: 6, label: 'Consultor' },
]

const listar = async (userId) => {
  loading.value = true
  try {
    const resposta = await usuarioService.listarId(userId)
    data.value = resposta.data || {}
  } catch (error) {
    console.error('Erro ao carregar usuário:', error)
    ElMessage.error('Erro ao carregar dados do usuário')
  } finally {
    loading.value = false
  }
}

const updateUsuario = async () => {
  loading.value = true
  try {
    const dataToUpdate = { ...data.value }
    // Remove senha se estiver vazia
    if (!dataToUpdate.password || dataToUpdate.password.trim() === '') {
      delete dataToUpdate.password
    }

    const resposta = await usuarioService.alterar(dataToUpdate)
    if (resposta.status) {
      ElMessage.success('Usuário alterado com sucesso!')
      router.push({ name: 'admin.usuarios' })
    } else {
      ElMessage.error(resposta.message || 'Erro ao alterar usuário')
    }
  } catch (error) {
    console.error('Erro ao alterar usuário:', error)
    ElMessage.error('Erro ao alterar usuário')
  } finally {
    loading.value = false
  }
}

const voltar = () => {
  router.push({ name: 'admin.usuarios' })
}

onMounted(() => {
  if (id.value) {
    listar(id.value)
  }
})
</script>
