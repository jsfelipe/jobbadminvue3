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

function openConversa(conversaId: number): void {
  if (conversaId > 0) {
    void router.push({ name: 'admin.chat', query: { conversa: String(conversaId) } })
  } else {
    void router.push({ name: 'admin.chat' })
  }
}

function onLobbyEvent(payload: ChatLobbyPayload): void {
  const conversaId = Number(payload.conversa_id)
  const nome = displayClienteNomeFromLobby(payload)

  if (payload.type === 'chat_contact_request') {
    ElNotification({
      title: 'Cliente em teste quer falar',
      message: nome,
      type: 'info',
      duration: 8000,
      customClass: 'custom-notification info',
      onClick: () => openConversa(conversaId),
    })
    chatBus.emit('chat:unread-refresh')
    return
  }

  if (payload.type === 'chat_human_request') {
    ElNotification({
      title: 'Cliente pediu atendimento humano',
      message: nome,
      type: 'warning',
      duration: 10000,
      customClass: 'custom-notification warning',
      onClick: () => openConversa(conversaId),
    })
    chatBus.emit('chat:unread-refresh')
    return
  }

  if (payload.type === 'chat_ia_handoff') {
    ElNotification({
      title: 'Chat transferido para humano',
      message: nome !== '—' ? nome : 'Conversa #' + String(conversaId),
      type: 'info',
      duration: 6000,
      customClass: 'custom-notification info',
      onClick: () => openConversa(conversaId),
    })
    chatBus.emit('chat:unread-refresh')
  }
}

onMounted(() => {
  chatBus.on('chat:lobby', onLobbyEvent)
})

onUnmounted(() => {
  chatBus.off('chat:lobby', onLobbyEvent)
})
</script>
