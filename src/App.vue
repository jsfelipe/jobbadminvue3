<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
      <TicketsRealtimeBridge />
      <ChatRealtimeBridge />
      <ChatContactNotifyBridge />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup>
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import TicketsRealtimeBridge from './components/tickets/TicketsRealtimeBridge.vue'
import ChatRealtimeBridge from './components/chat/ChatRealtimeBridge.vue'
import ChatContactNotifyBridge from './components/chat/ChatContactNotifyBridge.vue'
</script>

