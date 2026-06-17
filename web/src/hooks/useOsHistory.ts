import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { subscribeOsHistory, type OsHistoryEntry } from '../lib/osHistoryFirestore'

type State =
  | { status: 'loading' }
  | { status: 'ready'; entries: OsHistoryEntry[] }
  | { status: 'error'; message: string }

export function useOsHistory(uid: string | null): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (!uid) {
      setState({ status: 'ready', entries: [] })
      return
    }
    setState({ status: 'loading' })
    const unsub = subscribeOsHistory(
      db,
      uid,
      (entries) => setState({ status: 'ready', entries }),
      (err) => setState({ status: 'error', message: err.message }),
    )
    return () => unsub()
  }, [uid])

  return state
}
