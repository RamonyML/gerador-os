export type CepLookupResult = {
  logradouro: string
  bairro: string
  cidade: string
  uf: string
}

export class CepLookupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CepLookupError'
  }
}

function fetchWithTimeout(url: string, ms = 4000): Promise<Response> {
  const ctrl = new AbortController()
  const id = window.setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { signal: ctrl.signal }).finally(() => window.clearTimeout(id))
}

export async function fetchCepWithFallback(cepRaw: string): Promise<CepLookupResult> {
  const cep = cepRaw.replace(/\D/g, '')
  if (cep.length !== 8) throw new CepLookupError('CEP deve conter 8 dígitos')

  try {
    const r = await fetchWithTimeout(`https://viacep.com.br/ws/${cep}/json/`)
    if (r.ok) {
      const d = await r.json() as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }
      if (!d.erro) return { logradouro: d.logradouro ?? '', bairro: d.bairro ?? '', cidade: d.localidade ?? '', uf: d.uf ?? '' }
    }
    throw new Error('ViaCEP erro')
  } catch {
    try {
      const r = await fetchWithTimeout(`https://brasilapi.com.br/api/cep/v1/${cep}`)
      if (!r.ok) throw new Error('BrasilAPI falhou')
      const d = await r.json() as { street?: string; neighborhood?: string; city?: string; state?: string }
      return { logradouro: d.street ?? '', bairro: d.neighborhood ?? '', cidade: d.city ?? '', uf: d.state ?? '' }
    } catch {
      throw new CepLookupError('Não foi possível buscar o CEP. Tente novamente.')
    }
  }
}

export function normalizeCepInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
}
