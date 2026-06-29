import type { OsTemplateField } from '../../types/osTemplate'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'
import {
  ORIGEM_OPTS,
  ORIGEM_PADRAO,
  isOfertado,
  aplicarOfertadoProtocolo,
  aplicarOfertadoOS,
} from './ofertado'

/**
 * ALTERAÇÃO DE PLANO — REMOTO (fluxo único com variações de solicitação).
 *
 * Paridade caractere-a-caractere com:
 *  - titular  → legado-exemplo/suporte/altplan/altplan-remoto/index-altplan-remoto.html
 *  - terceiro → legado-exemplo/suporte/altplan/altplan-remoto/terceiro1/index-altplan-terc.html
 *  - PJ       → legado-exemplo/suporte/altplan/altplan-remoto/pj/index-altplan-remoto-pj.html
 *
 * O encerramento (data/hora do momento) NÃO é gerado aqui — apenas Protocolo + O.S.
 */

export const AST = '*'.repeat(14)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_PLANO = 'DETALHES DO PLANO'

export const R_TITULAR = 'titular'
export const R_TERCEIRO = 'terceiro'
export const R_PJ = 'pj'

/** Linhas idênticas entre as variações (reuso para evitar divergência). */
export const L_HEAD2 =
  'DISPONIBILIZEI AO CLIENTE 2 OPÇÕES PARA PROSSEGUIR COM O UPGRADE:'
export const L_O1 =
  '1° - AGENDAR UMA VISITA PRESENCIAL PARA REALIZAR TESTES, INSTRUÇÕES DO USO DE INTERNET, INFORMAÇÕES SOBRE COBERTURA WI-FI, REDE ELÉTRICA ETC; VISITA ESTA COM O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.'
export const L_O2 =
  '2° - REALIZAR A ALTERAÇÃO DE PLANO REMOTAMENTE (DENTRO DO PRAZO DE ATÉ 72 HORAS) E APÓS CONCLUÍDO A ALTERAÇÃO O CLIENTE REALIZAR A ASSINATURA DO CONTRATO DIGITAL POR MEIO DO APP "MZNET" OU ATÉ MESMO COMPARECER DIRETAMENTE NA EMPRESA E REALIZAR ESTA ASSINATURA PRESENCIAL.'
export const L_PROC = 'PROCEDIMENTO ESTE QUE NÃO GERA CUSTOS AO ASSINANTE.'
export const L_CIENTE =
  'CIENTE QUE OS BENEFÍCIOS SÃO LIBERADOS APÓS ASSINATURA DO CONTRATO.'

export const ALTPLAN_REMOTO_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{altplanRemotoTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{altplanRemotoTextoOS}}',
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

function splitDataHora(value: unknown): [string, string] {
  const partes = String(value ?? '').trim().split(/\s+/)
  return [partes[0] ?? '', partes[1] ?? '']
}

/** Sinal: "SEM SINAL" se marcado/ vazio; senão `-00.00DBM`. */
function sinalSaida(rawValues: Record<string, unknown>): string {
  const sig = formatSinalFibraSaida(String(rawValues.sinalONU ?? ''))
  const semSinal = String(rawValues.semSinal ?? '') === 'sim'
  return semSinal || !sig ? 'SEM SINAL' : sig
}

