<template>
  <admin-layout>
    <div class="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <!-- Barra de ações (Atualizar / Configuração) e gráfico principal -->
      <dashboard-header />

      <!-- Totalizadores (até 4 cards conforme permissão) -->
      <dashboard-totalizadores />

      <!-- Grid de widgets (conforme permissão do perfil) -->
      <dashboard-widgets />
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DashboardHeader from './DashboardHeader.vue'
import DashboardTotalizadores from './Totalizadores.vue'
import DashboardWidgets from './Widgets.vue'

const store = useStore()
const route = useRoute()

async function carregarDashboard() {
  const id_perfil = store.getters['Login/get']?.('id_usuario_tipo') ?? store.state.Login?.data?.id_usuario_tipo
  if (id_perfil) {
    await store.dispatch('Dashboard/getWidgets', { id_perfil })
    await store.dispatch('Dashboard/getWidgetTamanhos', id_perfil)
    await store.dispatch('Dashboard/getDataReceitasXDespesas')
  }
}

onMounted(() => {
  carregarDashboard()
})

// Ao voltar da Configuração, recarrega para aplicar as mudanças na Dashboard
watch(
  () => route.name,
  (to, from) => {
    if (to === 'Dashboard' && from === 'DashboardConfiguracao') {
      carregarDashboard()
    }
  }
)
</script>
