<template>
  <el-dialog
    v-model="showModal"
    title="Envio de Mensagem Whatsapp"
    width="70%"
    center
    :modal="false"
  >
    <div v-if="errors" class="mb-4 text-red-600">
      <b>Por favor, corrija o(s) seguinte(s) erro(s):</b>
      <ul>
        <li>{{ errors }}</li>
      </ul>
    </div>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Telefone:
        </label>
        <p>{{ dataWzap?.row?.telefone || '' }}</p>
        <label class="mb-2 mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mensagem:
        </label>
        <el-input
          v-model="msgWzap"
          :rows="4"
          type="textarea"
          autosize
          placeholder="Digite sua mensagem"
        />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showModal = false">Fechar</el-button>
        <el-button type="primary" @click="sendMsg" :loading="isLoading">Enviar</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '@/services/http'

const props = defineProps({
  openModal: {
    type: Boolean,
    required: true,
  },
  dataWzap: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:openModal'])

const showModal = computed({
  get: () => props.openModal,
  set: (val) => emit('update:openModal', val),
})

const errors = ref(null)
const isLoading = ref(false)
const msgWzap = ref('🙂 Olá! Verificamos que o seu pagamento encontra-se em aberto. Você gostaria de um link para pagamento?')

const sendMsg = async () => {
  if (!props.dataWzap?.row?.telefone) {
    ElMessage.error('Telefone não encontrado')
    return
  }

  isLoading.value = true
  errors.value = null

  try {
    const data = {
      number_client: props.dataWzap.row.telefone,
      message: msgWzap.value,
    }

    const response = await api.post('/send-wzap-msg', data)

    if (response.data?.sucess) {
      ElMessage.success('Enviado com sucesso!')
      showModal.value = false
      msgWzap.value = '🙂 Olá! Verificamos que o seu pagamento encontra-se em aberto. Você gostaria de um link para pagamento?'
    } else {
      ElMessage.error('Erro ao enviar mensagem')
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    errors.value = error.response?.data?.message || 'Erro ao enviar mensagem'
    ElMessage.error('Erro ao enviar mensagem')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.erros {
  color: red;
}
</style>
