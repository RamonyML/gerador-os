import type { UserProfile } from '../types/profile'

/** Quem pode criar/editar/desativar modelos de O.S no app (não só pelo console). */
export function canManageOsTemplates(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return (
    profile.hierarchy === 'gerente' || profile.hierarchy === 'supervisor'
  )
}
