/**
 * Modo "OFERTADO" para os fluxos de Alteração de Plano.
 *
 * A diferença entre o registro padrão (cliente solicitou) e o ofertado
 * (a empresa ofereceu) se resume a:
 *   1. Linha inicial do Protocolo: "<X> ENTROU EM CONTATO VIA <Y> SOLICITANDO
 *      ALTERAÇÃO DE PLANO." → "OFERTEI A <X> VIA <Y> ALTERAÇÃO DE PLANO."
 *   2. Remoção da linha "QUESTIONADO, CLIENTE DISSE QUE "...".".
 *   3. Rótulo "PLANO SOLICITADO:" / "PLANO ESCOLHIDO:" → "PLANO OFERTADO:".
 *   4. Início da O.S: "<X> SOLICITOU POR <Y> ALTERAÇÃO DO PLANO..." /
 *      "<X> ENTROU EM CONTATO VIA <Y> E SOLICITOU ALTERAÇÃO DO PLANO..." →
 *      "OFERTEI A <X> VIA <Y> ALTERAÇÃO DE PLANO DE INTERNET:".
 *
 * Todo o restante do texto (sinal, compatibilidade, visita, agenda, indicação
 * técnica e as variações de titular/terceiro) permanece idêntico. Por isso o
 * ofertado é derivado do texto padrão já gerado, garantindo paridade total no
 * corpo e centralizando a regra em um único lugar.
 */

export const ORIGEM_PADRAO = 'padrao'
export const ORIGEM_OFERTADO = 'ofertado'

export function isOfertado(rawValues: Record<string, unknown>): boolean {
  return String(rawValues.origem ?? ORIGEM_PADRAO) === ORIGEM_OFERTADO
}

export function aplicarOfertadoProtocolo(texto: string): string {
  return texto
    .replace(
      /^(.+?) ENTROU EM CONTATO VIA (.+?) SOLICITANDO ALTERAÇÃO DE PLANO\./m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO.',
    )
    .replace(/QUESTIONADO, CLIENTE DISSE QUE "[^\n]*"\.\n/, '')
    .replace(/PLANO SOLICITADO: ?/, 'PLANO OFERTADO: ')
}

export function aplicarOfertadoOS(texto: string): string {
  return texto
    .replace(
      /^(.+?) SOLICITOU POR (.+?) ALTERAÇÃO DO PLANO DE INTERNET:/m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO DE INTERNET:',
    )
    .replace(
      /^(.+?) ENTROU EM CONTATO VIA (.+?) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET:/m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO DE INTERNET:',
    )
    .replace(/PLANO ESCOLHIDO: ?/, 'PLANO OFERTADO: ')
}

export const ORIGEM_OPTS = [
  { value: ORIGEM_PADRAO, label: 'Cliente solicitou' },
  { value: ORIGEM_OFERTADO, label: 'Ofertado pela MZ' },
]
