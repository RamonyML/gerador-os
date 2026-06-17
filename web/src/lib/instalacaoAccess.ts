import type { UserProfile } from '../types/profile'

export function canAccessInstalacaoHub(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.sector === 'instalacao'
}
