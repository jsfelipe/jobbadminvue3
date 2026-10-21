export type TipoFila = 'risco_abandono' | 'atraso_pagamento' | 'teste_expirado'

export const TIPOS_FILA: TipoFila[] = ['risco_abandono', 'atraso_pagamento', 'teste_expirado']

export const FILA_LABEL: Record<TipoFila, string> = {
  risco_abandono: 'Risco de abandono',
  atraso_pagamento: 'Atraso de pagamento',
  teste_expirado: 'Teste > 3 meses',
}

export interface UltimoContato {
  data: string
  usuario: string | null
  tipo_fila: TipoFila
}

export type StatusCaso = 'pendente' | 'aguardando_retorno' | 'em_atendimento' | 'resolvido' | 'encerrado'
export type StatusRegistro = Exclude<StatusCaso, 'pendente'>

export const STATUS_CASO: StatusCaso[] = ['pendente', 'aguardando_retorno', 'em_atendimento', 'resolvido', 'encerrado']
export const STATUS_REGISTRO: StatusRegistro[] = ['aguardando_retorno', 'em_atendimento', 'resolvido', 'encerrado']

export const RESOLVIDO_LABEL: Record<TipoFila, string> = {
  risco_abandono: 'Voltou a usar',
  atraso_pagamento: 'Pagou',
  teste_expirado: 'Converteu',
}

export const statusLabel = (status: StatusCaso, tipo: TipoFila): string => {
  if (status === 'pendente') return 'Pendentes'
  if (status === 'aguardando_retorno') return 'Aguardando retorno'
  if (status === 'em_atendimento') return 'Em atendimento'
  if (status === 'resolvido') return RESOLVIDO_LABEL[tipo]
  return 'Encerrado'
}

export type MotivoEncerramento = 'sem_interesse' | 'nao_contatar' | 'sem_retorno' | 'contato_invalido' | 'outro'

export const MOTIVOS_ENCERRAMENTO: MotivoEncerramento[] = [
  'sem_interesse',
  'nao_contatar',
  'sem_retorno',
  'contato_invalido',
  'outro',
]

export const MOTIVO_ENCERRAMENTO_LABEL: Record<MotivoEncerramento, string> = {
  sem_interesse: 'Sem interesse',
  nao_contatar: 'Pediu para não contatar',
  sem_retorno: 'Sem retorno após tentativas',
  contato_invalido: 'Contato inválido',
  outro: 'Outro',
}

export interface CasoInfo {
  id: number
  status: StatusCaso
  prazo_retorno: string | null
  tentativas: number
  sem_retorno: boolean
  motivo_encerramento: MotivoEncerramento | null
  fora_criterio: boolean
  fechado_em: string | null
  updated_at: string | null
}

export interface ClienteFila {
  id_cliente: number
  nome: string
  telefone: string | null
  email: string | null
  dominio: string | null
  db_name?: string | null
  vencimento: string | null
  ultimo_acesso: string | null
  responsavel: string | null
  ultimo_contato?: UltimoContato | null
  caso?: CasoInfo | null
}

export type FilaPorStatus = Record<StatusCaso, ClienteFila[]>

export type ContagemFila = Record<StatusCaso, number> & { sem_retorno: number }

export interface CrmFilasResponse {
  filas: Record<TipoFila, FilaPorStatus>
  contagens: Record<TipoFila, ContagemFila>
  prazo_retorno_padrao: string
  prazo_retorno_dias_uteis: number
}

export interface CrmAtendimento {
  id: number
  id_cliente: number
  tipo_fila: TipoFila
  id_caso?: number | null
  status_anterior?: StatusCaso | null
  status_novo?: StatusCaso | null
  descricao: string
  id_usuario: number | null
  nome_usuario: string | null
  created_at: string
  nome_cliente?: string | null
  dominio?: string | null
}

export interface ContadorFila {
  total: number
  meus: number
}

export interface CrmContadores {
  hoje: {
    total: number
    meus: number
    por_fila: Record<TipoFila, ContadorFila>
  }
}

export interface RegistrarContatoPayload {
  id_cliente: number
  tipo_fila: TipoFila
  descricao: string
  status: StatusRegistro
  prazo_retorno?: string | null
  motivo_encerramento?: MotivoEncerramento | null
}

export interface CrmCasoRaw {
  id: number
  id_cliente: number
  tipo_fila: TipoFila
  status: StatusCaso
}

export type CrmAtendimentoRegistrado = CrmAtendimento & { caso: CrmCasoRaw }

export interface HistoricoFiltro {
  data_inicio?: string
  data_fim?: string
  tipo_fila?: TipoFila | ''
  id_usuario?: number | ''
  id_cliente?: number | ''
  per_page?: number
  page?: number
}

export interface Paginated<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
}

export type ProdutoLead = 'jobblive' | 'jobbvideo'
export type OrigemLead = 'contact_out' | 'linkedin'
export type BucketMetaLead = ProdutoLead | 'linkedin'

export const PRODUTOS_LEAD: ProdutoLead[] = ['jobblive', 'jobbvideo']
export const ORIGENS_LEAD: OrigemLead[] = ['contact_out', 'linkedin']
export const BUCKETS_META_LEAD: BucketMetaLead[] = ['jobblive', 'jobbvideo', 'linkedin']

export const PRODUTO_LEAD_LABEL: Record<ProdutoLead, string> = {
  jobblive: 'JobbLive',
  jobbvideo: 'JobbVideo',
}

