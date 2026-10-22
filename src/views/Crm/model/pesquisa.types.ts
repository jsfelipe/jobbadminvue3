export type PesquisaStatus = 'pending' | 'responded' | 'snoozed' | 'declined'
export type NpsFaixa = 'detrator' | 'neutro' | 'promotor'
export type FrequenciaUso = 'diariamente' | 'algumas_vezes_semana' | 'semanalmente' | 'raramente'
export type InteresseComercial = 'interesse' | 'nao' | 'contratar' | 'valores'
export type InteresseTipo = 'treinamento' | 'integracao' | 'dashboard'
export type ModuloJobb =
  | 'orcamentos'
  | 'financeiro'
  | 'tarefas'
  | 'campanhas'
  | 'equipamentos'
  | 'relatorios'
  | 'cadastros'
export type DificuldadePesquisa =
  | 'orcar'
  | 'financeiro'
  | 'tarefas'
  | 'relatorios'
  | 'integracoes'
  | 'usabilidade'
  | 'lentidao'
  | 'nenhuma'
export type ServicoDesejado =
  | 'app_mobile'
  | 'mais_relatorios'
  | 'ia'
  | 'assinatura_digital'
  | 'importacoes'
  | 'estoque'
  | 'portal_fornecedor'
  | 'app_cliente'
  | 'outro'
export type SistemaIntegracao =
  | 'omie'
  | 'conta_azul'
  | 'excel'
  | 'erp_proprio'
  | 'clicksign'
  | 'google_drive'
  | 'outro'
export type SimNao = 'sim' | 'nao'
export type CanalAtendimento = 'chat' | 'ticket' | 'whatsapp'
export type DimensaoAtendimento = 'educacao' | 'tempo' | 'resolucao'

export const NPS_FAIXAS: NpsFaixa[] = ['promotor', 'neutro', 'detrator']
export const FREQUENCIAS: FrequenciaUso[] = [
  'diariamente',
  'algumas_vezes_semana',
  'semanalmente',
  'raramente',
]
export const INTERESSES: InteresseComercial[] = ['interesse', 'nao']
export const INTERESSE_TIPOS: InteresseTipo[] = ['treinamento', 'integracao', 'dashboard']
export const MODULOS: ModuloJobb[] = [
  'orcamentos',
  'financeiro',
  'tarefas',
  'campanhas',
  'equipamentos',
  'relatorios',
  'cadastros',
]
export const DIFICULDADES: DificuldadePesquisa[] = [
  'orcar',
  'financeiro',
  'tarefas',
  'relatorios',
  'integracoes',
  'usabilidade',
  'lentidao',
  'nenhuma',
]
export const SERVICOS: ServicoDesejado[] = [
  'app_mobile',
  'mais_relatorios',
  'ia',
  'assinatura_digital',
  'importacoes',
  'estoque',
  'portal_fornecedor',
  'app_cliente',
  'outro',
]
export const SISTEMAS: SistemaIntegracao[] = [
  'omie',
  'conta_azul',
  'excel',
  'erp_proprio',
  'clicksign',
  'google_drive',
  'outro',
]
export const CANAIS_ATENDIMENTO: CanalAtendimento[] = ['ticket', 'whatsapp', 'chat']
export const DIMENSOES_ATENDIMENTO: DimensaoAtendimento[] = ['educacao', 'tempo', 'resolucao']

export const NPS_FAIXA_LABEL: Record<NpsFaixa, string> = {
  promotor: 'Promotor (9–10)',
  neutro: 'Neutro (7–8)',
  detrator: 'Detrator (0–6)',
}
export const FREQUENCIA_LABEL: Record<FrequenciaUso, string> = {
  diariamente: 'Diariamente',
  algumas_vezes_semana: 'Algumas vezes por semana',
  semanalmente: 'Semanalmente',
  raramente: 'Raramente',
}
export const INTERESSE_LABEL: Record<InteresseComercial, string> = {
  interesse: 'Tenho interesse',
  nao: 'Não agora',
  contratar: 'Tenho interesse',
  valores: 'Tenho interesse',
}
export const INTERESSE_TIPO_LABEL: Record<InteresseTipo, string> = {
  treinamento: 'Treinamento',
  integracao: 'Integração',
  dashboard: 'Dashboard',
}
export const MODULO_LABEL: Record<ModuloJobb, string> = {
  orcamentos: 'Orçamentos',
  financeiro: 'Financeiro',
  tarefas: 'Tarefas / Projetos',
  campanhas: 'Campanhas',
  equipamentos: 'Equipamentos',
  relatorios: 'Relatórios',
  cadastros: 'Cadastros',
}
export const DIFICULDADE_LABEL: Record<DificuldadePesquisa, string> = {
  orcar: 'Orçar jobs',
  financeiro: 'Controlar financeiro',
  tarefas: 'Acompanhar tarefas',
  relatorios: 'Extrair relatórios',
  integracoes: 'Integrações',
  usabilidade: 'Usabilidade',
  lentidao: 'Lentidão',
  nenhuma: 'Nenhuma',
}
export const SERVICO_LABEL: Record<ServicoDesejado, string> = {
  app_mobile: 'App mobile nativo',
  mais_relatorios: 'Mais relatórios / dashboards',
  ia: 'Mais serviços com IA',
  assinatura_digital: 'Assinatura digital',
  importacoes: 'Importações',
  estoque: 'Controle de estoque',
  portal_fornecedor: 'Portal do fornecedor',
  app_cliente: 'App do cliente',
  outro: 'Outro',
}
export const SISTEMA_LABEL: Record<SistemaIntegracao, string> = {
  omie: 'Omie',
  conta_azul: 'Conta Azul',
  excel: 'Excel / planilha',
  erp_proprio: 'ERP próprio',
  clicksign: 'ClickSign / D4Sign',
  google_drive: 'Google Drive',
  outro: 'Outro',
}
export const SIM_NAO_LABEL: Record<SimNao, string> = {
  sim: 'Sim',
  nao: 'Não',
}
export const CANAL_ATENDIMENTO_LABEL: Record<CanalAtendimento, string> = {
  ticket: 'Ticket / chamados',
  whatsapp: 'WhatsApp',
  chat: 'Chat/Bot',
}
export const DIMENSAO_ATENDIMENTO_LABEL: Record<DimensaoAtendimento, string> = {
  educacao: 'Educação',
  tempo: 'Tempo de resposta',
  resolucao: 'Resolução',
}

