export type CondominioCategoria = 'viavel' | 'inviavel'

export const CONDOMINIO_CATEGORIA_LABELS: Record<CondominioCategoria, string> = {
  viavel: 'Com viabilidade',
  inviavel: 'Inviabilidade',
}

export type CondominioGeocodeStatus = 'pending' | 'ok' | 'failed'

export type Condominio = {
  id: string
  categoria: CondominioCategoria
  nome: string
  rua: string
  numero: string
  cep: string
  bairro: string
  obs: string
  lat: number | null
  lng: number | null
  geocodeStatus: CondominioGeocodeStatus
}

export function isCondominioCategoria(v: unknown): v is CondominioCategoria {
  return v === 'viavel' || v === 'inviavel'
}

export function isCondominioGeocodeStatus(v: unknown): v is CondominioGeocodeStatus {
  return v === 'pending' || v === 'ok' || v === 'failed'
}