export const ORIGEM_LEAD_LABEL: Record<OrigemLead, string> = {
  contact_out: 'Contact Out',
  linkedin: 'LinkedIn',
}

export const BUCKET_META_LABEL: Record<BucketMetaLead, string> = {
  jobblive: 'JobbLive',
  jobbvideo: 'JobbVideo',
  linkedin: 'LinkedIn',
}

export interface CrmLead {
  id: number
  produto: ProdutoLead
  origem: OrigemLead
  nome: string
  empresa: string
  cargo: string | null
  email: string | null
  telefone: string | null
  linkedin_url: string | null
  cidade_uf: string | null
  observacao: string | null
  pagina: number | null
  palavra_chave: string | null
  id_usuario: number | null
  nome_usuario: string | null
  created_at: string
}

export interface CrmLeadBucketMeta {
  meta_diaria: number
  dias_uteis: number
  meta_acumulada: number
  feitos: number
  pendente: number
  feitos_hoje: number
}

export interface CrmLeadMetas {
  meta_inicio: string
  hoje: string
  buckets: Record<BucketMetaLead, CrmLeadBucketMeta>
}

export interface CriarLeadPayload {
  produto: ProdutoLead
  origem: OrigemLead
  nome: string
  empresa: string
  cargo?: string | null
  email?: string | null
  telefone?: string | null
  linkedin_url?: string | null
  cidade_uf?: string | null
  observacao?: string | null
  pagina?: number | null
  palavra_chave?: string | null
}

export interface CrmLeadImportStart {
  job_id: string
  status: string
  message?: string
}

export interface CrmLeadImportProgress {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_found' | string
  total: number
  processed: number
  percentage: number
  importados: number
  duplicados: number
  ignorados: number
  erros: string[]
  message: string
}

/** @deprecated use CrmLeadImportProgress */
export type CrmLeadImportResult = CrmLeadImportProgress

export interface LeadsFiltro {
  data_inicio?: string
  data_fim?: string
  produto?: ProdutoLead | ''
  origem?: OrigemLead | ''
  id_usuario?: number | ''
  q?: string
  per_page?: number
  page?: number
}

export type AbaCrm = TipoFila | 'novas_leads'

export interface CrmRelatorioFiltro {
  data_inicio?: string
  data_fim?: string
  tipo_fila?: TipoFila | ''
  page?: number
  page_casos?: number
  per_page?: number
}

export interface CrmRelatorioKpis {
  atendimentos: number
  clientes_unicos: number
  resolvidos: number
  encerrados: number
  leads: number
  taxa_desfecho: number
}

export interface CrmRelatorioSerieDia {
  data: string
  total: number
}

export interface CrmRelatorioFunilFila {
  atendimentos: number
  resolvidos: number
  encerrados: number
}

export type CategoriaAnaliseTexto =
  | 'whatsapp'
  | 'ligacao'
  | 'email'
  | 'cliente_respondeu'
  | 'prometeu_pagar'
  | 'sem_retorno'
  | 'sem_interesse'
  | 'acesso'

export const CATEGORIA_ANALISE: CategoriaAnaliseTexto[] = [
  'whatsapp',
  'ligacao',
  'email',
  'cliente_respondeu',
  'prometeu_pagar',
  'sem_retorno',
  'sem_interesse',
  'acesso',
]

export const CATEGORIA_ANALISE_LABEL: Record<CategoriaAnaliseTexto, string> = {
  whatsapp: 'WhatsApp',
  ligacao: 'Ligação',
  email: 'E-mail',
  cliente_respondeu: 'Cliente respondeu',
  prometeu_pagar: 'Prometeu pagar',
  sem_retorno: 'Sem retorno',
  sem_interesse: 'Sem interesse',
  acesso: 'Acesso / produto',
}

export interface CrmRelatorioCasoTentativa {
  id: number
  id_cliente: number
  tipo_fila: TipoFila
  status: StatusCaso
  tentativas: number
  sem_retorno: boolean
  prazo_retorno: string | null
  nome_cliente: string | null
  dominio: string | null
}

export interface CrmAnaliseTexto {
  categorias: Record<CategoriaAnaliseTexto, number>
  termos: Array<{ termo: string; total: number }>
  resumo: string | null
  ia_disponivel: boolean
}

export interface CrmRelatorioCasoFechado {
  id: number
  id_cliente: number
  tipo_fila: TipoFila
  status: StatusCaso
  motivo_encerramento: MotivoEncerramento | null
  tentativas: number
  fechado_em: string | null
  id_usuario_ultimo: number | null
  nome_usuario_ultimo: string | null
  nome_cliente: string | null
  dominio: string | null
}

export type CrmEstoqueCasos = Record<TipoFila, Record<StatusCaso, number>>

export interface CrmRelatorio {
  periodo: { data_inicio: string; data_fim: string }
  kpis: CrmRelatorioKpis
  serie_diaria: CrmRelatorioSerieDia[]
  por_fila: Record<TipoFila, number>
  funil_por_fila: Record<TipoFila, CrmRelatorioFunilFila>
  por_status_novo: Record<StatusRegistro, number>
  por_motivo: Record<MotivoEncerramento, number>
  estoque_casos: CrmEstoqueCasos
  casos_mais_tentativas: CrmRelatorioCasoTentativa[]
  analise_texto: CrmAnaliseTexto
  atendimentos: Paginated<CrmAtendimento>
  casos_fechados: Paginated<CrmRelatorioCasoFechado>
}
