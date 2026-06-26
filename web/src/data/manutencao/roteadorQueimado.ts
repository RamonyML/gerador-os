import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Roteador queimado (equipamento queimado) — fluxo unico com dois modos de custo.
 *
 * Paridade (titular) com legado-exemplo/suporte/equip-queimado/:
 * - roteador-queimado/roteador-queimado.html  -> modo "cobrada" (separadores `=`×41):
 *   cobra R$50 + equipamento se o dano for ocasionado pelo cliente.
 * - script.js (roteador-queimado.html de topo) -> modo "isento" (separadores `*`):
 *   cliente isento do custo do roteador, paga so R$50 de deslocamento.
 *
 * As variacoes de Pessoa Juridica e Terceiros (1/2) e o pagamento na mensalidade
 * NAO possuem implementacao no legado (abas/botoes apontavam para `#`); foram
 * compostas por ANALOGIA seguindo o padrao das demais O.S — o titular permanece
 * fiel byte-a-byte ao legado e e coberto por testes.
 */

export const M_COBRADA = 'cobrada'
export const M_ISENTO = 'isento'

export const T_PJ = 'pessoa-juridica'

const SEP_EQ = '='.repeat(41)
const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)

const S_SOL = 'DADOS DO SOLICITANTE'
const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_DET = 'DETALHES DA OCORRENCIA'
const S_AGE = 'AGENDAMENTO'

