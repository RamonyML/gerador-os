function firstWord(fullName: string): string {
  return fullName.trim().toUpperCase().split(/\s+/).filter(Boolean)[0] ?? ''
}

/**
 * Retorna o nome de exibição do operador na O.S.:
 * - Normalmente: apenas o primeiro nome em maiúsculo.
 * - Se houver outro colaborador com o mesmo primeiro nome: "PRIMEIRO I."
 *   (inicial do último sobrenome), para evitar ambiguidade na agenda.
 */
export function deriveOperadorNome(myFullName: string, allFullNames: string[]): string {
  const myFirst = firstWord(myFullName)
  if (!myFirst) return ''

  const myUpper = myFullName.trim().toUpperCase()
  const conflict = allFullNames.some(
    (name) => firstWord(name) === myFirst && name.trim().toUpperCase() !== myUpper,
  )

  if (!conflict) return myFirst

  const parts = myUpper.split(/\s+/).filter(Boolean)
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return lastInitial ? `${myFirst} ${lastInitial}.` : myFirst
}
