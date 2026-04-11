import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { parseOsTemplate, type OsTemplate } from '../types/osTemplate'
import type { UserProfile } from '../types/profile'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; templates: OsTemplate[] }
  | { status: 'error'; message: string }

export function useOsTemplates(profile: UserProfile | null) {
  const [state, setState] = useState<State>({ status: 'idle' })

  useEffect(() => {
    if (!profile) {
      setState({ status: 'ready', templates: [] })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })

    const q = query(
      collection(db, 'osTemplates'),
      where('active', '==', true),
    )

    getDocs(q)
      .then((snap) => {
        if (cancelled) return
        const list: OsTemplate[] = []
        snap.forEach((docSnap) => {
          const parsed = parseOsTemplate(
            docSnap.id,
            docSnap.data() as Record<string, unknown>,
          )
          if (parsed) list.push(parsed)
        })
        const filtered = profile.isDev
          ? list
          : list.filter((t) => t.sector === profile.sector)
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
        setState({ status: 'ready', templates: filtered })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Erro ao carregar templates.'
        setState({ status: 'error', message })
      })

    return () => {
      cancelled = true
    }
  }, [profile])

  return state
}
