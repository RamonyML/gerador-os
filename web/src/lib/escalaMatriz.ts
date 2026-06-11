/**
 * Helpers da visão "Por atendente" (matriz): pivot dos dados da escala
 * (que são centrados no dia) para uma leitura centrada na pessoa, além da
 * codificação visual de cada célula e da edição por operador/dia.
 *
 * Não há novo modelo de dados: tudo é derivado do mesmo `EscalaMesDays`
 * (`dia → turno → e-mails`) usado pelas demais visões.
 */

import type { EscalaMesDays } from '../types/escala'
import { SHIFT_IDS } from './escalaTurnosFixos'
import type { SectorRosterRow } from './userManagementApi'

/** Modalidade que define a cor da célula. */
export type ShiftKind =
  | 'presencial'
  | 'homeoffice'
  | 'extra'
  | 'feriado'
  | 'ferias'

export interface ShiftCellMeta {
  /** Código curto exibido na célula (M, T, E, F). */
  code: string
  kind: ShiftKind
}

/** Mapa id do turno → como exibir na matriz (cor = modalidade, letra = turno). */
export const SHIFT_CELL: Record<string, ShiftCellMeta> = {
  [SHIFT_IDS.segSex0816]: { code: 'M', kind: 'presencial' },
  [SHIFT_IDS.segSex1340]: { code: 'T', kind: 'presencial' },
  [SHIFT_IDS.sabPres0816]: { code: 'M', kind: 'presencial' },
  [SHIFT_IDS.sabHo1340]: { code: 'T', kind: 'homeoffice' },
  [SHIFT_IDS.domHo0816]: { code: 'M', kind: 'homeoffice' },
  [SHIFT_IDS.domHo1340]: { code: 'T', kind: 'homeoffice' },
  [SHIFT_IDS.extra1220]: { code: 'I', kind: 'extra' },
  [SHIFT_IDS.fer4h]: { code: 'F', kind: 'feriado' },
  [SHIFT_IDS.ferias]: { code: 'Fé', kind: 'ferias' },
}

export function shiftCellMeta(shiftId: string): ShiftCellMeta {
  return SHIFT_CELL[shiftId] ?? { code: '•', kind: 'extra' }
}

/** Clona profundamente o mapa de dias (evita mutação do estado). */
export function cloneEscalaDays(days: EscalaMesDays): EscalaMesDays {
  const out: EscalaMesDays = {}
  for (const [dk, dm] of Object.entries(days)) {
    out[dk] = {}
    for (const [sk, emails] of Object.entries(dm)) {
      out[dk][sk] = [...emails]
    }
  }
  return out
}

/** Turnos (ids) em que o e-mail aparece num dado dia. */
export function operatorShiftsForDay(
  days: EscalaMesDays,
  dayNum: number,
  email: string,
): string[] {
  const em = email.trim().toLowerCase()
  const dayMap = days[String(dayNum)]
  if (!dayMap) return []
  const out: string[] = []
  for (const [shiftId, emails] of Object.entries(dayMap)) {
    if (emails.some((e) => e.trim().toLowerCase() === em)) out.push(shiftId)
  }
  return out
}

/**
 * Define o turno de um operador num dia: remove o e-mail de todos os turnos
 * daquele dia e, se `shiftId` for informado, adiciona ao turno escolhido.
 * Passar `shiftId = null` equivale a "folga" (limpa o dia para a pessoa).
 * Remove arrays/dias vazios para não inchar o documento.
 */
export function setOperatorShiftForDay(
  days: EscalaMesDays,
  dayNum: number,
  email: string,
  shiftId: string | null,
): EscalaMesDays {
  const em = email.trim().toLowerCase()
  const next = cloneEscalaDays(days)
  const dayKey = String(dayNum)
  const dayMap = next[dayKey] ?? {}

  for (const shift of Object.keys(dayMap)) {
    dayMap[shift] = dayMap[shift].filter((e) => e.trim().toLowerCase() !== em)
  }

  if (shiftId) {
    const list = dayMap[shiftId] ?? []
    if (!list.some((e) => e.trim().toLowerCase() === em)) list.push(em)
    dayMap[shiftId] = list
  }

  for (const shift of Object.keys(dayMap)) {
    if (dayMap[shift].length === 0) delete dayMap[shift]
  }

  if (Object.keys(dayMap).length === 0) delete next[dayKey]
  else next[dayKey] = dayMap

  return next
}

/**
 * Lista de e-mails (linhas da matriz): todos do roster do setor + quaisquer
 * e-mails já presentes na escala (mesmo que fora do roster atual), sem repetir.
 */
export function collectMatrizEmails(
  roster: SectorRosterRow[],
  days: EscalaMesDays,
): string[] {
  const set = new Set<string>()
  for (const r of roster) {
    const em = r.email.trim().toLowerCase()
    if (em) set.add(em)
  }
  for (const dayMap of Object.values(days)) {
    for (const emails of Object.values(dayMap)) {
      for (const e of emails) {
        const em = e.trim().toLowerCase()
        if (em) set.add(em)
      }
    }
  }
  return [...set]
}
