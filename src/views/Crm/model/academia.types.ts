export type AcademiaEventoTipo =
  | 'page_view'
  | 'lesson_open'
  | 'chapter_click'
  | 'link_click'
  | 'video_play'
  | 'video_progress'
  | 'video_ended'
  | 'video_watch'

export type AcademiaAjudou = 'sim' | 'parcial' | 'nao'

export interface AcademiaResumo {
  visitantes: number
  aulas_abertas: number
  plays: number
  conclusoes: number
  taxa_conclusao: number
  feedbacks: number
  tempo_assistido: number
  ajudou: Record<AcademiaAjudou, number>
  top_aulas: AcademiaTopAula[]
  top_assuntos: AcademiaTopAssunto[]
}

export interface AcademiaTopAula {
  lesson_id: string
  lesson_title: string | null
  aberturas: number
  conclusoes: number
  tempo_segundos: number
}

export interface AcademiaTopAssunto {
  assunto: string
  total: number
}

export interface AcademiaEvento {
  id: number
  id_cliente: number
  id_usuario_externo: number
  dominio: string | null
  nome_cliente: string | null
  nome_usuario: string | null
  email: string | null
  tipo: AcademiaEventoTipo
  lesson_id: string | null
  lesson_title: string | null
  alvo: string | null
  progresso: number | null
  segundos: number | null
  created_at: string | null
}

export interface AcademiaFeedback {
  id: number
  id_cliente: number
  id_usuario_externo: number
  dominio: string | null
  nome_cliente: string | null
  nome_usuario: string | null
  email: string | null
  lesson_id: string | null
  lesson_title: string | null
  ajudou: AcademiaAjudou | null
  assunto_desejado: string | null
  comentario: string | null
  created_at: string | null
}

export interface AcademiaFiltro {
  data_inicio?: string
  data_fim?: string
  tipo?: AcademiaEventoTipo | ''
  ajudou?: AcademiaAjudou | ''
  lesson_id?: string
  q?: string
  page?: number
  per_page?: number
}

export const ACADEMIA_TIPO_LABEL: Record<AcademiaEventoTipo, string> = {
  page_view: 'Entrou',
  lesson_open: 'Abriu aula',
  chapter_click: 'Assunto',
  link_click: 'Link',
  video_play: 'Play',
  video_progress: 'Progresso',
  video_ended: 'Concluiu',
  video_watch: 'Assistiu',
}

export const ACADEMIA_AJUDOU_LABEL: Record<AcademiaAjudou, string> = {
  sim: 'Sim',
  parcial: 'Em parte',
  nao: 'Não',
}
