import type { UserProfile } from '../types/profile'

/** Hub Suporte + demandas: setor suporte, ou admin/dev. */
export function canAccessSupportHub(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.sector === 'suporte'
}
