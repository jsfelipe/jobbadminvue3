<template>
  <section
    class="dashboard-widgets-grid grid gap-4 sm:grid-cols-6 sm:auto-rows-[140px] sm:grid-flow-dense sm:gap-6"
    aria-label="Widgets"
  >
    <template v-for="(widget, key) in dataWidgetsFiltered" :key="key">
      <div
        v-if="widget.habilitado !== false"
        :class="gridSpanClass(widget.tamanho)"
        class="min-w-0"
      >
        <div
          class="flex min-h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/40 dark:bg-white/[0.03] sm:p-5"
        >
          <component :is="widgetComponent(widget)" :widget="widget" class="min-h-0 flex-1" />
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import ReceitasXDespesas from './widgets/ReceitasXDespesas.vue'
import FaturamentoMensal from './widgets/FaturamentoMensal.vue'
import GraficoVendas from './widgets/GraficoVendas.vue'
import GraficoFluxoDeCaixa from './widgets/GraficoFluxoDeCaixa.vue'
import QuantidadeOrcamentosPorStatus from './widgets/QuantidadeOrcamentosPorStatus.vue'
import ValorOrcamentoAgencia from './widgets/ValorOrcamentoAgencia.vue'
import MinhasTarefas from './widgets/MinhasTarefas.vue'
import SolicitacaoDeVerba from './widgets/SolicitacaoDeVerba.vue'
import Calendario from './widgets/Calendario.vue'
import VencendoHoje from './widgets/VencendoHoje.vue'
import UltimosOrcamentosUtilizados from './widgets/UltimosOrcamentosUtilizados.vue'
import Tweets from './widgets/Tweets.vue'

const widgetComponentMap = {
  receitasxdespesas: ReceitasXDespesas,
  faturamentomensal: FaturamentoMensal,
  graficodevendas: GraficoVendas,
  graficodofluxodecaixa: GraficoFluxoDeCaixa,
  quantidadedeorcamentosporstatus: QuantidadeOrcamentosPorStatus,
  valordeorcamentosporagenciatop5: ValorOrcamentoAgencia,
  minhastarefas: MinhasTarefas,
  solicitacaodeverba: SolicitacaoDeVerba,
  calendario: Calendario,
  vencendohoje: VencendoHoje,
  ultimosorcamentosutilizados: UltimosOrcamentosUtilizados,
  tweets: Tweets,
}

const store = useStore()

const dataWidgets = computed(() => store.getters['Dashboard/listaWidgets'])

/**
 * Grid denso: PEQUENO=1/3 (2 col), METADE=50% (3 col), MEDIO=2/3 (4 col), GRANDE=100% (6×2).
 * Em mobile: 1 coluna; em sm+: 6 colunas com auto-flow dense para preencher vazios.
 */
function gridSpanClass(tamanho: string | undefined): string {
  const t = (tamanho || 'PEQUENO').toUpperCase()
  switch (t) {
    case 'METADE':
      return 'sm:col-span-3 sm:row-span-1'
    case 'MEDIO':
      return 'sm:col-span-4 sm:row-span-1'
    case 'GRANDE':
      return 'sm:col-span-6 sm:row-span-2'
    case 'PEQUENO':
    default:
      return 'sm:col-span-2 sm:row-span-1'
  }
}

function widgetComponent(widget: { component?: string }) {
  return widgetComponentMap[widget.component ?? ''] ?? null
}

const dataWidgetsFiltered = computed(() =>
  dataWidgets.value.filter((w) => w.habilitado !== false && widgetComponentMap[w.component])
)
</script>

<style scoped>
.dashboard-widgets-grid {
  grid-auto-rows: minmax(140px, auto);
}
@media (max-width: 639px) {
  .dashboard-widgets-grid {
    grid-auto-rows: minmax(200px, auto);
  }
}
</style>
