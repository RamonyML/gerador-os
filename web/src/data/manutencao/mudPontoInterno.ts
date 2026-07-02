import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Mudanca de ponto interno — fluxo unico com variacoes.
 * Paridade com legado-exemplo/suporte/mud-ponto-int/:
 * - mud-ponto-int.html (titular / padrao)
 * - mud-ponto-int-pj.html (pessoa juridica)
 * - mudponto1/mudponto1.html (titular solicita e autoriza terceiro)
 * - mudponto2/mudponto2.html (terceiro solicita, titular ausente)
 * - mudponto3/mudponto3.html (terceiro solicita, titular presente)
 *
 * Observacao: o legado mistura separadores `---` (titular/PJ/terceiro-autorizado)
 * e `*`×35 (variacoes de terceiro), alem de espacamentos inconsistentes
 * (linhas com 4 ou 8 espacos) — reproduzidos fielmente.
 */

export const T_PJ = 'pessoa-juridica'

const SEP_STAR = '*'.repeat(35)

const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA SOLICITACAO'
const S_AGE = 'AGENDAMENTO'

const VALOR_50 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NAO SEJA POSSIVEL REAPROVEITA-LO SENDO NECESSARIO A PASSAGEM DE UM NOVO CABEAMENTO, O VALOR E DE R$ 50,00 REFERENTE A MAO DE OBRA TECNICA.'
const VALOR_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NAO SEJA POSSIVEL REAPROVEITA-LO SENDO NECESSARIO FAZER EMENDA TECNICA, O VALOR E DE R$ 100,00 REFERENTE A MAO DE OBRA TECNICA.'
const VALOR_50_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVICO E DE R$50,00. EXPLIQUEI TAMBEM QUE CASO DROP (CABO/FIBRA) NAO TENHA SOBRA E FOR NECESSARIO SER SUBSTITUIDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PECAS E SERVICOS).'

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
  'TECNICO: EFETUAR A MUDANCA DE PONTO DOS EQUIPAMENTOS PARA O LOCAL ESPECIFICADO PELO CLIENTE, CASO SEJA POSSIVEL REAPROVEITAR CABO DROP USANDO A SOBRA E RECONECTORIZAR. SE NAO DER TAMANHO, SERA NECESSARIO A PASSAGEM DE UM NOVO CABEAMENTO PARA CONCLUIR O SERVICO. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGENCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DA CLIENTE E APRESENTAR VARIACOES SE HOUVER. ATUALIZAR FIRMWARE DO ROTEADOR SE NECESSARIO. TEMPO ESTIMADO: 60 MIN.'

