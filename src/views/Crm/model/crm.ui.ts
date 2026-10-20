import type { BucketMetaLead, OrigemLead, ProdutoLead, StatusCaso, TipoFila } from './crm.types'

export const statusBadgeClass = (status: StatusCaso): string => {
  if (status === 'aguardando_retorno') return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100'
  if (status === 'em_atendimento') return 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
  if (status === 'resolvido') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
  if (status === 'encerrado') return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100'
}

export const diasAte = (value: string | null | undefined): number | null => {
  if (!value) return null
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((date.getTime() - hoje.getTime()) / 86400000)
}

export const filaBadgeClass = (tipo: TipoFila): string => {
  if (tipo === 'risco_abandono') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100'
  if (tipo === 'atraso_pagamento') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100'
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100'
}

export const produtoLeadBadgeClass = (produto: ProdutoLead): string => {
  if (produto === 'jobblive') return 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
  return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100'
}

export const origemLeadBadgeClass = (origem: OrigemLead): string => {
  if (origem === 'linkedin') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100'
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
}

export const bucketMetaBadgeClass = (bucket: BucketMetaLead): string => {
  if (bucket === 'linkedin') return origemLeadBadgeClass('linkedin')
  return produtoLeadBadgeClass(bucket)
}

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '-'
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

export const formatTime = (value: string | null | undefined): string => {
  if (!value) return '-'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export const diasDesde = (value: string | null | undefined): number | null => {
  if (!value) return null
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return null
  return Math.floor((Date.now() - date.getTime()) / 86400000)
}

export const whatsappLink = (telefone: string | null | undefined): string | null => {
  const digits = String(telefone || '').replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`
}
