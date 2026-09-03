import type { ChatConversaRow } from '@/services/chat'

export type ChatSiteOrigem = 'jobbvideo' | 'jobblive' | null

export function resolveChatSiteOrigem(
  c: Pick<ChatConversaRow, 'unidade_sigla' | 'unidade_nome'>,
): ChatSiteOrigem {
  const sigla = String(c.unidade_sigla || '')
    .trim()
    .toUpperCase()
  if (sigla === 'JOBBLIVE') {
    return 'jobblive'
  }
  if (sigla === 'JOBBVIDEO' || sigla === 'SITE') {
    return 'jobbvideo'
  }
  const nome = String(c.unidade_nome || '')
    .trim()
    .toLowerCase()
  if (nome.includes('jobblive')) {
    return 'jobblive'
  }
  if (nome.includes('jobbvideo') || nome === 'site jobb') {
    return 'jobbvideo'
  }
  return null
}

export function chatSiteOrigemLabel(origem: ChatSiteOrigem): string {
  if (origem === 'jobblive') {
    return 'JobbLive'
  }
  if (origem === 'jobbvideo') {
    return 'JobbVideo'
  }
  return ''
}

/** Laranja forte JobbVideo / rosa JobbLive */
export function chatSiteOrigemClass(origem: ChatSiteOrigem): string {
  if (origem === 'jobblive') {
    return 'bg-pink-500 text-white'
  }
  if (origem === 'jobbvideo') {
    return 'bg-orange-600 text-white'
  }
  return ''
}
