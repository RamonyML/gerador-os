import { geocodeAddress } from './coverageMap'

/** Subconjunto de campos de endereço de um condomínio usados na geocodificação. */
export type CondominioAddressParts = {
  rua: string
  numero: string
  bairro: string
  cep: string
}

/** `true` quando há endereço suficiente para tentar geocodificar. */
export function hasGeocodableAddress(c: CondominioAddressParts): boolean {
  return Boolean(c.rua.trim() || c.bairro.trim() || c.cep.trim())
}

/** Monta a query de endereço (rua + número, bairro) para o geocoder. */
export function condominioAddressQuery(c: CondominioAddressParts): string {
  const street = [c.rua, c.numero]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ')
  const parts = [street, c.bairro.trim(), c.cep.trim()].filter(Boolean)
  return parts.join(' - ')
}

/**
 * Geocodifica o endereço de um condomínio. Retorna `{ lat, lng }` ou `null`
 * quando não há endereço suficiente ou o geocoder não localizou o ponto.
 */
export async function geocodeCondominio(
  c: CondominioAddressParts,
  signal?: AbortSignal,
): Promise<{ lat: number; lng: number } | null> {
  if (!hasGeocodableAddress(c)) return null
  const query = condominioAddressQuery(c)
  if (!query) return null
  const geo = await geocodeAddress(query, {
    signal,
    structured: {
      street: c.rua,
      number: c.numero || undefined,
      neighborhood: c.bairro || undefined,
      postalCode: c.cep || undefined,
    },
  })
  if (!geo) return null
  return { lat: geo.lat, lng: geo.lng }
}
