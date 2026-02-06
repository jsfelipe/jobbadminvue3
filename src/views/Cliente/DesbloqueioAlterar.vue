<template>
  <admin-layout>
    <div class="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h4 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Alterar Cliente
        </h4>

        <form @submit.prevent="updateCliente">
          <!-- Tipo Jobb -->
          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo Jobb
            </label>
            <el-radio-group v-model="data.tipo_jobb">
              <el-radio label="V">VIDEO</el-radio>
              <el-radio label="J03">Jobb3.0</el-radio>
              <el-radio label="G24">Gestor24h</el-radio>
              <el-radio label="A">AUDIO</el-radio>
            </el-radio-group>
          </div>

          <!-- Dados básicos -->
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome
              </label>
              <el-input v-model="data.nome" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subdomínio
              </label>
              <el-input v-model="data.subdominio" disabled />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Qtd de Usuários
              </label>
              <el-input v-model="data.qtde_usuarios" type="number" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Qtd Prod. Externos
              </label>
              <el-input v-model="data.qtd_user_prod_ext" type="number" />
            </div>
          </div>

          <!-- Plano -->
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor do Plano
              </label>
              <el-input v-model="data.valor" type="number" step="0.01" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Período Plano
              </label>
              <el-input v-model="data.plano_periodo" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                ID Conexa
              </label>
              <el-input v-model="data.clientIdConexa" />
            </div>
          </div>

          <!-- Datas -->
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <strong>Data de vencimento</strong>
              </label>
              <el-date-picker
                v-model="data.data_vencimento"
                type="date"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data limite teste
              </label>
              <el-date-picker
                v-model="data.data_limite_teste"
                type="date"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data prorrogação
              </label>
              <el-date-picker
                v-model="data.data_prorrogacao"
                type="date"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de cadastro
              </label>
              <el-date-picker
                v-model="data.data_cadastro"
                type="date"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                disabled
                style="width: 100%"
              />
            </div>
          </div>

          <!-- Contato -->
          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contato
            </label>
            <el-input v-model="data.contato" />
          </div>

          <!-- Telefone e Emails -->
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Telefone
              </label>
              <el-input v-model="data.telefone" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail para boleto
              </label>
              <el-input v-model="data.email" type="email" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail Marketing
              </label>
              <el-input v-model="data.email_marketing" type="email" />
            </div>
          </div>

          <!-- Tipo Cliente -->
          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo Cliente
            </label>
            <el-radio-group v-model="data.tipo_cliente">
              <el-radio label="T">Teste</el-radio>
              <el-radio label="C">Cliente</el-radio>
              <el-radio label="A">Cancelado</el-radio>
              <el-radio label="D">Deletado</el-radio>
            </el-radio-group>
          </div>

          <!-- Dados NFe -->
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Razão Social
              </label>
              <el-input v-model="data.razao_nfe" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                CNPJ
              </label>
              <el-input v-model="data.cnpj_nfe" />
            </div>
          </div>

          <!-- Endereço NFe -->
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                CEP
              </label>
              <el-input v-model="data.cep_nfe" />
            </div>
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Logradouro
              </label>
              <el-input v-model="data.logradouro_nfe" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Complemento
              </label>
              <el-input v-model="data.complemento" />
            </div>
          </div>

          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nº
              </label>
              <el-input v-model="data.numero_nfe" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bairro
              </label>
              <el-input v-model="data.bairro_nfe" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cidade
              </label>
              <el-input v-model="data.cidade" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                UF (Ex: SP)
              </label>
              <el-input v-model="data.uf_nfe" maxlength="2" />
            </div>
          </div>

          <!-- Configurações -->
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enviar NF automaticamente?
              </label>
              <el-radio-group v-model="data.nfe_automatico">
                <el-radio label="S">SIM</el-radio>
                <el-radio label="N">NÃO</el-radio>
              </el-radio-group>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Imposto retido (Ex: 5.00)
              </label>
              <el-input v-model="data.cliente_tax" type="number" step="0.01" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bloquear automaticamente?
              </label>
              <el-radio-group v-model="data.bloquear">
                <el-radio label="S">SIM</el-radio>
                <el-radio label="N">NÃO</el-radio>
              </el-radio-group>
            </div>
          </div>

          <!-- Observações -->
          <div class="mb-6">
            <div class="mb-2 flex items-center justify-between">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Observações
              </label>
              <el-button
                @click="handleModalObs({ id: '', obs: '' })"
                type="primary"
                size="small"
                circle
              >
                +
              </el-button>
            </div>
            <el-table :data="listObs" style="width: 100%" stripe>
              <el-table-column prop="obs" label="Obs." min-width="400" />
              <el-table-column label="Dt. Alteração" width="130">
                <template #default="scope">
                  <span v-if="formatDate(scope.row.updated_at)">
                    {{ formatDate(scope.row.updated_at) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="Opções" width="120">
                <template #default="scope">
                  <el-button
                    @click="handleModalObs(scope.row)"
                    type="primary"
                    size="small"
                    link
                  >
                    Editar
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Botões -->
          <div class="flex justify-center gap-4">
            <el-button type="success" native-type="submit" :loading="loading">
              Salvar
            </el-button>
            <router-link :to="{ name: 'admin.desbloqueio' }">
              <el-button type="danger">Voltar</el-button>
            </router-link>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Observação -->
    <el-dialog
      v-model="centerDialogVisible"
      title="Observação"
      width="50%"
      center
      :modal="false"
    >
      <el-input
        v-model="obs"
        type="textarea"
        :rows="3"
        placeholder="Digite a observação"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="centerDialogVisible = false">Cancelar</el-button>
          <el-button type="primary" @click="updateObs(id_obs, obs)">Salvar</el-button>
        </span>
      </template>
    </el-dialog>
  </admin-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { clienteService } from '@/services/cliente'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const data = ref({})
const listObs = ref([])
const centerDialogVisible = ref(false)
const obs = ref('')
const id_obs = ref(0)

const id = computed(() => route.params.id)

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

const handleModalObs = (row) => {
  if (row.id) {
    id_obs.value = row.id
    obs.value = row.obs
  } else {
    id_obs.value = 0
    obs.value = ''
  }
  centerDialogVisible.value = true
}

const updateCliente = async () => {
  loading.value = true
  try {
    // Formata datas
    if (data.value.data_vencimento) {
      const d = new Date(data.value.data_vencimento)
      data.value.data_vencimento = d.toISOString().split('T')[0]
    }
    if (data.value.data_prorrogacao) {
      const d = new Date(data.value.data_prorrogacao)
      data.value.data_prorrogacao = d.toISOString().split('T')[0]
    }
    if (data.value.data_limite_teste) {
      const d = new Date(data.value.data_limite_teste)
      data.value.data_limite_teste = d.toISOString().split('T')[0]
    }

    const resposta = await clienteService.alterar(data.value)
    if (resposta.status) {
      ElMessage.success('Alterado com sucesso!')
      router.go(-1)
    } else {
      ElMessage.error(JSON.stringify(resposta))
    }
  } catch (error) {
    console.error('Erro ao alterar cliente:', error)
    ElMessage.error('Erro ao alterar cliente')
  } finally {
    loading.value = false
  }
}

const listar = async () => {
  try {
    const resposta = await clienteService.listarId(id.value)
    data.value = resposta.data || {}
  } catch (error) {
    console.error('Erro ao carregar cliente:', error)
    ElMessage.error('Erro ao carregar dados do cliente')
  }
}

const listarObs = async () => {
  try {
    const resposta = await clienteService.listarObs(id.value)
    listObs.value = resposta.data || []
  } catch (error) {
    console.error('Erro ao carregar observações:', error)
  }
}

const updateObs = async (obsId, obsText) => {
  loading.value = true
  try {
    if (obsId) {
      await clienteService.alterarObs(obsId, obsText)
    } else {
      await clienteService.salvarObs(id.value, obsText)
    }
    await listarObs()
    centerDialogVisible.value = false
    obs.value = ''
    id_obs.value = 0
    ElMessage.success('Observação salva com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar observação:', error)
    ElMessage.error('Erro ao salvar observação')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (id.value) {
    listar()
    listarObs()
  }
})
</script>
