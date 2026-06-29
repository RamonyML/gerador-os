import type { OsTemplateField } from '../../types/osTemplate'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'
import {
  ALTPLAN_PLANO_ATUAL_OPTS,
  ALTPLAN_PLANO_ESCOLHIDO_OPTS,
  ALTPLAN_ROTEADOR_OPTS,
} from './remoto'
import {
  ORIGEM_OPTS,
  ORIGEM_PADRAO,
  aplicarOfertadoOS,
  aplicarOfertadoProtocolo,
  isOfertado,
} from './ofertado'

/**
 * ALTERAÇÃO DE PLANO — SEM TROCA + VISITA PAGA.
 *
 * Paridade (versão titular) com:
 * - legado-exemplo/suporte/altplan/altplan-sem-troca-visita-paga/index-altplan-sem-troca-visita-paga.html
 *
 * As variações de terceiro (titular/terceiro, terceiro/titular, terceiro/terceiro)
 * seguem o mesmo padrão consolidado em altplan/semTrocaVisitaIsenta.ts, adaptando o
 * trecho de visita isenta para o de visita paga (R$50,00 / forma de pagamento).
 */

const AST = '*'.repeat(14)
const OS_SEP = '*'.repeat(35)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_TERCEIRO = 'DADOS DE TERCEIRO / AUTORIZAÇÃO'
const S_PLANO = 'DETALHES DO PLANO'
const S_AGE = 'AGENDAMENTO'

export const STVP_TITULAR = 'titular-solicita-titular-acompanha'
export const STVP_TITULAR_TERCEIRO = 'titular-solicita-terceiro-acompanha'
export const STVP_TERCEIRO_TITULAR = 'terceiro-solicita-titular-acompanha'
export const STVP_TERCEIRO_TERCEIRO = 'terceiro-solicita-terceiro-acompanha'

