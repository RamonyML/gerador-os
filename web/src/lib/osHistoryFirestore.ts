import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
  where,
} from 'firebase/firestore'

const COLLECTION = 'osHistory'

export interface OsHistoryEntry {
  id: string
  uid: string
  slug: string
  title: string
  demandCategory: string
  preview: string
  createdAt: Date
}

function parseEntry(id: string, data: Record<string, unknown>): OsHistoryEntry | null {
  const { uid, slug, title, demandCategory, preview, createdAt } = data
  if (
    typeof uid !== 'string' ||
    typeof slug !== 'string' ||
    typeof title !== 'string' ||
    typeof demandCategory !== 'string' ||
    typeof preview !== 'string' ||
    !(createdAt instanceof Timestamp)
  )
    return null
  return { id, uid, slug, title, demandCategory, preview, createdAt: createdAt.toDate() }
}

export async function saveOsHistory(
  db: Firestore,
  entry: Omit<OsHistoryEntry, 'id' | 'createdAt'>,
): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    uid: entry.uid,
    slug: entry.slug,
    title: entry.title,
    demandCategory: entry.demandCategory,
    preview: entry.preview,
    createdAt: serverTimestamp(),
  })
}

export function subscribeOsHistory(
  db: Firestore,
  uid: string,
  onNext: (entries: OsHistoryEntry[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  return onSnapshot(
    q,
    (snap) => {
      const entries: OsHistoryEntry[] = []
      for (const d of snap.docs) {
        const parsed = parseEntry(d.id, d.data() as Record<string, unknown>)
        if (parsed) entries.push(parsed)
      }
      onNext(entries)
    },
    onError,
  )
}

export async function deleteOsHistoryEntry(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
