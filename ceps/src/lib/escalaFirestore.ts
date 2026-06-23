import type { Sector } from '../types/profile'
import type { EscalaMesDays, EscalaMesDoc } from '../types/escala'

export function parseEscalaMes(
  data: Record<string, unknown>,
): EscalaMesDoc | null {
  const sector = data.sector as Sector | undefined
  const yearMonth = typeof data.yearMonth === 'string' ? data.yearMonth.trim() : ''
  if (!sector || !yearMonth) return null
  const days = parseDays(data.days)
  return { sector, yearMonth, days }
}

function parseDays(raw: unknown): EscalaMesDays {
  const out: EscalaMesDays = {}
  if (!raw || typeof raw !== 'object') return out
  const top = raw as Record<string, unknown>
  for (const [dayKey, dayVal] of Object.entries(top)) {
    if (!dayVal || typeof dayVal !== 'object') continue
    const shiftMap: Record<string, string[]> = {}
    const dayObj = dayVal as Record<string, unknown>
    for (const [shiftId, emailsVal] of Object.entries(dayObj)) {
      if (!Array.isArray(emailsVal)) continue
      const emails = emailsVal
        .filter((e): e is string => typeof e === 'string')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
      shiftMap[shiftId] = emails
    }
    out[dayKey] = shiftMap
  }
  return out
}

export function emptyMesDoc(sector: Sector, yearMonth: string): EscalaMesDoc {
  return { sector, yearMonth, days: {} }
}
