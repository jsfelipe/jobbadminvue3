<template>
  <admin-layout>
    <div class="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div class="mb-6">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Filtros</h4>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Busca
              </label>
              <el-input v-model="search" placeholder="Busca" clearable />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                De
              </label>
              <el-date-picker
                v-model="period_from"
                type="date"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                placeholder="De"
                style="width: 100%"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Até
              </label>
              <el-date-picker
                v-model="period_to"
                type="date"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                placeholder="Até"
                style="width: 100%"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo Pgto
              </label>
              <el-select v-model="tipo_pgto" placeholder="Tipo Pgto" clearable style="width: 100%">
                <el-option
                  v-for="item in tipo"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div v-if="usuarios.length > 1">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuário
              </label>
              <el-select
                v-model="usuario_selected"
                placeholder="Usuário"
                clearable
                style="width: 100%"
              >
                <el-option key="" label="Todos" value="" />
                <el-option
                  v-for="item in usuarios"
                  :key="item.id_usuarios"
                  :label="item.nome"
                  :value="item.id_usuarios"
                />
              </el-select>
            </div>
            <div class="flex items-end">
              <el-button type="primary" @click="filtrarPesquisa">Filtrar</el-button>
            </div>
          </div>
        </div>

        <el-table
          :data="filteredTableData"
          stripe
          resizable
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column fixed prop="cliente_id" label="Id" width="90" />
          <el-table-column prop="nome_cliente" label="Nome" width="300" />
          <el-table-column prop="status" label="Status" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 'paid' ? 'success' : 'warning'"
                disable-transitions
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email_cliente" label="E-mail" width="300" />
          <el-table-column prop="transaction_id" label="ID Transação" width="110" />
          <el-table-column prop="plan_payment_method" label="Tipo Pgto." width="100" align="center" />
          <el-table-column label="Pago em" width="150" align="right">
            <template #default="scope">
              <span v-if="formatDate(scope.row.updated_at) !== 'Invalid date'">
                {{ formatDate(scope.row.updated_at) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Valor" align="right">
            <template #default="scope">
              <span>{{ formatCurrency(scope.row.amount) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <el-card class="mt-4">
          <div class="text-right">
            <strong>Total R$:</strong> {{ formatCurrency(total) }}
          </div>
        </el-card>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { extratoService } from '@/services/extrato'
import { usuarioService } from '@/services/usuario'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const search = ref('')
const period_from = ref('')
const period_to = ref('')
const usuarios = ref([])
const usuario_selected = ref('')
const tipo_pgto = ref('')

const tipo = [
  { value: '', label: 'Tipo Pgto' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'credit_card', label: 'Cartão' },
]

const filteredTableData = computed(() => {
  if (!search.value) return tableData.value
  return tableData.value.filter(
    (data) =>
      data.cliente?.[0]?.nome?.toLowerCase().includes(search.value.toLowerCase()) ||
      data.nome_cliente?.toLowerCase().includes(search.value.toLowerCase())
  )
})

const total = computed(() => {
  const sum = filteredTableData.value.reduce((acc, valor) => acc + parseFloat(valor.amount || 0), 0)
  return sum.toFixed(2)
})

const formatDate = (date) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const dateStr = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const timeStr = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateStr} ${timeStr}`
  } catch {
    return ''
  }
}

const formatCurrency = (value) => {
  if (!value) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const pegaData = () => {
  const today = new Date()
  const mm = today.getMonth() + 1
  const yyyy = today.getFullYear()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  period_from.value = `${yyyy}-${mm.toString().padStart(2, '0')}-01`
  period_to.value = `${yyyy}-${mm.toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`
}

const carregarUsuarios = async () => {
  try {
    const resposta = await usuarioService.listar()
    usuarios.value = resposta.data || []
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
  }
}

const filtrarPesquisa = async () => {
  loading.value = true
  try {
    const resposta = await extratoService.filtrar(
      period_from.value,
      period_to.value,
      tipo_pgto.value,
      usuario_selected.value
    )
    tableData.value = resposta.data || []
  } catch (error) {
    console.error('Erro ao filtrar extrato:', error)
    ElMessage.error('Erro ao carregar extrato')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  carregarUsuarios()
  pegaData()
  filtrarPesquisa()
})
</script>