export function buildAltplanRemotoTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || R_TITULAR
  const cliente = upper(v.cliente)
  const clientePrimeiro = first(cliente)
  const solicitante = upper(v.solicitante)
  const solicitantePrimeiro = first(solicitante)
  const parente = upper(v.parente)
  const cargo = upper(v.cargo)
  const canal = v.canal ?? ''
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const motivo = upper(v.motivo)
  const planoAtual = v.planoAtual ?? ''
  const planoEscolhido = v.planoEscolhido ?? ''
  const roteador = v.roteador ?? ''
  const dataContrato = v.dataContrato ?? ''
  const protocolo = v.protocolo ?? ''
  const sig = sinalSaida(rawValues)
  const [dataLigacao, horaLigacao] = splitDataHora(v.dataLigacao)
  const [dataProtocolo, horaProtocolo] = splitDataHora(v.dataProtocolo)

  const ofertado = isOfertado(rawValues)

  const finaliza = (proto: string, os: string) => ({
    altplanRemotoTextoProtocolo: ofertado ? aplicarOfertadoProtocolo(proto) : proto,
    altplanRemotoTextoOS: ofertado ? aplicarOfertadoOS(os) : os,
  })

  const planoBloco = [
    `PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}`,
    '',
    `PLANO SOLICITADO: ${planoEscolhido}`,
  ]

  const opcoesHead = [
    `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.`,
    L_HEAD2,
    '',
    L_O1,
    '',
  ]

  if (tipo === R_TERCEIRO) {
    const protocoloTexto = [
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
      '',
      AST,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}.`,
      '',
      AST,
      `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
      '',
      ...planoBloco,
      '',
      'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
      '',
      '',
      AST,
      ...opcoesHead,
      L_O2,
      L_PROC,
      L_CIENTE,
      '',
      AST,
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${clientePrimeiro} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${dataLigacao} ÀS ${horaLigacao}HRS.`,
      '',
      `${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.`,
      '',
      'CLIENTE NÃO TEM DÚVIDAS',
    ].join('\n')

    const os = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) SOLICITOU POR ${canal} (${contatoSol}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${clientePrimeiro} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${dataLigacao} ÀS ${horaLigacao} HRS.`
    return finaliza(protocoloTexto, os)
  }

  if (tipo === R_PJ) {
    const protocoloTexto = [
      `${solicitantePrimeiro} (${cargo}) ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
      '',
      AST,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}`,
      '',
      AST,
      `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
      '',
      ...planoBloco,
      '',
      AST,
      ...opcoesHead,
      L_O2,
      L_PROC,
      '',
      AST,
      '',
      `${solicitantePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR ${canal} (${contato}) DIA ${dataLigacao} ÀS ${horaLigacao} HRS.`,
    ].join('\n')

    const os = `${solicitantePrimeiro} (${cargo}) SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº${protocolo} EM ${dataProtocolo} ÀS ${horaProtocolo} HRS.`
    return finaliza(protocoloTexto, os)
  }

  // R_TITULAR (padrão)
  const protocoloTexto = [
    `${clientePrimeiro} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
    '',
    AST,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}`,
    '',
    AST,
    `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
    '',
    ...planoBloco,
    '',
    'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
    '',
    '',
    AST,
    ...opcoesHead,
    L_O2,
    L_PROC,
    L_CIENTE,
    '',
    AST,
    '',
    `${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR ${canal} (${contato}) DIA ${dataLigacao} ÀS ${horaLigacao} HRS.`,
  ].join('\n')

  const os = `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${clientePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº${protocolo} EM ${dataProtocolo} ÀS ${horaProtocolo} HRS.`
  return finaliza(protocoloTexto, os)
}

export function buildAltplanRemotoSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[]; osDescricao: string } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo               = v.tipoSolicitacao || R_TITULAR
  const ofertado           = isOfertado(rawValues)
  const sig                = sinalSaida(rawValues)
  const clientePrimeiro    = first(upper(v.cliente))
  const solicitantePrimeiro = first(upper(v.solicitante))
  const parente            = upper(v.parente)
  const cargo              = upper(v.cargo)
  const canal              = v.canal ?? ''
  const contato            = digits(v.contato)
  const contatoSol         = digits(v.contatoSol)
  const motivo             = upper(v.motivo)
  const planoAtual         = v.planoAtual ?? ''
  const planoEscolhido     = v.planoEscolhido ?? ''
  const roteador           = v.roteador ?? ''
  const dataContrato       = v.dataContrato ?? ''
  const protocolo          = v.protocolo ?? ''
  const [dataLig, horaLig] = splitDataHora(v.dataLigacao)

  // ── info (abertura) ──
  let remetente: string
  let contatoRemetente: string
  let preposicao: string
  if (tipo === R_TERCEIRO) {
    remetente = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro})`
    contatoRemetente = contatoSol
    preposicao = 'POR'
  } else if (tipo === R_PJ) {
    remetente = `${solicitantePrimeiro} (${cargo})`
    contatoRemetente = contato
    preposicao = 'VIA'
  } else {
    remetente = clientePrimeiro
    contatoRemetente = contato
    preposicao = 'VIA'
  }

  const abertura = ofertado
    ? `OFERTEI A ${remetente} VIA ${canal} (${contatoRemetente}) ALTERAÇÃO DE PLANO.`
    : `${remetente} ENTROU EM CONTATO ${preposicao} ${canal} (${contatoRemetente}) SOLICITANDO ALTERAÇÃO DE PLANO.`

  const info = `${abertura}\n\nCLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}`

  // ── card: plano ──
  const planoLabel = ofertado ? 'PLANO OFERTADO' : 'PLANO SOLICITADO'
  const semAcesso  = tipo === R_PJ
  const planoCard  = [
    `PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}`,
    `${planoLabel}: ${planoEscolhido}`,
    ...(semAcesso ? [] : ['ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE.']),
  ].join('\n')

  // ── card: roteador compatível + cabeçalho das 2 opções ──
  const roteadorCard =
    `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.\n${L_HEAD2}`

  // ── card: proc + ciente ──
  const procCard = semAcesso ? L_PROC : `${L_PROC}\n${L_CIENTE}`

  // ── card: fechamento ──
  let fechamento: string
  if (tipo === R_TERCEIRO) {
    fechamento =
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${clientePrimeiro} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${dataLig} ÀS ${horaLig}HRS.\n\n` +
      `${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.\n\n` +
      `CLIENTE NÃO TEM DÚVIDAS`
  } else {
    const quem = tipo === R_PJ ? solicitantePrimeiro : clientePrimeiro
    fechamento =
      `${quem} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR ${canal} (${contatoRemetente}) DIA ${dataLig} ÀS ${horaLig} HRS.`
  }

  const comentarios: string[] = []
  if (!ofertado) comentarios.push(`QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`)
  comentarios.push(planoCard, roteadorCard, L_O1, L_O2, procCard, fechamento)

  const { altplanRemotoTextoOS: osDescricao } = buildAltplanRemotoTextos(rawValues)
  return { info, comentarios, osDescricao }
}

