import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * ONT queimada (equipamento queimado) — mesma logica do roteador queimado (modo
 * cobrada), porem so existe esta variacao no legado (dano ocasionado, separadores
 * `=`×41, sinal fixo DYINGGASP).
 *
 * Paridade (titular) com legado-exemplo/suporte/equip-queimado/ont-queimada/ont-queimada.html.
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

export const ONT_QUEIMADA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{ontQueimadaTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{ontQueimadaTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{ontQueimadaTextoAgenda}}',
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

export function buildOntQueimadaTextos(
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
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONT SEM SINAL (DYINGGASP).`,
    '',
    SEP_EQ,
    '',
    `QUESTIONADO, DISSE QUE O EQUIPAMENTO DE INTERNET NAO ESTA LIGANDO (${onu}).`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONT ${alarme} (SEM SINAL: DYINGGASP). ORIENTEI ${nome} A DESCONECTAR O CABO DE ENERGIA DA ONT E RECONECTA-LOS APOS 30 SEGUNDOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.`,
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

  const intro = `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, ${nome} DISSE "QUE ONT ${alarme}". REMOTAMENTE VERIFIQUEI QUE ONT ESTA DESCONECTADO/APAGADA. ORIENTEI ${nome} A RETIRAR A FONTE DE ENERGIA DA TOMADA ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI ${nome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${osClose}`
  const tecnico = `TECNICO: CONFERIR A TOMADA, T , ETC. ONDE ESTA LIGADA ONT. CONFERIR FONTE DO EQUIPAMENTO E CONFERIR ONT (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NA FONTE E ONT ESTIVER SEM AVARIAS, SUBSTITUIR ${onu} POR OUTRA SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DA ONT. CASO PROBLEMA SEJA NA TOMADA, T , FONTES OU ONT AVARIADA: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE ${nome}. TEMPO ESTIMADO 40 MINUTOS.`
  const os = `${intro}

${SEP_EQ}

INDICACAO TECNICA:

${tecnico}`

  const agendaPag = mensal ? 'MENSALIDADE' : formaPag
  const agenda = `MAN TROCA ONT ${clienteUpper} PROT:${protocolo} ${agendaPag} (${operadorPrimeiroNome}) - ${bairro}`

  return {
    ontQueimadaTextoProtocolo: protocoloTxt,
    ontQueimadaTextoOS: os,
    ontQueimadaTextoAgenda: agenda,
  }
}

const COM_SOLICITANTE = [T_PJ, T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_TERCEIRO = [T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_CONTATO_SOL = [T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]

const ONT_OPTIONS = [
  'ONT ZTE F 670-L',
  'ONT TP-LINK XC220',
  'ONT TP-LINK XC230',
  'ONT TP-LINK XX530',
  'ONT TP-LINK XX530v2',
].map((o) => ({ value: o, label: o }))

export const ONT_QUEIMADA_FIELDS: OsTemplateField[] = [
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
    label: 'Alarme (estado da ONT)',
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
    label: 'ONT atual (comodato)',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: ONT_OPTIONS,
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

export function buildOntQueimadaSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  const operadorPrimeiroNome = String(rawValues.operadorPrimeiroNome ?? '')
  const { ontQueimadaTextoProtocolo } = buildOntQueimadaTextos(rawValues, operadorPrimeiroNome)
  const segments = ontQueimadaTextoProtocolo
    .split(/^[=*]{5,}$/gm)
    .map((s) => s.trim())
    .filter(Boolean)
  return { info: segments[0] ?? '', comentarios: segments.slice(1) }
}

export function getManutOntQueimadaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-ont-queimada',
    title: 'ONT queimada',
    demandCategory: 'manutencao',
    outputTemplate: ONT_QUEIMADA_OUTPUT,
    fields: ONT_QUEIMADA_FIELDS.map((f) => ({ ...f })),
  }
}
