/**
 * CKEditor 5 para a página Enviar Orçamento: proposta em HTML com upload de imagens
 * via Laravel File Manager (S3). Usa Custom Upload Adapter.
 */

import { apiV2 } from '@/services/http'
import { createLaravelFileManagerUploadAdapter } from '@/components/Jobb/CKEditor5/LaravelFileManagerUploadAdapter'
import type { LaravelFileManagerAdapterConfig } from '@/components/Jobb/CKEditor5/LaravelFileManagerUploadAdapter'

const CKEDITOR5_IDS = {
  MODELO_CARTA: 'modelo_carta',
  TEXTO_EMAIL: 'texto_email',
} as const

export { CKEDITOR5_IDS }

let dbnameCache: string | null = null

async function getDbname(): Promise<string> {
  if (dbnameCache) return dbnameCache
  try {
    const { api } = await import('@/services/http')
    const res = await api.get('/token/gethostname/')
    const data = res?.data ?? res
    dbnameCache = data?.dbname ?? 'jobbbr'
    return dbnameCache
  } catch {
    dbnameCache = 'jobbbr'
    return dbnameCache
  }
}

/**
 * Retorna a URL base do file-manager (API V2 Laravel).
 * As rotas do pacote alexusmai são web (não api): /file-manager/content, /file-manager/upload, etc.
 * Se VITE_API_V2 terminar com /api, removemos para que as chamadas vão para /file-manager/* e não /api/file-manager/*.
 */
function getFileManagerBaseUrl(): string {
  const env = import.meta.env.VITE_API_V2
  const raw =
    typeof env !== 'undefined' ? String(env).replace(/\/$/, '') : 'https://apiv2.sistemajobb.com.br'
  let base = raw
  if (base.endsWith('/api')) base = base.replace(/\/api$/, '')
  return base
}

/** Base URL do bucket S3 (ex.: https://arquivos-jobbgestor.s3.amazonaws.com). */
function getS3BucketBaseUrl(): string {
  const bucket =
    typeof import.meta.env.VITE_APP_BUCKET_S3 !== 'undefined' && import.meta.env.VITE_APP_BUCKET_S3
      ? String(import.meta.env.VITE_APP_BUCKET_S3).replace(/\/$/, '')
      : ''
  return bucket
}

/**
 * Retorna a URL pública completa do arquivo no S3 (prefixo do bucket + path).
 * Ex.: path "arquivos/jobbtest/images/logo.jpg" → "https://bucket.s3.../arquivos/jobbtest/images/logo.jpg"
 */
