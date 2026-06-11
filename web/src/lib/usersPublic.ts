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
 * Cartão público mínimo de um usuário (nome + foto), usado em telas
 * compartilhadas como a linha do tempo de chamados, onde é preciso exibir a
 * foto de outros usuários sem expor o documento de perfil completo.
 */
export type PublicProfile = {
  displayName: string | null
  photoURL: string | null
}

const COLLECTION = 'usersPublic'

/**
 * Grava/atualiza (merge) o cartão público do usuário atual. Best-effort: deve
 * ser chamado no login e quando a foto de perfil muda.
 */
export async function upsertMyPublicProfile(
  db: Firestore,
  uid: string,
  data: { displayName?: string | null; photoURL?: string | null },
): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, uid),
    {
      displayName: data.displayName ?? null,
      photoURL: data.photoURL ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
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
          displayName:
            typeof data.displayName === 'string' ? data.displayName : null,
          photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
        }
      })
      onNext(map)
    },
    (err) => onError?.(err),
  )
}
