<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <!-- Botões de ação -->
      <div class="mb-4 flex flex-wrap items-center gap-4">
        <router-link :to="{ name: 'admin.clientes' }">
          <el-button type="default">&lt; Voltar</el-button>
        </router-link>
        <div class="flex flex-wrap items-center gap-2">
          <el-select
            v-model="asaasBillingType"
            placeholder="Forma no link"
            style="width: 200px"
            size="default"
          >
            <el-option label="Cliente escolhe (cartão/PIX/boleto)" value="UNDEFINED" />
            <el-option label="Somente cartão" value="CREDIT_CARD" />
            <el-option label="Somente PIX" value="PIX" />
            <el-option label="Somente boleto" value="BOLETO" />
          </el-select>
          <el-button
            type="primary"
            :loading="loadingAsaasLink"
            :disabled="!id"
            @click="criarLinkAssinaturaAsaas"
          >
            Link assinatura Asaas
          </el-button>
        </div>
        <span
          v-if="clienteResumo.valor != null && clienteResumo.valor !== ''"
          class="text-sm text-gray-600 dark:text-gray-400"
        >
          Plano: {{ formatCurrency(clienteResumo.valor) }}
          <template v-if="clienteResumo.plano_periodo">
            · ciclo cadastro: {{ clienteResumo.plano_periodo }}
          </template>
        </span>
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
              <span v-if="scope.row.status !== 'paid' && scope.row.status_txt !== 'Pago'">
                <el-button
                  v-if="scope.row.boleto_url"
                  size="small"
                  type="primary"
                  tag="a"
                  :href="scope.row.boleto_url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i class="fas fa-external-link-alt"></i> Abrir boleto
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
        <div
          v-if="mostrarAguardeStatus"
          class="text-center py-8"
        >
          <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Aguarde, consultando status da nota fiscal...</p>
        </div>

        <div v-if="!mostrarAguardeStatus && nfStatusData">
          <div
            class="mb-4 rounded-lg p-4"
            :class="{
              'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300':
                nfStatusData.nf_status === 'Pendente',
              'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300':
                nfStatusData.nf_status === 'Processando',
              'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300':
                nfStatusData.nf_status === 'Autorizado' || nfStatusData.nf_status === 'Autorizada',
              'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300':
                nfStatusData.nf_status === 'Cancelado' ||
                nfStatusData.nf_status === 'Erro' ||
                nfStatusData.nf_status === 'Negado' ||
                nfStatusData.nf_status === 'Negada',
            }"
          >
            <strong>Status:</strong> {{ nfStatusData.nf_status || 'Pendente' }}
            <br v-if="nfStatusData.nf_motivo_status" />
            <span v-if="nfStatusData.nf_motivo_status">{{ nfStatusData.nf_motivo_status }}</span>
          </div>

          <div v-if="nfStatusData.nf_status === 'Autorizado' || nfStatusData.nf_status === 'Autorizada'" class="mt-4">
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
              nfStatusData.nf_status !== 'Autorizada' &&
              nfStatusData.nf_status !== 'Cancelado' &&
              nfStatusData.nf_status !== 'Erro' &&
              nfStatusData.nf_status !== 'Negado' &&
              nfStatusData.nf_status !== 'Negada'
            "
            class="mt-4 text-sm text-gray-600 dark:text-gray-400"
          >
            <p>A nota fiscal está sendo processada. Esta janela será atualizada automaticamente.</p>
          </div>
        </div>

        <div
          v-if="!mostrarAguardeStatus && nfStatusError"
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

      <el-dialog
        v-model="dialogAsaasLink"
        title="Link de assinatura (Asaas)"
        width="min(560px, 92vw)"
        destroy-on-close
      >
        <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Envie ao cliente. O pagamento é concluído na página do Asaas (assinatura recorrente).
        </p>
        <el-input
          v-model="asaasPaymentLinkUrl"
          type="textarea"
          :rows="3"
          readonly
        />
        <template #footer>
          <el-button @click="dialogAsaasLink = false">Fechar</el-button>
          <el-button type="default" @click="copiarLinkAsaas">Copiar link</el-button>
          <el-button
            type="primary"
            tag="a"
            :href="asaasPaymentLinkUrl || undefined"
            target="_blank"
            rel="noopener noreferrer"
            :disabled="!asaasPaymentLinkUrl"
          >
            Abrir
          </el-button>
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
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadingAsaasLink = ref(false)
const asaasBillingType = ref('UNDEFINED')
const dialogAsaasLink = ref(false)
const asaasPaymentLinkUrl = ref('')
const clienteResumo = ref({ valor: null, plano_periodo: '' })
const tableData = ref([])
const DialogStatusNF = ref(false)
const nfId = ref(null)
const nfTransactionId = ref(null)
const nfStatusData = ref(null)
const nfStatusLoading = ref(false)
const nfStatusError = ref(null)
const nfStatusInterval = ref(null)

