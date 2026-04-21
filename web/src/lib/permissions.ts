import type { UserProfile } from '../types/profile'

/** Quem pode criar/editar/desativar modelos de O.S no app (não só pelo console). */
export function canManageOsTemplates(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return (
    profile.hierarchy === 'gerente' || profile.hierarchy === 'supervisor'
  )
}

/** Gestão de contas (Auth + documento `users/{uid}`) via Cloud Functions. */
export function canManageUsers(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return (
    profile.hierarchy === 'gerente' || profile.hierarchy === 'supervisor'
  )
}

/**
 * Lista completa de upgrades, filtros por operador e exportação global.
 * Operador comum só vê os próprios; visão ampla é para gestão do **Suporte**
 * (upgrades/Roku são fluxo do setor suporte — comercial terá comissão por vendas à parte).
 */
export function canViewAllUpgradesInRegistry(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  if (profile.sector !== 'suporte') return false
  return (
    profile.hierarchy === 'gerente' || profile.hierarchy === 'supervisor'
  )
}

/** Dashboard analítico + auditoria (gestão Suporte). */
export function canViewUpgradeAnalytics(profile: UserProfile | null): boolean {
  return canViewAllUpgradesInRegistry(profile)
}

/** Relatório de comissões sobre upgrades/Roku — destinado ao setor Suporte (PDF e tela). */
export function canViewUpgradeCommissions(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  if (profile.sector !== 'suporte') return false
  return (
    profile.hierarchy === 'gerente' || profile.hierarchy === 'supervisor'
  )
}

/**
 * Editar definições de turnos e a grade mensal da escala do setor.
 * Operadores só visualizam; gestão fica com gerente/supervisor (e dev/admin).
 */
export function canManageWorkSchedule(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return (
    profile.hierarchy === 'gerente' || profile.hierarchy === 'supervisor'
  )
}

/** Criar/editar avisos do sistema. */
export function canManageNotices(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.hierarchy === 'gerente'
}