/** Opções de plano/roteador — espelham os <select> do legado (reusadas no presencial). */
export const ALTPLAN_PLANO_ATUAL_OPTS = [
  { value: '100 MEGA/59,90', label: '100MB/59,90' },
  { value: '100 MEGA/79,90', label: '100MB/79,90' },
  { value: '150 MEGA/59,90', label: '150MB/59,90' },
  { value: '250 MEGA/69,90', label: '250MB/69,90' },
  { value: '300 MEGA/69,90', label: '300MB/69,90' },
  { value: '400 MEGA/79,90', label: '400MB/79,90' },
  { value: '500 MEGA/79,90', label: '500MB/79,90' },
  { value: '500 MEGA/99,90', label: '500MB/99,90' },
  { value: '600 MEGA/79,90', label: '600MB/79,90' },
  { value: '1000 MEGA/99,90', label: '1000MB/99,90' },
  { value: '1000 MEGA/149,80', label: '1000MB/149,80' },
  {
    value: '500 MEGA + WI-FI EXTEND/119,90',
    label: '500MB/119,90 — WI-FI EXTEND (CGNAT)',
  },
  {
    value: '1000 MEGA + WI-FI EXTEND/139,90',
    label: '1000MB/139,90 — WI-FI EXTEND (CGNAT)',
  },
]

