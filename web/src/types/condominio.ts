/**
 * Cadastro de condomínios para consulta dos operadores.
 * - `viavel`: já possui fibra óptica / cabeamento óptico da MZNET implantado.
 * - `inviavel`: tentativa de instalação não autorizada (motivo na observação).
 */
export type CondominioCategoria = 'viavel' | 'inviavel'

export const CONDOMINIO_CATEGORIAS: CondominioCategoria[] = ['viavel', 'inviavel']

export const CONDOMINIO_CATEGORIA_LABELS: Record<CondominioCategoria, string> = {
  viavel: 'Com viabilidade',
  inviavel: 'Inviabilidade',
}

export type Condominio = {
  id: string
  categoria: CondominioCategoria
  nome: string
  rua: string
  numero: string
  cep: string
  bairro: string
  obs: string
  /** Campos exclusivos da categoria "viável". */
  sindico: string
  vistoriador: string
  /** Campos exclusivos da categoria "inviável". */
  dataTentativa: string
  novaVistoria: string
  tecnicoResponsavel: string
  createdAt: Date | null
  updatedAt: Date | null
}

/** Campos editáveis (sem metadados/ID). */
export type CondominioDraft = Omit<Condominio, 'id' | 'createdAt' | 'updatedAt'>

export function isCondominioCategoria(v: unknown): v is CondominioCategoria {
  return v === 'viavel' || v === 'inviavel'
}

export function emptyCondominioDraft(
  categoria: CondominioCategoria,
): CondominioDraft {
  return {
    categoria,
    nome: '',
    rua: '',
    numero: '',
    cep: '',
    bairro: '',
    obs: '',
    sindico: '',
    vistoriador: '',
    dataTentativa: '',
    novaVistoria: '',
    tecnicoResponsavel: '',
  }
}
