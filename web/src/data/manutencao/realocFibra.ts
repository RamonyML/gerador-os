import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Remanejamento de fibra — fluxo único com variações.
 * Paridade com legado-exemplo/suporte/realoc-fibra/:
 * - realoc-fibra.html (titular / padrão)
 * - realoc-fibra-pj.html (pessoa jurídica)
 * - realoc-fibra1/realoc-fibra1.html (titular solicita e autoriza terceiro)
 * - realoc-fibra2/realoc-fibra2.html (terceiro solicita, titular ausente)
 * - realoc-fibra3/realoc-fibra3.html (terceiro solicita, titular presente)
 *
 * Observação: o legado tem separadores de tamanhos diferentes por variação
 * (39, 38 e 41 sinais de `=`) e espaçamentos inconsistentes — reproduzidos fielmente.
 */

export const T_PJ = 'pessoa-juridica'

const SEP39 = '='.repeat(39)
const SEP38 = '='.repeat(38)
const SEP41 = '='.repeat(41)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA SOLICITAÇÃO'
const S_AGE = 'AGENDAMENTO'

const VALOR_50 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSÁRIO FAZER EMENDA TÉCNICA, O VALOR É DE R$ 50,00 REFERENTE A MÃO DE OBRA TÉCNICA.'
const VALOR_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSÁRIO FAZER EMENDA TÉCNICA, O VALOR É DE R$ 100,00 REFERENTE A MÃO DE OBRA TÉCNICA.'
const VALOR_50_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVIÇO É DE R$50,00. EXPLIQUEI TAMBÉM QUE CASO DROP (CABO/FIBRA) NÃO TENHA SOBRA E FOR NECESSÁRIO SER SUBSTITUÍDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PEÇAS E SERVIÇOS).'

export const REALOC_FIBRA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{realocFibraTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{realocFibraTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{realocFibraTextoAgenda}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

function sp(n: number): string {
  return ' '.repeat(n)
}

const TECNICO_PREFIX =
  'TÉCNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TÉCNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXÃO. CASO NÃO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZAÇÃO COM '

function tecnico(quem: string): string {
  return `${TECNICO_PREFIX}${quem}. TEMPO ESTIMADO 60 MIN.`
}

function osText(intro: string, sep: string, quem: string, trailingNL: boolean): string {
  let s = `${intro}

${sep}

INDICAÇÃO TÉCNICA:

${tecnico(quem)}`
  if (trailingNL) s += '\n'
  return s
}

export function buildRealocFibraTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || T_TITULAR
  const clienteUpper = upper(v.cliente)
  const cp = first(clienteUpper)
  const solicitanteUpper = upper(v.solicitante)
  const sp_ = first(solicitanteUpper)
  const parente = upper(v.parente)
  const cargo = upper(v.cargo)
  const canal = v.canal
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const sinalONU = upper(v.sinalONU)
  const bairro = upper(v.bairro)
  const motivo = upper(v.motivo)
  const valor = v.valor
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const protocolo = v.protocolo

  const agenda = `MAN REMANEJAMENTO DE FIBRA ${clienteUpper} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`

  let protocoloTxt = ''
  let os = ''

  if (tipo === T_PJ) {
    protocoloTxt = [
      `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.`,
      '',
      SEP39,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '',
      SEP39,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      sp(4),
      SEP39,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} CLIENTE PAGARÁ EM ${formaPag}. AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HORAS.`
    os = osText(intro, SEP39, sp_, false)
  } else if (tipo === T_TITULAR_TERCEIRO) {
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.`,
      '',
      SEP38,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '',
      SEP38,
      '',
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      sp(4),
      SEP38,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}, ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} CLIENTE PAGARÁ EM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    os = osText(intro, SEP38, 'CLIENTE', true)
  } else if (tipo === T_TERCEIRO_TERCEIRO) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E SOLICITOU SUPORTE.`,
      '',
      SEP41,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU} SEM OSCILAÇÃO.`,
      '',
      SEP41,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      '',
      SEP41,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}.`,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} ${sp_} SOLICITOU PAGAR EM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    os = osText(intro, SEP41, 'CLIENTE', false)
  } else if (tipo === T_TERCEIRO_TITULAR) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E SOLICITOU SUPORTE.`,
      '',
      SEP41,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '',
      SEP41,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      sp(4),
      SEP41,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}.`,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} ${sp_} ESCOLHEU PAGAR EM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    os = osText(intro, SEP41, 'CLIENTE', false)
  } else {
    // T_TITULAR (padrão)
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.`,
      '',
      SEP39,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '',
      SEP39,
      '',
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      '',
      `${valor}. VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      '',
      SEP39,
      '',
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} CLIENTE PAGARÁ EM ${formaPag}. AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HORAS.`
    os = osText(intro, SEP39, cp, true)
  }

  return {
    realocFibraTextoProtocolo: protocoloTxt,
    realocFibraTextoOS: os,
    realocFibraTextoAgenda: agenda,
  }
}