export interface PesquisaResumoKpis {
  respostas: number
  recusas: number
  nps: number
  csat: number
  promotores: number
  neutros: number
  detratores: number
  pct_treinamento: number
  pct_integracao: number
  pct_dashboard: number
  interesse_treinamento: number
  interesse_integracao: number
  interesse_dashboard: number
  atendimento_usou: number
  atendimento_nao: number
  atendimento_nivel2: number
  pct_atendimento: number
  n1_media: number
  n2_media: number
}

export interface PesquisaResumo {
  periodo: { data_inicio: string; data_fim: string }
  pesquisa_codigo: string
  kpis: PesquisaResumoKpis
  nps_histograma: Record<string, number> | number[]
  csat_histograma: Record<string, number> | number[]
  frequencia_uso: Record<FrequenciaUso, number>
  modulos_usados: Record<ModuloJobb, number>
  dificuldades: Record<DificuldadePesquisa, number>
  servicos_desejados: Record<ServicoDesejado, number>
  treinamento_interesse: Record<InteresseComercial, number>
  integracao_interesse: Record<InteresseComercial, number>
  dashboard_interesse: Record<InteresseComercial, number>
  integracao_sistemas: Record<SistemaIntegracao, number>
  atendimento_canais: Record<CanalAtendimento, number>
  atendimento_n1: Record<DimensaoAtendimento, number>
  atendimento_n2: Record<DimensaoAtendimento, number>
}

export interface PesquisaResposta {
  id: number
  pesquisa_codigo: string
  id_cliente: number
  id_usuario_externo: number
  id_empresa_origem: number | null
  dominio: string | null
  nome_cliente: string | null
  nome_usuario: string | null
  email: string | null
  status: PesquisaStatus
  snooze_until: string | null
  answered_at: string | null
  declined_at: string | null
  nps: number | null
  nps_faixa: NpsFaixa | null
  csat: number | null
  frequencia_uso: FrequenciaUso | null
  treinamento_interesse: InteresseComercial | null
  integracao_interesse: InteresseComercial | null
  dashboard_interesse: InteresseComercial | null
  integracao_sistemas: SistemaIntegracao[]
  modulos_usados: ModuloJobb[]
  dificuldades: DificuldadePesquisa[]
  servicos_desejados: ServicoDesejado[]
  servico_outro: string | null
  servicos_sugestoes: Partial<Record<ServicoDesejado, string>>
  integracao_outro: string | null
  comentario: string | null
  atendimento_usou: SimNao | null
  atendimento_canais: CanalAtendimento[]
  n1_educacao: number | null
  n1_tempo: number | null
  n1_resolucao: number | null
  atendimento_nivel2: SimNao | null
  n2_educacao: number | null
  n2_tempo: number | null
  n2_resolucao: number | null
  created_at: string
  updated_at: string
}

export interface PesquisaListFiltro {
  data_inicio?: string
  data_fim?: string
  status?: PesquisaStatus | 'todos'
  nps_faixa?: NpsFaixa | ''
  interesse?: InteresseTipo | ''
  id_cliente?: number
  oportunidades?: number
  q?: string
  page?: number
  per_page?: number
}

export function histAt(mapa: Record<string, number> | number[] | undefined, key: number): number {
  if (!mapa) return 0
  if (Array.isArray(mapa)) {
    return Number(mapa[key] ?? 0)
  }
  return Number(mapa[String(key)] ?? 0)
}

export function npsFaixaClass(faixa: NpsFaixa | null): string {
  if (faixa === 'promotor') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
  if (faixa === 'neutro') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100'
  if (faixa === 'detrator') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
}

export function interesseClass(valor: InteresseComercial | null): string {
  if (valor === 'interesse' || valor === 'contratar' || valor === 'valores') {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
}
