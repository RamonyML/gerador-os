import type { UserProfile } from '../types/profile'

/** Agenda: todo o setor Suporte (operador, supervisor, gerente) + dev/admin. */
export function canAccessAgenda(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.sector === 'suporte'
}

/**
 * Editar células da agenda: histórico de edições e status operacional.
 * Liberado para isValidacao, gerentes do suporte e dev/admin.
 */
export function canEditAgendaCells(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  if (profile.isValidacao === true) return true
  return profile.sector === 'suporte' && profile.hierarchy === 'gerente'
}

/** Gerenciar técnicos da agenda (adicionar, renomear, remover, trocar veículo). */
export function canManageAgendaTecnicos(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.sector === 'suporte' && profile.hierarchy === 'gerente'
}

/** Upgrades: exclusivo do setor Suporte (operador, supervisor, gerente) + dev/admin. */
export function canAccessUpgrades(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.sector === 'suporte'
}

/** Gestão de contas (Auth + documento `users/{uid}`) via Cloud Functions. */
export function canManageUsers(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.hierarchy === 'gerente'
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
  return profile.hierarchy === 'gerente'
}

/** Criar/editar avisos do sistema. */
export function canManageNotices(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.hierarchy === 'gerente'
}

/** Criar, editar e excluir modelos de O.S. */
export function canManageModelosOs(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  if (profile.isDev === true || profile.isAdmin === true) return true
  return profile.hierarchy === 'gerente'
}

/**
 * Ambiente de validação de mudanças de endereço.
 * Em desenvolvimento — restrito a isDev até o lançamento oficial.
 * Ao lançar, descomentar: isAdmin, isValidacao, hierarchy === 'gerente'
 */
export function canAccessValidacao(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  return profile.isDev === true
}

/**
 * Cadastrar nova mudança de endereço para validação.
 * Em desenvolvimento — restrito a isDev até o lançamento oficial.
 */
export function canCreateMudancaEndereco(profile: UserProfile | null): boolean {
  if (!profile || profile.active === false) return false
  return profile.isDev === true
}
