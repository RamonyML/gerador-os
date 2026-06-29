function hexOnly(value: string): string {
  return value.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 12)
}

/** Máscara XX:XX:XX:XX:XX:XX para endereço MAC. */
export function formatMacMask(raw: string): string {
  const hex = hexOnly(raw)
  const parts: string[] = []
  for (let i = 0; i < hex.length; i += 2) {
    parts.push(hex.slice(i, i + 2))
  }
  return parts.join(':')
}
