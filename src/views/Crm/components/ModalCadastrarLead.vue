<template>
  <Modal full-screen-backdrop @close="$emit('close')">
    <template #body>
      <div class="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Cadastrar lead</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Prospecção via Contact Out ou LinkedIn. Conta nas metas do dia (e no débito acumulado).
        </p>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-produto">Produto *</label>
            <select
              id="lead-produto"
              v-model="form.produto"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            >
              <option v-for="p in PRODUTOS_LEAD" :key="p" :value="p">{{ PRODUTO_LEAD_LABEL[p] }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-origem">Origem *</label>
            <select
              id="lead-origem"
              v-model="form.origem"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            >
              <option v-for="o in ORIGENS_LEAD" :key="o" :value="o">{{ ORIGEM_LEAD_LABEL[o] }}</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-nome">Nome *</label>
            <input
              id="lead-nome"
              ref="nomeRef"
              v-model="form.nome"
              type="text"
              maxlength="160"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-empresa">Empresa *</label>
            <input
              id="lead-empresa"
              v-model="form.empresa"
              type="text"
              maxlength="160"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-cargo">Cargo</label>
            <input
              id="lead-cargo"
              v-model="form.cargo"
              type="text"
              maxlength="120"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-cidade">Cidade/UF</label>
            <input
              id="lead-cidade"
              v-model="form.cidade_uf"
              type="text"
              maxlength="80"
              placeholder="São Paulo / SP"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-email">E-mail</label>
            <input
              id="lead-email"
              v-model="form.email"
              type="email"
              maxlength="160"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-telefone">Telefone</label>
            <input
              id="lead-telefone"
              v-model="form.telefone"
              type="text"
              maxlength="40"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-linkedin">URL LinkedIn</label>
            <input
              id="lead-linkedin"
              v-model="form.linkedin_url"
              type="url"
              maxlength="255"
              :placeholder="form.origem === 'linkedin' ? 'https://www.linkedin.com/in/...' : ''"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400" for="lead-obs">Observação</label>
            <textarea
              id="lead-obs"
              v-model="form.observacao"
              rows="3"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="salvando"
            ></textarea>
          </div>
        </div>

        <p v-if="erro" class="mt-3 text-xs text-red-600">{{ erro }}</p>
        <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Será registrado em <span class="font-semibold">{{ agora }}</span> por
          <span class="font-semibold">{{ nomeUsuario }}</span>
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-gray-200"
            :disabled="salvando"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="salvando || !formValido"
            @click="salvar"
          >
            {{ salvando ? 'Salvando...' : 'Cadastrar' }}
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { toast } from 'vue3-toastify'
import Modal from '@/components/ui/Modal.vue'
import { crmService } from '@/services/crm'
import {
  ORIGEM_LEAD_LABEL,
  ORIGENS_LEAD,
  PRODUTO_LEAD_LABEL,
  PRODUTOS_LEAD,
  type CrmLead,
  type OrigemLead,
  type ProdutoLead,
} from '../model/crm.types'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'criado', lead: CrmLead): void
}>()

interface LoginState {
  data?: { nome?: string; name?: string }
}

const store = useStore()
const salvando = ref(false)
const erro = ref('')
const nomeRef = ref<HTMLInputElement | null>(null)
const agora = ref(new Date().toLocaleString('pt-BR'))

const form = reactive({
  produto: 'jobblive' as ProdutoLead,
  origem: 'contact_out' as OrigemLead,
  nome: '',
  empresa: '',
  cargo: '',
  email: '',
  telefone: '',
  linkedin_url: '',
  cidade_uf: '',
  observacao: '',
})

const nomeUsuario = computed(() => {
  const login = (store.state as { Login?: LoginState }).Login
  return login?.data?.nome || login?.data?.name || 'usuário logado'
})

const formValido = computed(
  () => form.nome.trim().length > 0 && form.empresa.trim().length > 0 && !!form.produto && !!form.origem,
)

const salvar = async () => {
  erro.value = ''
  if (!formValido.value) {
    erro.value = 'Preencha produto, origem, nome e empresa.'
    return
  }
  salvando.value = true
  try {
    const lead = await crmService.leadsCriar({
      produto: form.produto,
      origem: form.origem,
      nome: form.nome.trim(),
      empresa: form.empresa.trim(),
      cargo: form.cargo.trim() || null,
      email: form.email.trim() || null,
      telefone: form.telefone.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      cidade_uf: form.cidade_uf.trim() || null,
      observacao: form.observacao.trim() || null,
    })
    toast.success('Lead cadastrado')
    emit('criado', lead)
  } catch {
    erro.value = 'Não foi possível cadastrar. Tente novamente.'
  } finally {
    salvando.value = false
  }
}

onMounted(() => {
  nomeRef.value?.focus()
})
</script>
