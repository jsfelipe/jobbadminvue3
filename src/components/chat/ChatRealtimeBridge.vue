<template>
  <span class="hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { connectChatAbly, disconnectChatAbly } from '@/composables/useChatAbly'

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
const active = computed(() => Boolean(authToken.value) && !isPortalRoute.value)

watch(
  () => ({
    token: authToken.value,
    portal: isPortalRoute.value,
  }),
  async (cur, prev) => {
    const on = Boolean(cur.token) && !cur.portal
    const tokenChanged = Boolean(prev?.token && cur.token && prev.token !== cur.token)

    if (tokenChanged) {
      await disconnectChatAbly()
    }

    if (!on) {
      await disconnectChatAbly()
      return
    }

    const wasOn = Boolean(prev?.token && !prev.portal)
    if (tokenChanged || !wasOn) {
      connectChatAbly()
    }
  },
  { immediate: true }
)
</script>
