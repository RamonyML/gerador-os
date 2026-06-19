import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Roteador queimado (equipamento queimado) — fluxo único com dois modos de custo.
 *
 * Paridade (titular) com legado-exemplo/suporte/equip-queimado/:
 * - roteador-queimado/roteador-queimado.html  -> modo "cobrada" (separadores `=`×41):
 *   cobra R$50 + equipamento se o dano for ocasionado pelo cliente.
 * - script.js (roteador-queimado.html de topo) -> modo "isento" (separadores `*`):
 *   cliente isento do custo do roteador, paga só R$50 de deslocamento.
 *
 * As variações de Pessoa Jurídica e Terceiros (1/2) e o pagamento na mensalidade
 * NÃO possuem implementação no legado (abas/botões apontavam para `#`); foram
 * compostas por ANALOGIA seguindo o padrão das demais O.S — o titular permanece
 * fiel byte-a-byte ao legado e é coberto por testes.
 */

export const M_COBRADA = 'cobrada'
export const M_ISENTO = 'isento'

export const T_PJ = 'pessoa-juridica'

const SEP_EQ = '='.repeat(41)
const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)

const S_SOL = 'DADOS DO SOLICITANTE'
const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES DA OCORRÊNCIA'
const S_AGE = 'AGENDAMENTO'

/** Mapa nome do roteador -> valor (usado no modo isento, que exibe o preço). */
const ROTEADOR_PRECO: Record<string, string> = {
  MULTILASER: 'R$150,00',
  'TP-LINK 840': 'R$150,00',
  'TP LINK C-20': 'R$230,00',
  'D-LINK DIR 842': 'R$360,00',
  'TP LINK C-5': 'R$360,00',
  'TP LINK G-5': 'R$360,00',
  GREATEK: 'R$360,00',
  INTELBRAS: 'R$360,00',
  'HUAWEI AX2': 'R$360,00',
  'ZTE H196-MESH': 'R$360,00',
  'ZTE H199-A': 'R$360,00',
}

