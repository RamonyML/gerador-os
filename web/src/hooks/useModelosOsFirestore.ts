import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import {
  subscribeModelosOs,
  MODELOS_OS_CATEGORIES,
  type ModeloOsDoc,
} from '../lib/modelosOsFirestore'

export type ModelosByCategory = {
  id: string
  label: string
  modelos: ModeloOsDoc[]
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; modelos: ModeloOsDoc[]; byCategory: ModelosByCategory[] }
  | { status: 'error'; message: string }

export function useModelosOsFirestore(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    const unsub = subscribeModelosOs(
      db,
      (modelos) => {
        const byCategory: ModelosByCategory[] = MODELOS_OS_CATEGORIES.map((cat) => ({
          id: cat.id,
          label: cat.label,
          modelos: modelos.filter((m) => m.category === cat.id),
        }))
        setState({ status: 'ready', modelos, byCategory })
      },
      (err) => setState({ status: 'error', message: err.message }),
    )
    return () => unsub()
  }, [])

  return state
}
