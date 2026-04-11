<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 class="mb-3 text-lg font-semibold">Criar ticket</h2>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div class="relative">
            <input
              v-model="clienteBusca"
              class="w-full rounded-lg border px-3 py-2"
              placeholder="Pesquisar cliente (nome, email ou ID)"
              @input="buscarClientes"
            />
            <div
              v-if="clientes.length > 0"
              class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-white shadow"
            >
              <button
                v-for="item in clientes"
                :key="item.id_cliente"
                type="button"
                class="block w-full border-b px-3 py-2 text-left text-sm hover:bg-gray-50"
                @click="selecionarCliente(item)"
              >
                #{{ item.id_cliente }} - {{ item.nome }}
              </button>
            </div>
          </div>
          <input v-model="form.email_contato" class="rounded-lg border px-3 py-2" placeholder="Email de contato" />
          <input v-model="form.assunto" class="rounded-lg border px-3 py-2" placeholder="Assunto" />
          <select v-model="form.id_prioridade" class="rounded-lg border px-3 py-2">
            <option value="">Prioridade</option>
            <option v-for="item in meta.prioridades" :key="item.id" :value="item.id">{{ item.nome }}</option>
          </select>
          <select v-model="form.id_categoria" class="rounded-lg border px-3 py-2">
            <option value="">Categoria</option>
            <option v-for="item in meta.categorias" :key="item.id" :value="item.id">{{ item.nome }}</option>
          </select>
        </div>

        <textarea
          v-model="form.descricao"
          rows="5"
          class="mt-3 w-full rounded-lg border p-3"
          placeholder="Descrição completa"
        />

        <div class="mt-3 flex gap-2">
          <button class="rounded bg-gray-700 px-3 py-2 text-white" @click="salvar">Salvar ticket</button>
          <router-link to="/admin/tickets" class="rounded bg-gray-200 px-3 py-2 text-gray-800">Cancelar</router-link>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ticketsAdminService } from '@/services/tickets-admin'
import { clienteService } from '@/services/cliente'

const router = useRouter()
const meta = reactive({ prioridades: [], categorias: [] } as any)
const clientes = ref<any[]>([])
const clienteBusca = ref('')
const clienteSelecionado = ref<any>(null)

const form = reactive({
  id_cliente: '',
  assunto: '',
  descricao: '',
  email_contato: '',
  id_prioridade: '',
  id_categoria: '',
})

let buscaTimer: number | undefined
const buscarClientes = () => {
  if (buscaTimer) window.clearTimeout(buscaTimer)
  buscaTimer = window.setTimeout(async () => {
    const termo = clienteBusca.value.trim()
    if (!termo) {
      clientes.value = []
      return
    }
    const { data } = await clienteService.autocomplete(termo)
    clientes.value = data || []
  }, 250)
}

const selecionarCliente = async (item: any) => {
  clienteSelecionado.value = item
  clienteBusca.value = `#${item.id_cliente} - ${item.nome}`
  form.id_cliente = item.id_cliente
  clientes.value = []

  const resp = await clienteService.listarId(item.id_cliente)
  form.email_contato = resp.data?.email || form.email_contato
}

const salvar = async () => {
  await ticketsAdminService.criar({
    id_cliente: Number(form.id_cliente),
    assunto: form.assunto,
    descricao: form.descricao,
    email_contato: form.email_contato,
    id_prioridade: Number(form.id_prioridade),
    id_categoria: form.id_categoria ? Number(form.id_categoria) : null,
  })
  router.push('/admin/tickets')
}

onMounted(async () => {
  const { data } = await ticketsAdminService.meta()
  meta.prioridades = data.prioridades || []
  meta.categorias = data.categorias || []
})
</script>
