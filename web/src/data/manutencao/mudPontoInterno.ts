import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Mudança de ponto interno — fluxo único com variações.
 * Paridade com legado-exemplo/suporte/mud-ponto-int/:
 * - mud-ponto-int.html (titular / padrão)
 * - mud-ponto-int-pj.html (pessoa jurídica)
 * - mudponto1/mudponto1.html (titular solicita e autoriza terceiro)
 * - mudponto2/mudponto2.html (terceiro solicita, titular ausente)
 * - mudponto3/mudponto3.html (terceiro solicita, titular presente)
 *
 * Observação: o legado mistura separadores `---` (titular/PJ/terceiro-autorizado)
 * e `*`×35 (variações de terceiro), além de espaçamentos inconsistentes
 * (linhas com 4 ou 8 espaços) — reproduzidos fielmente.
 */

export const T_PJ = 'pessoa-juridica'

const SEP_STAR = '*'.repeat(35)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA SOLICITAÇÃO'
const S_AGE = 'AGENDAMENTO'

const VALOR_50 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSARIO A PASSAGEM DE UM NOVO CABEAMENTO, O VALOR É DE R$ 50,00 REFERENTE A MÃO DE OBRA TÉCNICA.'
const VALOR_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSÁRIO FAZER EMENDA TÉCNICA, O VALOR É DE R$ 100,00 REFERENTE A MÃO DE OBRA TÉCNICA.'
const VALOR_50_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVIÇO É DE R$50,00. EXPLIQUEI TAMBÉM QUE CASO DROP (CABO/FIBRA) NÃO TENHA SOBRA E FOR NECESSÁRIO SER SUBSTITUÍDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PEÇAS E SERVIÇOS).'

export const MUD_PONTO_INT_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{mudPontoIntTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{mudPontoIntTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{mudPontoIntTextoAgenda}}',
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

const TECNICO =
  'TÉCNICO: EFETUAR A MUDANÇA DE PONTO DOS EQUIPAMENTOS PARA O LOCAL ESPECIFICADO PELO CLIENTE, CASO SEJA POSSÍVEL REAPROVEITAR CABO DROP USANDO A SOBRA E RECONECTORIZAR. SE NÃO DER TAMANHO, SERÁ NECESSARIO A PASSAGEM DE UM NOVO CABEAMENTO PARA CONCLUIR O SERVIÇO. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DA CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. ATUALIZAR FIRMWARE DO ROTEADOR SE NECESSÁRIO. TEMPO ESTIMADO: 60 MIN.'

function osText(intro: string): string {
  return `${intro}

${SEP_STAR}

INDICAÇÃO TÉCNICA:

${TECNICO}`
}

export function buildMudPontoIntTextos(
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
  const ambienteAtual = upper(v.ambienteAtual)
  const ambienteNovo = upper(v.ambienteNovo)
  const valor = v.valor
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const protocolo = v.protocolo

  const agenda = `MAN MUD PONTO INTERNO ${clienteUpper} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`

  let protocoloTxt = ''
  let os = ''

  if (tipo === T_PJ) {
    protocoloTxt = [
      `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMAÇÕES SOBRE MUDANÇA DE PONTO INTERNO`,
      '---',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '---',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      sp(4),
      SEP_STAR,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${sp_} (${cargo}) SOLICITOU POR ${canal} (${contato}) MUDANÇA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} CLIENTE PAGARÁ EM ${formaPag}. AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HORAS.`,
    )
  } else if (tipo === T_TITULAR_TERCEIRO) {
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMAÇÕES SOBRE MUDANÇA DE PONTO INTERNO`,
      '---',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '---',
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      sp(4),
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      sp(8),
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      sp(4),
      SEP_STAR,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}, ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${cp} SOLICITOU POR ${canal} (${contato}) MUDANÇA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} CLIENTE PAGARÁ EM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
  } else if (tipo === T_TERCEIRO_TERCEIRO) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO INFORMAÇÕES SOBRE MUDANÇA DE PONTO INTERNO`,
      '',
      SEP_STAR,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU} SEM OSCILAÇÃO.`,
      '',
      SEP_STAR,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      '',
      SEP_STAR,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}.`,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) MUDANÇA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} ${sp_} SOLICITOU PAGAR EM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
  } else if (tipo === T_TERCEIRO_TITULAR) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO INFORMAÇÕES SOBRE MUDANÇA DE PONTO INTERNO`,
      '',
      SEP_STAR,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '',
      SEP_STAR,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      sp(4),
      SEP_STAR,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}.`,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) MUDANÇA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} ${sp_} ESCOLHEU PAGAR EM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
  } else {
    // T_TITULAR (padrão)
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMAÇÕES SOBRE MUDANÇA DE PONTO INTERNO`,
      '---',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '---',
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      '',
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.`,
      sp(4),
      SEP_STAR,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${cp} SOLICITOU POR ${canal} (${contato}) MUDANÇA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} CLIENTE PAGARÁ EM ${formaPag}. AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HORAS.`,
    )
  }

  return {
    mudPontoIntTextoProtocolo: protocoloTxt,
    mudPontoIntTextoOS: os,
    mudPontoIntTextoAgenda: agenda,
  }
}

const COM_SOLICITANTE = [T_PJ, T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_TERCEIRO = [T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_CONTATO_SOL = [T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]

export const MUD_PONTO_INT_FIELDS: OsTemplateField[] = [
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
    label: 'Motivo da mudança de ponto (o que o cliente disse)',
    control: 'text',
    placeholder: "Ex.: 'realizou uma reforma em sua sala e deseja alterar o roteador de lugar'",
    section: S_DET,
    layout: { md: 12 },
  },
  {
    id: 'ambienteAtual',
    label: 'Ambiente atual',
    control: 'text',
    placeholder: 'Ex.: Sala',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'ambienteNovo',
    label: 'Novo ambiente',
    control: 'text',
    placeholder: 'Ex.: Quarto',
    section: S_DET,
    layout: { md: 4 },
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

export function getManutMudPontoIntDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-mud-ponto-int',
    title: 'Mudança de ponto interno',
    demandCategory: 'manutencao',
    outputTemplate: MUD_PONTO_INT_OUTPUT,
    fields: MUD_PONTO_INT_FIELDS.map((f) => ({ ...f })),
  }
}
