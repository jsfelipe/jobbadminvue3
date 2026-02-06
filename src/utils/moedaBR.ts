/**
 * Utilitários para máscara de valor em reais (BR).
 * Reutilizável em qualquer campo de valor no projeto.
 *
 * Uso direto no template:
 *   import { formatValorBR, parseCurrencyBR } from '@/utils/moedaBR'
 *   <el-input :model-value="formatValorBR(form.valor)" @update:model-value="form.valor = parseCurrencyBR($event)" />
 *
 * Ou use o componente: <InputMoedaBR v-model="form.valor" />
 */

/** Formata número para exibição BR: 2000 → "2.000,00" */
export function formatValorBR(val: unknown): string {
  if (val == null || val === '') return ''
  const raw = String(val).replace(/\s/g, '')
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
  const n = Number(normalized)
  if (Number.isNaN(n)) return ''
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Parse string BR para número: "2.000,00" ou "2000" → 2000 (ao carregar da API ou editar com vírgula). */
export function parseValorBR(str: string): number {
  if (str == null || str === '') return 0
  const raw = String(str).replace(/\s/g, '').replace(/R\$\s?/g, '')
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
  const n = parseFloat(normalized)
  return Number.isNaN(n) ? 0 : n
}

/**
 * Parse só dígitos como centavos (igual Taxa Produtora no Cálculo do Orçamento).
 * Ignora ponto e vírgula: extrai só dígitos e divide por 100.
 * Ex.: "0,012" → "0012" → 0,12 | "123456" → 1234,56
 */
export function parseCurrencyBR(raw: string): number {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits === '') return 0
  return parseInt(digits, 10) / 100
}
