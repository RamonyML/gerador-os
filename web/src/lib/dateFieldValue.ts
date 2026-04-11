import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

/** Converte string dd/mm/aaaa do estado do formulário para Dayjs (ou null). */
export function parseBrDateString(s: string): Dayjs | null {
  const t = s.trim()
  if (!t) return null
  const d = dayjs(t, 'DD/MM/YYYY', true)
  return d.isValid() ? d : null
}

/** Valor salvo no template / protocolo em formato brasileiro. */
export function toBrDateString(d: Dayjs | null): string {
  return d && d.isValid() ? d.format('DD/MM/YYYY') : ''
}
