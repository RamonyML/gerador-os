import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * ONU queimada (equipamento queimado) — mesma logica do roteador/ONT queimado
 * (modo cobrada, dano ocasionado, separadores `=`×41, sinal fixo DYINGGASP).
 *
 * Paridade (titular) com legado-exemplo/suporte/equip-queimado/onu-queimada/onu-queimada.html.
 *
 * As variacoes de Pessoa Juridica e Terceiros (1/2) e o pagamento na mensalidade
 * NAO possuem implementacao no legado (abas/botoes apontavam para `#`); foram
 * compostas por ANALOGIA — o titular permanece fiel byte-a-byte e e coberto por teste.
 */

export const T_PJ = 'pessoa-juridica'

const SEP_EQ = '='.repeat(41)

const S_SOL = 'DADOS DO SOLICITANTE'
const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_DET = 'DETALHES DA OCORRENCIA'
const S_AGE = 'AGENDAMENTO'

const ALARME_POWER = 'ESTA APENAS COM A LUZ POWER ACESA'
const ALARME_POWER_LAN = 'ESTA APENAS COM AS LUZES POWER/LAN ACESAS'
const ALARME_APAGADAS = 'ESTA COM TODAS AS LUZES APAGADAS'

export const ONU_QUEIMADA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{onuQueimadaTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{onuQueimadaTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{onuQueimadaTextoAgenda}}',
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

const TIPOS_TERCEIRO = [T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]

export function buildOnuQueimadaTextos(
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
  const bairro = upper(v.bairro)
  const alarme = v.alarme
  const onu = v.onu
  const protocolo = v.protocolo
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const mensal = v.pagamento === 'MENSALIDADE'

  // Pecas que variam por tipo de solicitacao.
  const isTerceiro = TIPOS_TERCEIRO.includes(tipo)
  let abertura = cp
  let nome = cp
  let contatoOpen = contato
  if (tipo === T_PJ) {
    abertura = `${sp_} (${cargo})`
    nome = sp_
  } else if (isTerceiro) {
    abertura = `${sp_} (${parente} DE ${cp})`
    nome = sp_
    contatoOpen = contatoSol
  }

  const agree = mensal
    ? `CONCORDOU COM A VISITA E CASO HAJA COBRANCA OPTOU POR LANCAR O VALOR NA PROXIMA MENSALIDADE`
    : `CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}`
  const visita = `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${dataVisita} ${horaVisita}`
  const proced = `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E`

  // Fechamento do PROTOCOLO (varia por tipo).
  let closeProtoLines: string[]
  if (tipo === T_TITULAR_TERCEIRO) {
    closeProtoLines = [
      `${cp} ${agree},${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visita}.`,
    ]
  } else if (tipo === T_TERCEIRO_TERCEIRO) {
    closeProtoLines = [
      `${sp_} ${agree}.`,
      '',
      `${proced} AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visita}.`,
    ]
  } else if (tipo === T_TERCEIRO_TITULAR) {
    closeProtoLines = [
      `${sp_} ${agree}.`,
      '',
      `${proced} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visita}.`,
    ]
  } else {
    // T_TITULAR / T_PJ (fiel ao legado p/ titular)
    closeProtoLines = [
      `${nome} ${agree},DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. ${visita}.`,
    ]
  }

  // Fechamento da O.S (varia por tipo).
  let osClose: string
  if (tipo === T_TITULAR_TERCEIRO) {
    osClose = `${cp} ${agree}, ${cp} NAO ESTARA PRESENTE MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visita}.`
  } else if (tipo === T_TERCEIRO_TERCEIRO) {
    osClose = `${sp_} ${agree}. ${proced} AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visita}.`
  } else if (tipo === T_TERCEIRO_TITULAR) {
    osClose = `${sp_} ${agree}. ${proced} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visita}.`
  } else {
    // T_TITULAR / T_PJ (fiel ao legado p/ titular)
    osClose = `${nome} ${agree}. ${visita}.`
  }

  const protocoloTxt = [
    `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP_EQ,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU SEM SINAL (DYINGGASP).`,
    '',
    SEP_EQ,
    '',
    `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ${alarme} (SEM SINAL: DYINGGASP).`,
    '',
    `ORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E INVERTE-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.`,
    '',
    `PERGUNTEI A ${nome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    '',
    SEP_EQ,
    '',
    `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.`,
    '',
    SEP_EQ,
    '',
    ...closeProtoLines,
    '',
    `CLIENTE SEM DUVIDAS.`,
  ].join('\n')

  const intro = `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, ${nome} DISSE "QUE ONU ${alarme}". REMOTAMENTE VERIFIQUEI QUE ONU ESTA DESCONECTADO/APAGADA. ORIENTEI ${nome} A INVERTER AS FONTES DE ENERGIA DOS EQUIPAMENTOS (ONU E ROTEADOR) E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI ${nome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${osClose}`
  const tecnico = `TECNICO: CONFERIR AS TOMADAS,  T , ETC. ONDE ESTAO LIGADOS ONU E ROTEADOR. CONFERIR FONTES DOS EQUIPAMENTOS E CONFERIR ONU (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NAS FONTES E ONU ESTIVER SEM AVARIAS, SUBSTITUIR ONU ${onu} POR OUTRA SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DO ROTEADOR. CASO PROBLEMA SEJA NA TOMADA,  T , FONTES OU ONU AVARIADA: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE ${nome}. TEMPO ESTIMADO 40 MINUTOS.`
  const os = `${intro}

${SEP_EQ}

INDICACAO TECNICA:

${tecnico}`

  const agendaPag = mensal ? 'MENSALIDADE' : formaPag
  const agenda = `MAN TROCA ONU ${clienteUpper} PROT:${protocolo} ${agendaPag} (${operadorPrimeiroNome}) - ${bairro}`

  return {
    onuQueimadaTextoProtocolo: protocoloTxt,
    onuQueimadaTextoOS: os,
    onuQueimadaTextoAgenda: agenda,
  }
}

const COM_SOLICITANTE = [T_PJ, T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_TERCEIRO = [T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_CONTATO_SOL = [T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]

const ONU_OPTIONS = [
  { value: 'C-DATA', label: 'ONU DATA' },
  { value: 'ZTE', label: 'ONU ZTE' },
  { value: 'TENDA', label: 'ONU TENDA' },
  { value: 'SHORELINE', label: 'ONU SHORELINE' },
  { value: 'FIBERHOME', label: 'ONU FIBERHOME' },
]

export const ONU_QUEIMADA_FIELDS: OsTemplateField[] = [
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
    layout: { md: 4 },
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
    layout: { md: 4 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Insira o bairro do cliente',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'alarme',
    label: 'Alarme (estado da ONU)',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: ALARME_POWER, label: 'Luz Power' },
      { value: ALARME_POWER_LAN, label: 'Luz PWR/LAN' },
      { value: ALARME_APAGADAS, label: 'Luzes apagadas' },
    ],
  },
  {
    id: 'onu',
    label: 'ONU atual (comodato)',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: ONU_OPTIONS,
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
  {
    id: 'pagamento',
    label: 'Pagamento',
    control: 'select',
    section: S_AGE,
    defaultValue: 'AVISTA',
    layout: { md: 4 },
    options: [
      { value: 'AVISTA', label: 'A vista (no ato)' },
      { value: 'MENSALIDADE', label: 'Lancar na mensalidade' },
    ],
  },
]

export function buildOnuQueimadaSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[]; osDescricao: string; osIndicacoes: string } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const _osRaw = buildOnuQueimadaTextos(rawValues, '').onuQueimadaTextoOS
  const _mark = 'INDICACAO TECNICA:'
  const _midx = _osRaw.indexOf(_mark)
  const osDescricao = _midx >= 0 ? _osRaw.slice(0, _midx).replace(/[\s=>*]+$/, '') : _osRaw
  const osIndicacoes = _midx >= 0 ? _osRaw.slice(_midx + _mark.length).trimStart() : ''

  const tipo       = v.tipoSolicitacao || T_TITULAR
  const cp         = first(upper(v.cliente))
  const sol        = first(upper(v.solicitante))
  const solFull    = upper(v.solicitante)
  const parente    = upper(v.parente)
  const cargo      = upper(v.cargo)
  const canal      = upper(v.canal)
  const contato    = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const alarme     = v.alarme || ALARME_POWER
  const formaPag   = upper(v.formaPag)
  const dataV      = v.dataVisita || 'XX/XX/XXXX'
  const horaV      = v.horaVisita || 'XX:XX'
  const mensal     = v.pagamento === 'MENSALIDADE'

  const isTerceiro  = TIPOS_TERCEIRO.includes(tipo)
  const nome        = tipo === T_PJ || isTerceiro ? sol : cp
  const contatoOpen = isTerceiro ? contatoSol : contato
  const abertura    = tipo === T_PJ
    ? `${sol} (${cargo})`
    : isTerceiro ? `${sol} (${parente} DE ${cp})` : cp

  const agree = mensal
    ? `CONCORDOU COM A VISITA E CASO HAJA COBRANCA OPTOU POR LANCAR O VALOR NA PROXIMA MENSALIDADE`
    : `CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}`

  const visita = `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${dataV} ${horaV}`
  const proced = `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E`

  const sharedCards = [
    `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.`,
    `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ${alarme} (SEM SINAL: DYINGGASP).\nORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E INVERTE-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.`,
    `PERGUNTEI A ${nome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
    `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS`,
    `POREM, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.`,
  ]

  const info = `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU SEM SINAL (DYINGGASP).`

  if (tipo === T_TERCEIRO_TERCEIRO) {
    return {
      info,
      comentarios: [
        ...sharedCards,
        `${sol} ${agree}.`,
        `${proced} AUTORIZOU ${solFull} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visita}.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    return {
      info,
      comentarios: [
        ...sharedCards,
        `${sol} ${agree}.`,
        `${proced} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visita}.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    return {
      info,
      comentarios: [
        ...sharedCards,
        `${cp} ${agree},${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solFull} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visita}.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  // T_TITULAR / T_PJ
  return {
    info,
    comentarios: [
      ...sharedCards,
      `${nome} ${agree},DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. ${visita}.\n\nCLIENTE SEM DUVIDAS.`,
    ],
    osDescricao,
    osIndicacoes,
  }
}

export function getManutOnuQueimadaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-onu-queimada',
    title: 'ONU queimada',
    demandCategory: 'manutencao',
    outputTemplate: ONU_QUEIMADA_OUTPUT,
    fields: ONU_QUEIMADA_FIELDS.map((f) => ({ ...f })),
  }
}
