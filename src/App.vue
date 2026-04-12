<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
      <TicketsRealtimeBridge />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup>
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import TicketsRealtimeBridge from './components/tickets/TicketsRealtimeBridge.vue'
</script>

