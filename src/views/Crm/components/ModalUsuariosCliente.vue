<template>
  <Modal full-screen-backdrop @close="$emit('close')">
    <template #body>
      <div class="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Usuários da conta</h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              <span class="font-semibold text-gray-800 dark:text-gray-200">{{ cliente.nome }}</span>
              <span v-if="cliente.dominio"> ({{ cliente.dominio }})</span>
            </p>
          </div>
          <button type="button" class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" @click="$emit('close')">
            ✕
          </button>
        </div>

        <div class="mt-4 flex-1 overflow-y-auto pr-1">
          <p v-if="carregando" class="text-sm text-gray-500">Carregando...</p>
          <p v-else-if="erro" class="text-sm text-red-600">{{ erro }}</p>
          <p v-else-if="usuarios.length === 0" class="text-sm text-gray-500">Nenhum usuário ativo nesta conta.</p>
          <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                <th>Nome</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(u, i) in usuarios" :key="`${u.nome}-${i}`" class="border-t border-gray-100 dark:border-gray-700">
                <td class="font-medium text-gray-900 dark:text-white">{{ u.nome || '—' }}</td>
                <td>
                  <a
                    v-if="whatsappLink(u.telefone)"
                    :href="whatsappLink(u.telefone) ?? undefined"
                    target="_blank"
                    rel="noopener"
                    class="text-emerald-600 hover:underline"
                  >
                    {{ u.telefone }}
                  </a>
                  <span v-else class="text-gray-500">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import type { ClienteFila, CrmUsuarioCliente } from '../model/crm.types'
import { whatsappLink } from '../model/crm.ui'

const props = defineProps<{ cliente: ClienteFila }>()
defineEmits<{ (e: 'close'): void }>()

const usuarios = ref<CrmUsuarioCliente[]>([])
const carregando = ref(false)
const erro = ref('')

onMounted(async () => {
  carregando.value = true
  erro.value = ''
  try {
    const resp = await crmService.usuariosCliente(props.cliente.id_cliente)
    if (!Array.isArray(resp?.usuarios)) {
      erro.value = 'Não foi possível carregar os usuários.'
      return
    }
    usuarios.value = resp.usuarios
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { error?: string; message?: string } } }
    erro.value = ax.response?.data?.error || ax.response?.data?.message || 'Não foi possível carregar os usuários.'
  } finally {
    carregando.value = false
  }
})
</script>
