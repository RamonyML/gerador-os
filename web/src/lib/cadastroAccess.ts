import type { UserProfile } from '../types/profile'

/** Hub Cadastro + demandas: setor cadastro, ou admin/dev. */
export function canAccessCadastroHub(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.sector === 'cadastro'
}
