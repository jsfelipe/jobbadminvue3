<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <!-- Botão voltar -->
      <div class="mb-4">
        <router-link :to="{ name: 'admin.clientes' }">
          <el-button type="default">< Voltar</el-button>
        </router-link>
      </div>

      <!-- Tabela de notas fiscais -->
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <el-table
          :data="tableData"
          style="width: 100%"
          v-loading="loading"
          stripe
        >
          <el-table-column label="Data NF">
            <template #default="scope">
              {{ formatDate(scope.row.updated_at) }}
            </template>
          </el-table-column>
          <el-table-column label="Número da NF">
            <template #default="scope">
              {{ scope.row.nf_numero }}
              {{ scope.row.nf_codigo_verificador ? '' : scope.row.nf_numero_rps }}
            </template>
          </el-table-column>
          <el-table-column label="Status">
            <template #default="scope">
              {{ scope.row.nf_status }}
              {{ scope.row.status_nf_solicitada == 1 ? 'Solicitada' : '' }}
            </template>
          </el-table-column>
          <el-table-column label="Valor">
            <template #default="scope">
              {{ formatCurrency(scope.row.nf_valor_total) }}
            </template>
          </el-table-column>
          <el-table-column label="Opções" width="150">
            <template #default="scope">
              <span v-if="scope.row.nf_link_pdf">
                <el-button
                  size="small"
                  type="primary"
                  :href="scope.row.nf_link_pdf"
                  target="_blank"
                  circle
                >
                  <i class="fas fa-arrow-down"></i>
                </el-button>
                <el-button
                  size="small"
                  type="info"
                  :href="getNfseLink(scope.row)"
                  target="_blank"
                  circle
                >
                  <i class="fas fa-link"></i>
                </el-button>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { clienteService } from '@/services/cliente'
import { ElMessage } from 'element-plus'
import numbro from 'numbro'

const route = useRoute()

const loading = ref(false)
const tableData = ref([])

const id = computed(() => route.params.id)

const formatDate = (date) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return date
    return d.toLocaleDateString('pt-BR')
  } catch {
    return date
  }
}

const formatCurrency = (value) => {
  if (!value) return 'R$ 0,00'
  return numbro(value).format({ thousandSeparator: '.', decimalSeparator: ',', prefix: 'R$ ' })
}

const getNfseLink = (row) => {
  if (row.nf_codigo_verificador) {
    const codigo = row.nf_codigo_verificador.replace(/-/g, '')
    return `https://nfse.recife.pe.gov.br/contribuinte/notaprint.aspx?inscricao=3570487&nf=${row.nf_numero}&cod=${codigo}`
  }
  return '#'
}

const listarNotas = async (idCliente) => {
  loading.value = true
  try {
    const response = await clienteService.getNotas(idCliente)
    const notas = response.data || []
    
    // Limita a 12 registros (igual ao projeto antigo)
    const arrResult = notas.slice(0, 12).map((item) => ({
      ...item,
      updated_at: formatDate(item.updated_at),
    }))
    
    tableData.value = arrResult
  } catch (error) {
    console.error('Erro ao listar notas fiscais:', error)
    ElMessage.error('Erro ao carregar notas fiscais')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  listarNotas(id.value)
})
</script>

<style scoped>
.el-button + .el-button {
  margin-left: 4px;
}
</style>
