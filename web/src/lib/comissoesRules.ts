/**
 * Regras de comissão sobre upgrades/Roku — escopo **Suporte**.
 * Comissões do setor Comercial (vendas) serão definidas em módulo futuro.
 */

export function calcularComissaoAtivos(quantidade: number): number {
  if (quantidade <= 49) return quantidade * 11
  if (quantidade <= 59) return quantidade * 13
  if (quantidade <= 69) return quantidade * 15
  if (quantidade <= 79) return quantidade * 18
  if (quantidade <= 89) return quantidade * 21
  if (quantidade <= 99) return quantidade * 24
  return quantidade * 28
}

export function calcularComissaoReceptivos(quantidade: number): number {
  return quantidade * 9
}
