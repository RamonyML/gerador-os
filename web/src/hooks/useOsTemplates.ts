import { useMemo } from 'react'
import { getOsTemplatesForProfile } from '../data/osTemplateRegistry'
import type { OsTemplate } from '../types/osTemplate'
import type { UserProfile } from '../types/profile'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; templates: OsTemplate[] }
  | { status: 'error'; message: string }

export function useOsTemplates(profile: UserProfile | null) {
  const state = useMemo((): State => {
    if (!profile) {
      return { status: 'ready', templates: [] }
    }
    return {
      status: 'ready',
      templates: getOsTemplatesForProfile(profile),
    }
  }, [profile])

  return state
}
