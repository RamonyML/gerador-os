import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

type LogAction = 'create' | 'update' | 'delete'

export function useUpgradeLogger() {
  const { user, profile } = useAuth()

  async function logAction(payload: {
    action: LogAction
    targetCollection?: string
    targetId?: string
    details?: Record<string, unknown>
  }) {
    if (!user) return
    try {
      await addDoc(collection(db, 'logs'), {
        timestamp: serverTimestamp(),
        userEmail: user.email ?? '',
        userName: profile?.displayName ?? user.email?.split('@')[0] ?? '',
        action: payload.action,
        targetCollection: payload.targetCollection,
        targetId: payload.targetId,
        details: payload.details,
      })
    } catch (e) {
      console.error('Erro ao registrar log:', e)
    }
  }

  return { logAction }
}