export const ALTPLAN_PLANO_ESCOLHIDO_OPTS = [
  {
    value: '150 MEGA/59,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '150 MEGA/59,90 + MZTV (CDNTV+)',
  },
  {
    value: '300 MEGA/69,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '300 MEGA/69,90 + MZTV (CDNTV+)',
  },
  {
    value: '600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/79,90 + MZTV (CDNTV+)',
  },
  {
    value:
      '1 GIGA (1.000 MEGA) R$99,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/99,90 + MZTV (CDNTV+) + VOD',
  },
  {
    value:
      '150 MEGA/80,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '150 MEGA/80,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value:
      '300 MEGA/90,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '300 MEGA/90,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value:
      '600 MEGA/100,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/100,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value:
      '1 GIGA (1.000 MEGA) R$120,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/120,00 + MZTV (CDNTV+) + VOD + IP DIN',
  },
  {
    value:
      '600 MEGA/109,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV',
    label: '600 MEGA/109,90 + MZTV + VOD + ITTV PLUS (1 LICENÇA)',
  },
  {
    value:
      '1 GIGA (1.000 MEGA) R$129,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV + VOD',
    label: '1000 MEGA/129,90 + MZTV + VOD + ITTV PLUS (1 LICENÇA)',
  },
  {
    value:
      '600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/114,90 + BENEFÍCIOS + WI-FI EXTEND',
  },
  {
    value:
      '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/134,90 + BENEFÍCIOS + WI-FI EXTEND',
  },
]

export const ALTPLAN_ROTEADOR_OPTS = [
  { value: 'MULTILASER', label: 'MULTILASER' },
  { value: 'TP-LINK 840', label: 'TP-LINK 840' },
  { value: 'TP LINK C-20', label: 'TP LINK C-20' },
  { value: 'D-LINK DIR 842', label: 'D-LINK DIR 842' },
  { value: 'TP LINK C-5', label: 'TP LINK C-5' },
  { value: 'TP LINK G-5', label: 'TP LINK G-5' },
  { value: 'GREATEK', label: 'GREATEK' },
  { value: 'INTELBRAS', label: 'INTELBRAS' },
  { value: 'HUAWEI AX2', label: 'HUAWEI AX2' },
  { value: 'ZTE H196-MESH', label: 'ZTE H196-MESH' },
  { value: 'ZTE H199-A', label: 'ZTE H199-A' },
  { value: 'ONT ZTE F 670-L', label: 'ONT ZTE F 670-L' },
  { value: 'ONT TP-LINK XC220', label: 'ONT TP-LINK XC220' },
  { value: 'ONT TP-LINK XC230', label: 'ONT TP-LINK XC230' },
  { value: 'ONT TP-LINK X530', label: 'ONT TP-LINK X530' },
  { value: 'ZTE H199-A + ZTE H199-A', label: 'ZTE H199-A + ZTE H199-A (Wi-Fi Extend)' },
  { value: 'ZTE H199-A + ZTE H196', label: 'ZTE H199-A + ZTE H196 (Wi-Fi Extend)' },
  {
    value: 'ONT ZTE F 670-L + ZTE H199-A',
    label: 'ONT ZTE F 670-L + ZTE H199-A (Wi-Fi Extend)',
  },
  {
    value: 'ONT ZTE F 670-L + ZTE H196',
    label: 'ONT ZTE F 670-L + ZTE H196 (Wi-Fi Extend)',
  },
  { value: 'PARTICULAR DO CLIENTE', label: 'ROTEADOR PARTICULAR' },
]

const CANAL_OPTS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const SEM_SINAL_OPTS = [
  { value: 'nao', label: 'Informar medida' },
  { value: 'sim', label: 'Sem sinal' },
]

const TERCEIRO = [R_TERCEIRO]
const TERC_PJ = [R_TERCEIRO, R_PJ]
const TIT_PJ = [R_TITULAR, R_PJ]
const TIT_TERC = [R_TITULAR, R_TERCEIRO]