function osText(intro: string): string {
  return `${intro}

${SEP_STAR}

INDICACAO TECNICA:

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
      `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
      SEP_STAR,
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      SEP_STAR,
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      sp(4),
      SEP_STAR,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${sp_} (${cargo}) SOLICITOU POR ${canal} (${contato}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} CLIENTE PAGARA EM ${formaPag}. AGENDADA PARA ${dataVisita} AS ${horaVisita} HORAS.`,
    )
  } else if (tipo === T_TITULAR_TERCEIRO) {
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
      SEP_STAR,
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      SEP_STAR,
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      sp(4),
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      sp(8),
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      sp(4),
      SEP_STAR,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${cp} SOLICITOU POR ${canal} (${contato}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} CLIENTE PAGARA EM ${formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    )
  } else if (tipo === T_TERCEIRO_TERCEIRO) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
      '',
      SEP_STAR,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU} SEM OSCILACAO.`,
      '',
      SEP_STAR,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      '',
      SEP_STAR,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}.`,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} ${sp_} SOLICITOU PAGAR EM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    )
  } else if (tipo === T_TERCEIRO_TITULAR) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
      '',
      SEP_STAR,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      '',
      SEP_STAR,
      '',
      `QUESTIONADO ${sp_} DISSE QUE ${motivo}.`,
      '',
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      sp(4),
      SEP_STAR,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}.`,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} ${sp_} ESCOLHEU PAGAR EM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    )
  } else {
    // T_TITULAR (padrao)
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
      SEP_STAR,
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      SEP_STAR,
      `QUESTIONADO ${cp} DISSE QUE ${motivo}.`,
      '',
      `AMBIENTE ATUAL: ${ambienteAtual}`,
      `NOVO AMBIENTE: ${ambienteNovo}`,
      '',
      `${valor} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`,
      sp(4),
      SEP_STAR,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    ].join('\n')
    os = osText(
      `${cp} SOLICITOU POR ${canal} (${contato}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${ambienteAtual}, E REINSTALAR EM: ${ambienteNovo}. MOTIVO: ${motivo}. ${valor} CLIENTE PAGARA EM ${formaPag}. AGENDADA PARA ${dataVisita} AS ${horaVisita} HORAS.`,
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
    label: 'Motivo da mudanca de ponto (o que o cliente disse)',
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

export function buildMudPontoIntSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[]; osDescricao: string; osIndicacoes: string } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo          = v.tipoSolicitacao || T_TITULAR
  const cp            = first(upper(v.cliente))
  const solUpper      = upper(v.solicitante)
  const sp_           = first(solUpper)
  const parente       = upper(v.parente)
  const cargo         = upper(v.cargo)
  const canal         = upper(v.canal)
  const contato       = digits(v.contato)
  const contatoSol    = digits(v.contatoSol)
  const sinalONU      = upper(v.sinalONU)
  const motivo        = upper(v.motivo)
  const ambienteAtual = upper(v.ambienteAtual)
  const ambienteNovo  = upper(v.ambienteNovo)
  const valor         = v.valor || ''
  const formaPag      = upper(v.formaPag)
  const dataV         = v.dataVisita || 'XX/XX/XXXX'
  const horaV         = v.horaVisita || 'XX:XX'

  const sMotivoAmbiente = `QUESTIONADO ${tipo === T_TITULAR || tipo === T_TITULAR_TERCEIRO ? cp : sp_} DISSE QUE ${motivo}.\n\nAMBIENTE ATUAL: ${ambienteAtual}\nNOVO AMBIENTE: ${ambienteNovo}`

  const _osRaw = buildMudPontoIntTextos(rawValues, '').mudPontoIntTextoOS
  const _mark = 'INDICACAO TECNICA:'
  const _midx = _osRaw.indexOf(_mark)
  const osDescricao = _midx >= 0 ? _osRaw.slice(0, _midx).replace(/[\s=>*]+$/, '') : _osRaw
  const osIndicacoes = _midx >= 0 ? _osRaw.slice(_midx + _mark.length).trimStart() : ''

  if (tipo === T_PJ) {
    return {
      info: `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      comentarios: [
        `QUESTIONADO ${sp_} DISSE QUE ${motivo}.\n\nAMBIENTE ATUAL: ${ambienteAtual}\nNOVO AMBIENTE: ${ambienteNovo}`,
        `${valor}`,
        `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    return {
      info: `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      comentarios: [
        sMotivoAmbiente,
        `${valor}`,
        `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}. ${cp} NAO ESTARA PRESENTE, MAS AUTORIZOU ${solUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER.`,
        `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TERCEIRO_TERCEIRO) {
    return {
      info: `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      comentarios: [
        `QUESTIONADO ${sp_} DISSE QUE ${motivo}.\n\nAMBIENTE ATUAL: ${ambienteAtual}\nNOVO AMBIENTE: ${ambienteNovo}`,
        `${valor}`,
        `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}.`,
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER.`,
        `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    return {
      info: `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      comentarios: [
        `QUESTIONADO ${sp_} DISSE QUE ${motivo}.\n\nAMBIENTE ATUAL: ${ambienteAtual}\nNOVO AMBIENTE: ${ambienteNovo}`,
        `${valor}`,
        `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}.`,
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.`,
        `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  // T_TITULAR (padrão)
  return {
    info: `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
    comentarios: [
      sMotivoAmbiente,
      `${valor}`,
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.`,
    ],
    osDescricao,
    osIndicacoes,
  }
}

export function getManutMudPontoIntDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-mud-ponto-int',
    title: 'Mudanca de ponto interno',
    demandCategory: 'manutencao',
    outputTemplate: MUD_PONTO_INT_OUTPUT,
    fields: MUD_PONTO_INT_FIELDS.map((f) => ({ ...f })),
  }
}
