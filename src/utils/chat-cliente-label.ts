import type { ChatConversaRow } from '@/services/chat'

export function displayClienteNome(c: Pick<ChatConversaRow, 'nome_usuario' | 'id_usuario_externo'>): string {
  const nome = String(c.nome_usuario || '').trim()
  if (nome) {
    return nome
  }
  const id = Number(c.id_usuario_externo)
  if (id > 0) {
    return `Usuário #${id}`
  }
  return 'Cliente em teste'
}

export function displayClienteSubtitulo(
  c: Pick<ChatConversaRow, 'email' | 'unidade_nome' | 'unidade_dbname' | 'id_usuario_externo'>,
): string {
  const email = String(c.email || '').trim()
  if (email) {
    return email
  }
  const unidade = String(c.unidade_nome || c.unidade_dbname || '').trim()
  if (unidade) {
    return unidade
  }
  return '—'
}

export function displayClienteNomeFromLobby(payload: {
  nome_usuario?: unknown
  id_usuario_externo?: unknown
  unidade_nome?: unknown
}): string {
  const nome = String(payload.nome_usuario || '').trim()
  if (nome) {
    return nome
  }
  const unidade = String(payload.unidade_nome || '').trim()
  if (unidade) {
    return unidade
  }
  const id = Number(payload.id_usuario_externo)
  if (id > 0) {
    return `Usuário #${id}`
  }
  return 'Cliente em teste'
}
