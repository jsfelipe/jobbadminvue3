<template>
  <ticket-support-realtime-panel v-if="showPanel" />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import TicketSupportRealtimePanel from './TicketSupportRealtimePanel.vue'
import { connectTicketsAbly, disconnectTicketsAbly } from '@/composables/useTicketsAbly'

interface LoginState {
  token?: string | null
}

interface RootState {
  Login?: LoginState
}

const store = useStore()
const route = useRoute()
const rootState = computed(() => store.state as RootState)

const authToken = computed(() => rootState.value.Login?.token ?? null)
const isPortalRoute = computed(() => route.path.startsWith('/portal'))
const showPanel = computed(() => Boolean(authToken.value) && !isPortalRoute.value)

watch(
  () => ({
    token: authToken.value,
    portal: isPortalRoute.value,
  }),
  async (cur, prev) => {
    const active = Boolean(cur.token) && !cur.portal
    const tokenChanged = Boolean(
      prev?.token && cur.token && prev.token !== cur.token
    )

    if (tokenChanged) {
      await disconnectTicketsAbly({ deactivatePush: false })
    }

    if (!active) {
      await disconnectTicketsAbly({ deactivatePush: !Boolean(cur.token) })
      return
    }

    const wasActive = Boolean(prev?.token && !prev.portal)
    if (tokenChanged || !wasActive) {
      connectTicketsAbly()
    }
  },
  { immediate: true }
)
</script>
