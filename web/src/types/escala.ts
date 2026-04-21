import type { Sector } from './profile'

/**
 * Mapa dia (1–31 como string) → id do turno fixo → lista de e-mails dos colaboradores.
 * IDs dos turnos: ver `lib/escalaTurnosFixos.ts` (`SHIFT_IDS`).
 */
export type EscalaMesDays = Record<string, Record<string, string[]>>

export interface EscalaMesDoc {
  sector: Sector
  /** Formato `yyyy-MM`. */
  yearMonth: string
  days: EscalaMesDays
}

export function escalaMesDocId(sector: Sector, yearMonth: string): string {
  return `${sector}_${yearMonth}`
}
