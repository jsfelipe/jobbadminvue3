import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { clienteService } from '@/services/cliente'

/**
 * Verifica se o usuário logado pode acessar o cliente (perfil 1 ou é o responsável).
 * @param {object} userData - store.state.Login?.data
 * @param {object} clientData - dados do cliente (id_usuario_responsavel)
 * @returns {boolean}
 */
export function podeAcessarCliente(userData, clientData) {
  if (!clientData || !userData) return false
  const profile = userData.id_perfil ?? userData.id_usuario_tipo
  if (Number(profile) === 1) return true
  const userId = userData.id_usuarios
  return Number(clientData.id_usuario_responsavel) === Number(userId)
}

/**
 * Para rotas que recebem :id do cliente: busca o cliente, verifica acesso e redireciona se não permitido.
 * @param {import('vue').Ref<string>|import('vue').ComputedRef<string>} idRef - ref ou computed com o id do cliente (route.params.id)
 * @returns {{ loading: import('vue').Ref<boolean>, allowed: import('vue').Ref<boolean> }}
 */
export function useRequerClienteResponsavel(idRef) {
  const store = useStore()
  const router = useRouter()
  const loading = ref(true)
  const allowed = ref(false)

  async function check() {
    const id = idRef?.value ?? idRef
    if (!id) {
      loading.value = false
      return
    }
    loading.value = true
    allowed.value = false
    try {
      const res = await clienteService.listarId(id)
      const data = res.data || {}
      const userData = store.state.Login?.data || {}
      if (!podeAcessarCliente(userData, data)) {
        router.replace('/admin/clientes')
        return
      }
      allowed.value = true
    } catch {
      router.replace('/admin/clientes')
    } finally {
      loading.value = false
    }
  }

  watch(idRef, (val) => {
    if (val) check()
    else { loading.value = false; allowed.value = false }
  }, { immediate: true })

  return { loading, allowed }
}