/** Mapa nome do roteador -> valor (usado no modo isento, que exibe o preco). */
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

  // Frases de "concordancia" / agendamento conforme o modo.
  const agree = isento
    ? `CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}`
    : mensal
      ? `CONCORDOU COM A VISITA E CASO HAJA COBRANCA OPTOU POR LANCAR O VALOR NA PROXIMA MENSALIDADE`
      : `CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}`
  const visitaProto = isento
    ? `VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS`
    : `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${dataVisita} ${horaCobrada}`
  const visitaOS = isento
    ? `VISITA AGENDADA PARA ${dataVisita} AS ${horaVisita} HRS`
    : `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${dataVisita} ${horaCobrada}`
  const disseConn = isento ? ', ' : ','
  const proced = `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E`

  // Linhas de fechamento do PROTOCOLO (variam por tipo).
  let closeProtoLines: string[]
  if (tipo === T_TITULAR_TERCEIRO) {
    closeProtoLines = [
      `${cp} ${agree}${disseConn}${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaProto}.`,
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
      `${proced} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visitaProto}.`,
    ]
  } else {
    // T_TITULAR / T_PJ
    closeProtoLines = [
      `${nome} ${agree}${disseConn}DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. ${visitaProto}.`,
    ]
  }

  // Texto de fechamento da O.S (variam por tipo).
  let osClose: string
  if (isento) {
    if (tipo === T_TITULAR_TERCEIRO) {
      osClose = `${cp} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO EM ${formaPag}, ${cp} NAO ESTARA PRESENTE MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaOS}.`
    } else if (tipo === T_TERCEIRO_TERCEIRO) {
      osClose = `${sp_} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO EM ${formaPag}. ${proced} AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaOS}.`
    } else if (tipo === T_TERCEIRO_TITULAR) {
      osClose = `${sp_} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO EM ${formaPag}. ${proced} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visitaOS}.`
    } else if (tipo === T_PJ) {
      osClose = `${nome} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO EM ${formaPag}. ${visitaOS}.`
    } else {
      // T_TITULAR (fiel ao legado)
      osClose = `CLIENTE DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO EM ${formaPag}. ${visitaOS}.`
    }
  } else {
    if (tipo === T_TITULAR_TERCEIRO) {
      osClose = `${cp} ${agree}, ${cp} NAO ESTARA PRESENTE MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaOS}.`
    } else if (tipo === T_TERCEIRO_TERCEIRO) {
      osClose = `${sp_} ${agree}. ${proced} AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaOS}.`
    } else if (tipo === T_TERCEIRO_TITULAR) {
      osClose = `${sp_} ${agree}. ${proced} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visitaOS}.`
    } else {
      // T_TITULAR / T_PJ (fiel ao legado p/ titular)
      osClose = `${nome} ${agree}. ${visitaOS}.`
    }
  }

  let protocoloTxt = ''
  let os = ''

  if (isento) {
    protocoloTxt = [
      `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.`,
      sp(4),
      `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ACESA (SINAL ${sinalONU}). ORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${nome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO ${nome} CONECTAR O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA MZNET, ESTARA ISENTO DO CUSTO DO ROTEADOR. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.`,
      sp(4),
      SEP19,
      sp(4),
      ...closeProtoLines,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')

    const intro = `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET, QUESTIONADO DISSE QUE "QUE ROTEADOR ESTA COM TODAS AS LUZES APAGADAS E ONU ESTA LIGADO NORMALMENTE". REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ACESA (SINAL ${sinalONU}). ORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU. INFORMEI ${nome} QUE E NECESSARIO VISITA TECNICA, E QUE HAVENDO PROBLEMAS DE QUEIMA NA FONTE DE ENERGIA OU EQUIPAMENTO NAO OCASIONADO, SUBSTITUICAO DO COMODATO NAO HAVERA CUSTOS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 MAIS O CUSTO DA PECA OU EQUIPAMENTO A SER SUBSTITUIDO (FONTE R$40,00) OU (ROTEADOR ${roteadorPreco}), ${osClose}`
    const tecnico = `TECNICO: CONFERIR ENERGIA DAS TOMADAS, ANALISAR FONTE E ROTEADOR, CASO ENERGIA E FONTE ESTIVER NORMAL, E EQUIPAMENTO NAO APRESENTAR SINAL DE MAL USO OU QUEDA, SUBSTITUIR FONTE E/OU ROTEADOR QUEIMADO, RESTABELECER CONEXAO E REALIZAR OS DEVIDOS TESTES. CASO ENERGIA NAO ESTIVER NORMAL INSTRUIR ${nome} A VERIFICA-LA E COBRAR VISITA DE R$50,00 + EQUIPAMENTO DANIFICADO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WIFI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 60 MIN.`
    os = `${intro}

${SEP42}

INDICACAO TECNICA:

${tecnico}`
  } else {
    // M_COBRADA
    protocoloTxt = [
      `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP_EQ,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      '',
      SEP_EQ,
      '',
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO (${roteador}).`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ONLINE COM SINAL ${sinalONU}.`,
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

    const intro = `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, ${nome} DISSE "QUE ROTEADOR ESTA COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE ONU ESTA CONECTADA E COM SINAL ${sinalONU}. ORIENTEI ${nome} A INVERTER AS FONTES DE ENERGIA DOS EQUIPAMENTOS (ONU E ROTEADOR) E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI ${nome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${osClose}`
    const tecnico = `TECNICO: CONFERIR AS TOMADAS, T, ETC. ONDE ESTAO LIGADOS ONU E ROTEADOR. CONFERIR FONTES DOS EQUIPAMENTOS E CONFERIR ROTEADOR (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NAS FONTES E ROTEADOR ESTIVER SEM AVARIAS, SUBSTITUIR ROTEADOR ${roteador} POR OUTRO SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DO ROTEADOR. CASO PROBLEMA SEJA NA TOMADA,  T , FONTES OU ROTEADOR AVARIADO: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE ${nome}. TEMPO ESTIMADO 40 MINUTOS.`
    os = `${intro}

${SEP_EQ}

INDICACAO TECNICA:

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
    label: 'Modo de cobranca',
    control: 'select',
    highlight: true,
    defaultValue: M_COBRADA,
    options: [
      { value: M_COBRADA, label: 'Com visita cobrada (dano ocasionado)', icon: 'plug' },
      { value: M_ISENTO, label: 'Instalacao no padrao (isento do roteador)', icon: 'plug' },
    ],
    layout: { md: 12 },
  },
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
      { value: 'AS 08:30 HRS', label: '08:30' },
      { value: 'AS 09:30 HRS', label: '09:30' },
      { value: 'AS 10:30 HRS', label: '10:30' },
      { value: 'AS 11:30 HRS', label: '11:30' },
      { value: 'AS 14:30 HRS', label: '14:30' },
      { value: 'AS 15:30 HRS', label: '15:30' },
      { value: 'AS 16:30 HRS', label: '16:30' },
      { value: 'AS 17:30 HRS', label: '17:30' },
      { value: 'NO PERIODO DA MANHA', label: 'No periodo da manha' },
      { value: 'NO PERIODO DA TARDE', label: 'No periodo da tarde' },
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
      { value: 'AVISTA', label: 'A vista (no ato)' },
      { value: 'MENSALIDADE', label: 'Lancar na mensalidade' },
    ],
  },
]

export function buildRoteadorQueimadoSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const modo      = v.modoCusto || M_COBRADA
  const tipo      = v.tipoSolicitacao || T_TITULAR
  const isento    = modo === M_ISENTO
  const cp        = first(upper(v.cliente))
  const sol       = first(upper(v.solicitante))
  const solFull   = upper(v.solicitante)
  const parente   = upper(v.parente)
  const cargo     = upper(v.cargo)
  const canal     = upper(v.canal)
  const contato   = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const sinalONU  = upper(v.sinalONU)
  const roteador  = v.roteador || ''
  const formaPag  = upper(v.formaPag)
  const dataV     = v.dataVisita || 'XX/XX/XXXX'
  const horaV     = v.horaVisita || 'XX:XX'
  const horaCobrada = v.horaCobrada || 'XX:XX'
  const mensal    = !isento && v.pagamento === 'MENSALIDADE'

  const isTerceiro  = TIPOS_TERCEIRO.includes(tipo)
  const nome        = tipo === T_PJ || isTerceiro ? sol : cp
  const contatoOpen = isTerceiro ? contatoSol : contato
  const abertura    = tipo === T_PJ
    ? `${sol} (${cargo})`
    : isTerceiro ? `${sol} (${parente} DE ${cp})` : cp

  const visitaProto = isento
    ? `VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS`
    : `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${dataV} ${horaCobrada}`

  const agree = isento
    ? `CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}`
    : mensal
      ? `CONCORDOU COM A VISITA E CASO HAJA COBRANCA OPTOU POR LANCAR O VALOR NA PROXIMA MENSALIDADE`
      : `CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}`

  const disseConn = isento ? ', ' : ','
  const proced = `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E`

  const info = `${abertura} ENTROU EM CONTATO POR ${canal} (${contatoOpen}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`

  const sharedBase = isento
    ? [
        `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.`,
        `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ACESA (SINAL ${sinalONU}). ORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.`,
        `PERGUNTEI A ${nome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO ${nome} CONECTAR O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA MZNET, ESTARA ISENTO DO CUSTO DO ROTEADOR.`,
        `FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.`,
      ]
    : [
        `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO (${roteador}).`,
        `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ONLINE COM SINAL ${sinalONU}.\nORIENTEI ${nome} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E INVERTE-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.`,
        `PERGUNTEI A ${nome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS`,
        `POREM, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.`,
      ]

  if (tipo === T_TERCEIRO_TERCEIRO) {
    return {
      info,
      comentarios: [
        ...sharedBase,
        `${sol} ${agree}.`,
        `${proced} AUTORIZOU ${solFull} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaProto}.\n\nCLIENTE SEM DUVIDAS.`,
      ],
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    return {
      info,
      comentarios: [
        ...sharedBase,
        `${sol} ${agree}.`,
        `${proced} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${visitaProto}.\n\nCLIENTE SEM DUVIDAS.`,
      ],
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    return {
      info,
      comentarios: [
        ...sharedBase,
        `${cp} ${agree}${disseConn}${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solFull} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${visitaProto}.\n\nCLIENTE SEM DUVIDAS.`,
      ],
    }
  }

  // T_TITULAR / T_PJ
  return {
    info,
    comentarios: [
      ...sharedBase,
      `${nome} ${agree}${disseConn}DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. ${visitaProto}.\n\nCLIENTE SEM DUVIDAS.`,
    ],
  }
}

export function getManutRoteadorQueimadoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-roteador-queimado',
    title: 'Roteador queimado',
    demandCategory: 'manutencao',
    outputTemplate: ROTEADOR_QUEIMADO_OUTPUT,
    fields: ROTEADOR_QUEIMADO_FIELDS.map((f) => ({ ...f })),
  }
}
