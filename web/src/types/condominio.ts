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

/**
 * Estado da geocodificação do endereço:
 * - `pending`: ainda não tentou (ou endereço mudou) — não aparece no mapa.
 * - `ok`: possui `lat`/`lng` válidos e é plotado no mapa de cobertura.
 * - `failed`: tentou geocodificar mas não localizou o endereço.
 */
export type CondominioGeocodeStatus = 'pending' | 'ok' | 'failed'

export function isCondominioGeocodeStatus(
  v: unknown,
): v is CondominioGeocodeStatus {
  return v === 'pending' || v === 'ok' || v === 'failed'
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
  /** Coordenadas geocodificadas do endereço (null enquanto não resolvidas). */
  lat: number | null
  lng: number | null
  geocodeStatus: CondominioGeocodeStatus
  geocodedAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

/** Campos editáveis (sem metadados/ID). */
export type CondominioDraft = Omit<
  Condominio,
  'id' | 'createdAt' | 'updatedAt' | 'geocodedAt'
>

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
    lat: null,
    lng: null,
    geocodeStatus: 'pending',
  }
}
