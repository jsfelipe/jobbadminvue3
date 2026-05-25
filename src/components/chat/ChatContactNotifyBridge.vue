<template>
  <span class="hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { chatBus, type ChatLobbyPayload } from '@/lib/chat-bus'
import { displayClienteNomeFromLobby } from '@/utils/chat-cliente-label'

const router = useRouter()

function onLobbyEvent(payload: ChatLobbyPayload): void {
  if (payload.type !== 'chat_contact_request') {
    return
  }

  const conversaId = Number(payload.conversa_id)
  const nome = displayClienteNomeFromLobby(payload)

  ElNotification({
    title: 'Cliente em teste quer falar',
    message: nome,
    type: 'info',
    duration: 8000,
    customClass: 'custom-notification info',
    onClick: () => {
      if (conversaId > 0) {
        void router.push({ name: 'admin.chat', query: { conversa: String(conversaId) } })
      } else {
        void router.push({ name: 'admin.chat' })
      }
    },
  })

  chatBus.emit('chat:unread-refresh')
}

onMounted(() => {
  chatBus.on('chat:lobby', onLobbyEvent)
})

onUnmounted(() => {
  chatBus.off('chat:lobby', onLobbyEvent)
})
</script>
