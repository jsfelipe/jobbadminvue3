<template>
  <section
    class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/40 dark:bg-white/[0.03] sm:p-5"
    aria-label="Totalizadores"
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <template v-for="(totalizador, key) in listaTotalizadores" :key="key">
        <div
          v-if="totalizador?.habilitado !== false"
          class="min-h-[100px] min-w-0"
        >
          <component :is="totalizador.component" :widget="totalizador" />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import TotalReceitasMesAtual from './totalizadores/TotalReceitasMesAtual.vue'
import TotalDespesasMesAtual from './totalizadores/TotalDespesasMesAtual.vue'
import SaldoDisponivel from './totalizadores/SaldoDisponivel.vue'
import TotalOrcamentoAberto from './totalizadores/TotalOrcamentoAberto.vue'
import TotalTarefasUsuario from './totalizadores/TotalTarefasUsuario.vue'
import ValorOrcamentosAprovadosMes from './totalizadores/ValorOrcamentosAprovadosMes.vue'

const componentMap = {
  totaldereceitasdomesatual: TotalReceitasMesAtual,
  totaldedespessasdomesatual: TotalDespesasMesAtual,
  saldodisponivel: SaldoDisponivel,
  totaldeorcamentosemaberto: TotalOrcamentoAberto,
  totaldetarefasparaousuario: TotalTarefasUsuario,
  valororcamentosaprovadosdomes: ValorOrcamentosAprovadosMes,
  valordeorcamentosaprovadosdomes: ValorOrcamentosAprovadosMes,
}

const store = useStore()

const dataWidgets = computed(() => store.getters['Dashboard/listaWidgetsTotalizadores'])

const listaTotalizadores = computed(() => {
  const list = []
  let count = 0
  for (let i = 0; i < dataWidgets.value.length && count < 4; i++) {
    const w = dataWidgets.value[i]
    if (w?.habilitado !== false && componentMap[w.component]) {
      list.push({ ...w, component: componentMap[w.component] })
      count++
    }
  }
  return list
})
</script>
