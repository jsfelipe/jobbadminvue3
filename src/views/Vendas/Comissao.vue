<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Vendas / Comissão</h4>

        <div class="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Competência</label>
            <div class="flex gap-2">
              <el-select v-model="competenciaMes" placeholder="Mês" style="width: 140px" @change="carregarLista">
                <el-option
                  v-for="m in meses"
                  :key="m.value"
                  :label="m.label"
                  :value="m.value"
                />
              </el-select>
              <el-select v-model="competenciaAno" placeholder="Ano" style="width: 100px" @change="carregarLista">
                <el-option
                  v-for="y in anos"
                  :key="y"
                  :label="String(y)"
                  :value="y"
                />
              </el-select>
            </div>
          </div>
          <el-button type="primary" @click="abrirAdicionar">Adicionar</el-button>
        </div>

        <el-table :data="lista" stripe v-loading="loading" style="width: 100%">
          <el-table-column prop="cliente.nome" label="Cliente" min-width="200">
            <template #default="scope">{{ scope.row.cliente?.nome ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="responsavel.nome" label="Responsável" width="140">
            <template #default="scope">{{ scope.row.responsavel?.nome ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="Valor Setup" width="120" align="right">
            <template #default="scope">{{ formatCurrency(scope.row.valor_setup) }}</template>
          </el-table-column>
          <el-table-column label="% Setup" width="90" align="center">
            <template #default="scope">{{ scope.row.percentual_setup }}%</template>
          </el-table-column>
          <el-table-column label="Comissão Setup" width="120" align="right">
            <template #default="scope">{{ formatCurrency(scope.row.comissao_setup) }}</template>
          </el-table-column>
          <el-table-column label="Valor Mensalidade" width="140" align="right">
            <template #default="scope">{{ formatCurrency(scope.row.valor_mensalidade) }}</template>
          </el-table-column>
          <el-table-column label="Comissão Mens." width="120" align="right">
            <template #default="scope">{{ formatCurrency(scope.row.comissao_mensalidade) }}</template>
          </el-table-column>
          <el-table-column label="Efetivado" width="100" align="center">
            <template #default="scope">
              <el-checkbox
                :model-value="scope.row.efetivado"
                @update:model-value="(v) => toggleEfetivado(scope.row, v)"
              />
            </template>
          </el-table-column>
          <el-table-column label="Ações" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="abrirEditar(scope.row)">Alterar</el-button>
              <el-button link type="danger" size="small" @click="confirmarExcluir(scope.row)">Excluir</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-card class="mt-4">
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            <div><strong>Salário fixo:</strong> {{ formatCurrency(salarioFixo) }}</div>
            <div><strong>Total previsto (comissões):</strong> {{ formatCurrency(totais.total_previsto) }}</div>
            <div><strong>Total real (salário + comissão efetivada):</strong> {{ formatCurrency(totais.total_real) }}</div>
          </div>
        </el-card>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Previsão anual – Comissão</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Apenas comissão </p>
          </div>
          <el-select v-model="anoGrafico" placeholder="Ano" style="width: 100px" @change="carregarGrafico">
            <el-option v-for="y in anos" :key="y" :label="String(y)" :value="y" />
          </el-select>
        </div>
        <div class="min-h-[320px]">
          <VueApexCharts
            v-if="chartSeries.length"
            type="line"
            height="320"
            :options="chartOptions"
            :series="chartSeries"
          />
          <div v-else class="flex items-center justify-center py-12 text-gray-500">
            {{ loadingGrafico ? 'Carregando...' : 'Nenhum dado para exibir' }}
          </div>
        </div>
      </div>

      <el-dialog
        v-model="dialogAdicionar"
        title="Adicionar Comissão (previsão)"
        width="500px"
        destroy-on-close
        @close="resetForm"
      >
        <el-form :model="form" label-width="140px" label-position="top">
          <el-form-item label="Cliente">
            <el-autocomplete
              v-model="form.clienteNome"
              :fetch-suggestions="buscarClientes"
              placeholder="Buscar cliente..."
              value-key="nome"
              style="width: 100%"
              @select="onSelectCliente"
            >
              <template #default="{ item }">
                <span>{{ item.nome }} ({{ item.id_cliente }})</span>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="Valor Setup">
            <el-input-number v-model="form.valor_setup" :min="0" :precision="2" :step="100" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Percentual Setup">
            <el-radio-group v-model="form.percentual_setup">
              <el-radio :label="25">25%</el-radio>
              <el-radio :label="30">30%</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Valor Mensalidade">
            <el-input-number v-model="form.valor_mensalidade" :min="0" :precision="2" :step="100" style="width: 100%" />
          </el-form-item>
          <p class="text-sm text-gray-500">Mensalidade: 50% de comissão. Responsável será você ao salvar.</p>
        </el-form>
        <template #footer>
          <el-button @click="dialogAdicionar = false">Cancelar</el-button>
          <el-button type="primary" :loading="salvando" @click="salvarNovo">Salvar</el-button>
        </template>
      </el-dialog>

      <el-dialog
        v-model="dialogEditar"
        title="Alterar Comissão"
        width="500px"
        destroy-on-close
        @close="editando = null"
      >
        <el-form v-if="editando" :model="formEdit" label-position="top">
          <el-form-item label="Cliente">
            <el-input :model-value="editando.cliente?.nome" disabled />
          </el-form-item>
          <el-form-item label="Valor Setup">
            <el-input-number v-model="formEdit.valor_setup" :min="0" :precision="2" :step="100" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Percentual Setup">
            <el-radio-group v-model="formEdit.percentual_setup">
              <el-radio :label="25">25%</el-radio>
              <el-radio :label="30">30%</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Valor Mensalidade">
            <el-input-number v-model="formEdit.valor_mensalidade" :min="0" :precision="2" :step="100" style="width: 100%" />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="formEdit.efetivado">Efetivado</el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogEditar = false">Cancelar</el-button>
          <el-button type="primary" :loading="salvando" @click="salvarEdicao">Salvar</el-button>
        </template>
      </el-dialog>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import VueApexCharts from 'vue3-apexcharts'
