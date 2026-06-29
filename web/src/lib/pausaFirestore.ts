import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { PausaEntry } from '../types/pausa'
import { todayISO } from '../types/pausa'

// Daily pause records: pausas/{YYYY-MM-DD}_{uid}
function docRef(date: string, uid: string) {
  return doc(db, 'pausas', `${date}_${uid}`)
}

// Permanent schedule: pausaSchedule/{uid}
function scheduleRef(uid: string) {
  return doc(db, 'pausaSchedule', uid)
}

function fromFirestore(data: Record<string, unknown>, uid: string, date: string): PausaEntry {
  return {
    uid,
    date,
    displayName: String(data.displayName ?? ''),
    horarioAgendado: typeof data.horarioAgendado === 'string' ? data.horarioAgendado : null,
    inicioEfetivo: data.inicioEfetivo instanceof Timestamp ? data.inicioEfetivo.toDate() : null,
    fimEfetivo: data.fimEfetivo instanceof Timestamp ? data.fimEfetivo.toDate() : null,
  }
}

/**
 * Salva o horário de pausa de forma permanente no schedule e também
 * atualiza o doc do dia atual (sem sobrescrever inicioEfetivo/fimEfetivo).
 */
export async function setHorarioPausa(
  uid: string,
  displayName: string,
  date: string,
  horario: string | null,
): Promise<void> {
  // Permanent schedule — source of truth
  await setDoc(
    scheduleRef(uid),
    { uid, displayName, horarioAgendado: horario },
    { merge: true },
  )
  // Cache in today's doc so subscribePausasDia picks it up immediately
  await setDoc(
    docRef(date, uid),
    { uid, displayName, date, horarioAgendado: horario },
    { merge: true },
  )
}

export async function iniciarPausa(uid: string, date: string): Promise<void> {
  // setDoc com merge para criar o doc caso não exista (quando só há schedule, sem doc diário)
  await setDoc(
    docRef(date, uid),
    { uid, date, inicioEfetivo: serverTimestamp(), fimEfetivo: null },
    { merge: true },
  )
}

export async function encerrarPausa(uid: string, date: string): Promise<void> {
  await setDoc(
    docRef(date, uid),
    { fimEfetivo: serverTimestamp() },
    { merge: true },
  )
}

export function subscribePausasDia(
  date: string,
  callback: (entries: PausaEntry[]) => void,
  onError?: () => void,
): Unsubscribe {
  const q = query(collection(db, 'pausas'), where('date', '==', date))
  return onSnapshot(
    q,
    (snap) => {
      const entries: PausaEntry[] = snap.docs.map((d) => {
        const data = d.data()
        return fromFirestore(data, String(data.uid ?? ''), date)
      })
      callback(entries)
    },
    () => onError?.(),
  )
}

export function subscribeMinhaPausa(
  uid: string,
  date: string,
  callback: (entry: PausaEntry | null) => void,
): Unsubscribe {
  return onSnapshot(docRef(date, uid), (snap) => {
    callback(snap.exists() ? fromFirestore(snap.data(), uid, date) : null)
  })
}

/**
 * Assina o horário permanente de um único usuário.
 * Retorna null se não houver schedule cadastrado.
 */
export function subscribeMinhaPausaSchedule(
  uid: string,
  callback: (horario: string | null) => void,
): Unsubscribe {
  return onSnapshot(scheduleRef(uid), (snap) => {
    if (!snap.exists()) {
      callback(null)
      return
    }
    const data = snap.data()
    callback(typeof data.horarioAgendado === 'string' ? data.horarioAgendado : null)
  })
}

/**
 * Assina todos os schedules permanentes.
 * Retorna um Map uid -> horarioAgendado para uso no PausaTeamCard.
 */
export function subscribePausaSchedules(
  callback: (map: Map<string, string | null>) => void,
): Unsubscribe {
  return onSnapshot(collection(db, 'pausaSchedule'), (snap) => {
    const map = new Map<string, string | null>()
    snap.forEach((d) => {
      const data = d.data()
      map.set(d.id, typeof data.horarioAgendado === 'string' ? data.horarioAgendado : null)
    })
    callback(map)
  })
}

export { todayISO }
