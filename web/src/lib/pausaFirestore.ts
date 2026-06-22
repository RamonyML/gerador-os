import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import type { PausaEntry } from '../types/pausa'

function docRef(date: string, uid: string) {
  return doc(db, 'pausas', `${date}_${uid}`)
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

export async function setHorarioPausa(
  uid: string,
  displayName: string,
  date: string,
  horario: string | null,
): Promise<void> {
  await setDoc(
    docRef(date, uid),
    { uid, displayName, date, horarioAgendado: horario, inicioEfetivo: null, fimEfetivo: null },
    { merge: true },
  )
}

export async function iniciarPausa(uid: string, date: string): Promise<void> {
  await updateDoc(docRef(date, uid), { inicioEfetivo: serverTimestamp(), fimEfetivo: null })
}

export async function encerrarPausa(uid: string, date: string): Promise<void> {
  await updateDoc(docRef(date, uid), { fimEfetivo: serverTimestamp() })
}

export function subscribePausasDia(
  date: string,
  callback: (entries: PausaEntry[]) => void,
  onError?: () => void,
): () => void {
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
): () => void {
  return onSnapshot(docRef(date, uid), (snap) => {
    callback(snap.exists() ? fromFirestore(snap.data(), uid, date) : null)
  })
}
