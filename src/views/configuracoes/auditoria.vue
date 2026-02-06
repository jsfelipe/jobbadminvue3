<template>
  <AdminLayout>
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12"
    >
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white/90">
          Auditoria
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Consulte o histórico de ações no sistema
        </p>
      </div>

      <!-- Filtros -->
      <div class="audit-filters mb-6">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Data inicial</label>
            <el-date-picker
              v-model="filters.date_from"
              type="date"
              placeholder="dd/mm/aaaa"
              value-format="YYYY-MM-DD"
              format="DD/MM/YYYY"
              class="w-full"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Data final</label>
            <el-date-picker
              v-model="filters.date_to"
              type="date"
              placeholder="dd/mm/aaaa"
              value-format="YYYY-MM-DD"
              format="DD/MM/YYYY"
              class="w-full"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Usuário</label>
            <el-select
              v-model="filters.id_usuario"
              placeholder="Todos"
              clearable
              class="w-full"
            >
              <el-option
                v-for="u in filterOptions.users"
                :key="u.id_usuario"
                :label="u.nome_usuario || u.login_usuario || ''"
                :value="u.id_usuario"
              />
            </el-select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Ação</label>
            <el-select
              v-model="filters.action"
              placeholder="Todas"
              clearable
              class="w-full"
            >
              <el-option
                v-for="a in filterOptions.actions"
                :key="a"
                :label="actionLabel(a)"
                :value="a"
              />
            </el-select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Módulo</label>
            <el-select
              v-model="filters.entity_type"
              placeholder="Todos"
              clearable
              class="w-full"
            >
              <el-option
                v-for="e in filterOptions.entity_types"
                :key="e"
                :label="entityLabel(e)"
                :value="e"
              />
            </el-select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Busca</label>
            <el-input
              v-model="filters.search"
              placeholder="Texto ou ID..."
              clearable
              @keyup.enter="buscar"
            />
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <el-button type="primary" :icon="Search" @click="buscar">Pesquisar</el-button>
          <el-button @click="limparFiltros">Limpar</el-button>
        </div>
      </div>

      <div class="jobb-data-table">
        <el-table
          v-loading="loading"
          :data="logs"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column prop="created_at" label="Data/Hora" width="180">
            <template #default="{ row }">
              {{ formatDataHoraBr(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="nome_usuario" label="Usuário" width="140">
            <template #default="{ row }">
              {{ row.nome_usuario || row.login_usuario || 'Sistema' }}
            </template>
          </el-table-column>
          <el-table-column prop="action" label="Ação" width="100">
            <template #default="{ row }">
              <el-tag size="small" class="audit-tag" :type="actionTagType(row.action)">
                {{ actionLabel(row.action) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="entity_type" label="Módulo" width="120">
            <template #default="{ row }">
              {{ entityLabel(row.entity_type) }}
            </template>
          </el-table-column>
          <el-table-column prop="entity_display" label="Registro" width="160" />
          <el-table-column prop="summary" label="Resumo" min-width="300" show-overflow-tooltip />
          <el-table-column label="" width="80" align="center">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                :disabled="!temIdValido(row)"
                @click="verDetalhe(row)"
              >
                Detalhe
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Total: {{ meta.total }} registro(s)
          <span v-if="meta.total > 0" class="ml-2">
            — Página {{ meta.current_page }} de {{ meta.last_page }}
          </span>
        </span>
        <el-pagination
          v-model:current-page="meta.current_page"
          :page-size="meta.per_page"
          :total="meta.total"
          :disabled="loading"
          layout="total, prev, pager, next"
          @current-change="onPageChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="modalDetalhe"
      title="Detalhe do log"
      width="720px"
    >
      <div v-if="detalhe" class="audit-detail">
        <div class="audit-detail__row">
          <span class="audit-detail__label">Data:</span>
          <span>{{ formatDataHoraBr(detalhe.created_at) }}</span>
        </div>
        <div class="audit-detail__row">
          <span class="audit-detail__label">Usuário:</span>
          <span>{{ detalhe.nome_usuario || detalhe.login_usuario || 'Sistema' }}</span>
        </div>
        <div class="audit-detail__row">
          <span class="audit-detail__label">Ação:</span>
          <el-tag size="small" class="audit-tag" :type="actionTagType(detalhe.action)">
            {{ actionLabel(detalhe.action) }}
          </el-tag>
        </div>
        <div class="audit-detail__row">
          <span class="audit-detail__label">Módulo:</span>
          <span>{{ entityLabel(detalhe.entity_type) }}</span>
        </div>
        <div class="audit-detail__row">
          <span class="audit-detail__label">Registro:</span>
          <span>{{ detalhe.entity_display || '-' }}</span>
        </div>
        <div class="audit-detail__block">
          <span class="audit-detail__label">Resumo:</span>
          <div class="audit-detail__summary">{{ detalhe.summary }}</div>
        </div>
        <div v-if="detalhe.changes && detalhe.changes.length" class="audit-detail__changes">
          <strong>{{ detalhe.action === 'deleted' ? 'Dados do item excluído' : 'Alterações' }}:</strong>
          <el-table :data="detalhe.changes" size="small" border class="mt-2">
            <el-table-column prop="field_label" label="Campo" width="180" />
            <el-table-column
              :label="detalhe.action === 'deleted' ? 'Valor (excluído)' : 'Valor anterior'"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.old_value != null && row.old_value !== '' ? row.old_value : '—' }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="detalhe.action !== 'deleted'"
              prop="new_value"
              label="Valor novo"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.new_value != null && row.new_value !== '' ? row.new_value : '—' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import {
  getAuditFilters,
  getAuditList,
  getAuditDetail,
  type AuditLog,
  type AuditListParams,
} from '@/services/audit'

const today = new Date()
const lastMonth = new Date(today)
lastMonth.setMonth(lastMonth.getMonth() - 1)

const loading = ref(false)
const logs = ref<AuditLog[]>([])
const meta = reactive({
  current_page: 1,
  per_page: 25,
  total: 0,
  last_page: 1,
})
const filters = reactive<AuditListParams>({
  date_from: lastMonth.toISOString().slice(0, 10),
  date_to: today.toISOString().slice(0, 10),
  id_usuario: null,
  action: null,
  entity_type: null,
  search: null,
})
const filterOptions = reactive<{
  users: { id_usuario: number; nome_usuario?: string; login_usuario?: string }[]
  actions: string[]
  entity_types: string[]
}>({
  users: [],
  actions: [],
  entity_types: [],
})
const modalDetalhe = ref(false)
const detalhe = ref<AuditLog | null>(null)

function formatDataHoraBr(value: string | undefined | null): string {
  if (value == null || value === '') return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function actionLabel(action: string | undefined): string {
  const map: Record<string, string> = {
    created: 'Criar',
    updated: 'Alterar',
    deleted: 'Excluir',
    approved: 'Aprovar',
    other: 'Outro',
  }
  return map[action ?? ''] || action || 'Outro'
}

function actionTagType(action: string | undefined): 'success' | 'warning' | 'danger' | 'primary' | 'info' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'info'> = {
    created: 'success',
    updated: 'warning',
    deleted: 'danger',
    approved: 'primary',
    other: 'info',
  }
  return map[action ?? ''] || 'info'
}

function entityLabel(type: string | undefined): string {
  const map: Record<string, string> = {
    orcamento: 'Orçamento',
    lancamento: 'Lançamento',
    orca_item: 'Item orçamento',
    fatura: 'Fatura',
    config: 'Configuração',
    pessoa: 'Pessoa',
    usuario: 'Usuário',
    empresa: 'Empresa',
    servico: 'Serviço',
    produto: 'Produto',
    equipamento: 'Equipamento',
    remessa: 'Remessa',
    remessa_item: 'Item remessa',
  }
  return map[type ?? ''] || type || '-'
}

async function carregarFiltros() {
  try {
    const data = await getAuditFilters()
    if (data) {
      filterOptions.users = data.users ?? []
      filterOptions.actions = data.actions ?? []
      filterOptions.entity_types = data.entity_types ?? []
    }
  } catch (e) {
    console.error('Erro ao carregar filtros de auditoria', e)
  }
}

async function buscar() {
  loading.value = true
  try {
    const { data: list, meta: m } = await getAuditList({
      page: meta.current_page,
      per_page: meta.per_page,
      ...filters,
    })
    logs.value = list
    meta.current_page = m.current_page
    meta.per_page = m.per_page
    meta.total = m.total
    meta.last_page = m.last_page
  } catch {
    ElMessage.error('Erro ao carregar logs de auditoria.')
    logs.value = []
  } finally {
    loading.value = false
  }
}

function onPageChange(page: number) {
  meta.current_page = page
  buscar()
}

function limparFiltros() {
  const t = new Date()
  const lm = new Date(t)
  lm.setMonth(lm.getMonth() - 1)
  filters.date_from = lm.toISOString().slice(0, 10)
  filters.date_to = t.toISOString().slice(0, 10)
  filters.id_usuario = null
  filters.action = null
  filters.entity_type = null
  filters.search = null
  meta.current_page = 1
  buscar()
}

function temIdValido(row: AuditLog): boolean {
  if (!row) return false
  const n = Number(row.id)
  return !Number.isNaN(n) && n >= 1
}

async function verDetalhe(row: AuditLog) {
  const id = row?.id != null ? Number(row.id) : NaN
  if (Number.isNaN(id) || id < 1) {
    ElMessage.warning('Detalhe não disponível para este item.')
    return
  }
  try {
    const data = await getAuditDetail(id)
    if (data) {
      detalhe.value = data
      modalDetalhe.value = true
    }
  } catch {
    ElMessage.error('Erro ao carregar detalhe do log.')
  }
}

onMounted(() => {
  carregarFiltros()
  buscar()
})
</script>

<style scoped>
.audit-filters label {
  display: block;
}

.audit-detail__row {
  margin-bottom: 10px;
}
.audit-detail__label {
  display: inline-block;
  min-width: 90px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}
.audit-detail__block {
  margin-top: 12px;
  margin-bottom: 12px;
}
.audit-detail__summary {
  margin-top: 6px;
  padding: 10px 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
  max-height: 120px;
  overflow-y: auto;
}
.audit-detail__changes {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