const id = computed(() => route.params.id)

const isStatusFinal = (status) => {
  if (!status) return false
  const s = String(status)
  return s === 'Negada' || s === 'Negado' || s === 'Autorizada' || s === 'Autorizado' || s === 'Cancelado' || s === 'Erro'
}

const mostrarAguardeStatus = computed(() => {
  if (nfStatusLoading.value) return true
  if (!nfStatusData.value) return false
  return !isStatusFinal(nfStatusData.value.nf_status)
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

    if (resposta.data && resposta.data.status === 'already_exists') {
      ElMessage.warning(
        resposta.data.message || 'Já existe nota fiscal autorizada para esta transação. Não será criada novamente.'
      )
      return
    }

    if (resposta.data && resposta.data.status === 'success' && resposta.data.data) {
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
        nfStatusData.value.nf_status === 'Autorizada' ||
        nfStatusData.value.nf_status === 'Cancelado' ||
        nfStatusData.value.nf_status === 'Erro' ||
        nfStatusData.value.nf_status === 'Negado' ||
        nfStatusData.value.nf_status === 'Negada'
      ) {
        pararConsultaStatusNF()

        if (nfStatusData.value.nf_status === 'Autorizado' || nfStatusData.value.nf_status === 'Autorizada') {
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

const carregarClienteResumo = async (idCliente) => {
  try {
    const res = await clienteService.listarId(idCliente)
    const c = res.data || {}
    clienteResumo.value = {
      valor: c.valor ?? null,
      plano_periodo: c.plano_periodo ?? '',
    }
  } catch {
    clienteResumo.value = { valor: null, plano_periodo: '' }
  }
}

const criarLinkAssinaturaAsaas = async () => {
  try {
    await ElMessageBox.confirm(
      'Criar no Asaas um link de pagamento recorrente usando o valor do plano e o período do cadastro do cliente?',
      'Assinatura Asaas',
      { confirmButtonText: 'Sim', cancelButtonText: 'Cancelar', type: 'info' }
    )
  } catch {
    return
  }

  loadingAsaasLink.value = true
  asaasPaymentLinkUrl.value = ''
  try {
    const res = await clienteService.createAsaasSubscriptionPaymentLink(id.value, {
      billing_type: asaasBillingType.value,
    })
    const url = res.data?.url
    if (!url) {
      ElMessage.error(res.data?.message || 'Resposta sem URL do Asaas')
      return
    }
    asaasPaymentLinkUrl.value = url
    dialogAsaasLink.value = true
    ElMessage.success('Link gerado')
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erro ao gerar link'
    ElMessage.error(msg)
  } finally {
    loadingAsaasLink.value = false
  }
}

const copiarLinkAsaas = async () => {
  if (!asaasPaymentLinkUrl.value) return
  try {
    await navigator.clipboard.writeText(asaasPaymentLinkUrl.value)
    ElMessage.success('Link copiado')
  } catch {
    ElMessage.error('Não foi possível copiar (permissão do navegador)')
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
  if (id.value) {
    carregarClienteResumo(id.value)
    listarBoletos(id.value)
  }
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
