import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Remanejamento de fibra — fluxo unico com variacoes.
 * Paridade com legado-exemplo/suporte/realoc-fibra/:
 * - realoc-fibra.html (titular / padrao)
 * - realoc-fibra-pj.html (pessoa juridica)
 * - realoc-fibra1/realoc-fibra1.html (titular solicita e autoriza terceiro)
 * - realoc-fibra2/realoc-fibra2.html (terceiro solicita, titular ausente)
 * - realoc-fibra3/realoc-fibra3.html (terceiro solicita, titular presente)
 *
 * Observacao: o legado tem separadores de tamanhos diferentes por variacao
 * (39, 38 e 41 sinais de `=`) e espacamentos inconsistentes — reproduzidos fielmente.
 */

export const T_PJ = 'pessoa-juridica'

const SEP39 = '='.repeat(39)
const SEP38 = '='.repeat(38)
const SEP41 = '='.repeat(41)

const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA SOLICITACAO'
const S_AGE = 'AGENDAMENTO'

const VALOR_50 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NAO SEJA POSSIVEL REAPROVEITA-LO SENDO NECESSARIO FAZER EMENDA TECNICA, O VALOR E DE R$ 50,00 REFERENTE A MAO DE OBRA TECNICA.'
const VALOR_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NAO SEJA POSSIVEL REAPROVEITA-LO SENDO NECESSARIO FAZER EMENDA TECNICA, O VALOR E DE R$ 100,00 REFERENTE A MAO DE OBRA TECNICA.'
const VALOR_50_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVICO E DE R$50,00. EXPLIQUEI TAMBEM QUE CASO DROP (CABO/FIBRA) NAO TENHA SOBRA E FOR NECESSARIO SER SUBSTITUIDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PECAS E SERVICOS).'

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
  'TECNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TECNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXAO. CASO NAO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZACAO COM '

function tecnico(quem: string): string {
  return `${TECNICO_PREFIX}${quem}. TEMPO ESTIMADO 60 MIN.`
}

function osText(intro: string, sep: string, quem: string, trailingNL: boolean): string {
  let s = `${intro}

${sep}

INDICACAO TECNICA:

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
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      '',
      SEP39,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      sp(4),
      SEP39,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} CLIENTE PAGARA EM ${formaPag}. AGENDADA PARA ${dataVisita} AS ${horaVisita} HORAS.`
    os = osText(intro, SEP39, sp_, false)
  } else if (tipo === T_TITULAR_TERCEIRO) {
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.`,
      '',
      SEP38,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      '',
      SEP38,
      '',
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      sp(4),
      SEP38,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} CLIENTE PAGARA EM ${formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    os = osText(intro, SEP38, 'CLIENTE', true)
  } else if (tipo === T_TERCEIRO_TERCEIRO) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E SOLICITOU SUPORTE.`,
      '',
      SEP41,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU} SEM OSCILACAO.`,
      '',
      SEP41,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      '',
      SEP41,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}.`,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} ${sp_} SOLICITOU PAGAR EM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    os = osText(intro, SEP41, 'CLIENTE', false)
  } else if (tipo === T_TERCEIRO_TITULAR) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E SOLICITOU SUPORTE.`,
      '',
      SEP41,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      '',
      SEP41,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      sp(4),
      SEP41,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}.`,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} ${sp_} ESCOLHEU PAGAR EM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    os = osText(intro, SEP41, 'CLIENTE', false)
  } else {
    // T_TITULAR (padrao)
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.`,
      '',
      SEP39,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      '',
      SEP39,
      '',
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      '',
      `${valor}. VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      '',
      SEP39,
      '',
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    const intro = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${valor} CLIENTE PAGARA EM ${formaPag}. AGENDADA PARA ${dataVisita} AS ${horaVisita} HORAS.`
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
    label: 'Tipo de solicitacao',
    control: 'select',
    highlight: true,
    defaultValue: T_TITULAR,
    options: [
      { value: T_TITULAR, label: 'Titular solicita e acompanha', icon: 'user-round' },
      { value: T_PJ, label: 'Pessoa juridica', icon: 'factory' },
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
    label: 'Cargo/Funcao',
    control: 'text',
    placeholder: 'Ex.: Socio, Admin, Gerente…',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: [T_PJ] },
    layout: { md: 4 },
  },
  {
    id: 'parente',
    label: 'Grau de relacionamento',
    control: 'text',
    placeholder: 'Ex.: Mae, Filho, Irmao, Esposa…',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_TERCEIRO },
    layout: { md: 4 },
  },
  {
    id: 'contatoSol',
    label: 'Contato do solicitante',
    control: 'phone',
    placeholder: 'Somente os numeros',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_CONTATO_SOL },
    layout: { md: 4 },
  },
  {
    id: 'cpf',
    label: 'CPF / CNPJ',
    control: 'text',
    placeholder: 'Somente numeros',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'cliente',
    label: 'Nome completo / Razao social',
    control: 'text',
    placeholder: 'Nome completo (ou razao social, p/ pessoa juridica)',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 3 },
    options: [
      { value: 'LIGACAO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os numeros',
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
    label: 'Valor / explicacao de custo',
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

export function buildRealocFibraSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo           = v.tipoSolicitacao || T_TITULAR
  const cp             = first(upper(v.cliente))
  const solUpper       = upper(v.solicitante)
  const sp_            = first(solUpper)
  const parente        = upper(v.parente)
  const cargo          = upper(v.cargo)
  const canal          = upper(v.canal)
  const contato        = digits(v.contato)
  const contatoSol     = digits(v.contatoSol)
  const sinalONU       = upper(v.sinalONU)
  const motivo         = upper(v.motivo)
  const valor          = v.valor || ''
  const formaPag       = upper(v.formaPag)
  const dataV          = v.dataVisita || 'XX/XX/XXXX'
  const horaV          = v.horaVisita || 'XX:XX'

  if (tipo === T_PJ) {
    return {
      info: `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      comentarios: [
        `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
        `${valor}`,
        `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.`,
      ],
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    return {
      info: `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      comentarios: [
        `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
        `${valor}`,
        `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}. ${cp} NAO ESTARA PRESENTE, MAS AUTORIZOU ${solUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.`,
        `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.`,
      ],
    }
  }

  if (tipo === T_TERCEIRO_TERCEIRO) {
    return {
      info: `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E SOLICITOU SUPORTE.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      comentarios: [
        `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
        `${valor}`,
        `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}.`,
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.`,
        `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.`,
      ],
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    return {
      info: `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E SOLICITOU SUPORTE.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      comentarios: [
        `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
        `${valor}`,
        `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}.`,
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.`,
        `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.`,
      ],
    }
  }

  // T_TITULAR (padrão)
  return {
    info: `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
    comentarios: [
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      `${valor}`,
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.`,
    ],
  }
}

export function getManutRealocFibraDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-realoc-fibra',
    title: 'Remanejamento de fibra',
    demandCategory: 'manutencao',
    outputTemplate: REALOC_FIBRA_OUTPUT,
    fields: REALOC_FIBRA_FIELDS.map((f) => ({ ...f })),
  }
}