const COM_SOLICITANTE = [T_PJ, T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_TERCEIRO = [T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_CONTATO_SOL = [T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]

export const REALOC_FIBRA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: T_TITULAR,
    options: [
      { value: T_TITULAR, label: 'Titular solicita e acompanha', icon: 'user-round' },
      { value: T_PJ, label: 'Pessoa jurídica', icon: 'factory' },
      {
        value: T_TERCEIRO_TERCEIRO,
        label: 'Terceiro solicita (titular ausente)',
        icon: 'users-round',
      },
      {
        value: T_TERCEIRO_TITULAR,
        label: 'Terceiro solicita (titular presente)',
        icon: 'users-round',
      },
      {
        value: T_TITULAR_TERCEIRO,
        label: 'Titular solicita e autoriza terceiro',
        icon: 'user-round',
      },
    ],
    layout: { md: 12 },
  },
  {
    id: 'solicitante',
    label: 'Solicitante / autorizado',
    control: 'text',
    placeholder: 'Nome completo de quem entrou em contato (ou autorizado)',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_SOLICITANTE },
    layout: { md: 8 },
  },
  {
    id: 'cargo',
    label: 'Cargo/Função',
    control: 'text',
    placeholder: 'Ex.: Sócio, Admin, Gerente…',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: [T_PJ] },
    layout: { md: 4 },
  },
  {
    id: 'parente',
    label: 'Grau de relacionamento',
    control: 'text',
    placeholder: 'Ex.: Mãe, Filho, Irmão, Esposa…',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_TERCEIRO },
    layout: { md: 4 },
  },
  {
    id: 'contatoSol',
    label: 'Contato do solicitante',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_CONTATO_SOL },
    layout: { md: 4 },
  },
  {
    id: 'cliente',
    label: 'Nome completo / Razão social',
    control: 'text',
    placeholder: 'Nome completo (ou razão social, p/ pessoa jurídica)',
    section: S_ID,
    layout: { md: 12 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 3 },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-19.20 DBM ou SEM SINAL',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Insira o bairro do cliente',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'motivo',
    label: 'Motivo do remanejamento (o que o cliente disse)',
    control: 'text',
    placeholder: "Ex.: 'realizou reforma em sua sala e precisa realocar o drop interno'",
    section: S_DET,
    layout: { md: 8 },
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'valor',
    label: 'Valor / explicação de custo',
    control: 'select',
    section: S_DET,
    layout: { md: 12 },
    options: [
      { value: VALOR_50, label: 'R$50,00' },
      { value: VALOR_100, label: 'R$100,00' },
      { value: VALOR_50_100, label: 'R$50 ou R$100' },
    ],
  },
  {
    id: 'dataVisita',
    label: 'Data da visita técnica',
    control: 'date',
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 4 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: [
      { value: '08:30', label: '08:30' },
      { value: '09:30', label: '09:30' },
      { value: '10:30', label: '10:30' },
      { value: '11:30', label: '11:30' },
      { value: '13:30', label: '13:30' },
      { value: '14:30', label: '14:30' },
      { value: '15:30', label: '15:30' },
      { value: '16:30', label: '16:30' },
      { value: '17:30', label: '17:30' },
    ],
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
]

export function getManutRealocFibraDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-realoc-fibra',
    title: 'Remanejamento de fibra',
    demandCategory: 'manutencao',
    outputTemplate: REALOC_FIBRA_OUTPUT,
    fields: REALOC_FIBRA_FIELDS.map((f) => ({ ...f })),
  }
}
