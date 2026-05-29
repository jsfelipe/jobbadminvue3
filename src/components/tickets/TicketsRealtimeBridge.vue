<template>
  <ticket-support-realtime-panel v-if="showPanel" />
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import TicketSupportRealtimePanel from './TicketSupportRealtimePanel.vue'
import { connectTicketsAbly, disconnectTicketsAbly } from '@/composables/useTicketsAbly'

interface LoginUserData {
  id_perfil?: number | string | null
  id_usuario_tipo?: number | string | null
}

interface LoginState {
  token?: string | null
  data?: LoginUserData | null
}

interface RootState {
  Login?: LoginState
}

const store = useStore()
const route = useRoute()
const rootState = computed(() => store.state as RootState)

const authToken = computed(() => rootState.value.Login?.token ?? null)
const isPortalRoute = computed(() => route.path.startsWith('/portal'))

const userTipo = computed(() => {
  const data = rootState.value.Login?.data
  if (!data) return null
  const raw = data.id_perfil ?? data.id_usuario_tipo
  if (raw == null || raw === '') return null
  return Number(raw)
})

const showPanel = computed(() => {
  if (!authToken.value || isPortalRoute.value) return false
  if (!rootState.value.Login?.data) return false
  return userTipo.value !== 6
})

async function ensureUserData(): Promise<void> {
  if (!authToken.value || rootState.value.Login?.data) return
  try {
    await store.dispatch('Login/me')
  } catch {
    /* noop */
  }
}

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

onMounted(() => {
  void ensureUserData()
})

watch(authToken, (token) => {
  if (token) void ensureUserData()
})
</script>