export const ROTEADOR_QUEIMADO_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{roteadorQueimadoTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{roteadorQueimadoTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{roteadorQueimadoTextoAgenda}}',
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

const TIPOS_TERCEIRO = [T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]

export function buildRoteadorQueimadoTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const modo = v.modoCusto || M_COBRADA
  const tipo = v.tipoSolicitacao || T_TITULAR
  const isento = modo === M_ISENTO

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
  const roteador = v.roteador
  const roteadorPreco = ROTEADOR_PRECO[roteador] ?? roteador
  const protocolo = v.protocolo
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const horaCobrada = v.horaCobrada
  const mensal = !isento && v.pagamento === 'MENSALIDADE'

  // Peças que variam por tipo de solicitação.
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

  // Frases de "concordância" / agendamento conforme o modo.
  const agree = isento
    ? `CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E PAGARÁ EM ${formaPag}`
    : mensal
      ? `CONCORDOU COM A VISITA E CASO HAJA COBRANÇA OPTOU POR LANÇAR O VALOR NA PRÓXIMA MENSALIDADE`
      : `CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}`
  const visitaProto = isento
    ? `VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS`
    : `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${dataVisita} ${horaCobrada}`
  const visitaOS = isento
    ? `VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS`
    : `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${dataVisita} ${horaCobrada}`
  const disseConn = isento ? ', ' : ','
  const proced = `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E`

  // Linhas de fechamento do PROTOCOLO (variam por tipo).
  let closeProtoLines: string[]
  if (tipo === T_TITULAR_TERCEIRO) {
    closeProtoLines = [
      `${cp} ${agree}${disseConn}${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaProto}.`,
    ]
  } else if (tipo === T_TERCEIRO_TERCEIRO) {
    closeProtoLines = [
      `${sp_} ${agree}.`,
      '',
      `${proced} AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaProto}.`,
    ]
  } else if (tipo === T_TERCEIRO_TITULAR) {
    closeProtoLines = [
      `${sp_} ${agree}.`,
      '',
      `${proced} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visitaProto}.`,
    ]
  } else {
    // T_TITULAR / T_PJ
    closeProtoLines = [
      `${nome} ${agree}${disseConn}DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. ${visitaProto}.`,
    ]
  }

  // Texto de fechamento da O.S (variam por tipo).
  let osClose: string
  if (isento) {
    if (tipo === T_TITULAR_TERCEIRO) {
      osClose = `${cp} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARÁ O PAGAMENTO EM ${formaPag}, ${cp} NÃO ESTARÁ PRESENTE MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaOS}.`
    } else if (tipo === T_TERCEIRO_TERCEIRO) {
      osClose = `${sp_} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARÁ O PAGAMENTO EM ${formaPag}. ${proced} AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaOS}.`
    } else if (tipo === T_TERCEIRO_TITULAR) {
      osClose = `${sp_} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARÁ O PAGAMENTO EM ${formaPag}. ${proced} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visitaOS}.`
    } else if (tipo === T_PJ) {
      osClose = `${nome} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARÁ O PAGAMENTO EM ${formaPag}. ${visitaOS}.`
    } else {
      // T_TITULAR (fiel ao legado)
      osClose = `CLIENTE DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARÁ O PAGAMENTO EM ${formaPag}. ${visitaOS}.`
    }
  } else {
    if (tipo === T_TITULAR_TERCEIRO) {
      osClose = `${cp} ${agree}, ${cp} NÃO ESTARÁ PRESENTE MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaOS}.`
    } else if (tipo === T_TERCEIRO_TERCEIRO) {
      osClose = `${sp_} ${agree}. ${proced} AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaOS}.`
    } else if (tipo === T_TERCEIRO_TITULAR) {
      osClose = `${sp_} ${agree}. ${proced} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visitaOS}.`
    } else {
      // T_TITULAR / T_PJ (fiel ao legado p/ titular)
      osClose = `${nome} ${agree}. ${visitaOS}.`
    }
  }

  let protocoloTxt = ''
  let os = ''

  if (isento) {
    protocoloTxt = [
      `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NÃO ESTÁ LIGANDO.`,
      sp(4),
      `REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU ESTÁ ACESA (SINAL ${sinalONU}). ORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, PORÉM, CONEXÃO NÃO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${nome} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO ${nome} CONECTAR O EQUIPAMENTO À ENERGIA CONFORME RECOMENDAÇÃO DA MZNET, ESTARÁ ISENTO DO CUSTO DO ROTEADOR. FICANDO APENAS A COBRANÇA DO DESLOCAMENTO DO TÉCNICO COM O CUSTO DE R$50,00.`,
      sp(4),
      SEP19,
      sp(4),
      ...closeProtoLines,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')

    const intro = `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET, QUESTIONADO DISSE QUE "QUE ROTEADOR ESTÁ COM TODAS AS LUZES APAGADAS E ONU ESTÁ LIGADO NORMALMENTE". REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU ESTÁ ACESA (SINAL ${sinalONU}). ORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, PORÉM, CONEXÃO NÃO RESTABELECEU. INFORMEI ${nome} QUE É NECESSÁRIO VISITA TÉCNICA, E QUE HAVENDO PROBLEMAS DE QUEIMA NA FONTE DE ENERGIA OU EQUIPAMENTO NÃO OCASIONADO, SUBSTITUIÇÃO DO COMODATO NÃO HAVERÁ CUSTOS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 MAIS O CUSTO DA PEÇA OU EQUIPAMENTO A SER SUBSTITUÍDO (FONTE R$40,00) OU (ROTEADOR ${roteadorPreco}), ${osClose}`
    const tecnico = `TECNICO: CONFERIR ENERGIA DAS TOMADAS, ANALISAR FONTE E ROTEADOR, CASO ENERGIA E FONTE ESTIVER NORMAL, E EQUIPAMENTO NÃO APRESENTAR SINAL DE MAL USO OU QUEDA, SUBSTITUIR FONTE E/OU ROTEADOR QUEIMADO, RESTABELECER CONEXÃO E REALIZAR OS DEVIDOS TESTES. CASO ENERGIA NÃO ESTIVER NORMAL INSTRUIR ${nome} A VERIFICA-LA E COBRAR VISITA DE R$50,00 + EQUIPAMENTO DANIFICADO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WIFI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 60 MIN.`
    os = `${intro}

${SEP42}

INDICAÇÃO TÉCNICA:

${tecnico}`
  } else {
    // M_COBRADA
    protocoloTxt = [
      `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP_EQ,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      '',
      SEP_EQ,
      '',
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NÃO ESTÁ LIGANDO (${roteador}).`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU ESTÁ ONLINE COM SINAL ${sinalONU}.`,
      '',
      `ORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E INVERTE-LOS, FEITO, PORÉM, CONEXÃO NÃO RESTABELECEU.`,
      '',
      `PERGUNTEI A ${nome} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      '',
      SEP_EQ,
      '',
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS.`,
      '',
      SEP_EQ,
      '',
      ...closeProtoLines,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')

    const intro = `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, ${nome} DISSE "QUE ROTEADOR ESTÁ COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE ONU ESTÁ CONECTADA E COM SINAL ${sinalONU}. ORIENTEI ${nome} A INVERTER AS FONTES DE ENERGIA DOS EQUIPAMENTOS (ONU E ROTEADOR) E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI ${nome} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${osClose}`
    const tecnico = `TÉCNICO: CONFERIR AS TOMADAS, T, ETC. ONDE ESTÃO LIGADOS ONU E ROTEADOR. CONFERIR FONTES DOS EQUIPAMENTOS E CONFERIR ROTEADOR (APARÊNCIA FÍSICA). SE NÃO FOR PROBLEMAS NA TOMADA, NAS FONTES E ROTEADOR ESTIVER SEM AVARIAS, SUBSTITUIR ROTEADOR ${roteador} POR OUTRO SIMILAR. EFETUAR TESTES PADRÕES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZAÇÃO DO FIRMWARE DO ROTEADOR. CASO PROBLEMA SEJA NA TOMADA,  T , FONTES OU ROTEADOR AVARIADO: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARÁ DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DÚVIDAS DE ${nome}. TEMPO ESTIMADO 40 MINUTOS.`
    os = `${intro}

${SEP_EQ}

INDICAÇÃO TÉCNICA:

${tecnico}`
  }

  const agendaPag = mensal ? 'MENSALIDADE' : formaPag
  const agenda = `MAN TROCA ROTEADOR ${clienteUpper} PROT:${protocolo} ${agendaPag} (${operadorPrimeiroNome}) - ${bairro}`

  return {
    roteadorQueimadoTextoProtocolo: protocoloTxt,
    roteadorQueimadoTextoOS: os,
    roteadorQueimadoTextoAgenda: agenda,
  }
}

const COM_SOLICITANTE = [T_PJ, T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_TERCEIRO = [T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]
const COM_CONTATO_SOL = [T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR]

const ROTEADOR_OPTIONS = [
  'MULTILASER',
  'TP-LINK 840',
  'TP LINK C-20',
  'D-LINK DIR 842',
  'TP LINK C-5',
  'TP LINK G-5',
  'GREATEK',
  'INTELBRAS',
  'HUAWEI AX2',
  'ZTE H196-MESH',
  'ZTE H199-A',
].map((r) => ({ value: r, label: r }))

export const ROTEADOR_QUEIMADO_FIELDS: OsTemplateField[] = [
  {
    id: 'modoCusto',
    label: 'Modo de cobrança',
    control: 'select',
    highlight: true,
    defaultValue: M_COBRADA,
    options: [
      { value: M_COBRADA, label: 'Com visita cobrada (dano ocasionado)', icon: 'plug' },
      { value: M_ISENTO, label: 'Instalação no padrão (isento do roteador)', icon: 'plug' },
    ],
    layout: { md: 6 },
  },
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
    layout: { md: 6 },
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
    id: 'roteador',
    label: 'Roteador (comodato)',
    control: 'select',
    section: S_DET,
    layout: { md: 6 },
    options: ROTEADOR_OPTIONS,
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_DET,
    layout: { md: 6 },
  },
  {
    id: 'horaCobrada',
    label: 'Hora',
    control: 'select',
    section: S_AGE,
    showWhen: { field: 'modoCusto', equals: [M_COBRADA] },
    layout: { md: 4 },
    options: [
      { value: 'ÀS 08:30 HRS', label: '08:30' },
      { value: 'ÀS 09:30 HRS', label: '09:30' },
      { value: 'ÀS 10:30 HRS', label: '10:30' },
      { value: 'ÀS 11:30 HRS', label: '11:30' },
      { value: 'ÀS 14:30 HRS', label: '14:30' },
      { value: 'ÀS 15:30 HRS', label: '15:30' },
      { value: 'ÀS 16:30 HRS', label: '16:30' },
      { value: 'ÀS 17:30 HRS', label: '17:30' },
      { value: 'NO PERÍODO DA MANHÃ', label: 'No período da manhã' },
      { value: 'NO PERÍODO DA TARDE', label: 'No período da tarde' },
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
  {
    id: 'pagamento',
    label: 'Pagamento',
    control: 'select',
    section: S_AGE,
    showWhen: { field: 'modoCusto', equals: [M_COBRADA] },
    defaultValue: 'AVISTA',
    layout: { md: 4 },
    options: [
      { value: 'AVISTA', label: 'À vista (no ato)' },
      { value: 'MENSALIDADE', label: 'Lançar na mensalidade' },
    ],
  },
]

export function getManutRoteadorQueimadoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-roteador-queimado',
    title: 'Roteador queimado',
    demandCategory: 'manutencao',
    outputTemplate: ROTEADOR_QUEIMADO_OUTPUT,
    fields: ROTEADOR_QUEIMADO_FIELDS.map((f) => ({ ...f })),
  }
}
