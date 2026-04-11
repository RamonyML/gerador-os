/** Resultado normalizado para preencher campos do formulário. */
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

function fetchWithTimeout(
  url: string,
  timeoutMs = 3000,
): Promise<Response> {
  const controller = new AbortController()
  const id = window.setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { signal: controller.signal }).finally(() =>
    window.clearTimeout(id),
  )
}

/**
 * ViaCEP primeiro; em falha, Brasil API (mesma lógica do index-mud-end.html).
 */
export async function fetchCepWithFallback(
  cepRaw: string,
): Promise<CepLookupResult> {
  const cepLimpo = cepRaw.replace(/\D/g, '')
  if (cepLimpo.length !== 8) {
    throw new CepLookupError('CEP deve conter 8 dígitos')
  }

  try {
    const response = await fetchWithTimeout(
      `https://viacep.com.br/ws/${cepLimpo}/json/`,
      3000,
    )
    if (response.ok) {
      const data = (await response.json()) as {
        erro?: boolean
        logradouro?: string
        bairro?: string
        localidade?: string
        uf?: string
      }
      if (!data.erro) {
        return {
          logradouro: data.logradouro ?? '',
          bairro: data.bairro ?? '',
          cidade: data.localidade ?? '',
          uf: data.uf ?? '',
        }
      }
    }
    throw new Error('ViaCEP retornou erro')
  } catch {
    try {
      const response = await fetchWithTimeout(
        `https://brasilapi.com.br/api/cep/v1/${cepLimpo}`,
        3000,
      )
      if (!response.ok) {
        throw new Error('BrasilAPI falhou')
      }
      const data = (await response.json()) as {
        street?: string
        neighborhood?: string
        city?: string
        state?: string
      }
      return {
        logradouro: data.street ?? '',
        bairro: data.neighborhood ?? '',
        cidade: data.city ?? '',
        uf: data.state ?? '',
      }
    } catch (err) {
      const aborted =
        (typeof DOMException !== 'undefined' &&
          err instanceof DOMException &&
          err.name === 'AbortError') ||
        (err instanceof Error && err.name === 'AbortError')
      const msg = aborted
        ? 'Tempo de resposta excedido. Tente novamente.'
        : 'Não foi possível buscar o CEP. Tente novamente mais tarde.'
      throw new CepLookupError(msg)
    }
  }
}

export function normalizeCepInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
}
