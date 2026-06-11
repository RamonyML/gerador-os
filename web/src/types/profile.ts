export type Sector =
  | 'suporte'
  | 'instalacao'
  | 'financeiro'
  | 'comercial'
  | 'cadastro'

export const SECTOR_LABELS: Record<Sector, string> = {
  suporte: 'Suporte',
  instalacao: 'Instalação',
  financeiro: 'Financeiro',
  comercial: 'Comercial',
  cadastro: 'Cadastro',
}

export const SECTORS: Sector[] = [
  'suporte',
  'instalacao',
  'financeiro',
  'comercial',
  'cadastro',
]

export type Hierarchy = 'gerente' | 'supervisor' | 'operador'

export interface UserProfile {
  sector: Sector
  hierarchy: Hierarchy
  displayName?: string
  email?: string
  isDev?: boolean
  isAdmin?: boolean
  /** Função T.I: gerencia o ambiente de chamados (GLPI), independente do setor. */
  isTi?: boolean
  active?: boolean
}

export function parseUserProfile(data: Record<string, unknown>): UserProfile | null {
  const sector = data.sector as Sector | undefined
  const hierarchy = data.hierarchy as Hierarchy | undefined
  if (!sector || !hierarchy) return null
  return {
    sector,
    hierarchy,
    displayName: typeof data.displayName === 'string' ? data.displayName : undefined,
    email: typeof data.email === 'string' ? data.email : undefined,
    isDev: data.isDev === true,
    isAdmin: data.isAdmin === true,
    isTi: data.isTi === true,
    active: data.active !== false,
  }
}
