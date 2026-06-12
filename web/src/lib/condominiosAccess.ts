import type { Sector, UserProfile } from '../types/profile'

/** Setores com acesso ao ambiente de condomínios (financeiro fica de fora). */
export const CONDOMINIO_SECTORS: Sector[] = [
  'suporte',
  'instalacao',
  'cadastro',
  'comercial',
]

/**
 * Acesso (consulta) ao ambiente de condomínios: setores suporte, instalação,
 * cadastro e comercial — e dev/admin têm acesso total.
 */
export function canAccessCondominios(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return CONDOMINIO_SECTORS.includes(profile.sector)
}

/**
 * Edição do cadastro de condomínios (criar/editar/excluir/importar). Restrito a
 * gerentes dos setores com acesso — e dev/admin têm acesso total. Demais
 * usuários apenas consultam.
 */
export function canManageCondominios(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.hierarchy === 'gerente' && CONDOMINIO_SECTORS.includes(profile.sector)
}
