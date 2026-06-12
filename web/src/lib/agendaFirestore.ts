import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  cellKey,
  defaultSlots,
  emptyDia,
  isAgendaArea,
  type AgendaArea,
  type AgendaCell,
  type AgendaDia,
  type AgendaSlot,
  type AgendaTecnico,
  type CellColor,
  type NegadoItem,
} from '../types/agenda'

const COLLECTION = 'agendaDias'

function docId(area: AgendaArea, date: string): string {
  return `${area}_${date}`
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function parseSlots(v: unknown, area: AgendaArea): AgendaSlot[] {
  if (!Array.isArray(v)) return defaultSlots(area)
  const out: AgendaSlot[] = []
  for (const item of v) {
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    if (typeof s.id === 'string' && typeof s.label === 'string') {
      out.push({ id: s.id, label: s.label })
    }
  }
  return out.length ? out : defaultSlots(area)
}

function parseTecnicos(v: unknown): AgendaTecnico[] {
  if (!Array.isArray(v)) return []
  const out: AgendaTecnico[] = []
  for (const item of v) {
    if (!item || typeof item !== 'object') continue
    const t = item as Record<string, unknown>
    if (typeof t.id === 'string' && typeof t.nome === 'string') {
      out.push({ id: t.id, nome: t.nome })
    }
  }
  return out
}

function parseCells(v: unknown): Record<string, AgendaCell> {
  const out: Record<string, AgendaCell> = {}
  if (!v || typeof v !== 'object') return out
  for (const [key, raw] of Object.entries(v as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object') continue
    const c = raw as Record<string, unknown>
    const text = str(c.text)
    const color = (typeof c.color === 'string' ? c.color : 'branco') as CellColor
    if (!text && color === 'branco' && c.bold !== true) continue
    out[key] = { text, color, bold: c.bold === true }
  }
  return out
}

function parseNegados(v: unknown): NegadoItem[] {
  if (!Array.isArray(v)) return []
  const out: NegadoItem[] = []
  for (const item of v) {
    if (!item || typeof item !== 'object') continue
    const n = item as Record<string, unknown>
    if (typeof n.id !== 'string') continue
    const negado: NegadoItem = {
      id: n.id,
      text: str(n.text),
    }
    if (typeof n.origem === 'string' && n.origem.trim()) {
      negado.origem = n.origem
    }
    out.push(negado)
  }
  return out
}

function parseDia(
  area: AgendaArea,
  date: string,
  data: Record<string, unknown>,
): AgendaDia {
  return {
    area: isAgendaArea(data.area) ? data.area : area,
    date: str(data.date) || date,
    slots: parseSlots(data.slots, area),
    tecnicos: parseTecnicos(data.tecnicos),
    cells: parseCells(data.cells),
    negados: parseNegados(data.negados),
  }
}

/** Assina um dia/área. Emite `null` quando ainda não existe documento. */
export function subscribeDia(
  db: Firestore,
  area: AgendaArea,
  date: string,
  onNext: (dia: AgendaDia | null) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTION, docId(area, date)),
    (snap) => {
      if (!snap.exists()) {
        onNext(null)
        return
      }
      onNext(parseDia(area, date, snap.data() as Record<string, unknown>))
    },
    (err) => onError(err),
  )
}

/** Grava o documento inteiro do dia (last-write-wins). */
export async function saveDia(db: Firestore, dia: AgendaDia): Promise<void> {
  // Remove células "vazias" para não inflar o documento.
  const cells: Record<string, AgendaCell> = {}
  for (const [key, c] of Object.entries(dia.cells)) {
    if (c.text.trim() || c.color !== 'branco' || c.bold) cells[key] = c
  }
  const negados = dia.negados.map((n) => ({
    id: n.id,
    text: n.text,
    ...(n.origem?.trim() ? { origem: n.origem } : {}),
  }))
  await setDoc(
    doc(db, COLLECTION, docId(dia.area, dia.date)),
    {
      area: dia.area,
      date: dia.date,
      slots: dia.slots,
      tecnicos: dia.tecnicos,
      cells,
      negados,
      updatedAt: serverTimestamp(),
    },
    { merge: false },
  )
}

/** Busca os técnicos do dia anterior mais recente (até 21 dias atrás). */
export async function getTecnicosFromPreviousDay(
  db: Firestore,
  area: AgendaArea,
  date: string,
): Promise<AgendaTecnico[]> {
  const base = new Date(`${date}T00:00:00`)
  for (let i = 1; i <= 21; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const snap = await getDoc(doc(db, COLLECTION, docId(area, iso)))
    if (snap.exists()) {
      const dia = parseDia(area, iso, snap.data() as Record<string, unknown>)
      if (dia.tecnicos.length) return dia.tecnicos
    }
  }
  return []
}

/** Reexporta utilitários úteis para a página. */
export { cellKey, emptyDia, docId }
