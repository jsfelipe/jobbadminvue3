import { api } from '@/services/http'

/** Resposta da API de redefinir senha (compatível Laravel/Zend). */
export interface RedefinirSenhaResponse {
  success?: boolean
  msg?: string
}

/**
 * Solicita o envio de uma nova senha por e-mail.
 * O e-mail informado deve estar cadastrado no usuário no domínio informado.
 * POST /auth/redefinir-senha
 */
export async function redefinirSenha(dominio: string, email: string): Promise<RedefinirSenhaResponse> {
  const response = await api.post<RedefinirSenhaResponse>('/auth/redefinir-senha', {
    dominio,
    email,
  })
  return response.data ?? {}
}
