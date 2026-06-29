import type { OsTemplateField } from '../../types/osTemplate'

/** Separadores do legado compra-roku-tv (17 e 35 asteriscos). */
export const SEP_PROTO = '*'.repeat(17)
export const SEP_OS = '*'.repeat(35)

export const S_COMPRA = 'DETALHES DA COMPRA'
export const S_AGE = 'AGENDAMENTO'

export function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

export function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

export function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function sp(n: number): string {
  return ' '.repeat(n)
}

export const ROKU_VALOR_OPTS = [
  { value: 'R$200,00', label: 'R$200,00 à vista' },
  { value: 'R$230,00', label: 'R$230,00 parcelado' },
] as const

export const ROKU_PARCELAS_OPTS = [
  { value: '1x', label: '1x' },
  { value: '2x', label: '2x' },
  { value: '3x', label: '3x' },
] as const

export const ROKU_FORMA_PAG_OPTS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTAO' },
] as const

export const ROKU_HORA_VISITA_OPTS = [
  { value: '08:30', label: '08:30' },
  { value: '09:30', label: '09:30' },
  { value: '10:30', label: '10:30' },
  { value: '11:30', label: '11:30' },
  { value: '14:30', label: '14:30' },
  { value: '15:30', label: '15:30' },
  { value: '16:30', label: '16:30' },
  { value: '17:30', label: '17:30' },
] as const

export const ROKU_COMPRA_FIELDS: OsTemplateField[] = [
  {
    id: 'valorSTB',
    label: 'Tipo da compra',
    control: 'select',
    section: S_COMPRA,
    layout: { md: 4 },
    options: [...ROKU_VALOR_OPTS],
  },
  {
    id: 'parcelas',
    label: 'Parcelas',
    control: 'select',
    section: S_COMPRA,
    layout: { md: 4 },
    options: [...ROKU_PARCELAS_OPTS],
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_COMPRA,
    layout: { md: 4 },
    options: [...ROKU_FORMA_PAG_OPTS],
  },
]

export const ROKU_AGENDAMENTO_FIELDS: OsTemplateField[] = [
  {
    id: 'protocolo',
    label: 'Nº Protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    layout: { md: 3 },
  },
  { id: 'dataVisita', label: 'Data da visita', control: 'date', placeholder: 'dd/mm/aaaa', section: S_AGE, layout: { md: 3 } },
  {
    id: 'horaVisita',
    label: 'Horário',
    control: 'select',
    section: S_AGE,
    layout: { md: 3 },
    options: [...ROKU_HORA_VISITA_OPTS],
  },
]

type RokuValues = {
  clienteUpper: string
  cp: string
  sinalONU: string
  bairro: string
  valorSTB: string
  parcelas: string
  formaPag: string
  dataVisita: string
  horaVisita: string
  protocolo: string
}

function parseRokuValues(rawValues: Record<string, unknown>): RokuValues {
  const clienteUpper = upper(rawValues.cliente)
  return {
    clienteUpper,
    cp: first(clienteUpper),
    sinalONU: upper(rawValues.sinalONU),
    bairro: upper(rawValues.bairro),
    valorSTB: String(rawValues.valorSTB ?? ''),
    parcelas: String(rawValues.parcelas ?? ''),
    formaPag: String(rawValues.formaPag ?? ''),
    dataVisita: String(rawValues.dataVisita ?? ''),
    horaVisita: String(rawValues.horaVisita ?? ''),
    protocolo: String(rawValues.protocolo ?? ''),
  }
}

