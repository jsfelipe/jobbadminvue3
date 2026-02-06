<template>
  <AdminLayout>
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12"
    >
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white/90">
            Modelos de e-mail
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Listagem de modelos de e-mail
          </p>
        </div>
        <el-button type="primary" @click="router.push('/configuracoes/modelo-email/formulario')">
          <el-icon class="mr-1"><Plus /></el-icon>
          Cadastrar
        </el-button>
      </div>

      <div class="jobb-data-table">
        <el-table
          v-loading="loading"
          :data="listData"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column prop="id" label="#" width="64" />
          <el-table-column prop="descricao" label="Descrição" min-width="200" show-overflow-tooltip />

          <el-table-column label="" width="120" align="right" fixed="right">
            <template #default="{ row }">
              <div class="flex justify-end gap-1">
                <el-button type="primary" size="small" :icon="Edit" circle @click="edit(row)" />
                <el-button type="danger" size="small" :icon="Delete" circle @click="destroy(row.id)" />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import Swal from 'sweetalert2'
import type { SweetAlertResult } from 'sweetalert2'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { listModelsEmail, destroyModelEmail, type ModelEmailItem } from '@/services/model-email'
import { ElMessage } from 'element-plus'

const router = useRouter()
const instance = getCurrentInstance()
const alerta = instance?.proxy?.$alerta

const loading = ref(true)
const listData = ref<ModelEmailItem[]>([])

async function getModels() {
  loading.value = true
  try {
    const result = await listModelsEmail()
    listData.value = result.models_emails ?? []
  } catch (e) {
    console.error('Erro ao listar modelos de e-mail', e)
    listData.value = []
    ElMessage.error('Erro ao listar modelos de e-mail.')
  } finally {
    loading.value = false
  }
}

function edit(row: ModelEmailItem) {
  router.push(`/configuracoes/modelo-email/formulario/${row.id}`)
}

function destroy(id: number) {
  Swal.fire({
    title: 'Deseja realmente deletar?',
    text: 'Esta ação não pode ser desfeita.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-secondary',
    },
    buttonsStyling: false,
  }).then(async (result: SweetAlertResult) => {
    if (result.isConfirmed) {
      try {
        const ret = await destroyModelEmail(id)
        if (ret.status !== false) {
          listData.value = listData.value.filter((item) => item.id !== id)
          alerta?.('Deletado com sucesso', 'success') ?? ElMessage.success('Deletado com sucesso.')
        } else {
          alerta?.(ret.msg ?? 'Erro ao deletar', 'danger') ?? ElMessage.error(ret.msg ?? 'Erro ao deletar.')
        }
      } catch (e) {
        console.error('Erro ao deletar modelo de e-mail:', e)
        alerta?.('Erro ao deletar modelo de e-mail', 'danger') ?? ElMessage.error('Erro ao deletar modelo de e-mail.')
      }
    }
  })
}

onMounted(() => {
  getModels()
})
</script>
