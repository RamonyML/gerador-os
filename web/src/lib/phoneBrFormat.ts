/** Apenas dígitos, no máx. 11 (DDD + número). */
export function digitsPhoneBr(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11)
}

/**
 * Máscara visual (00) 0000-0000 ou (00) 00000-0000.
 * Valor armazenado no estado é sempre esta string formatada; `contatoNumerico` no gerador usa só dígitos.
 */
export function formatPhoneBrMask(digits: string): string {
  const d = digitsPhoneBr(digits)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  const rest = d.slice(2)
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${rest}`
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}
