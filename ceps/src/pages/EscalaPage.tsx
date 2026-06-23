import { useEffect, useRef, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../firebase'
import { parseEscalaMes } from '../lib/escalaFirestore'
import { metaTurnoPorId } from '../lib/escalaTurnosFixos'
import { escalaMesDocId, type EscalaMesDays } from '../types/escala'
import type { Sector } from '../types/profile'

const DAY_ABBR = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function weekMonday(date: Date): Date {
  const d = new Date(date)
  const dow = d.getDay()
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function fmtYM(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function isToday(date: Date): boolean {
  const n = new Date()
  return date.getDate() === n.getDate() && date.getMonth() === n.getMonth() && date.getFullYear() === n.getFullYear()
}

function findShift(days: EscalaMesDays, dayNum: number, emailLc: string): string | null {
  const entry = days[String(dayNum)]
  if (!entry) return null
  for (const [id, emails] of Object.entries(entry)) {
    if (emails.includes(emailLc)) return id
  }
  return null
}

type DayEntry = {
  date: Date
  label: string
  variant: 'presencial' | 'homeoffice' | 'extra' | null
}

type Props = { user: User }

export function EscalaPage({ user }: Props) {
  const [sector, setSector] = useState<Sector | null>(null)
  const [loadingSector, setLoadingSector] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [entries, setEntries] = useState<DayEntry[] | null>(null)
  const [loadingWeek, setLoadingWeek] = useState(false)
  const cacheRef = useRef<Record<string, EscalaMesDays>>({})

  useEffect(() => {
    void getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) {
        const s = (snap.data() as Record<string, unknown>).sector as Sector | undefined
        if (s) setSector(s)
      }
      setLoadingSector(false)
    })
  }, [user.uid])

  useEffect(() => {
    if (!sector) return
    let cancelled = false
    const emailLc = (user.email ?? '').trim().toLowerCase()

    const load = async () => {
      setLoadingWeek(true)
      const mon = addDays(weekMonday(new Date()), weekOffset * 7)
      const dates = Array.from({ length: 7 }, (_, i) => addDays(mon, i))
      const months = [...new Set(dates.map(fmtYM))]
      const toLoad = months.filter((ym) => !(ym in cacheRef.current))

      for (const ym of toLoad) {
        const snap = await getDoc(doc(db, 'escalaMes', escalaMesDocId(sector, ym)))
        cacheRef.current[ym] = snap.exists() ? (parseEscalaMes(snap.data())?.days ?? {}) : {}
      }

      if (cancelled) return

      const result: DayEntry[] = dates.map((date) => {
        const daysMap = cacheRef.current[fmtYM(date)] ?? {}
        const shiftId = findShift(daysMap, date.getDate(), emailLc)
        if (!shiftId) return { date, label: 'Folga', variant: null }
        const meta = metaTurnoPorId(shiftId, date, sector)
        if (!meta) return { date, label: shiftId, variant: null }
        const parts = meta.headline.split('·')
        const timePart = parts.length >= 2 ? parts[1]!.trim() : meta.headline
        return {
          date,
          label: meta.variant === 'homeoffice' ? `HO · ${timePart}` : timePart,
          variant: meta.variant,
        }
      })

      setEntries(result)
      setLoadingWeek(false)
    }

    void load()
    return () => { cancelled = true }
  }, [sector, weekOffset, user.email])

  const mon = addDays(weekMonday(new Date()), weekOffset * 7)
  const sun = addDays(mon, 6)
  const weekLabel =
    mon.getMonth() === sun.getMonth()
      ? `${mon.getDate()}–${sun.getDate()} ${MONTH_LABELS[mon.getMonth()]} ${mon.getFullYear()}`
      : `${mon.getDate()} ${MONTH_LABELS[mon.getMonth()]} – ${sun.getDate()} ${MONTH_LABELS[sun.getMonth()]}`

  if (loadingSector) {
    return (
      <div className="reg-empty" style={{ paddingTop: 40 }}>
        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
      </div>
    )
  }

  if (!sector) {
    return (
      <div className="reg-empty" style={{ paddingTop: 40 }}>
        <p>Setor não configurado no perfil.</p>
        <p style={{ fontSize: 12, marginTop: 6 }}>Acesse o sistema principal e defina seu setor.</p>
      </div>
    )
  }

  return (
    <div className="escala-root">
      <div className="escala-nav">
        <button className="escala-nav-btn" onClick={() => setWeekOffset((w) => w - 1)} title="Semana anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <span className="escala-week-label">{weekLabel}</span>
        <button className="escala-nav-btn" onClick={() => setWeekOffset((w) => w + 1)} title="Próxima semana">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
        {weekOffset !== 0 && (
          <button className="escala-today-btn" onClick={() => setWeekOffset(0)}>Hoje</button>
        )}
      </div>

      {loadingWeek ? (
        <div className="reg-empty" style={{ paddingTop: 24 }}>
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
        </div>
      ) : (
        <div className="escala-days">
          {(entries ?? []).map((entry, i) => {
            const today = isToday(entry.date)
            return (
              <div key={i} className={`escala-day${today ? ' today' : ''}${!entry.variant ? ' off' : ''}`}>
                <span className="escala-day-abbr">{DAY_ABBR[i]}</span>
                <span className="escala-day-num">{entry.date.getDate()}</span>
                <span className={`escala-day-shift${entry.variant ? ` ${entry.variant}` : ''}`}>
                  {entry.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="escala-illus">
        <img src="/illus-historico.png" alt="" />
      </div>
    </div>
  )
}
