export type TipoEtapa = 'aberto' | 'ganho' | 'perdido'

export const TIPO_ETAPA_LABEL: Record<TipoEtapa, string> = {
  aberto: 'Aberto',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

export const QTD_FUNC_LABEL: Record<string, string> = {
  '1a2': '1 a 2',
  '3a5': '3 a 5',
  '6a10': '6 a 10',
  acima10: 'Acima de 10',
}

export interface FunilEtapa {
  id: number
  id_funil: number
  nome: string
  probabilidade: number
  tipo: TipoEtapa
  ordem: number
}

export interface Funil {
  id: number
  nome: string
  padrao: boolean
  ativo: boolean
  ordem: number
  oportunidades_count?: number
  etapas: FunilEtapa[]
}

export interface FunilPayload {
  nome: string
  padrao: boolean
  ativo: boolean
  ordem?: number
}

export interface EtapaPayload {
  nome: string
  probabilidade: number
  tipo: TipoEtapa
}

export interface OportunidadeEtapa {
  id: number
  nome: string
  tipo: TipoEtapa
  probabilidade: number
}

export interface Oportunidade {
  id: number
  id_funil: number
  id_etapa: number
  id_cliente: number | null
  id_usuario_responsavel: number | null
  nome: string
  contato: string | null
  email: string | null
  telefone: string | null
  uf: string | null
  qtd_funcionarios: string | null
  interesse: string | null
  codigo_promocao: string | null
  tag: string | null
  tipo_jobb?: string | null
  descricao: string | null
  valor: number
  motivo_perda: string | null
  data_fechamento: string | null
  ordem: number
  etapa_atualizada_em: string | null
  created_at?: string | null
  brevo_id?: string | null
  nome_responsavel?: string | null
  etapa?: OportunidadeEtapa | null
}

export interface OportunidadeMeta {
  motivos_perda: Record<string, string>
  tags: Record<string, string>
  qtd_funcionarios: string[]
}

export interface OportunidadePayload {
  nome: string
  id_funil: number
  id_etapa: number
  id_cliente: number | null
  id_usuario_responsavel: number | null
  contato: string | null
  email: string | null
  telefone: string | null
  uf: string | null
  qtd_funcionarios: string | null
  interesse: string | null
  codigo_promocao: string | null
  tag: string | null
  descricao: string | null
  valor: number | null
  motivo_perda: string | null
  data_fechamento: string | null
}

export interface OportunidadeLista {
  data: Oportunidade[]
  total: number
  current_page?: number
  last_page?: number
  per_page?: number
}

export interface OportunidadeFiltro {
  id_funil?: number
  id_etapa?: number | ''
  id_usuario_responsavel?: number | ''
  q?: string
  modo?: 'quadro' | 'lista'
  page?: number
  per_page?: number
}

export interface ReordenarColuna {
  id_etapa: number
  ids: number[]
}

export interface WhatsappLinha {
  id: string
  nome: string
  telefone: string
}

export interface MensagemModelo {
  id: number
  tema: 'cadastro_sem_resposta' | 'pos_apresentacao' | 'pos_proposta'
  titulo: string
  texto: string
  ordem?: number
  ativo?: boolean
}

export interface MensagemModeloPayload {
  tema: MensagemModelo['tema']
  titulo: string
  texto: string
  ativo: boolean
}

export interface MensagemModeloGestao {
  temas: Record<string, string>
  modelos: MensagemModelo[]
}

export const badgeTipoJobb = (tipo: string | null | undefined): { label: 'Video' | 'Live'; classe: string } | null => {
  const valor = (tipo || '').toUpperCase()
  if (valor === 'JOBBLIVE' || valor === 'JLIVE' || valor === 'JLIVE3') {
    return { label: 'Live', classe: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' }
  }
  if (valor === 'V' || valor === 'J03' || valor === 'J04' || valor === '40' || valor === '30') {
    return { label: 'Video', classe: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' }
  }
  return null
}

export const TEMA_MENSAGEM: Record<MensagemModelo['tema'], string> = {
  cadastro_sem_resposta: 'Cadastrou e não respondeu',
  pos_apresentacao: 'Depois da apresentação',
  pos_proposta: 'Proposta enviada',
}

export interface UsuarioAdmin {
  id_usuarios: number
  nome: string
}

export interface OportunidadeEmpresa {
  id: string
  nome: string
  id_cliente?: number | null
}

export interface ClienteVinculo {
  id_cliente: number
  nome: string
  email: string
  telefone: string
}

export interface OportunidadeContato {
  id: string
  nome: string
  email: string
  telefone: string
}

export interface OportunidadeEvento {
  id: string
  tipo: 'tarefa' | 'nota' | 'etapa' | 'criada' | 'whatsapp'
  titulo: string
  texto: string
  quando: string
  autor: string
  feito: boolean
  prazo: string
}

export interface OportunidadePainel {
  vinculado: boolean
  erro: string | null
  empresas: OportunidadeEmpresa[]
  contatos: OportunidadeContato[]
  proximas: OportunidadeEvento[]
  timeline: OportunidadeEvento[]
}

export interface OportunidadeDetalhe {
  oportunidade: Oportunidade
  etapas: FunilEtapa[]
  cliente: ClienteVinculo | null
}

export const brl = (valor: number | null | undefined): string =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const mensagemApi = (err: unknown, fallback: string): string => {
  const ax = err as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } }
  }
  const errors = ax.response?.data?.errors
  if (errors) {
    const first = Object.values(errors)[0]
    if (first && first[0]) return first[0]
  }
  return ax.response?.data?.message || fallback
}