export const ALTPLAN_REMOTO_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: R_TITULAR,
    options: [
      { value: R_TITULAR, label: 'Titular solicita (remoto)', icon: 'user-round' },
      {
        value: R_TERCEIRO,
        label: 'Terceiro solicita (titular autoriza)',
        icon: 'users-round',
      },
      { value: R_PJ, label: 'Pessoa Jurídica', icon: 'users-round' },
    ],
    layout: { md: 12 },
  },
  {
    id: 'origem',
    label: 'Origem da alteração',
    control: 'radio',
    defaultValue: ORIGEM_PADRAO,
    options: ORIGEM_OPTS,
    layout: { md: 12 },
  },
  {
    id: 'cpf',
    label: 'CPF / CNPJ do titular',
    control: 'text',
    placeholder: 'Somente números',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'solicitante',
    label: 'Nome do solicitante',
    control: 'text',
    placeholder: 'Quem entrou em contato',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: TERC_PJ },
    layout: { md: 6 },
  },
  {
    id: 'cargo',
    label: 'Cargo / função',
    control: 'text',
    placeholder: 'Ex.: SÓCIO, GERENTE, RESPONSÁVEL',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: R_PJ },
    layout: { md: 6 },
  },
  {
    id: 'parente',
    label: 'Grau de parentesco',
    control: 'text',
    placeholder: 'Ex.: CÔNJUGE, FILHO(A)',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: TERCEIRO },
    layout: { md: 6 },
  },
  {
    id: 'cliente',
    label: 'Nome completo (titular/assinante)',
    control: 'text',
    placeholder: 'Titular da conexão',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: TIT_TERC },
    layout: { md: 6 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    options: CANAL_OPTS,
    layout: { md: 3 },
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
    id: 'contatoSol',
    label: 'Contato do solicitante',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: TERCEIRO },
    layout: { md: 3 },
  },
  {
    id: 'dataLigacao',
    label: 'Data/hora do contato',
    control: 'datetime',
    placeholder: 'dd/mm/aaaa hh:mm',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'semSinal',
    label: 'Sinal na ONU',
    control: 'radio',
    defaultValue: 'nao',
    section: S_ID,
    options: SEM_SINAL_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal da fibra',
    control: 'signal',
    placeholder: 'Ex.: 12.34 (sai -12.34DBM)',
    section: S_ID,
    showWhen: { field: 'semSinal', equals: 'nao' },
    layout: { md: 3 },
  },
  {
    id: 'motivo',
    label: 'Motivo (apenas o trecho entre aspas, em caixa alta no texto)',
    control: 'text',
    placeholder: "Ex.: 'deseja cortar gastos'",
    section: S_PLANO,
    showWhen: { field: 'origem', equals: ORIGEM_PADRAO },
    layout: { md: 12 },
  },
  {
    id: 'planoAtual',
    label: 'Plano atual',
    control: 'select',
    section: S_PLANO,
    options: ALTPLAN_PLANO_ATUAL_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'planoEscolhido',
    label: 'Plano escolhido',
    control: 'select',
    section: S_PLANO,
    options: ALTPLAN_PLANO_ESCOLHIDO_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    section: S_PLANO,
    options: ALTPLAN_ROTEADOR_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'dataContrato',
    label: 'Plano contratado em',
    control: 'text',
    placeholder: 'mês/ano',
    section: S_PLANO,
    layout: { md: 3 },
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_PLANO,
    layout: { md: 3 },
  },
  {
    id: 'dataProtocolo',
    label: 'Data/hora do protocolo',
    control: 'datetime',
    placeholder: 'dd/mm/aaaa hh:mm',
    section: S_PLANO,
    showWhen: { field: 'tipoSolicitacao', equals: TIT_PJ },
    layout: { md: 6 },
  },
]

export function getAltplanRemotoDefaults() {
  return {
    slug: 'altplan-remoto',
    title: 'Alteração de plano — remoto',
    outputTemplate: ALTPLAN_REMOTO_OUTPUT,
    demandCategory: 'alteracao-plano',
    fields: ALTPLAN_REMOTO_FIELDS.map((f) => ({
      ...f,
      options: f.options?.map((o) => ({ ...o })),
    })),
  }
}
