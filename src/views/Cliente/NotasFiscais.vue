<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <!-- Botão voltar -->
      <div class="mb-4">
        <router-link :to="{ name: 'admin.clientes' }">
          <el-button type="default">&lt; Voltar</el-button>
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
          <el-table-column label="Opções" width="200">
            <template #default="scope">
              <div class="flex items-center gap-1">
                <el-button
                  size="small"
                  type="info"
                  @click="abrirModalDetalhes(scope.row)"
                  circle
                >
                  <i class="fas fa-info-circle"></i>
                </el-button>
                <a
                  v-if="scope.row.nf_link_pdf"
                  :href="scope.row.nf_link_pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
                  title="PDF"
                >
                  <i class="fas fa-file-pdf"></i>
                </a>
                <a
                  v-if="scope.row.nf_link_xml"
                  :href="scope.row.nf_link_xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700"
                  title="XML"
                >
                  <i class="fas fa-file-code"></i>
                </a>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Modal de detalhes da nota fiscal -->
      <el-dialog
        v-model="dialogDetalhesVisible"
        title="Detalhes da Nota Fiscal"
        width="60%"
        center
      >
        <div v-if="notaSelecionada" class="space-y-4">
          <!-- Status -->
          <div class="rounded-lg p-4" :class="getStatusClass(notaSelecionada.nf_status)">
            <h3 class="text-lg font-semibold mb-2">Status</h3>
            <p class="text-xl">{{ notaSelecionada.nf_status || 'Pendente' }}</p>
            <p v-if="notaSelecionada.nf_motivo_status" class="mt-2 text-sm whitespace-pre-line">
              {{ notaSelecionada.nf_motivo_status }}
            </p>
          </div>

          <!-- Informações principais -->
          <div v-if="notaSelecionada.nf_status === 'Autorizado'" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Número da NF</label>
              <p class="text-lg">{{ notaSelecionada.nf_numero || notaSelecionada.nf_numero_rps }}</p>
            </div>
            <div v-if="notaSelecionada.nf_codigo_verificador">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Código Verificador</label>
              <p class="text-lg">{{ notaSelecionada.nf_codigo_verificador }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Criação</label>
              <p>{{ formatDate(notaSelecionada.nf_data_criacao) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Total</label>
              <p class="text-lg font-semibold">{{ formatCurrency(notaSelecionada.nf_valor_total) }}</p>
            </div>
          </div>

          <!-- Botão consultar novamente -->
          <div v-if="notaSelecionada.nf_status === 'EmProcessoDeAutorizacao'" class="flex gap-4">
            <el-button
              type="primary"
              @click="consultarStatusNF"
              :loading="consultandoStatus"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Consultar Status Novamente
            </el-button>
          </div>

          <!-- Links de download -->
          <div v-if="notaSelecionada.nf_status === 'Autorizado'" class="flex flex-wrap gap-4">
            <a
              v-if="notaSelecionada.nf_link_pdf"
              :href="notaSelecionada.nf_link_pdf"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              <i class="fas fa-file-pdf mr-2"></i>
              Baixar PDF
            </a>
            <a
              v-if="notaSelecionada.nf_link_xml"
              :href="notaSelecionada.nf_link_xml"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              <i class="fas fa-file-code mr-2"></i>
              Baixar XML
            </a>
            <a
              v-if="notaSelecionada.nf_codigo_verificador"
              :href="getNfseLink(notaSelecionada)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              <i class="fas fa-link mr-2"></i>
              Ver na Prefeitura
            </a>
          </div>
        </div>
      </el-dialog>
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
const dialogDetalhesVisible = ref(false)
const notaSelecionada = ref(null)
const consultandoStatus = ref(false)

const id = computed(() => route.params.id)

const formatDate = (date) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return date
    return d.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return date
  }
}

const formatCurrency = (value) => {
  if (value == null || value === '') return 'R$ 0,00'
  const num = parseFloat(String(value).replace(',', '.'))
  if (Number.isNaN(num)) return 'R$ 0,00'
  const formatted = numbro(num).format({ thousandSeparated: true, mantissa: 2 })
  // Converte para formato brasileiro: ponto para vírgula e vírgula para ponto
  return 'R$ ' + formatted.replace(/\./g, 'X').replace(/,/g, '.').replace(/X/g, ',')
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
    
    // O backend retorna { status: 'success', data: [...] }
    const notas = (response.data?.data || response.data || [])
    
    if (!Array.isArray(notas)) {
      console.error('Resposta inválida:', response.data)
      ElMessage.error('Formato de resposta inválido')
      return
    }
    
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

const abrirModalDetalhes = (nota) => {
  notaSelecionada.value = nota
  dialogDetalhesVisible.value = true
}

const consultarStatusNF = async () => {
  if (!notaSelecionada.value) return
  
  consultandoStatus.value = true
  try {
    const response = await clienteService.consultarStatusNF(
      notaSelecionada.value.nf_id,
      notaSelecionada.value.transaction_id
    )
    
    if (response.data?.status === 'success' && response.data?.data) {
      // Atualiza a nota selecionada com os novos dados
      notaSelecionada.value = response.data.data
      
      // Atualiza também na tabela
      const index = tableData.value.findIndex(
        item => item.nf_id === response.data.data.nf_id || 
        item.nf_numero_rps === response.data.data.nf_numero_rps
      )
      if (index !== -1) {
        tableData.value[index] = {
          ...response.data.data,
          updated_at: formatDate(response.data.data.updated_at)
        }
      }
      
      ElMessage.success('Status atualizado com sucesso')
    } else {
      ElMessage.error('Erro ao consultar status da nota')
    }
  } catch (error) {
    console.error('Erro ao consultar status:', error)
    ElMessage.error('Erro ao consultar status da nota')
  } finally {
    consultandoStatus.value = false
  }
}

const getStatusClass = (status) => {
  if (status === 'Autorizado') {
    return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
  } else if (status === 'Negada' || status === 'Rejeitado' || status === 'Erro') {
    return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
  } else if (status === 'Cancelado') {
    return 'bg-gray-50 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
  } else if (status === 'EmProcessoDeAutorizacao' || status === 'Pendente') {
    return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
  }
  return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
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
