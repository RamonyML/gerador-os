import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import { MODELOS_OS } from '../data/modelosOs'

export const MODELOS_OS_CATEGORIES = [
  { id: 'manutencao', label: 'Manutenção' },
  { id: 'altplan', label: 'Alteração de Plano' },
  { id: 'variadas', label: 'O.S. Variadas' },
] as const

export type ModeloOsCategory = 'manutencao' | 'altplan' | 'variadas'

export type ModeloOsDoc = {
  id: string
  title: string
  subtitle: string
  description: string
  text: string
  category: ModeloOsCategory
  order: number
  createdAt: Date
  updatedAt: Date
}

export type ModeloOsDraft = Omit<ModeloOsDoc, 'id' | 'createdAt' | 'updatedAt'>

const COLLECTION = 'modelos_os'

function parseCategory(v: unknown): ModeloOsCategory {
  if (v === 'manutencao' || v === 'altplan' || v === 'variadas') return v
  return 'variadas'
}

function parseDateOrNow(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  return new Date()
}

function parseModeloOs(id: string, data: Record<string, unknown>): ModeloOsDoc | null {
  const title = data.title
  const text = data.text
  const description = data.description
  if (typeof title !== 'string' || !title.trim()) return null
  if (typeof text !== 'string' || !text.trim()) return null
  if (typeof description !== 'string') return null
  return {
    id,
    title: title.trim(),
    subtitle: typeof data.subtitle === 'string' ? data.subtitle.trim() : '',
    description: description.trim(),
    text: text.trim(),
    category: parseCategory(data.category),
    order: typeof data.order === 'number' ? data.order : 0,
    createdAt: parseDateOrNow(data.createdAt),
    updatedAt: parseDateOrNow(data.updatedAt),
  }
}

export function subscribeModelosOs(
  db: Firestore,
  onData: (modelos: ModeloOsDoc[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy('order', 'asc'))
  return onSnapshot(
    q,
    (snap) => {
      const modelos = snap.docs
        .map((d) => parseModeloOs(d.id, d.data() as Record<string, unknown>))
        .filter((m): m is ModeloOsDoc => m !== null)
      onData(modelos)
    },
    (err) => onError(err instanceof Error ? err : new Error(String(err))),
  )
}

export async function createModeloOs(db: Firestore, draft: ModeloOsDraft): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateModeloOs(
  db: Firestore,
  id: string,
  draft: Partial<ModeloOsDraft>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...draft,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteModeloOs(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

/** Seeds Firestore from the static list if the collection is empty. Returns true if seeded. */
export async function seedModelosOsIfEmpty(db: Firestore): Promise<boolean> {
  const snap = await getDocs(collection(db, COLLECTION))
  if (!snap.empty) return false
  let order = 0
  for (const cat of MODELOS_OS) {
    for (const modelo of cat.modelos) {
      await addDoc(collection(db, COLLECTION), {
        title: modelo.title,
        subtitle: modelo.subtitle ?? '',
        description: modelo.description,
        text: modelo.text,
        category: cat.id,
        order: order++,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }
  return true
}
