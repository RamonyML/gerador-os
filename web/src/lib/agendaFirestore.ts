import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
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
  type AgendaCellHistoryEntry,
  type AgendaCellStatus,
  type AgendaColorOverride,
  type AgendaColorSettings,
  type AgendaDia,
  type AgendaSlot,
  type AgendaTecnico,
  type CellColor,
  type NegadoItem,
} from '../types/agenda'

const VALID_STATUSES: AgendaCellStatus[] = ['redes', 'validado', 'com_pendencia', 'reagendar']

function isAgendaCellStatus(v: unknown): v is AgendaCellStatus {
  return VALID_STATUSES.includes(v as AgendaCellStatus)
}

function parseHistory(v: unknown): AgendaCellHistoryEntry[] | undefined {
  if (!Array.isArray(v) || v.length === 0) return undefined
  const out: AgendaCellHistoryEntry[] = []
  for (const item of v) {
    if (!item || typeof item !== 'object') continue
    const h = item as Record<string, unknown>
    if (typeof h.at !== 'string' || typeof h.prevText !== 'string') continue
    out.push({
      at: h.at,
      byUid: typeof h.byUid === 'string' ? h.byUid : '',
      byName: typeof h.byName === 'string' ? h.byName : '',
      prevText: h.prevText,
    })
  }
  return out.length ? out : undefined
}

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
      const veiculo: 'carro' | 'moto' = t.veiculo === 'moto' ? 'moto' : 'carro'
      const entry: AgendaTecnico = { id: t.id, nome: t.nome, veiculo }
      if (t.tem1830 === true) entry.tem1830 = true
      out.push(entry)
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
    const status = isAgendaCellStatus(c.status) ? c.status : undefined
    const statusObs = typeof c.statusObs === 'string' && c.statusObs.trim() ? c.statusObs : undefined
    const history = parseHistory(c.history)
    const hasHistory = Array.isArray(c.history) && c.history.length > 0
    if (!text && color === 'branco' && c.bold !== true && !status && !hasHistory) continue
    out[key] = { text, color, bold: c.bold === true, status, statusObs, history }
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
  // Remove células "vazias" e campos undefined (Firestore rejeita undefined).
  const cells: Record<string, unknown> = {}
  for (const [key, c] of Object.entries(dia.cells)) {
    const hasHist = c.history && c.history.length > 0
    if (!c.text.trim() && c.color === 'branco' && !c.bold && !c.status && !hasHist) continue
    const cell: Record<string, unknown> = { text: c.text, color: c.color, bold: c.bold }
    if (c.status !== undefined) cell.status = c.status
    if (c.statusObs !== undefined) cell.statusObs = c.statusObs
    if (c.history !== undefined && c.history.length > 0) cell.history = c.history
    cells[key] = cell
  }
  const negados = dia.negados.map((n) => ({
    id: n.id,
    text: n.text,
    ...(n.origem?.trim() ? { origem: n.origem } : {}),
  }))
  const tecnicos = dia.tecnicos.map((t) => {
    const entry: Record<string, unknown> = { id: t.id, nome: t.nome, veiculo: t.veiculo }
    if (t.tem1830 === true) entry.tem1830 = true
    return entry
  })
  await setDoc(
    doc(db, COLLECTION, docId(dia.area, dia.date)),
    {
      area: dia.area,
      date: dia.date,
      slots: dia.slots,
      tecnicos,
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

/** Busca um dia/área uma única vez (sem assinatura). */
export async function getDia(
  db: Firestore,
  area: AgendaArea,
  date: string,
): Promise<AgendaDia> {
  const snap = await getDoc(doc(db, COLLECTION, docId(area, date)))
  if (!snap.exists()) return emptyDia(area, date)
  return parseDia(area, date, snap.data() as Record<string, unknown>)
}

/** Reexporta utilitários úteis para a página. */
export { cellKey, emptyDia, docId }

// ---- Configurações de cores da legenda ----

const COLOR_SETTINGS_COLLECTION = 'agendaSettings'

function colorSettingsDocId(area: AgendaArea): string {
  return `${area}_colors`
}

export function subscribeColorSettings(
  db: Firestore,
  area: AgendaArea,
  onNext: (settings: AgendaColorSettings) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, COLOR_SETTINGS_COLLECTION, colorSettingsDocId(area)),
    (snap) => {
      if (!snap.exists()) {
        onNext({ overrides: {} })
        return
      }
      const data = snap.data() as Record<string, unknown>
      const overrides: Partial<Record<CellColor, AgendaColorOverride>> = {}
      if (data.overrides && typeof data.overrides === 'object') {
        for (const [k, v] of Object.entries(data.overrides as Record<string, unknown>)) {
          if (!v || typeof v !== 'object') continue
          const obj = v as Record<string, unknown>
          const override: AgendaColorOverride = {}
          if (typeof obj.label === 'string') override.label = obj.label
          if (typeof obj.fill === 'string') override.fill = obj.fill
          if (typeof obj.fillDark === 'string') override.fillDark = obj.fillDark
          if (typeof obj.border === 'string') override.border = obj.border
          if (typeof obj.textColor === 'string') override.textColor = obj.textColor
          if (typeof obj.textColorDark === 'string') override.textColorDark = obj.textColorDark
          overrides[k as CellColor] = override
        }
      }
      const extraPaletteColors = Array.isArray(data.extraPaletteColors)
        ? (data.extraPaletteColors as unknown[]).filter((c): c is CellColor => typeof c === 'string')
        : []
      onNext({ overrides, extraPaletteColors })
    },
    (err) => onError(err),
  )
}

export async function saveColorSettings(
  db: Firestore,
  area: AgendaArea,
  settings: AgendaColorSettings,
): Promise<void> {
  await setDoc(
    doc(db, COLOR_SETTINGS_COLLECTION, colorSettingsDocId(area)),
    { area, overrides: settings.overrides, extraPaletteColors: settings.extraPaletteColors ?? [] },
    { merge: false },
  )
}

// ---- Busca ----

export type CellSearchResult = {
  date: string
  tecnicoNome: string
  slotLabel: string
  key: string
  text: string
  color: CellColor
}

export async function searchAgendaCells(
  db: Firestore,
  area: AgendaArea,
  startDate: string,
  endDate: string,
  needle: string,
): Promise<CellSearchResult[]> {
  const q = query(
    collection(db, COLLECTION),
    where(documentId(), '>=', `${area}_${startDate}`),
    where(documentId(), '<=', `${area}_${endDate}`),
  )
  const snap = await getDocs(q)
  const n = needle.trim().toLowerCase()
  const results: CellSearchResult[] = []
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as Record<string, unknown>
    const dia = parseDia(area, str(data.date) || '', data)
    for (const [key, cell] of Object.entries(dia.cells)) {
      if (!cell.text || !cell.text.toLowerCase().includes(n)) continue
      const [tecId, slotId] = key.split('__')
      const tec = dia.tecnicos.find((t) => t.id === tecId)
      const slot = dia.slots.find((s) => s.id === slotId)
      results.push({
        date: dia.date,
        tecnicoNome: tec?.nome ?? tecId,
        slotLabel: slot?.label ?? slotId,
        key,
        text: cell.text,
        color: cell.color,
      })
    }
  }
  results.sort((a, b) => a.date.localeCompare(b.date) || a.slotLabel.localeCompare(b.slotLabel))
  return results
}
