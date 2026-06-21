import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { UserPresence, UserStatus } from '../types/chat'

export async function setPresence(
  uid: string,
  status: UserStatus,
  displayName: string,
  photoURL: string | null,
): Promise<void> {
  await setDoc(
    doc(db, 'presence', uid),
    { uid, displayName, photoURL: photoURL ?? null, status, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export function subscribePresence(callback: (users: UserPresence[]) => void): () => void {
  return onSnapshot(collection(db, 'presence'), (snap) => {
    const users: UserPresence[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        uid: d.id,
        displayName: data.displayName ?? '',
        photoURL: data.photoURL ?? null,
        status: (data.status ?? 'offline') as UserStatus,
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      }
    })
    callback(users)
  })
}
