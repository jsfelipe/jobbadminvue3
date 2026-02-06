/**
 * CKEditor 4 para a página Enviar Orçamento: proposta em HTML com upload de imagens (file-manager).
 * CKEditor 4 é carregado via CDN em index.html.
 */

import { api } from '@/services/http'

const CKEDITOR_IDS = {
  MODELO_CARTA: 'text_modelo_carta',
  TEXTO_EMAIL: 'text_email',
} as const

export { CKEDITOR_IDS }

export interface CKEditorSettings {
  width?: string
  height?: string | number
}

/**
 * Obtém o dbname para o path do file-manager (igual ao antigo: token/gethostname).
 */
async function getDbname(): Promise<string> {
  try {
    const res = await api.get('/token/gethostname/')
    const data = res?.data ?? res
    return data?.dbname ?? 'jobbbr'
  } catch {
    return 'jobbbr'
  }
}

/**
 * Configuração do CKEditor 4 com file-manager para imagens (browse + upload).
 */
export async function getCKEditorConfig(settings?: CKEditorSettings): Promise<Record<string, unknown>> {
  const dbname = await getDbname()
  const baseFileManager =
    typeof import.meta.env.VITE_API_V2 !== 'undefined' && import.meta.env.VITE_API_V2
      ? String(import.meta.env.VITE_API_V2).replace(/\/$/, '')
      : 'https://apiv2.sistemajobb.com.br'

  const CK = window.CKEDITOR
  const config: Record<string, unknown> = {
    filebrowserImageBrowseUrl: `${baseFileManager}/file-manager?leftPath=arquivos/${dbname}/images`,
    filebrowserUploadUrl: `${baseFileManager}/file-manager/upload`,
    autoParagraph: false,
    fillEmptyBlocks: false,
    enterMode: CK?.ENTER_BR ?? 2,
    shiftEnterMode: CK?.ENTER_P ?? 1,
    allowedContent: true,
  }
  if (settings?.width) config.width = settings.width
  if (settings?.height) config.height = settings.height
  return config
}

/**
 * Aguarda window.CKEDITOR estar disponível (script do index.html).
 */
function waitForCKEDITOR(): Promise<typeof window.CKEDITOR> {
  return new Promise((resolve) => {
    if (window.CKEDITOR) {
      resolve(window.CKEDITOR)
      return
    }
    const check = setInterval(() => {
      if (window.CKEDITOR) {
        clearInterval(check)
        resolve(window.CKEDITOR)
      }
    }, 50)
    setTimeout(() => {
      clearInterval(check)
      resolve(window.CKEDITOR!)
    }, 5000)
  })
}

/** Timeout em ms para aguardar o elemento aparecer no DOM. */
const WAIT_ELEMENT_MS = 8000

/**
 * Aguarda o elemento com o id existir no DOM e ser um textarea (válido para CK.replace).
 * Necessário quando o elemento está dentro de v-else / el-tabs e pode não estar visível no primeiro nextTick.
 */
function waitForElement(id: string): Promise<HTMLTextAreaElement> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = (): void => {
      const el = document.getElementById(id)
      if (el && el.tagName === 'TEXTAREA') {
        resolve(el as HTMLTextAreaElement)
        return
      }
      if (Date.now() - start >= WAIT_ELEMENT_MS) {
        reject(new Error(`CKEditor: elemento "#${id}" não encontrado no DOM dentro de ${WAIT_ELEMENT_MS}ms.`))
        return
      }
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  })
}

/**
 * Cria uma instância do CKEditor 4 no elemento com o id dado.
 * Aguarda o elemento existir no DOM (útil quando está dentro de v-else / el-tabs).
 */
export async function createCKEditorForEnviarOrcamento(
  id: string,
  settings?: CKEditorSettings
): Promise<void> {
  const CK = await waitForCKEDITOR()
  if (!CK) {
    console.error('CKEditor 4 não carregado. Verifique o script em index.html.')
    return
  }
  if (CK.instances[id]) {
    try {
      CK.instances[id].destroy(true)
    } catch {
      // ignore
    }
  }
  const element = await waitForElement(id)
  const config = await getCKEditorConfig(settings)
  CK.replace(element, config)
}

/**
 * Destrói as instâncias do CKEditor usadas na página Enviar Orçamento.
 */
export function destroyCKEditorEnviarOrcamento(): void {
  const CK = window.CKEDITOR
  if (!CK?.instances) return
  ;[CKEDITOR_IDS.MODELO_CARTA, CKEDITOR_IDS.TEXTO_EMAIL].forEach((id) => {
    if (CK.instances[id]) {
      try {
        CK.instances[id].destroy(true)
      } catch {
        // ignore
      }
    }
  });
}

/**
 * Retorna o HTML do editor (modelo carta ou texto email).
 */
export function getCKEditorData(id: string): string {
  const CK = window.CKEDITOR
  if (!CK?.instances?.[id]) return ''
  return CK.instances[id].getData()
}

/**
 * Define o HTML do editor.
 */
export function setCKEditorData(id: string, html: string): void {
  const CK = window.CKEDITOR
  if (!CK?.instances?.[id]) return
  CK.instances[id].setData(html ?? '')
}
