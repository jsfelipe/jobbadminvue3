export interface TarefaTipo {
  id: number
  nome: string
}

export interface Tarefa {
  id: number
  id_tipo: number
  tipo: string
  nome: string
  notas: string
  vencimento: string
  lembrete_em: string | null
  prioridade: boolean
  feito: boolean
  id_oportunidade: number | null
  oportunidade: string | null
  id_cliente: number | null
  cliente: string | null
  contato_nome: string
  contato_email: string
  id_usuario: number | null
  nome_usuario: string
}

export interface TarefaContagens {
  todos: number
  atrasada: number
  hoje: number
  semana: number
}

export interface TarefaLista {
  items: Tarefa[]
  contagens: TarefaContagens
  page: number
  per_page: number
  total: number
}

export type FiltroTarefa = 'todos' | 'atrasada' | 'hoje' | 'semana'

export interface TarefaPayload {
  id_tipo: number
  nome: string
  notas: string | null
  vencimento: string
  lembrete_em: string | null
  prioridade: boolean
  id_oportunidade: number | null
  id_cliente: number | null
  contato_nome: string | null
  contato_email: string | null
  feito?: boolean
}

export interface OportunidadeBusca {
  id: number
  nome: string
  id_cliente: number | null
  contato: string | null
  email: string | null
  cliente: string | null
}

export interface ClienteBusca {
  id_cliente: number
  nome: string
}
