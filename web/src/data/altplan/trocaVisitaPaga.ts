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
 * ALTERAÇÃO DE PLANO — COM TROCA + VISITA PAGA.
 *
 * Paridade (versão titular) com:
 * - legado-exemplo/suporte/altplan/altplan-troca-visita-paga/index-altplan-troca-visita-paga.html
 *
 * Variações de terceiro consolidadas a partir de:
 * - ct-vp-1 (titular solicita / autoriza terceiro)
 * - ct-vp-3 (terceiro solicita / titular acompanha)
 * - ct-vp-2 (terceiro solicita / terceiro acompanha)
 * Separadores e espaçamentos normalizados para o padrão da versão titular.
 */

const AST = '*'.repeat(14)
const OS_SEP = '*'.repeat(35)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_TERCEIRO = 'DADOS DE TERCEIRO / AUTORIZAÇÃO'
const S_PLANO = 'DETALHES DO PLANO'
const S_AGE = 'AGENDAMENTO'

export const TVP_TITULAR = 'titular-solicita-titular-acompanha'
export const TVP_TITULAR_TERCEIRO = 'titular-solicita-terceiro-acompanha'
export const TVP_TERCEIRO_TITULAR = 'terceiro-solicita-titular-acompanha'
export const TVP_TERCEIRO_TERCEIRO = 'terceiro-solicita-terceiro-acompanha'

const COMPAT_SIM =
  'É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, PORÉM FAREMOS O AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO DE UM NOVO ROTEADOR COM VERSÃO ATUALIZADA. APÓS INSTALADO, FAREMOS OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER.'
const COMPAT_NAO =
  'NÃO É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, E ASSIM SE FAZ NECESSÁRIO O AGENDAMENTO DE VISITA TÉCNICA PARA SUBSTITUIÇÃO DO ROTEADOR PARA UM MODELO COMPATÍVEL COM TAL VELOCIDADE, REALIZAR OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER.'

export const ALTPLAN_TROCA_VISITA_PAGA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{altplanTrocaVisitaPagaTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{altplanTrocaVisitaPagaTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{altplanTrocaVisitaPagaTextoAgenda}}',
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

const OS_TROCA_COMUM =
  'RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. É NECESSÁRIA VISITA TÉCNICA PARA TROCA DO ROTEADOR WI-FI POR OUTRO COMPATÍVEL COM O NOVO PLANO ESCOLHIDO, TAL EQUIPAMENTO IRÁ SUBSTITUIR O ROTEADOR INSTALADO ANTERIORMENTE E PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO.'

const INDICACAO_TECNICA = `TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO, FAZER TESTES ANTES E DEPOIS DA TROCA DO ROTEADOR. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), SOLICITAR ESCOLHA DA SENHA, CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.`

function osComIndicacao(inicio: string): string {
  return `${inicio}

${OS_SEP}

INDICAÇÃO TÉCNICA:

${INDICACAO_TECNICA}`
}

function protocoloBase(
  intro: string,
  sig: string,
  compat: string,
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
    `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${v.roteador}) ${compat} NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE O DESLOCAMENTO TÉCNICO, ESTE VALOR A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`,
    '',
    AST,
    '',
  ]
}

export function buildAltplanTrocaVisitaPagaTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || TVP_TITULAR
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
  const compat = upper(v.compat)
  const roteadorSug = upper(v.roteadorSug)
  const formaPag = v.formaPag ?? ''
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
  const sig = sinalSaida(rawValues)
  const agenda = `ALT PLANO ${cliente} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro} // ${roteadorSug}`

  const visitaPagaOS = `VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}.`

  const ofertado = isOfertado(rawValues)
  const finaliza = (textoProtocolo: string, os: string) => ({
    altplanTrocaVisitaPagaTextoProtocolo: ofertado
      ? aplicarOfertadoProtocolo(textoProtocolo)
      : textoProtocolo,
    altplanTrocaVisitaPagaTextoOS: ofertado ? aplicarOfertadoOS(os) : os,
    altplanTrocaVisitaPagaTextoAgenda: agenda,
  })

  const introTitular = `${clientePrimeiro} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`
  const introTerceiro = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`

  const osIntroTitular = `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${valores.planoAtual}. PLANO ESCOLHIDO: ${valores.planoEscolhido}. ${OS_TROCA_COMUM}`
  const osIntroTerceiro = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${valores.planoAtual}. PLANO ESCOLHIDO: ${valores.planoEscolhido}. ${OS_TROCA_COMUM}`

  if (tipo === TVP_TITULAR_TERCEIRO) {
    const textoProtocolo = [
      ...protocoloBase(introTitular, sig, compat, valores),
      `${clientePrimeiro} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS. OPTOU POR REALIZAR O PAGAMENTO NO ATO EM ${formaPag}. ${clientePrimeiro} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    const os = osComIndicacao(
      `${osIntroTitular} ${clientePrimeiro} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${visitaPagaOS} VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return finaliza(textoProtocolo, os)
  }

  if (tipo === TVP_TERCEIRO_TITULAR) {
    const textoProtocolo = [
      ...protocoloBase(introTerceiro, sig, compat, valores),
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${visitaPagaOS} AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    const os = osComIndicacao(
      `${osIntroTerceiro} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${visitaPagaOS} AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return finaliza(textoProtocolo, os)
  }

  if (tipo === TVP_TERCEIRO_TERCEIRO) {
    const textoProtocolo = [
      ...protocoloBase(introTerceiro, sig, compat, valores),
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. PAGAMENTO SERÁ REALIZADO EM ${formaPag} VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    const os = osComIndicacao(
      `${osIntroTerceiro} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${visitaPagaOS} AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return finaliza(textoProtocolo, os)
  }

  const textoProtocolo = [
    ...protocoloBase(introTitular, sig, compat, valores),
    `${clientePrimeiro} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS. OPTOU POR REALIZAR O PAGAMENTO NO ATO EM ${formaPag}, E A VISITA TÉCNICA FOI AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO.`,
  ].join('\n')

  const os = osComIndicacao(
    `${osIntroTitular} ${visitaPagaOS} VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
  )
  return finaliza(textoProtocolo, os)
}

const CANAL_OPTS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const COMPAT_OPTS = [
  { value: COMPAT_SIM, label: 'Sim — roteador compatível' },
  { value: COMPAT_NAO, label: 'Não — roteador incompatível' },
]

const HORA_VISITA_OPTS = [
  { value: '08:30', label: '08:30' },
  { value: '09:30', label: '09:30' },
  { value: '10:30', label: '10:30' },
  { value: '11:30', label: '11:30' },
  { value: '14:30', label: '14:30' },
  { value: '15:30', label: '15:30' },
  { value: '16:30', label: '16:30' },
  { value: '17:30', label: '17:30' },
  { value: '18:30', label: '18:30 (Tolentino)' },
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

const THIRD_REQUEST = [TVP_TERCEIRO_TITULAR, TVP_TERCEIRO_TERCEIRO]

export const ALTPLAN_TROCA_VISITA_PAGA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: TVP_TITULAR,
    options: [
      {
        value: TVP_TITULAR,
        label: 'Titular solicita e acompanha',
        icon: 'user-round',
      },
      {
        value: TVP_TITULAR_TERCEIRO,
        label: 'Titular solicita e autoriza terceiro',
        icon: 'user-round',
      },
      {
        value: TVP_TERCEIRO_TITULAR,
        label: 'Terceiro solicita e titular acompanha',
        icon: 'users-round',
      },
      {
        value: TVP_TERCEIRO_TERCEIRO,
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
    showWhen: { field: 'tipoSolicitacao', equals: TVP_TITULAR_TERCEIRO },
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
        TVP_TITULAR_TERCEIRO,
        TVP_TERCEIRO_TITULAR,
        TVP_TERCEIRO_TERCEIRO,
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
    label: 'Roteador atual',
    control: 'select',
    section: S_PLANO,
    options: ALTPLAN_ROTEADOR_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'compat',
    label: 'O roteador atual é compatível?',
    control: 'select',
    section: S_PLANO,
    options: COMPAT_OPTS,
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
    id: 'roteadorSug',
    label: 'Roteador sugerido (p/ agenda)',
    control: 'text',
    placeholder: 'Ex.: ONT ZTE F 670-L',
    section: S_PLANO,
    layout: { md: 6 },
  },
  {
    id: 'dataVisita',
    label: 'Data da visita técnica',
    control: 'date',
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 3 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_AGE,
    options: HORA_VISITA_OPTS,
    layout: { md: 3 },
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

export function getAltplanTrocaVisitaPagaDefaults() {
  return {
    slug: 'altplan-troca-visita-paga',
    title: 'Alteração de plano — com troca visita paga',
    outputTemplate: ALTPLAN_TROCA_VISITA_PAGA_OUTPUT,
    demandCategory: 'alteracao-plano',
    fields: ALTPLAN_TROCA_VISITA_PAGA_FIELDS.map((f) => ({
      ...f,
      options: f.options?.map((o) => ({ ...o })),
    })),
  }
}
