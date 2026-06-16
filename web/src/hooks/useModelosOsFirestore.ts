import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import {
  subscribeModelosOs,
  seedModelosOsIfEmpty,
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

function buildByCategory(modelos: ModeloOsDoc[]): ModelosByCategory[] {
  return MODELOS_OS_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    modelos: modelos.filter((m) => m.category === cat.id),
  }))
}

export function useModelosOsFirestore(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let seedAttempted = false

    const unsub = subscribeModelosOs(
      db,
      (modelos) => {
        if (modelos.length === 0 && !seedAttempted) {
          seedAttempted = true
          // Try to auto-seed; succeeds for managers, fails silently for others
          seedModelosOsIfEmpty(db).catch(() => {
            // Write permission denied — just show empty state
            setState({ status: 'ready', modelos: [], byCategory: buildByCategory([]) })
          })
          // Wait for the next snapshot triggered by the seed write
          return
        }
        setState({ status: 'ready', modelos, byCategory: buildByCategory(modelos) })
      },
      (err) => setState({ status: 'error', message: err.message }),
    )
    return () => unsub()
  }, [])

  return state
}