export function getS3PublicUrl(path: string): string {
  const base = getS3BucketBaseUrl()
  if (!base) {
    throw new Error('VITE_APP_BUCKET_S3 não configurado para URLs do S3.')
  }
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${normalizedPath}`
}

/**
 * Configuração do Custom Upload Adapter para o Laravel File Manager (S3).
 * Usar no @ready do componente para registrar no FileRepository.
 */
export function getLaravelFileManagerAdapterConfig(): LaravelFileManagerAdapterConfig {
  const base = getFileManagerBaseUrl()
  const bucketBase = getS3BucketBaseUrl()
  return {
    uploadUrl: `${base}/file-manager/upload`,
    urlEndpoint: `${base}/file-manager/url`,
    disk: 's3',
    getUploadPath: async () => {
      const dbname = await getDbname()
      return `arquivos/${dbname}/images`
    },
    uploadRequest: (url: string, formData: FormData) =>
      apiV2.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }) as Promise<{ data?: { result?: { status?: string; message?: string } } }>,
    getRequest: (url: string) =>
      apiV2.get(url) as Promise<{ data?: { url?: string } }>,
    ...(bucketBase ? { buildS3PublicUrl: getS3PublicUrl } : {}),
  }
}

/**
 * Registra o Laravel File Manager como upload adapter no editor (chamar no @ready).
 */
export function attachLaravelFileManagerUploadAdapter(editor: {
  plugins: { get: (name: string) => unknown }
}): void {
  const fileRepository = editor.plugins.get('FileRepository') as {
    createUploadAdapter: (loader: { file: Promise<File | null> }) => unknown
  }
  if (fileRepository) {
    const config = getLaravelFileManagerAdapterConfig()
    fileRepository.createUploadAdapter = (loader: { file: Promise<File | null> }) =>
      createLaravelFileManagerUploadAdapter(loader, config)
  }
}

/** Path padrão de imagens no S3 (arquivos/{dbname}/images). */
export async function getImagesPath(): Promise<string> {
  const dbname = await getDbname()
  return `arquivos/${dbname}/images`
}

/**
 * URL para abrir o File Manager em popup (TinyMCE / CKEditor antigo).
 * Igual ao projeto antigo: base + /file-manager/tinymce5?leftPath=arquivos/dbname/images
 * O popup usa postMessage({ mceAction: 'insert', content: URL }) para devolver a URL.
 */
export async function getFileManagerTinymce5PopupUrl(): Promise<string> {
  const base = getFileManagerBaseUrl()
  const path = await getImagesPath()
  const leftPath = encodeURIComponent(path)
  const sep = base ? (base.endsWith('/') ? '' : '/') : ''
  return `${base}${sep}file-manager/tinymce5?leftPath=${leftPath}`
}

/** Item de arquivo/pasta retornado pelo endpoint content do file-manager (API usa basename, não name). */
export interface FileManagerItem {
  path: string
  /** Nome do arquivo/pasta; API retorna como basename */
  name?: string
  basename?: string
  dirname?: string
  filename?: string
  extension?: string
  type?: string
  time?: string
  timestamp?: number
}

export interface FileManagerContentResponse {
  result?: { status?: string }
  working_dir?: string
  files?: FileManagerItem[]
  directories?: FileManagerItem[]
}

/**
 * Lista arquivos e pastas em um path do file-manager (S3).
 * Útil para o seletor "Inserir imagem do servidor".
 */
export async function fetchFileManagerContent(path: string): Promise<FileManagerContentResponse> {
  const base = getFileManagerBaseUrl()
  const res = await apiV2.get<FileManagerContentResponse>(`${base}/file-manager/content`, {
    params: { disk: 's3', path },
  })
  const data = res?.data ?? res
  return data as FileManagerContentResponse
}

/**
 * Retorna a URL pública de um arquivo no S3.
 * Usa o prefixo completo do bucket (VITE_APP_BUCKET_S3 + path); se o bucket não estiver configurado, consulta a API.
 */
export async function getFileManagerFileUrl(filePath: string): Promise<string> {
  const bucketBase = getS3BucketBaseUrl()
  if (bucketBase) {
    const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
    return `${bucketBase}/${normalizedPath}`
  }
  const base = getFileManagerBaseUrl()
  const res = await apiV2.get<{ url?: string }>(`${base}/file-manager/url`, {
    params: { disk: 's3', path: filePath },
  })
  const data = res?.data ?? res
  const url = data?.url
  if (!url) throw new Error('URL não retornada.')
  return url
}

/**
 * URL para exibir a imagem (thumbnail ou original) no S3.
 * Usa o endereço completo do bucket (VITE_APP_BUCKET_S3 + path). Se o bucket não estiver configurado, usa o endpoint de thumbnails da API.
 */
export function getFileManagerThumbnailUrl(filePath: string): string {
  const bucketBase = getS3BucketBaseUrl()
  if (bucketBase) {
    const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
    return `${bucketBase}/${normalizedPath}`
  }
  const base = getFileManagerBaseUrl()
  const params = new URLSearchParams({ disk: 's3', path: filePath })
  return `${base}/file-manager/thumbnails?${params.toString()}`
}

/**
 * Faz upload de uma imagem para o Laravel File Manager e retorna a URL pública.
 * Usado pelo TipTap e por qualquer outro editor que precise enviar arquivo e obter URL.
 */
export async function uploadImageToFileManager(file: File): Promise<string> {
  const config = getLaravelFileManagerAdapterConfig()
  const loader = { file: Promise.resolve(file) }
  const adapter = createLaravelFileManagerUploadAdapter(loader, config)
  const result = await adapter.upload()
  return result.default
}

/**
 * Remove wrappers <figure class="table"> que o CKEditor 5 coloca em volta das tabelas.
 * Usar ao carregar HTML da API e ao emitir do editor para manter o visual do HTML original.
 */
export function stripFigureTableWrapper(html: string): string {
  if (!html || typeof html !== 'string') return html
  let s = html
  let prev = ''
  while (prev !== s) {
    prev = s
    s = s.replace(/<\/table>\s*<\/figure>/g, '</table>')
    s = s.replace(/<figure\s+(?=[^>]*class\s*=\s*["']table["'])[^>]*>\s*/gi, '')
  }
  while (s.includes('<figure class="table">') || s.includes("<figure class='table'>")) {
    s = s.replace(/<figure class="table">\s*/g, '').replace(/<figure class='table'>\s*/g, '')
  }
  return s
}
