import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { parseOsTemplate, type OsTemplate } from '../types/osTemplate'
import type { UserProfile } from '../types/profile'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; templates: OsTemplate[] }
  | { status: 'error'; message: string }

export function useAdminOsTemplates(profile: UserProfile | null) {
  const [state, setState] = useState<State>({ status: 'idle' })
  const [reloadTick, setReloadTick] = useState(0)

  const reload = useCallback(() => {
    setReloadTick((t) => t + 1)
  }, [])

  useEffect(() => {
    if (!profile) {
      setState({ status: 'ready', templates: [] })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })

    const promise = profile.isDev
      ? getDocs(collection(db, 'osTemplates'))
      : getDocs(
          query(
            collection(db, 'osTemplates'),
            where('sector', '==', profile.sector),
          ),
        )

    promise
      .then((snap) => {
        if (cancelled) return
        const list: OsTemplate[] = []
        snap.forEach((d) => {
          const parsed = parseOsTemplate(
            d.id,
            d.data() as Record<string, unknown>,
          )
          if (parsed) list.push(parsed)
        })
        list.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
        setState({ status: 'ready', templates: list })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Erro ao carregar modelos.'
        setState({ status: 'error', message })
      })

    return () => {
      cancelled = true
    }
  }, [profile, reloadTick])

  return { state, reload }
}
