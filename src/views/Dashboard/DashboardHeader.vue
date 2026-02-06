<template>
  <div class="space-y-6">
    <!-- Barra de ações: Atualizar gráfico e Configuração -->
    <div
      class="flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/40"
    >
      <el-tooltip v-if="hasPrincipalChart" content="Atualizar gráfico" placement="top">
        <button
          type="button"
          :disabled="loading"
          class="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          @click="onRefresh"
        >
          <el-icon v-if="loading" class="is-loading" :size="20">
            <Refresh />
          </el-icon>
          <el-icon v-else :size="20">
            <Refresh />
          </el-icon>
        </button>
      </el-tooltip>
      <el-tooltip content="Configuração da Dashboard" placement="top">
        <router-link
          to="/dashboard/configuracao"
          class="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        >
          <el-icon :size="20">
            <Setting />
          </el-icon>
        </router-link>
      </el-tooltip>
    </div>

    <!-- Gráfico principal (quando houver widget de gráfico) -->
    <div
      v-if="widget.component && hasPrincipalChart"
      class="min-h-[300px] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/40 sm:p-6"
    >
      <component
        :is="widgetComponent"
        :widget="widget"
        :top-location="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { Refresh, Setting } from '@element-plus/icons-vue'
import ReceitasXDespesas from './widgets/ReceitasXDespesas.vue'
import FaturamentoMensal from './widgets/FaturamentoMensal.vue'
import GraficoVendas from './widgets/GraficoVendas.vue'

const widgetComponentMap = {
  receitasxdespesas: ReceitasXDespesas,
  faturamentomensal: FaturamentoMensal,
  graficodevendas: GraficoVendas,
}

const store = useStore()
const loading = ref(false)

const widget = computed(() => store.getters['Dashboard/listaWidgetPrincipal'])

const chartComponents = ['receitasxdespesas', 'faturamentomensal', 'graficodevendas']
const hasPrincipalChart = computed(() => {
  const comp = widget.value?.component
  return comp && chartComponents.includes(comp)
})

const widgetComponent = computed(() => {
  const comp = widget.value?.component
  return comp ? widgetComponentMap[comp] : null
})

async function onRefresh() {
  try {
    loading.value = true
    await store.dispatch('Dashboard/getDataReceitasXDespesas')
  } catch {
    // erro já pode ser tratado pelo interceptor ou store
  } finally {
    loading.value = false
  }
}

watch(
  () => widget.value?.component,
  (comp) => {
    if (comp === 'receitasxdespesas') {
      store.dispatch('Dashboard/getDataReceitasXDespesas')
    }
  },
  { immediate: true }
)
</script>
