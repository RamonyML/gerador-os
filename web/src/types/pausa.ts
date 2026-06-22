export interface PausaEntry {
  uid: string
  displayName: string
  date: string
  horarioAgendado: string | null
  inicioEfetivo: Date | null
  fimEfetivo: Date | null
}

export type PausaStatus = 'sem_pausa' | 'agendada' | 'em_pausa' | 'concluida'

export const PAUSA_DURATION_MS = 60 * 60 * 1000

export function getPausaStatus(entry: PausaEntry | null | undefined): PausaStatus {
  if (!entry || !entry.horarioAgendado) return 'sem_pausa'
  if (!entry.inicioEfetivo) return 'agendada'
  if (!entry.fimEfetivo) return 'em_pausa'
  return 'concluida'
}

export function elapsedMs(entry: PausaEntry): number {
  if (!entry.inicioEfetivo) return 0
  const end = entry.fimEfetivo ?? new Date()
  return end.getTime() - entry.inicioEfetivo.getTime()
}

export function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`
}

export function todayISO(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}
