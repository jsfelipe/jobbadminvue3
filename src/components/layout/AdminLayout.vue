<template>
  <!-- overflow-x-clip evita barra horizontal sem quebrar position:sticky (overflow-x-hidden quebra) -->
  <div class="h-full min-h-screen overflow-x-clip lg:flex">
    <app-sidebar />
    <!-- Backdrop removido: ao abrir o menu o conteúdo é empurrado (ml-[290px]), sem overlay bloqueante -->
    <!-- Spacer reserva o espaço do sidebar fixo; sem fundo para o cinza do body aparecer -->
    <div
      class="hidden shrink-0 transition-all duration-300 ease-in-out lg:block"
      :class="[isExpanded || isHovered ? 'lg:w-[290px]' : 'lg:w-[90px]']"
      aria-hidden="true"
    />
    <div
      class="flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out pl-2 pr-4 md:pl-3 md:pr-6"
      :class="{ 'ml-[290px]': isMobileOpen }"
      :style="sidebarWidthStyle"
      @click.self="isMobileOpen && toggleMobileSidebar()"
    >
      <app-header />
      <!-- Bloco branco acompanha a largura disponível; padding do wrapper mantém o cinza nas laterais -->
      <div class="min-h-0 min-w-0 flex-1 w-full overflow-auto p-3 md:p-4 bg-white dark:bg-gray-900">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useSidebar } from '@/composables/useSidebar'

const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar } = useSidebar()

const isLg = ref(true)
let mediaCleanup = () => {}
onMounted(() => {
  const m = window.matchMedia('(min-width: 1024px)')
  isLg.value = m.matches
  const fn = () => { isLg.value = m.matches }
  m.addEventListener('change', fn)
  mediaCleanup = () => m.removeEventListener('change', fn)
})
onUnmounted(() => mediaCleanup())

/** Largura do sidebar para a barra fixa do orçamento (left offset). */
const sidebarWidthStyle = computed(() => ({
  '--sidebar-width': isLg.value ? ((isExpanded.value || isHovered.value) ? '290px' : '90px') : '0px',
}))
</script>
