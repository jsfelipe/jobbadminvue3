export interface TicketPrioridadeOpcao {
  id: string | number
  nome?: string
  slug?: string
  cor?: string
}

function normalizeSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function prioridadeSlaTexto(item: TicketPrioridadeOpcao): string {
  const slug = normalizeSlug(String(item.slug || ''))
  const nome = String(item.nome || '')
  if (slug === 'urgencia_bug_erro' || /bug/i.test(nome)) {
    return 'respondido em média em até 4h'
  }
  if (slug === 'atencao_alta' || /aten[çc][ãa]o/i.test(nome)) {
    return 'respondido em média em até 8h'
  }
  return 'respondido em média em até 24h'
}

export function prioridadeSelectLabel(item: TicketPrioridadeOpcao): string {
  const cor = String(item.cor || '').toLowerCase()
  let prefix = ''
  if (cor === 'red') {
    prefix = '🔴 '
  } else if (cor === 'yellow') {
    prefix = '🟡 '
  } else if (cor === 'green') {
    prefix = '🟢 '
  }
  const nome = String(item.nome || '')
  const sla = prioridadeSlaTexto(item)
  return `${prefix}${nome} — ${sla}`
}