/** Bloco central compartilhado (protocolo) — idêntico nos dois legados. */
function protocoloCorpo(v: RokuValues): string[] {
  return [
    SEP_PROTO,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${v.sinalONU} SEM OSCILAÇÃO.`,
    '',
    SEP_PROTO,
    sp(8),
    `QUESTIONADO, ${v.cp} INFORMOU QUE CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET).  `,
    '',
    SEP_PROTO,
    sp(8),
    'VALOR DO ROKU-TV: R$200,00, SE PAGO À VISTA, OU R$230,00 SE PARCELADO EM ATÉ 3X NO CARTÃO DE CRÉDITO.',
    '',
    'PAGAMENTO PODE SER REALIZADO EM DINHEIRO, PIX OU CARTÃO.',
    sp(8),
    SEP_PROTO,
    sp(8),
    'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA (ISENTA DE CUSTOS) PARA INSTALAÇÃO DO APARELHO ROKU-TV (CONVERSOR DE MÍDIA)',
    '',
    SEP_PROTO,
    sp(8),
    `INFORMEI A ${v.cp} QUE UMA VEZ QUE REALIZAR A COMPRA DO ROKU-TV, O MESMO PASSA A SER SEU, NÃO HAVENDO DEVOLUÇÃO DO EQUIPAMENTO (ROKU) NEM RESTITUIÇÃO DO VALOR PAGO. ${v.cp} CONCORDOU COM OS TERMOS DA VISITA E PAGARÁ O ROKU-TV EM ${v.formaPag}. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HORAS.`,
    sp(4),
    'GARANTIA DO APARELHO ADQUIRIDO É DE 90 DIAS PARA DEFEITOS DE FABRICAÇÃO.',
  ]
}

function osCorpo(intro: string, v: RokuValues): string {
  return [
    `${intro} POIS CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET) VALOR DO ROKU-TV: ${v.valorSTB}, PGM EM ${v.parcelas} NO ${v.formaPag} A SER PAGO NO INÍCIO DA INSTALAÇÃO. COM O APARELHO (ROKU-TV) CLIENTE TERÁ ACESSO À LOJA DE APLICATIVOS ONDE PODERÁ UTILIZAR O SERVIÇO DE STREAMING QUE TEM NOME DE MZ TV, E TAL SERVIÇO É GRATUITO ENQUANTO CLIENTE FOR ASSINANTE E ADIMPLENTE DO SERVIÇO DE INTERNET MZNET COM O PLANO CONTRATADO QUE POSSUI TAL BENEFÍCIO, E NÃO SENDO MAIS, NÃO HAVERÁ DEVOLUÇÃO DO EQUIPAMENTO (ROKU-TV) NEM RESTITUIÇÃO DO VALOR PAGO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HORAS.`,
    '',
    SEP_OS,
    '',
    'INDICAÇÃO TÉCNICA:',
    '',
    'TÉCNICO: INSTALAR ROKU-TV, CONECTA-LO PREFERENCIALMENTE VIA REDE WI-FI 5G E EXPLICAR DIFERENÇAS DESTA CONEXÃO. CONFIGURAR USUÁRIO E SENHA DO SERVIÇO DE STREAMING, ORIENTAR SOBRE UTILIZAÇÃO (DO SERVIÇO E DO EQUIPAMENTO/ROKU-TV). TEMPO ESTIMADO 30 MINUTOS.',
  ].join('\n')
}

export function buildRokuPadraoTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v = parseRokuValues(rawValues)
  const canal = String(rawValues.canal ?? '')
  const contato = digits(rawValues.contato)

  const protocolo = [
    `${v.cp} SOLICITOU POR ${canal} (${contato}) A COMPRA DO ROKU-TV (CONVERSOR DE MÍDIA).`,
    '',
    ...protocoloCorpo(v),
  ].join('\n')

  const osIntro = `${v.cp} SOLICITOU POR ${canal} (${contato}) A COMPRA DO ROKU-TV (CONVERSOR DE MÍDIA)`
  const agenda = `COMPRA ROKU-TV ${v.clienteUpper} PROT:${v.protocolo} ${v.formaPag} (${operadorPrimeiroNome}) - ${v.bairro}`

  return {
    rokuPadraoTextoProtocolo: protocolo,
    rokuPadraoTextoOS: osCorpo(osIntro, v),
    rokuPadraoTextoAgenda: agenda,
  }
}

export function buildRokuSegmentos(
  rawValues: Record<string, unknown>,
  variant: 'PADRAO' | 'PRESENCIAL',
): { info: string; comentarios: string[] } {
  const v = parseRokuValues(rawValues)
  const canal = String(rawValues.canal ?? '')
  const contato = digits(rawValues.contato)

  const intro = variant === 'PRESENCIAL'
    ? `${v.cp} COMPARECEU NA LOJA E SOLICITOU A COMPRA DO ROKU-TV (CONVERSOR DE MÍDIA).`
    : `${v.cp} SOLICITOU POR ${canal} (${contato}) A COMPRA DO ROKU-TV (CONVERSOR DE MÍDIA).`

  const clienteSem = `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${v.sinalONU} SEM OSCILAÇÃO.`
  const questionado = `QUESTIONADO, ${v.cp} INFORMOU QUE CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET).`
  const valores = 'VALOR DO ROKU-TV: R$200,00, SE PAGO À VISTA, OU R$230,00 SE PARCELADO EM ATÉ 3X NO CARTÃO DE CRÉDITO.\nPAGAMENTO PODE SER REALIZADO EM DINHEIRO, PIX OU CARTÃO.'
  const informeiVisita = 'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA (ISENTA DE CUSTOS) PARA INSTALAÇÃO DO APARELHO ROKU-TV (CONVERSOR DE MÍDIA).'
  const concordou = `INFORMEI A ${v.cp} QUE UMA VEZ QUE REALIZAR A COMPRA DO ROKU-TV, O MESMO PASSA A SER SEU, NÃO HAVENDO DEVOLUÇÃO DO EQUIPAMENTO (ROKU) NEM RESTITUIÇÃO DO VALOR PAGO. ${v.cp} CONCORDOU COM OS TERMOS DA VISITA E PAGARÁ O ROKU-TV EM ${v.formaPag}.`
  const agendada = `VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HORAS.\nGARANTIA DO APARELHO ADQUIRIDO É DE 90 DIAS PARA DEFEITOS DE FABRICAÇÃO.`

  return {
    info: `${intro}\n\n${clienteSem}`,
    comentarios: [
      questionado,
      valores,
      informeiVisita,
      concordou,
      agendada,
    ],
  }
}

export function buildRokuPresencialTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v = parseRokuValues(rawValues)

  const protocolo = [
    `${v.cp} COMPARECEU NA LOJA E SOLICITOU A COMPRA DO ROKU-TV (CONVERSOR DE MÍDIA).`,
    '',
    ...protocoloCorpo(v),
  ].join('\n')

  const osIntro = `${v.cp} COMPARECEU NA LOJA E SOLICITOU A COMPRA DE ROKU-TV (CONVERSOR DE MÍDIA)`
  const agenda = `COMPRA ROKU-TV ${v.clienteUpper} PROT:${v.protocolo} ${v.formaPag} (${operadorPrimeiroNome}) - ${v.bairro}`

  return {
    rokuPresencialTextoProtocolo: protocolo,
    rokuPresencialTextoOS: osCorpo(osIntro, v),
    rokuPresencialTextoAgenda: agenda,
  }
}