import { comissaoService } from '@/services/comissao'
import { api } from '@/services/http'
import { ElMessage, ElMessageBox } from 'element-plus'

const SALARIO_FIXO = 4800

const loading = ref(false)
const salvando = ref(false)
const lista = ref([])
const totais = ref({
  total_previsto: 0,
  total_efetivado: 0,
  total_real: 0,
  salario_fixo: SALARIO_FIXO,
})
const competenciaMes = ref(new Date().getMonth() + 1)
const competenciaAno = ref(new Date().getFullYear())
const anoGrafico = ref(new Date().getFullYear())
const loadingGrafico = ref(false)
const chartData = ref({ meses: [], efetivado: [], previsto: [] })

const meses = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
]
const anos = computed(() => {
  const y = new Date().getFullYear()
  return [y, y - 1, y - 2, y + 1]
})

const dialogAdicionar = ref(false)
const dialogEditar = ref(false)
const editando = ref(null)
const formEdit = ref({
  valor_setup: 0,
  valor_mensalidade: 0,
  percentual_setup: 25,
  efetivado: false,
})
const form = ref({
  id_cliente: null,
  clienteNome: '',
  valor_setup: 0,
  valor_mensalidade: 0,
  percentual_setup: 25,
})

function formatCurrency(value) {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

async function buscarClientes(queryString, cb) {
  if (!queryString || queryString.length < 2) {
    cb([])
    return
  }
  try {
    const { data } = await api.get('/clientes/autocomplete', { params: { q: queryString } })
    cb(Array.isArray(data) ? data : [])
  } catch {
    cb([])
  }
}

function onSelectCliente(item) {
  form.value.id_cliente = item.id_cliente
  form.value.clienteNome = item.nome
}

function resetForm() {
  form.value = {
    id_cliente: null,
    clienteNome: '',
    valor_setup: 0,
    valor_mensalidade: 0,
    percentual_setup: 25,
  }
}

function abrirAdicionar() {
  resetForm()
  dialogAdicionar.value = true
}

async function carregarLista() {
  loading.value = true
  try {
    const { data } = await comissaoService.listar(competenciaMes.value, competenciaAno.value)
    lista.value = data.lista || []
    totais.value = data.totais || totais.value
  } catch (e) {
    ElMessage.error(e.response?.data?.error || 'Erro ao carregar comissões')
    lista.value = []
  } finally {
    loading.value = false
  }
}

async function salvarNovo() {
  if (!form.value.id_cliente) {
    ElMessage.warning('Selecione um cliente.')
    return
  }
  salvando.value = true
  try {
    await comissaoService.criar({
      id_cliente: form.value.id_cliente,
      competencia_mes: competenciaMes.value,
      competencia_ano: competenciaAno.value,
      valor_setup: form.value.valor_setup ?? 0,
      valor_mensalidade: form.value.valor_mensalidade ?? 0,
      percentual_setup: form.value.percentual_setup ?? 25,
    })
    ElMessage.success('Comissão adicionada (previsão).')
    dialogAdicionar.value = false
    carregarLista()
    carregarGrafico()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || 'Erro ao salvar')
  } finally {
    salvando.value = false
  }
}

