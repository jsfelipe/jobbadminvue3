<template>
  <admin-layout>
    <div class="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <!-- Filtros -->
        <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Busca
            </label>
            <el-input
              v-model="filtros.search"
              placeholder="Busca"
              clearable
              @keyup.enter="filtrar"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data
            </label>
            <el-select v-model="filtros.tipo_data" placeholder="Data">
              <el-option value="data_cadastro" label="Data Cad." />
              <el-option value="data_vencimento" label="Data Venc." />
            </el-select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              De
            </label>
            <el-date-picker
              v-model="filtros.period_from"
              type="date"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              placeholder="De:"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Até
            </label>
            <el-date-picker
              v-model="filtros.period_to"
              type="date"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              placeholder="Até:"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo Jobb
            </label>
            <el-select v-model="filtros.tipo_jobb" placeholder="Tipo Jobb" clearable>
              <el-option value="" label="Tipo Jobb" />
              <el-option value="V" label="Jobb 2.0" />
              <el-option value="J03" label="Jobb 3.0" />
              <el-option value="G24" label="Gestor24h" />
            </el-select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo Cliente
            </label>
            <el-select v-model="filtros.tipo_cliente" placeholder="Tipo Cliente" clearable>
              <el-option value="" label="Tipo Cliente" />
              <el-option value="C" label="Cliente" />
              <el-option value="T" label="Teste" />
              <el-option value="A" label="Cancelado" />
              <el-option value="D" label="Deletado" />
            </el-select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Responsável
            </label>
            <el-select
              v-model="filtros.search_responsavel"
              placeholder="Responsável"
              clearable
              filterable
            >
              <el-option value="" label="Todos os Responsáveis" />
              <el-option
                v-for="responsavel in listResponsaveis"
                :key="responsavel.id_usuarios"
                :value="responsavel.id_usuarios"
                :label="responsavel.nome"
              />
            </el-select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Regime
            </label>
            <el-select v-model="filtros.search_regime" placeholder="Regime" clearable>
              <el-option value="" label="Todos os Regimes" />
              <el-option value="MEI" label="MEI" />
              <el-option value="SIMPLES" label="Simples" />
              <el-option value="LUCRO" label="Lucro P." />
              <el-option value="NENHUMCNPJ" label="Sem CNPJ" />
              <el-option value="OUTRO" label="Outro" />
            </el-select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              QTD Funcionários
            </label>
            <el-select v-model="filtros.search_qtd_funcionarios" placeholder="QTD Funcionários" clearable>
              <el-option value="" label="Todas as Quantidades" />
              <el-option value="1" label="1" />
              <el-option value="2" label="2" />
              <el-option value="3" label="3" />
              <el-option value="4" label="4" />
              <el-option value="5" label="5" />
              <el-option value="6" label="6" />
              <el-option value="7" label="7" />
              <el-option value="8" label="8" />
              <el-option value="9" label="9" />
              <el-option value="10" label="10" />
              <el-option value="11-20" label="11-20" />
              <el-option value="21-30" label="21-30" />
              <el-option value="31-50" label="31-50" />
              <el-option value="51-100" label="51-100" />
              <el-option value="101+" label="101+" />
            </el-select>
          </div>
          <div class="flex items-end">
            <el-button type="primary" @click="filtrar">Filtrar</el-button>
          </div>
        </div>

        <!-- Tabela -->
        <el-table
          :data="tableData"
          style="width: 100%"
          size="small"
          stripe
          v-loading="loading"
        >
          <el-table-column prop="id_cliente" label="Id" width="60" />
          <el-table-column prop="nome" label="Nome" width="190" />
          <el-table-column prop="subdominio" label="Subdominio" width="120" />
          <el-table-column label="Dt. Cad." width="88">
            <template #default="scope">
              <span v-if="formatDate(scope.row.data_cadastro)">
                {{ formatDate(scope.row.data_cadastro) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Dt. Venc." width="88">
            <template #default="scope">
              <span v-if="formatDate(scope.row.data_vencimento)">
                {{ formatDate(scope.row.data_vencimento) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Dt. Prorrog." width="88">
            <template #default="scope">
              <span v-if="formatDate(scope.row.data_prorrogacao)">
                {{ formatDate(scope.row.data_prorrogacao) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Últ.Acesso" width="125">
            <template #default="scope">
              <span v-if="formatDate(scope.row.data_ultimo_acesso)">
                {{ formatDate(scope.row.data_ultimo_acesso) }} ({{ scope.row.qtde_acesso }})
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="qtd_funcionarios" label="QTD Func." width="100" />
          <el-table-column prop="modulos_interesse" label="Interesse" width="200" />
          <el-table-column prop="tipo_jobb" label="Tipo" width="60">
            <template #default="scope">
              <span v-if="scope.row.tipo_jobb === 'V'">Video</span>
              <span v-else-if="scope.row.tipo_jobb === 'A'">Audio</span>
              <span v-else-if="scope.row.tipo_jobb === 'J03'">Jobb3.0</span>
              <span v-else-if="scope.row.tipo_jobb === 'G24'">Gestor24h</span>
              <span v-else-if="scope.row.tipo_jobb === 'E'">Estudio</span>
            </template>
          </el-table-column>
          <el-table-column label="Valor" width="90">
            <template #default="scope">
              <span>{{ formatCurrency(scope.row.valor) }} ({{ scope.row.qtde_usuarios }})</span>
            </template>
          </el-table-column>
          <el-table-column prop="tipo_empresa" label="Regime" width="100">
            <template #default="scope">
              <span v-if="scope.row.tipo_empresa === 'MEI'">MEI</span>
              <span v-else-if="scope.row.tipo_empresa === 'SIMPLES'">Simples</span>
              <span v-else-if="scope.row.tipo_empresa === 'LUCRO'">Lucro P.</span>
              <span v-else-if="scope.row.tipo_empresa === 'NENHUMCNPJ'">Sem CNPJ</span>
              <span v-else-if="scope.row.tipo_empresa === 'OUTRO'">Outro</span>
            </template>
          </el-table-column>
          <el-table-column prop="telefone" label="Telefone" width="120" />
          <el-table-column prop="email" label="E-mail" width="220" />
          <el-table-column label="Tipo Cliente" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.tipo_cliente === 'C'" type="success" disable-transitions>
                Cliente
              </el-tag>
              <el-tag v-else-if="scope.row.tipo_cliente === 'T'" type="info" disable-transitions>
                Teste
              </el-tag>
              <el-tag v-else-if="scope.row.tipo_cliente === 'A'" type="danger" disable-transitions>
                Cancelado
              </el-tag>
              <span v-else-if="scope.row.tipo_cliente === 'D'">Deletado</span>
            </template>
          </el-table-column>
          <el-table-column prop="nome_usuario" label="Responsável" width="110" />
          <el-table-column fixed="right" label="Opções" width="292">
            <template #default="scope">
              <el-button size="small" @click="handleBoleto(scope.$index, scope.row)">
                <i class="fas fa-barcode"></i>
              </el-button>
              <el-button size="small" @click="handleNF(scope.$index, scope.row)">NF</el-button>
              <el-button size="small" @click="handleWzap(scope.$index, scope.row)">Wzap</el-button>
              <el-button size="small" @click="handleDominio(scope.$index, scope.row)">
                <i class="fas fa-plus"></i>
              </el-button>
              <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
                <i class="far fa-edit"></i>
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Paginação -->
        <div class="mt-4 flex items-center justify-between">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :page-sizes="[30, 60, 120, 240]"
            :page-size="filtros.perPage"
            layout="total, sizes, prev, pager, next"
            :total="total"
          />
          <div class="text-right">
            <strong>Total:</strong> {{ total }}
          </div>
        </div>
      </div>
    </div>

    <modal-wzap :data-wzap="dataModalWzap" :open-modal="toogleModalWzap" @update:open-modal="toogleModalWzap = $event" />
  </admin-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ModalWzap from './ModalWzap.vue'
import { clienteService } from '@/services/cliente'
import { ElMessage } from 'element-plus'
import numbro from 'numbro'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const toogleModalWzap = ref(false)
const dataModalWzap = ref({})
const listResponsaveis = ref([])

const filtros = ref({
  search: '',
  search_responsavel: '',
  search_regime: '',
  search_qtd_funcionarios: '',
  tipo_data: 'data_cadastro',
  tipo_cliente: '',
  tipo_jobb: '',
  period_from: '',
  period_to: '',
  page: 1,
  perPage: 30,
  desbloqueio: 'N',
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
  if (!value) return 'R$ 0,00'
  return numbro(value).format({ thousandSeparator: '.', decimalSeparator: ',', prefix: 'R$ ' })
}

const handleEdit = (index, row) => {
  router.push({ path: `/admin/clientes/alterar/${row.id_cliente}` })
}

const handleBoleto = (index, row) => {
  router.push({ path: `/admin/clientes/boletos/${row.id_cliente}` })
}

const handleNF = (index, row) => {
  router.push({ path: `/admin/clientes/notas/${row.id_cliente}` })
}

const handleWzap = (index, row) => {
  dataModalWzap.value = {
    index,
    row,
  }
  toogleModalWzap.value = true
}

const handleDominio = (index, row) => {
  router.push({ path: `/admin/clientes/dominio/${row.id_cliente}` })
}

const handleCurrentChange = (val) => {
  filtros.value.page = val
  listar()
}

const handleSizeChange = (val) => {
  filtros.value.perPage = val
  listar()
}

const listar = async () => {
  filtros.value.desbloqueio = 'N'
  loading.value = true
  try {
    const resposta = await clienteService.listar(filtros.value)
    tableData.value = resposta.data[0] || []
    total.value = resposta.data[1]?.[0]?.total || 0
  } catch (error) {
    console.error('Erro ao listar clientes:', error)
    ElMessage.error('Erro ao carregar lista de clientes')
  } finally {
    loading.value = false
  }
}

const filtrar = () => {
  filtros.value.desbloqueio = 'N'
  filtros.value.page = 1
  listar()
}

const carregarResponsaveis = async () => {
  try {
    const resposta = await clienteService.listarResponsaveis()
    listResponsaveis.value = resposta.data || []
  } catch (error) {
    console.error('Erro ao carregar responsáveis:', error)
  }
}

onMounted(() => {
  // Carrega filtros salvos do localStorage
  const savedFilters = localStorage.getItem('searchClientes')
  if (savedFilters) {
    try {
      const parsed = JSON.parse(savedFilters)
      filtros.value = { ...filtros.value, ...parsed }
    } catch (e) {
      console.error('Erro ao carregar filtros salvos:', e)
    }
  }
  carregarResponsaveis()
  listar()
})
</script>

<style scoped>
.el-button + .el-button {
  margin-left: 2px !important;
}
</style>
