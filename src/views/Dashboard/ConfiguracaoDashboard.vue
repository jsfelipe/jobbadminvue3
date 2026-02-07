<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 sm:px-6 lg:px-8">
      <!-- Cabeçalho: voltar, título e perfil (admin) -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <router-link
            to="/"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <el-icon><ArrowLeft /></el-icon>
            Voltar ao Dashboard
          </router-link>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Configuração da Dashboard
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Arraste os cards para reordenar e clique em <strong>Salvar ordem</strong> para aplicar na Dashboard.
          </p>
        </div>
        <div v-if="hasAdmin" class="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div class="min-w-[200px]">
            <select-perfil
              v-model="perfilId"
              :show-label="false"
              @return-value="carregarWidgetsDoPerfil"
            />
          </div>
          <button
            type="button"
            :disabled="salvandoOrdem || !perfilId"
            class="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="salvarOrdem"
          >
            <el-icon v-if="salvandoOrdem" class="animate-spin"><Loading /></el-icon>
            <el-icon v-else><Select /></el-icon>
            {{ salvandoOrdem ? 'Salvando...' : 'Salvar ordem' }}
          </button>
        </div>
      </div>

      <!-- Mockup: mesma estrutura visual da Dashboard (sem dados reais nos widgets) -->

      <!-- 1) Gráfico principal (placeholder) -->
      <div class="min-h-[300px] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/40 sm:p-6">
        <div
          class="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 px-5 py-5 dark:border-gray-600"
        >
          <template v-if="widgetPrincipal.nome">
            <el-icon :size="56" class="text-gray-400 dark:text-gray-500">
              <DataLine />
            </el-icon>
            <p class="text-center text-lg font-medium text-gray-700 dark:text-gray-300">
              {{ cardTitle(widgetPrincipal) }}
            </p>
            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
              Gráfico principal (visualização real na Dashboard)
            </p>
          </template>
          <template v-else>
            <el-icon :size="48" class="text-gray-400"><DataLine /></el-icon>
            <p class="text-center text-gray-500 dark:text-gray-400">
              Nenhum gráfico principal definido
            </p>
          </template>
          <div class="mt-2 flex flex-wrap justify-center gap-2">
            <button
              v-for="(g, idx) in graficosPrincipaisDisponiveis"
              :key="g.id"
              type="button"
              :class="[
                'rounded-lg border px-3 py-2 text-sm font-medium transition',
                g.principal
                  ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              ]"
              @click="tornarPrincipal(idx)"
            >
              {{ cardTitle(g) }}
            </button>
          </div>
          <template v-if="widgetPrincipal.id === 7 && widgetPrincipal.nome">
            <div class="flex gap-2">
              <button
                type="button"
                :class="[
                  'rounded-lg border px-3 py-1 text-sm',
                  widgetPrincipal.dashboard_grafico_receita_despesa_todos === 'S'
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-600',
                ]"
                @click="removerPrincipal(graficosPrincipaisDisponiveis.findIndex((x) => x.id === 7), false)"
              >
                Valores abertos e pagos: SIM
              </button>
              <button
                type="button"
                :class="[
                  'rounded-lg border px-3 py-1 text-sm',
                  widgetPrincipal.dashboard_grafico_receita_despesa_todos !== 'S'
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-600',
                ]"
                @click="tornarPrincipal(graficosPrincipaisDisponiveis.findIndex((x) => x.id === 7), true)"
              >
                NÃO
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- 2) Totalizadores (mockup – mesma fileira, cards arrastáveis) -->
      <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/40 sm:p-5">
        <p class="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Totalizadores (até 4 na Dashboard)
        </p>
        <draggable
          v-model="totalizadores"
          item-key="id"
          handle=".handle-totalizador"
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <template #item="{ element: item }">
            <div
              :class="[
                'flex min-h-[120px] cursor-grab items-center gap-3 rounded-xl border px-4 py-4 active:cursor-grabbing',
                item.habilitado !== false
                  ? 'border-gray-200 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-800/60'
                  : 'border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-800/40',
              ]"
            >
              <el-icon class="handle-totalizador shrink-0 text-gray-400" :size="18">
                <Rank />
              </el-icon>
              <el-icon class="shrink-0 text-gray-500 dark:text-gray-400" :size="24">
                <component :is="iconForWidget(item)" />
              </el-icon>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-gray-800 dark:text-gray-200">
                  {{ cardTitle(item) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Mockup – sem dados
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                :title="item.habilitado !== false ? 'Visível (clique para ocultar)' : 'Oculto (clique para exibir)'"
                @click.stop="item.habilitado !== false ? desabilitar(item.id) : habilitar(item.id)"
              >
                <el-icon v-if="item.habilitado !== false" :size="18"><View /></el-icon>
                <el-icon v-else :size="18"><Hide /></el-icon>
              </button>
            </div>
          </template>
        </draggable>
      </section>

      <!-- 3) Widgets (mockup – grid denso; escolha o tamanho por percentual) -->
      <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/40 sm:p-5">
        <p class="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Widgets – arraste para reordenar; clique no percentual (25%, 50%, 75%, 100%) para definir o tamanho do card.
        </p>
        <draggable
          v-model="widgets"
          item-key="id"
          handle=".handle-widget"
          class="config-widgets-grid grid gap-4 sm:grid-cols-6 sm:auto-rows-[140px] sm:grid-flow-dense sm:gap-6"
        >
          <template #item="{ element: item }">
            <div :class="['min-w-0', gridSpanClass(effectiveTamanho(item))]">
              <div
                :class="[
                  'flex min-h-full cursor-grab flex-col rounded-2xl border px-4 py-4 active:cursor-grabbing sm:p-5',
                  item.habilitado !== false
                    ? 'border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800/60'
                    : 'border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-800/40',
                ]"
              >
                <div class="flex items-start justify-between gap-2">
                  <el-icon class="handle-widget mt-0.5 shrink-0 text-gray-400" :size="18">
                    <Rank />
                  </el-icon>
                  <div class="flex flex-wrap gap-1">
                    <button
                      v-for="opt in tamanhoOpcoes"
                      :key="opt.tamanho"
                      type="button"
                      :class="[
                        'rounded px-2 py-0.5 text-xs font-medium',
                        effectiveTamanho(item) === opt.tamanho
                          ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300',
                      ]"
                      :title="opt.tamanho === 'GRANDE' ? '100% da largura (2 linhas)' : opt.percentual + ' da largura'"
                      @click.stop="setTamanho(item.id, opt.tamanho)"
                    >
                      {{ opt.percentual }}
                    </button>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex justify-center">
                    <el-icon :size="32" class="text-gray-400 dark:text-gray-500">
                      <component :is="iconForWidget(item)" />
                    </el-icon>
                  </div>
                  <p class="text-center font-medium text-gray-800 dark:text-gray-200">
                    {{ cardTitle(item) }}
                  </p>
                  <p class="text-center text-xs text-gray-500 dark:text-gray-400">
                    {{ tamanhoToPercentual(effectiveTamanho(item)) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="mt-2 shrink-0 self-center rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  :title="item.habilitado !== false ? 'Visível (clique para ocultar)' : 'Oculto (clique para exibir)'"
                  @click.stop="item.habilitado !== false ? desabilitar(item.id) : habilitar(item.id)"
                >
                  <el-icon v-if="item.habilitado !== false" :size="18"><View /></el-icon>
                  <el-icon v-else :size="18"><Hide /></el-icon>
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </section>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, type Component } from 'vue'
import { useStore } from 'vuex'
import {
  ArrowLeft,
  View,
  Hide,
  Rank,
  DataLine,
  Grid,
  Loading,
  Select,
  Money,
  Wallet,
  Document,
  Calendar,
  Bell,
  List,
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import SelectPerfil from '@/components/Jobb/Perfil/SelectPerfil.vue'

interface Widget {
  id: number
  nome: string
  logo?: string
  tipo: string
  tamanho?: string
  principal?: boolean
  habilitado?: boolean
  ordem?: number
  dashboard_grafico_receita_despesa_todos?: string
}

const store = useStore()
const instance = getCurrentInstance()
const alerta = instance?.proxy?.$alerta as ((msg: string, type: string) => void) | undefined

const perfilId = ref<string | number | null>(null)
const totalizadores = ref<Widget[]>([])
const widgets = ref<Widget[]>([])
const graficosPrincipaisDisponiveis = ref<Widget[]>([])
const salvandoOrdem = ref(false)

const idUsuarioTipo = computed(
  () =>
    store.getters['Login/get']?.('id_usuario_tipo') ??
    (store.state as { Login?: { data?: { id_usuario_tipo?: number | string } } }).Login?.data
      ?.id_usuario_tipo
)

const hasAdmin = computed(() => {
  const id = idUsuarioTipo.value
  return id === 1 || id === '1'
})

const widgetPrincipal = computed(() => {
  return graficosPrincipaisDisponiveis.value.find((w) => w.principal) ?? ({} as Widget)
})

/** Título do card: Tweets → Novidades */
function cardTitle(item: Widget): string {
  return item.nome === 'Tweets' ? 'Novidades' : (item.nome ?? '')
}

/** Ícone do card conforme nome/tipo do widget */
const iconMap: Record<string, Component> = {
  receitas: Money,
  despesas: Wallet,
  orçamentos: Document,
  orcamentos: Document,
  tarefas: List,
  calendário: Calendar,
  calendario: Calendar,
  tweets: Bell,
  novidades: Bell,
  'notícias do blog': Bell,
  'grafico do fluxo de caixa': DataLine,
  'gráfico do fluxo de caixa': DataLine,
  'receitas x despesas': DataLine,
  vendas: DataLine,
}
function iconForWidget(item: Widget): Component {
  const key = (item.nome ?? '').toLowerCase().trim()
  return iconMap[key] ?? Grid
}

async function carregarWidgetsDoPerfil() {
  const id = perfilId.value
  if (!id) return
  try {
    const data = (await store.dispatch('Dashboard/getWidgets', {
      id_perfil: id,
      removeCommit: true,
    })) as Widget[]
    await store.dispatch('Dashboard/getWidgetTamanhos', id)
    const totalizadoresList: Widget[] = []
    const widgetsList: Widget[] = []
    const principaisList: Widget[] = []
    for (const w of data ?? []) {
      if (w.tipo === 'TOTALIZADOR') {
        totalizadoresList.push(w)
      } else {
        widgetsList.push(w)
      }
      if (w.tipo === 'GRAFICO_BARRA' || w.tipo === 'GRAFICO_LINHA') {
        principaisList.push(w)
      }
    }
    totalizadores.value = totalizadoresList
    widgets.value = widgetsList
    graficosPrincipaisDisponiveis.value = principaisList
  } catch {
    alerta?.('Falha ao carregar os widgets', 'danger')
  }
}

/** Tamanho efetivo: override do usuário (v2) ou padrão do widget */
function effectiveTamanho(item: Widget): string {
  const overrides = (store.state as { Dashboard?: { dashboardTamanhos?: Record<number, string> } }).Dashboard?.dashboardTamanhos ?? {}
  return overrides[item.id] ?? item.tamanho ?? 'PEQUENO'
}

/** Opções de tamanho com rótulo em percentual (25, 50, 75, 100) */
const tamanhoOpcoes = [
  { tamanho: 'PEQUENO', percentual: '25%' },
  { tamanho: 'METADE', percentual: '50%' },
  { tamanho: 'MEDIO', percentual: '75%' },
  { tamanho: 'GRANDE', percentual: '100%' },
] as const

/** Converte tamanho interno para exibição em percentual */
function tamanhoToPercentual(tamanho: string): string {
  const t = (tamanho || 'PEQUENO').toUpperCase()
  const opt = tamanhoOpcoes.find((o) => o.tamanho === t)
  return opt?.percentual ?? '25%'
}

/** Grid denso: mesmo mapeamento da Dashboard (33%=2col, 50%=3col, 67%=4col, 100%=6col×2) */
function gridSpanClass(tamanho: string): string {
  const t = (tamanho || 'PEQUENO').toUpperCase()
  switch (t) {
    case 'METADE':
      return 'sm:col-span-3 sm:row-span-1'
    case 'MEDIO':
      return 'sm:col-span-4 sm:row-span-1'
    case 'GRANDE':
      return 'sm:col-span-6 sm:row-span-2'
    default:
      return 'sm:col-span-2 sm:row-span-1'
  }
}

async function setTamanho(idWidget: number, tamanho: string) {
  if (alertaSelecionarPerfil()) return
  const overrides = (store.state as { Dashboard?: { dashboardTamanhos?: Record<number, string> } }).Dashboard?.dashboardTamanhos ?? {}
  try {
    await store.dispatch('Dashboard/updateWidgetTamanhos', {
      id_perfil: perfilId.value,
      tamanhos: { ...overrides, [idWidget]: tamanho },
    })
    alerta?.('Tamanho atualizado. A Dashboard será atualizada.', 'success')
  } catch {
    alerta?.('Falha ao atualizar tamanho', 'danger')
  }
}

function alertaSelecionarPerfil() {
  if (!perfilId.value) {
    alerta?.('Selecione o Perfil!', 'warning')
    return true
  }
  return false
}

async function habilitar(id: number) {
  if (alertaSelecionarPerfil()) return
  try {
    await store.dispatch('Dashboard/editWidgets', {
      id,
      id_perfil: perfilId.value,
      habilitar: true,
    })
    await carregarWidgetsDoPerfil()
    alerta?.('Alterado com sucesso', 'success')
  } catch {
    alerta?.('Falha ao alterar', 'danger')
  }
}

async function desabilitar(id: number) {
  if (alertaSelecionarPerfil()) return
  try {
    await store.dispatch('Dashboard/editWidgets', {
      id,
      id_perfil: perfilId.value,
      habilitar: false,
    })
    await carregarWidgetsDoPerfil()
    alerta?.('Alterado com sucesso', 'success')
  } catch (err: unknown) {
    const msg =
      err &&
      typeof err === 'object' &&
      'data' in err &&
      typeof (err as { data?: { msgDetails?: string } }).data?.msgDetails === 'string'
        ? (err as { data: { msgDetails: string } }).data.msgDetails
        : 'Falha ao alterar'
    alerta?.(msg, 'danger')
  }
}

async function tornarPrincipal(index: number, receitaDespesa: boolean | null = null) {
  if (alertaSelecionarPerfil()) return
  const widget = graficosPrincipaisDisponiveis.value[index]
  if (!widget) return
  try {
    const params: Record<string, unknown> = {
      id: widget.id,
      id_perfil: perfilId.value,
      principal: true,
    }
    if (receitaDespesa === true) {
      params.receita_despesa = true
    }
    await store.dispatch('Dashboard/editWidgets', params)
    await carregarWidgetsDoPerfil()
    alerta?.('Widget principal alterado com sucesso', 'success')
  } catch {
    alerta?.('Falha ao alterar widget principal', 'danger')
  }
}

async function removerPrincipal(index: number, receitaDespesa: boolean | null = null) {
  if (alertaSelecionarPerfil()) return
  const widget = graficosPrincipaisDisponiveis.value[index]
  if (!widget) return
  try {
    const params: Record<string, unknown> = {
      id: widget.id,
      id_perfil: perfilId.value,
      principal: false,
    }
    if (receitaDespesa === false) {
      params.receita_despesa = false
    }
    await store.dispatch('Dashboard/editWidgets', params)
    await carregarWidgetsDoPerfil()
    alerta?.('Widget principal removido com sucesso', 'success')
  } catch {
    alerta?.('Falha ao remover widget principal', 'danger')
  }
}

async function salvarOrdem() {
  if (alertaSelecionarPerfil()) return
  salvandoOrdem.value = true
  try {
    const idPerfil = perfilId.value
    const ordem: { id: number; ordem: number }[] = []
    let ordemGlobal = 0
    for (const t of totalizadores.value) {
      ordem.push({ id: t.id, ordem: ordemGlobal++ })
    }
    for (const w of widgets.value) {
      ordem.push({ id: w.id, ordem: ordemGlobal++ })
    }
    await store.dispatch('Dashboard/editWidgetsOrdemLote', { id_perfil: idPerfil, ordem })
    await carregarWidgetsDoPerfil()
    alerta?.('Ordem salva com sucesso. A Dashboard será atualizada.', 'success')
  } catch {
    alerta?.('Falha ao salvar a ordem', 'danger')
  } finally {
    salvandoOrdem.value = false
  }
}

onMounted(async () => {
  const id =
    store.getters['Login/get']?.('id_usuario_tipo') ??
    (store.state as { Login?: { data?: { id_usuario_tipo?: number | string } } }).Login?.data
      ?.id_usuario_tipo
  if (id) {
    perfilId.value = id
    await carregarWidgetsDoPerfil()
  }
})
</script>

<style scoped>
.config-widgets-grid {
  grid-auto-rows: minmax(140px, auto);
}
@media (max-width: 639px) {
  .config-widgets-grid {
    grid-auto-rows: minmax(200px, auto);
  }
}
</style>
