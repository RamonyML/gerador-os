import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'

/**
 * Cartão público de um usuário — usado no chat, lista de pausas e linha do
 * tempo de chamados. Inclui campos de diretório (sector, hierarchy) além dos
 * visuais (displayName, photoURL).
 */
export type PublicProfile = {
  uid?: string
  displayName: string | null
  photoURL: string | null
  sector: string
  hierarchy: string
}

const COLLECTION = 'usersPublic'

/**
 * Grava/atualiza (merge) o cartão público do usuário atual. Best-effort: deve
 * ser chamado no login e quando a foto de perfil muda.
 */
export async function upsertMyPublicProfile(
  db: Firestore,
  uid: string,
  data: {
    displayName?: string | null
    photoURL?: string | null
    sector?: string
    hierarchy?: string
  },
): Promise<void> {
  const payload: Record<string, unknown> = {
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    updatedAt: serverTimestamp(),
  }
  if (data.sector !== undefined) payload.sector = data.sector
  if (data.hierarchy !== undefined) payload.hierarchy = data.hierarchy
  await setDoc(doc(db, COLLECTION, uid), payload, { merge: true })
}

/**
 * Assina a coleção pública e devolve um mapa `uid -> { displayName, photoURL }`.
 */
export function subscribeUsersPublic(
  db: Firestore,
  onNext: (map: Record<string, PublicProfile>) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const map: Record<string, PublicProfile> = {}
      snap.forEach((d) => {
        const data = d.data() as Record<string, unknown>
        map[d.id] = {
          uid: d.id,
          displayName: typeof data.displayName === 'string' ? data.displayName : null,
          photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
          sector: typeof data.sector === 'string' ? data.sector : '',
          hierarchy: typeof data.hierarchy === 'string' ? data.hierarchy : '',
        }
      })
      onNext(map)
    },
    (err) => onError?.(err),
  )
}

/** Lista ordenada de todos os usuários do diretório público (para pausa, etc). */
export function subscribeUsersDirectory(
  db: Firestore,
  onNext: (users: PublicProfile[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const users: PublicProfile[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>
        return {
          uid: d.id,
          displayName: typeof data.displayName === 'string' ? data.displayName : null,
          photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
          sector: typeof data.sector === 'string' ? data.sector : '',
          hierarchy: typeof data.hierarchy === 'string' ? data.hierarchy : '',
        }
      })
      onNext(users)
    },
    (err) => onError?.(err),
  )
}
