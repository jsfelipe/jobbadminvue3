import { api } from '@/services/http'

/** Perfil (tipo de usuário) retornado pela API */
export interface Perfil {
  id_usuario_tipo: number | string
  tipo?: string
  [key: string]: unknown
}

/** Resposta da API de listagem de perfis */
export interface PerfilListResponse {
  data: Perfil[]
}

/** Resposta genérica da API com msg e status */
export interface PerfilMutationResponse {
  status: boolean
  msg?: string
  id_usuario_tipo?: number | string
}

/**
 * Lista todos os perfis (tipos de usuário).
 * Compatível com Laravel 8 e Zend 1.
 */
export async function listarPerfis(): Promise<Perfil[]> {
  try {
    const response = await api.get<{ data: Perfil[] }>('/Perfil/get')
    const data = response.data?.data ?? response.data
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    return []
  }
}

/**
 * Exclui um perfil por id.
 */
export async function deletarPerfil(id_usuario_tipo: number | string): Promise<PerfilMutationResponse> {
  try {
    const response = await api.get<{ msg?: string }>(
      `/Perfil/delete/id_usuario_tipo/${id_usuario_tipo}`
    )
    return {
      status: true,
      msg: response.data?.msg,
    }
  } catch (result: unknown) {
    const err = result as { response?: { data?: { msg?: string } } }
    return {
      status: false,
      msg: err?.response?.data?.msg ?? 'Erro ao excluir',
    }
  }
}

/**
 * Insere um novo perfil.
 */
export async function inserirPerfil(parametro: Record<string, unknown>): Promise<PerfilMutationResponse> {
  try {
    const response = await api.post<{ msg?: string; id_usuario_tipo?: number | string }>(
      '/Perfil/post',
      parametro
    )
    return {
      status: true,
      msg: response.data?.msg,
      id_usuario_tipo: response.data?.id_usuario_tipo,
    }
  } catch (result: unknown) {
    const err = result as { response?: { data?: { msg?: string } } }
    return {
      status: false,
      msg: err?.response?.data?.msg ?? 'Erro ao cadastrar',
    }
  }
}

/**
 * Altera um perfil existente.
 */
export async function alterarPerfil(parametro: Record<string, unknown>): Promise<PerfilMutationResponse> {
  try {
    const response = await api.post<{ msg?: string }>('/Perfil/put', parametro)
    return {
      status: true,
      msg: response.data?.msg,
    }
  } catch (result: unknown) {
    const err = result as { response?: { data?: { msg?: string } } }
    return {
      status: false,
      msg: err?.response?.data?.msg ?? 'Erro ao alterar',
    }
  }
}
