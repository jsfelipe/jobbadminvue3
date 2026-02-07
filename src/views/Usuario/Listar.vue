<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h4 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Usuários</h4>

        <el-table :data="tableData" stripe resizable style="width: 100%" v-loading="loading">
          <el-table-column prop="id_usuarios" label="ID" width="50" />
          <el-table-column prop="id_perfil" label="Perfil" width="100">
            <template #default="scope">
              <el-tag
                :type="getPerfilTipo(scope.row.id_perfil)"
                disable-transitions
              >
                {{ getPerfilNome(scope.row.id_perfil) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nome" label="Nome" width="250" />
          <el-table-column prop="email" label="E-mail" />
          <el-table-column fixed="right" label="Opções" width="80">
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
                <i class="far fa-edit"></i>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { usuarioService } from '@/services/usuario'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])

const perfisMap = {
  1: { nome: 'Supadm', tipo: 'danger' },
  2: { nome: 'Adm', tipo: 'warning' },
  3: { nome: 'Usuário', tipo: 'info' },
  4: { nome: 'Visitante', tipo: 'info' },
  6: { nome: 'Consultor', tipo: 'success' },
}

const getPerfilNome = (idPerfil) => {
  if (!idPerfil) return 'N/A'
  return perfisMap[idPerfil]?.nome || `Perfil ${idPerfil}`
}

const getPerfilTipo = (idPerfil) => {
  if (!idPerfil) return 'info'
  return perfisMap[idPerfil]?.tipo || 'info'
}

const handleEdit = (index, row) => {
  router.push({ path: `/admin/usuarios/alterar/${row.id_usuarios}` })
}

const listar = async () => {
  loading.value = true
  try {
    const resposta = await usuarioService.listar()
    tableData.value = resposta.data || []
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    ElMessage.error('Erro ao carregar lista de usuários')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  listar()
})
</script>
