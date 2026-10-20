<template>
  <Modal full-screen-backdrop @close="$emit('close')">
    <template #body>
      <div class="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Histórico de contatos</h3>
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
          <p v-else-if="itens.length === 0" class="text-sm text-gray-500">Nenhum contato registrado para este cliente.</p>
          <ol v-else class="relative border-l border-gray-200 dark:border-gray-700">
            <li v-for="item in itens" :key="item.id" class="mb-6 ml-4">
              <span class="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-blue-500 dark:border-gray-800"></span>
              <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <time class="font-semibold text-gray-700 dark:text-gray-300">{{ formatDateTime(item.created_at) }}</time>
                <span>por {{ item.nome_usuario || '—' }}</span>
                <span class="inline-flex rounded-full px-2 py-0.5 font-semibold" :class="filaBadgeClass(item.tipo_fila)">
                  {{ FILA_LABEL[item.tipo_fila] }}
                </span>
                <span
                  v-if="item.status_novo"
                  class="inline-flex rounded-full px-2 py-0.5 font-semibold"
                  :class="statusBadgeClass(item.status_novo)"
                >
                  <template v-if="item.status_anterior && item.status_anterior !== item.status_novo">
                    {{ statusLabel(item.status_anterior, item.tipo_fila) }} →
                  </template>
                  {{ statusLabel(item.status_novo, item.tipo_fila) }}
                </span>
              </div>
              <p class="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{{ item.descricao }}</p>
            </li>
          </ol>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import { FILA_LABEL, statusLabel, type ClienteFila, type CrmAtendimento } from '../model/crm.types'
import { filaBadgeClass, formatDateTime, statusBadgeClass } from '../model/crm.ui'

const props = defineProps<{ cliente: ClienteFila }>()
defineEmits<{ (e: 'close'): void }>()

const itens = ref<CrmAtendimento[]>([])
const carregando = ref(false)

onMounted(async () => {
  carregando.value = true
  try {
    itens.value = await crmService.historicoCliente(props.cliente.id_cliente)
  } finally {
    carregando.value = false
  }
})
</script>
