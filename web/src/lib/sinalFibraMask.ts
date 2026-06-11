/**
 * Máscara do sinal da fibra: captura apenas dígitos e formata como `00.00`.
 * Ex.: "1234" ou "12.34" -> "12.34"; "850" -> "8.50".
 */
export function formatSinalFibraMask(raw: string): string {
  const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, digits.length - 2)}.${digits.slice(digits.length - 2)}`
}

/**
 * Saída do sinal para o texto da O.S.: `-00.00DBM`.
 * Retorna string vazia quando não há valor numérico.
 */
export function formatSinalFibraSaida(raw: string): string {
  const masked = formatSinalFibraMask(raw)
  return masked ? `-${masked}DBM` : ''
}
