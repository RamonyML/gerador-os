import type { UserProfile } from '../types/profile'

/**
 * Abertura/consulta de chamados internos: qualquer colaborador ativo.
 * (Todos os usuários podem abrir e acompanhar os próprios chamados.)
 */
export function canUseHelpdesk(profile: UserProfile | null): boolean {
  return !!profile && profile.active !== false
}

/**
 * Gestão dos chamados (estilo GLPI): receber, resgatar, atribuir, atualizar e
 * encerrar com parecer resolutivo. Restrito ao setor **T.I** (e dev/admin).
 */
export function canManageHelpdesk(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.sector === 'ti'
}