export const ALTPLAN_SEM_TROCA_VISITA_PAGA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{altplanSemTrocaVisitaPagaTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{altplanSemTrocaVisitaPagaTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{altplanSemTrocaVisitaPagaTextoAgenda}}',
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

function sinalSaida(rawValues: Record<string, unknown>): string {
  const sig = formatSinalFibraSaida(String(rawValues.sinalONU ?? ''))
  const semSinal = String(rawValues.semSinal ?? '') === 'sim'
  return semSinal || !sig ? 'SEM SINAL' : sig
}

const INDICACAO_TECNICA = `TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO.  FAZER TESTE DA BANDA CONTRATADA.  PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.`

function osComIndicacao(inicio: string): string {
  return `${inicio}

${OS_SEP}

INDICAÇÃO TÉCNICA:

${INDICACAO_TECNICA}`
}

function protocoloBase(
  intro: string,
  sig: string,
  v: Record<string, string>,
): string[] {
  return [
    intro,
    '',
    AST,
    '    ',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}`,
    '    ',
    AST,
    `QUESTIONADO, CLIENTE DISSE QUE "${v.motivo}".`,
    '',
    `PLANO ATUAL: ${v.planoAtual} CONTRATADO EM ${v.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${v.roteador}`,
    '',
    `PLANO SOLICITADO: ${v.planoEscolhido}`,
    '',
    'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
    '',
    '',
    AST,
    '',
  ]
}

function informei(nome: string, roteador: string): string {
  return `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${nome} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${nome} POSSA TER, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE O DESLOCAMENTO TÉCNICO, ESTE VALOR A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`
}

export function buildAltplanSemTrocaVisitaPagaTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || STVP_TITULAR
  const cliente = upper(v.cliente)
  const clientePrimeiro = first(cliente)
  const solicitante = upper(v.solicitante)
  const solicitantePrimeiro = first(solicitante)
  const autorizado = upper(v.autorizado)
  const parente = upper(v.parente)
  const canal = v.canal ?? ''
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const bairro = upper(v.bairro)
  const valores = {
    motivo: upper(v.motivo),
    planoAtual: v.planoAtual ?? '',
    planoEscolhido: v.planoEscolhido ?? '',
    roteador: v.roteador ?? '',
    dataContrato: v.dataContrato ?? '',
  }
  const dataVisita = v.dataVisita ?? ''
  const horaVisita = v.horaVisita ?? ''
  const protocolo = v.protocolo ?? ''
  const formaPag = v.formaPag ?? ''
  const sig = sinalSaida(rawValues)
  const agenda = `ALT PLANO ${cliente} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`

  const ofertado = isOfertado(rawValues)
  const finaliza = (textoProtocolo: string, os: string) => ({
    altplanSemTrocaVisitaPagaTextoProtocolo: ofertado
      ? aplicarOfertadoProtocolo(textoProtocolo)
      : textoProtocolo,
    altplanSemTrocaVisitaPagaTextoOS: ofertado ? aplicarOfertadoOS(os) : os,
    altplanSemTrocaVisitaPagaTextoAgenda: agenda,
  })

  const introTitular = `${clientePrimeiro} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`
  const introTerceiro = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`

  if (tipo === STVP_TITULAR_TERCEIRO) {
    const textoProtocolo = [
      ...protocoloBase(introTitular, sig, valores),
      informei(clientePrimeiro, valores.roteador),
      '',
      AST,
      '',
      `${clientePrimeiro} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    const os = osComIndicacao(
      `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${valores.planoAtual}. PLANO ESCOLHIDO: ${valores.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${clientePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. ${clientePrimeiro} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}. AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return finaliza(textoProtocolo, os)
  }

  if (tipo === STVP_TERCEIRO_TITULAR) {
    const textoProtocolo = [
      ...protocoloBase(introTerceiro, sig, valores),
      informei(solicitantePrimeiro, valores.roteador),
      '',
      AST,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    const os = osComIndicacao(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${valores.planoAtual}. PLANO ESCOLHIDO: ${valores.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}. AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return finaliza(textoProtocolo, os)
  }

  if (tipo === STVP_TERCEIRO_TERCEIRO) {
    const textoProtocolo = [
      ...protocoloBase(introTerceiro, sig, valores),
      informei(solicitantePrimeiro, valores.roteador),
      '',
      AST,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    const os = osComIndicacao(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${valores.planoAtual}. PLANO ESCOLHIDO: ${valores.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}. AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return finaliza(textoProtocolo, os)
  }

  const textoProtocolo = [
    ...protocoloBase(introTitular, sig, valores),
    informei(clientePrimeiro, valores.roteador),
    '',
    AST,
    '',
    `${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, E FOI AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
  ].join('\n')

  const os = osComIndicacao(
    `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${valores.planoAtual}. PLANO ESCOLHIDO:${valores.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${clientePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}. AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
  )
  return finaliza(textoProtocolo, os)
}

export function buildAltplanSemTrocaVisitaPagaSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[]; osDescricao: string; osIndicacoes: string } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo     = v.tipoSolicitacao || STVP_TITULAR
  const ofertado = isOfertado(rawValues)
  const sig      = (() => {
    const s = formatSinalFibraSaida(v.sinalONU ?? '')
    return v.semSinal === 'sim' || !s ? 'SEM SINAL' : s
  })()

  const cp        = (v.cliente ?? '').trim().toUpperCase().split(/\s+/).filter(Boolean)[0] ?? ''
  const sp        = (v.solicitante ?? '').trim().toUpperCase().split(/\s+/).filter(Boolean)[0] ?? ''
  const solicitante = (v.solicitante ?? '').trim().toUpperCase()
  const autorizado  = (v.autorizado ?? '').trim().toUpperCase()
  const parente     = (v.parente ?? '').trim().toUpperCase()
  const canal       = v.canal ?? ''
  const contato     = (v.contato ?? '').replace(/\D/g, '')
  const contatoSol  = (v.contatoSol ?? '').replace(/\D/g, '')
  const motivo      = (v.motivo ?? '').trim().toUpperCase()
  const planoAtual     = v.planoAtual ?? ''
  const planoEscolhido = v.planoEscolhido ?? ''
  const roteador       = v.roteador ?? ''
  const dataContrato   = v.dataContrato ?? ''
  const formaPag       = v.formaPag ?? ''
  const dataVisita     = v.dataVisita ?? ''
  const horaVisita     = v.horaVisita ?? ''

  const isThird          = tipo === STVP_TERCEIRO_TITULAR || tipo === STVP_TERCEIRO_TERCEIRO
  const remetente        = isThird ? sp : cp
  const contatoRemetente = isThird ? contatoSol : contato
  const preposicao       = isThird ? `${sp} (${parente} DE ${cp})` : cp

  const abertura = ofertado
    ? `OFERTEI A ${preposicao} VIA ${canal} (${contatoRemetente}) ALTERAÇÃO DE PLANO.`
    : `${preposicao} ENTROU EM CONTATO VIA ${canal} (${contatoRemetente}) SOLICITANDO ALTERAÇÃO DE PLANO.`

  const info = `${abertura}\n\nCLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}`

  const planoLabel = ofertado ? 'PLANO OFERTADO' : 'PLANO SOLICITADO'
  const planoCard  = `PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}\n\n${planoLabel}: ${planoEscolhido}\n\nACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE.`

  const informei1 = `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${remetente} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS.`
  const informei2 = `O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${remetente} POSSA TER, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE O DESLOCAMENTO TÉCNICO, ESTE VALOR A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`

  let fechamento: string
  if (tipo === STVP_TITULAR_TERCEIRO) {
    fechamento = `${cp} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.\n\nCLIENTE SEM DUVIDAS.`
  } else if (tipo === STVP_TERCEIRO_TITULAR) {
    fechamento = `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.\n\nCLIENTE SEM DUVIDAS.`
  } else if (tipo === STVP_TERCEIRO_TERCEIRO) {
    fechamento = `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${cp} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.\n\nCLIENTE SEM DUVIDAS.`
  } else {
    fechamento = `${cp} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, E FOI AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`
  }

  const comentarios: string[] = []
  if (!ofertado) comentarios.push(`QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`)
  comentarios.push(planoCard, informei1, informei2, fechamento)

  const { altplanSemTrocaVisitaPagaTextoOS } = buildAltplanSemTrocaVisitaPagaTextos(rawValues, '')
  const sep = `\n\n${'*'.repeat(35)}\n\nINDICAÇÃO TÉCNICA:\n\n`
  const splitAt = altplanSemTrocaVisitaPagaTextoOS.indexOf(sep)
  const osDescricao = splitAt >= 0 ? altplanSemTrocaVisitaPagaTextoOS.slice(0, splitAt) : altplanSemTrocaVisitaPagaTextoOS
  const osIndicacoes = splitAt >= 0 ? altplanSemTrocaVisitaPagaTextoOS.slice(splitAt + sep.length) : ''

  return { info, comentarios, osDescricao, osIndicacoes }
}

const CANAL_OPTS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const FORMA_PAG_OPTS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTAO' },
]

const SEM_SINAL_OPTS = [
  { value: 'nao', label: 'Informar medida' },
  { value: 'sim', label: 'Sem sinal' },
]

const THIRD_REQUEST = [STVP_TERCEIRO_TITULAR, STVP_TERCEIRO_TERCEIRO]

export const ALTPLAN_SEM_TROCA_VISITA_PAGA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: STVP_TITULAR,
    options: [
      {
        value: STVP_TITULAR,
        label: 'Titular solicita e acompanha',
        icon: 'user-round',
      },
      {
        value: STVP_TITULAR_TERCEIRO,
        label: 'Titular solicita e autoriza terceiro',
        icon: 'user-round',
      },
      {
        value: STVP_TERCEIRO_TITULAR,
        label: 'Terceiro solicita e titular acompanha',
        icon: 'users-round',
      },
      {
        value: STVP_TERCEIRO_TERCEIRO,
        label: 'Terceiro solicita e terceiro acompanha',
        icon: 'users-round',
      },
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
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo do titular',
    section: S_ID,
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
    label: 'Contato do titular',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    layout: { md: 3 },
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
    id: 'semSinal',
    label: 'Sinal na ONU',
    control: 'radio',
    defaultValue: 'nao',
    section: S_ID,
    options: SEM_SINAL_OPTS,
    layout: { md: 6 },
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
    id: 'solicitante',
    label: 'Nome do terceiro solicitante',
    control: 'text',
    placeholder: 'Quem entrou em contato',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: THIRD_REQUEST },
    layout: { md: 5 },
  },
  {
    id: 'contatoSol',
    label: 'Contato do terceiro',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: THIRD_REQUEST },
    layout: { md: 3 },
  },
  {
    id: 'autorizado',
    label: 'Terceiro autorizado',
    control: 'text',
    placeholder: 'Nome completo de quem acompanhará o técnico',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: STVP_TITULAR_TERCEIRO },
    layout: { md: 5 },
  },
  {
    id: 'parente',
    label: 'Vínculo / parentesco',
    control: 'text',
    placeholder: 'MÃE, IRMÃO, LOCATÁRIO, ETC...',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [
        STVP_TITULAR_TERCEIRO,
        STVP_TERCEIRO_TITULAR,
        STVP_TERCEIRO_TERCEIRO,
      ],
    },
    layout: { md: 4 },
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
    layout: { md: 6 },
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_AGE,
    options: FORMA_PAG_OPTS,
    layout: { md: 3 },
  },
  {
    id: 'protocolo',
    label: 'Nº Protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    layout: { md: 3 },
  },
]

export function getAltplanSemTrocaVisitaPagaDefaults() {
  return {
    slug: 'altplan-sem-troca-visita-paga',
    title: 'Alteração de plano — sem troca visita paga',
    outputTemplate: ALTPLAN_SEM_TROCA_VISITA_PAGA_OUTPUT,
    demandCategory: 'alteracao-plano',
    fields: ALTPLAN_SEM_TROCA_VISITA_PAGA_FIELDS.map((f) => ({
      ...f,
      options: f.options?.map((o) => ({ ...o })),
    })),
  }
}