async function toggleEfetivado(row, value) {
  try {
    await comissaoService.atualizar(row.id, { efetivado: value })
    row.efetivado = value
    carregarLista()
    carregarGrafico()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || 'Erro ao atualizar')
  }
}

function abrirEditar(row) {
  editando.value = row
  formEdit.value = {
    valor_setup: Number(row.valor_setup) || 0,
    valor_mensalidade: Number(row.valor_mensalidade) || 0,
    percentual_setup: row.percentual_setup ?? 25,
    efetivado: !!row.efetivado,
  }
  dialogEditar.value = true
}

async function salvarEdicao() {
  if (!editando.value) return
  salvando.value = true
  try {
    await comissaoService.atualizar(editando.value.id, {
      valor_setup: formEdit.value.valor_setup,
      valor_mensalidade: formEdit.value.valor_mensalidade,
      percentual_setup: formEdit.value.percentual_setup,
      efetivado: formEdit.value.efetivado,
    })
    ElMessage.success('Comissão alterada.')
    dialogEditar.value = false
    carregarLista()
    carregarGrafico()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || 'Erro ao salvar')
  } finally {
    salvando.value = false
  }
}

function confirmarExcluir(row) {
  ElMessageBox.confirm(
    `Excluir comissão do cliente "${row.cliente?.nome ?? ''}"?`,
    'Confirmar exclusão',
    {
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await comissaoService.excluir(row.id)
      ElMessage.success('Comissão excluída.')
      carregarLista()
      carregarGrafico()
    } catch (e) {
      ElMessage.error(e.response?.data?.error || 'Erro ao excluir')
    }
  }).catch(() => {})
}

const salarioFixo = computed(() => totais.value.salario_fixo ?? SALARIO_FIXO)

const chartSeries = computed(() => {
  const d = chartData.value
  if (!d.meses?.length) return []
  return [
    { name: 'Comissão efetivada', data: d.efetivado || [] },
    { name: 'Previsão de comissão', data: d.previsto || [] },
  ]
})

const chartOptions = computed(() => ({
  chart: { type: 'line', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#10b981', '#3b82f6'],
  stroke: { curve: 'smooth', width: 2, dashArray: [0, 6] },
  xaxis: {
    categories: chartData.value.meses || [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    title: { text: 'Comissão (R$)' },
    labels: {
      formatter: (val) => (val == null ? '' : 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })),
    },
  },
  grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
  legend: { position: 'top', horizontalAlign: 'right' },
  tooltip: {
    title: { formatter: () => 'Comissão' },
    y: {
      formatter: (val) => (val == null ? '' : 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
    },
  },
  dataLabels: { enabled: false },
}))

async function carregarGrafico() {
  loadingGrafico.value = true
  try {
    const { data } = await comissaoService.graficoAnual(anoGrafico.value)
    chartData.value = {
      meses: data.meses || [],
      efetivado: data.efetivado || [],
      previsto: data.previsto || [],
    }
  } catch {
    chartData.value = { meses: [], efetivado: [], previsto: [] }
  } finally {
    loadingGrafico.value = false
  }
}

onMounted(() => {
  carregarLista()
  carregarGrafico()
})
</script>
