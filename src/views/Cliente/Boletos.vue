<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <!-- Botões de ação -->
      <div class="mb-4 flex items-center gap-4">
        <router-link :to="{ name: 'admin.clientes' }">
          <el-button type="default">< Voltar</el-button>
        </router-link>
        <el-button
          v-if="tipo_admin === 'gestor24h'"
          type="primary"
          @click="DialogBoletoAvulso = true"
        >
          + Boleto Avulso
        </el-button>
      </div>

      <!-- Tabela de boletos -->
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <el-table
          :data="tableData"
          style="width: 100%"
          v-loading="loading"
          stripe
        >
          <el-table-column prop="competencia_mes" label="Competência" />
          <el-table-column prop="transaction_id" label="ID" />
          <el-table-column label="Boleto Venc.:">
            <template #default="scope">
              {{ formatDate(scope.row.boleto_expiration_date) }}
            </template>
          </el-table-column>
          <el-table-column label="Pago em:">
            <template #default="scope">
              {{ formatDate(scope.row.data_pagamento) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="Status" />
          <el-table-column label="Valor">
            <template #default="scope">
              {{ formatCurrency(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column label="Opções" width="200">
            <template #default="scope">
              <span v-if="scope.row.status !== 'paid'">
                <el-button
                  size="small"
                  type="primary"
                  @click="handleModal(scope.row)"
                  circle
                >
                  <i class="far fa-edit"></i>
                </el-button>
                <el-button
                  size="small"
                  type="info"
                  :href="scope.row.boleto_url"
                  target="_blank"
                  circle
                >
                  <i class="fas fa-link"></i>
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDelete(scope.row.id)"
                  circle
                >
                  <i class="far fa-times-circle"></i>
                </el-button>
              </span>
              <span v-else>
                <el-button size="small" type="success" @click="handleNF(scope.row)">
                  Criar NF
                </el-button>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Modal novo boleto -->
      <el-dialog
        v-model="centerDialogVisible"
        title="Gerar novo boleto"
        width="50%"
        center
        :modal="false"
      >
        <div v-if="errors.length" class="mb-4 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20">
          <b>Por favor, corrija o(s) seguinte(s) erro(s):</b>
          <ul class="ml-4 list-disc">
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor
            </label>
            <el-input
              v-model="novoBoletoData.amount"
              placeholder="Valor"
              type="number"
              step="0.01"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data de Vencimento
            </label>
            <el-date-picker
              v-model="novaData"
              type="date"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="centerDialogVisible = false">Cancelar</el-button>
            <el-button type="primary" @click="handleNovoBoleto">Confirmar</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- Modal boleto avulso -->
      <el-dialog
        v-model="DialogBoletoAvulso"
        title="Boleto Avulso (Setup e outros)"
        width="80%"
        center
        :modal="false"
      >
        <div v-if="errors.length" class="mb-4 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20">
          <b>Por favor, corrija o(s) seguinte(s) erro(s):</b>
          <ul class="ml-4 list-disc">
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor (Ex: 500.00 com ponto e sem vírgulas)
            </label>
            <el-input
              v-model="amount"
              placeholder="500.00"
              type="number"
              step="0.01"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data de Vencimento (Ex: 10/10/2019)
            </label>
            <el-date-picker
              v-model="dataBoletoAvulso"
              type="date"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="DialogBoletoAvulso = false">Fechar</el-button>
            <el-button type="primary" @click="handleBoletoAvulso">Gerar Boleto</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- Modal consulta status NF -->
      <el-dialog
        v-model="DialogStatusNF"
        title="Status da Nota Fiscal"
        width="60%"
        center
        :modal="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <div v-if="nfStatusLoading" class="text-center py-8">
          <i class="el-icon-loading" style="font-size: 32px; color: #409eff"></i>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Consultando status da nota fiscal...</p>
        </div>

        <div v-if="!nfStatusLoading && nfStatusData">
          <div
            class="mb-4 rounded-lg p-4"
            :class="{
              'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300':
                nfStatusData.nf_status === 'Pendente',
              'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300':
                nfStatusData.nf_status === 'Processando',
              'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300':
                nfStatusData.nf_status === 'Autorizado',
              'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300':
                nfStatusData.nf_status === 'Cancelado' ||
                nfStatusData.nf_status === 'Erro' ||
                nfStatusData.nf_status === 'Negado',
            }"
          >
            <strong>Status:</strong> {{ nfStatusData.nf_status || 'Pendente' }}
            <br v-if="nfStatusData.nf_motivo_status" />
            <span v-if="nfStatusData.nf_motivo_status">{{ nfStatusData.nf_motivo_status }}</span>
          </div>

          <div v-if="nfStatusData.nf_status === 'Autorizado'" class="mt-4">
            <h5 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Nota Fiscal Autorizada!
            </h5>
            <div class="mb-4 flex gap-3">
              <el-button
                v-if="nfStatusData.nf_link_pdf"
                type="primary"
                :href="nfStatusData.nf_link_pdf"
                target="_blank"
              >
                <i class="fas fa-file-pdf"></i> Baixar PDF
              </el-button>
              <el-button
                v-if="nfStatusData.nf_link_xml"
                type="success"
                :href="nfStatusData.nf_link_xml"
                target="_blank"
              >
                <i class="fas fa-file-code"></i> Baixar XML
              </el-button>
            </div>
            <div v-if="nfStatusData.nf_numero" class="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Número da NF:</strong> {{ nfStatusData.nf_numero }}
            </div>
            <div
              v-if="nfStatusData.nf_codigo_verificador"
              class="mb-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <strong>Código Verificador:</strong> {{ nfStatusData.nf_codigo_verificador }}
            </div>
          </div>

          <div
            v-if="
              nfStatusData.nf_status !== 'Autorizado' &&
              nfStatusData.nf_status !== 'Cancelado' &&
              nfStatusData.nf_status !== 'Erro' &&
              nfStatusData.nf_status !== 'Negado'
            "
            class="mt-4 text-sm text-gray-600 dark:text-gray-400"
          >
            <p>A nota fiscal está sendo processada. Esta janela será atualizada automaticamente.</p>
          </div>
        </div>

        <div
          v-if="!nfStatusLoading && nfStatusError"
          class="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
          <strong>Erro:</strong> {{ nfStatusError }}
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="fecharModalNF">Fechar</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { clienteService } from '@/services/cliente'
import { ElMessage, ElMessageBox } from 'element-plus'
import numbro from 'numbro'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()

const loading = ref(false)
const tableData = ref([])
const centerDialogVisible = ref(false)
const DialogBoletoAvulso = ref(false)
const DialogStatusNF = ref(false)
const errors = ref([])
const novaData = ref('')
const novoBoleto = ref(null)
const novoBoletoData = ref({ amount: '', boleto_expiration_date: '' })
const dataBoletoAvulso = ref(null)
const amount = ref(null)
const nfId = ref(null)
const nfTransactionId = ref(null)
const nfStatusData = ref(null)
const nfStatusLoading = ref(false)
const nfStatusError = ref(null)
const nfStatusInterval = ref(null)

const id = computed(() => route.params.id)

const tipo_admin = computed(() => {
  // Verifica se é gestor24h baseado no host ou perfil do usuário
  if (typeof window !== 'undefined' && window.location.host === 'gestoradminv2.gestor24h.com.br') {
    return 'gestor24h'
  }
  // Pode também verificar no store se necessário
  const userData = store.state.Login?.data || {}
  return userData.tipo_admin || ''
})

const formatDate = (date) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pt-BR')
  } catch {
    return ''
  }
}

const formatCurrency = (value) => {
  if (value == null || value === '') return 'R$ 0,00'
  const num = parseFloat(String(value).replace(',', '.'))
  if (Number.isNaN(num)) return 'R$ 0,00'
  return 'R$ ' + numbro(num).format({ thousandSeparated: true, mantissa: 2 })
}

const handleModal = (row) => {
  centerDialogVisible.value = true
  novoBoletoData.value.amount = row.amount
  novoBoletoData.value.boleto_expiration_date = row.boleto_expiration_date
  novoBoleto.value = row
}

const handleNovoBoleto = async () => {
  errors.value = []

  if (!novaData.value || !novoBoletoData.value.amount) {
    errors.value.push('Valor e data são obrigatórios.')
    return
  }

  const amountNumber = Number(novoBoletoData.value.amount)
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    errors.value.push('Valor inválido. Use o formato 500.00 (com ponto).')
    return
  }

  const formattedAmount = amountNumber.toFixed(2)

  const today = new Date()
  const hj = today.toISOString().split('T')[0]

  if (novaData.value < hj) {
    errors.value.push('A data não deve ser menor que hoje.')
    return
  }

  loading.value = true
  try {
    await clienteService.novoBoleto(
      formattedAmount,
      novaData.value,
      novoBoleto.value
    )
    centerDialogVisible.value = false
    ElMessage.success('Boleto criado com sucesso!')
    listarBoletos(id.value)
    novoBoletoData.value = { amount: '', boleto_expiration_date: '' }
    novaData.value = ''
  } catch (error) {
    console.error('Erro ao criar boleto:', error)
    ElMessage.error('Erro ao criar boleto')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (transaction_id) => {
  try {
    await ElMessageBox.confirm('Tem certeza que deseja apagar este boleto?', 'Confirmar', {
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    })

    loading.value = true
    await clienteService.apagarBoleto(transaction_id)
    ElMessage.success('Boleto apagado com sucesso!')
    listarBoletos(id.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Erro ao apagar boleto:', error)
      ElMessage.error('Erro ao apagar boleto')
    }
  } finally {
    loading.value = false
  }
}

const handleNF = async (transaction) => {
  loading.value = true
  try {
    const resposta = await clienteService.createNF(transaction)

    if (resposta.data && resposta.data.status === 'success' && resposta.data.data) {
      // Abrir modal de consulta de status
      nfId.value = resposta.data.data.nfeId || resposta.data.data.nf_id || null
      nfTransactionId.value = transaction.transaction_id
      DialogStatusNF.value = true
      iniciarConsultaStatusNF()
    } else {
      ElMessage({
        message:
          resposta.data && resposta.data.message
            ? resposta.data.message
            : 'NF solicitada, mas não foi possível acompanhar o status automaticamente.',
        type: resposta.data && resposta.data.status === 'error' ? 'error' : 'warning',
        duration: 5000,
      })
    }
  } catch (error) {
    console.error('Erro ao criar NF:', error)
    ElMessage({
      message:
        'Erro ao solicitar NF: ' +
        (error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message),
      type: 'error',
      duration: 5000,
    })
  } finally {
    loading.value = false
  }
}

const iniciarConsultaStatusNF = () => {
  nfStatusLoading.value = true
  nfStatusError.value = null
  consultarStatusNF()

  // Iniciar polling a cada 5 segundos
  nfStatusInterval.value = setInterval(() => {
    consultarStatusNF()
  }, 5000)
}

const consultarStatusNF = async () => {
  try {
    const resposta = await clienteService.consultarStatusNF(nfId.value, nfTransactionId.value)

    if (resposta.data && resposta.data.status === 'success' && resposta.data.data) {
      nfStatusData.value = resposta.data.data
      nfStatusLoading.value = false

      // Se estiver autorizado, cancelado ou erro, parar polling
      if (
        nfStatusData.value.nf_status === 'Autorizado' ||
        nfStatusData.value.nf_status === 'Cancelado' ||
        nfStatusData.value.nf_status === 'Erro' ||
        nfStatusData.value.nf_status === 'Negado'
      ) {
        pararConsultaStatusNF()

        if (nfStatusData.value.nf_status === 'Autorizado') {
          ElMessage({
            message: 'Nota Fiscal autorizada com sucesso!',
            type: 'success',
            duration: 5000,
          })
        }
      }
    } else {
      nfStatusError.value =
        resposta.data && resposta.data.message ? resposta.data.message : 'Erro ao consultar status'
      nfStatusLoading.value = false
    }
  } catch (error) {
    nfStatusError.value =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Erro ao consultar status da nota fiscal'
    nfStatusLoading.value = false
  }
}

const pararConsultaStatusNF = () => {
  if (nfStatusInterval.value) {
    clearInterval(nfStatusInterval.value)
    nfStatusInterval.value = null
  }
}

const fecharModalNF = () => {
  pararConsultaStatusNF()
  DialogStatusNF.value = false
  nfStatusData.value = null
  nfStatusError.value = null
  nfId.value = null
  nfTransactionId.value = null
}

const handleBoletoAvulso = async () => {
  errors.value = []

  if (!dataBoletoAvulso.value || !amount.value) {
    errors.value.push('Valor e data são obrigatórios.')
    return
  }

  const amountNumber = Number(amount.value)
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    errors.value.push('Valor inválido. Use o formato 500.00 (com ponto).')
    return
  }

  const formattedAmount = amountNumber.toFixed(2)

  loading.value = true
  try {
    const resposta = await clienteService.boletoAvulso(
      formattedAmount,
      dataBoletoAvulso.value,
      id.value
    )

    if (resposta.data?.status === 'error') {
      ElMessage.warning('Preencha todos os dados do cliente.')
    } else {
      DialogBoletoAvulso.value = false
      ElMessage.success('Boleto criado com sucesso!')
      listarBoletos(id.value)
      amount.value = null
      dataBoletoAvulso.value = null
    }
  } catch (error) {
    console.error('Erro ao criar boleto avulso:', error)
    ElMessage.error('Erro ao criar boleto avulso')
  } finally {
    loading.value = false
  }
}

const listarBoletos = async (idCliente) => {
  loading.value = true
  try {
    const resposta = await clienteService.listarboletos(idCliente)
    // Limita a 10 registros (igual ao projeto antigo)
    const arrResult = (resposta.data || []).slice(0, 10).map((item) => ({
      ...item,
      updated_at: formatDate(item.updated_at),
    }))
    tableData.value = arrResult
  } catch (error) {
    console.error('Erro ao listar boletos:', error)
    ElMessage.error('Erro ao carregar boletos')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  listarBoletos(id.value)
})

onBeforeUnmount(() => {
  // Limpar intervalo ao sair do componente
  pararConsultaStatusNF()
})
</script>

<style scoped>
.el-button + .el-button {
  margin-left: 4px;
}
</style>
