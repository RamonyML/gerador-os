import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Luz vermelha / PON piscando — Pessoa Jurídica.
 * Paridade com legado-exemplo/suporte/luz-vermelha/luzv-pj-padrao/index-luzverm-padrao-pj.html.
 */

const SEP_AST = '*'.repeat(19)
const SEP_OS = '='.repeat(39)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES DA OCORRÊNCIA'
const S_AGE = 'AGENDAMENTO'

const TECNICO =
  'TÉCNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE É DE OBRIGAÇÃO DO PROVEDOR, TOMAR PROVIDÊNCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZAÇÃO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.'

export const LUZ_VERMELHA_PJ_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{luzVmPjTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{luzVmPjTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{luzVmPjTextoAgenda}}',
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

function ctoBlock(ctoType: string, cto: string, passante: string): string {
  if (ctoType === 'CTOE') {
    return `\nCTOE: ${cto} // ${passante}.\n`
  }
  if (ctoType === 'CTOI') {
    return `\nCTOI // ${passante}.\n`
  }
  return ''
}

function alarmeAgendaPrefix(alarme: string): string {
  return alarme.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ')
}

export function buildLuzVermelhaPjTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const cliente = upper(v.cliente)
  const solicitante = upper(v.solicitante)
  const solicitantePrimeiro = first(solicitante)
  const cargo = upper(v.cargo)
  const contato = digits(v.contato)
  const alarme = v.alarme ?? ''
  const bairro = upper(v.bairro)
  const formaPag = v.formaPag ?? ''
  const onu = upper(v.onu)
  const onuPrimeiro = first(onu)
  const ctoType = v.ctoType || 'CTOE'
  const cto = upper(v.cto)
  const passante = upper(v.passante)

  const protocolo = `${solicitantePrimeiro} (${cargo}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.

${SEP_AST}
${sp(4)}
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${onuPrimeiro} SEM SINAL.
${sp(4)}
${SEP_AST}
${sp(4)}
QUESTIONADO, DISSE QUE A ${onuPrimeiro} ESTÁ COM ${alarme}.
${sp(4)}
REMOTAMENTE VERIFIQUEI QUE ${onuPrimeiro} ESTÁ DESCONECTADO/APAGADA. 
ORIENTEI ${solicitantePrimeiro} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. 
${sp(4)}
PERGUNTEI A ${solicitantePrimeiro} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 
${sp(4)}
${SEP_AST}
${sp(4)}
INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.
${sp(4)}
${SEP_AST}
${sp(4)}
${solicitantePrimeiro} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${v.dataVisita ?? ''} ÀS ${v.horaVisita ?? ''} HRS.

CLIENTE SEM DUVIDAS.`

  const osBase = `${solicitantePrimeiro} (${cargo}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${onuPrimeiro} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ONU ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${solicitantePrimeiro} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI A ${solicitantePrimeiro} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${solicitantePrimeiro} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita ?? ''} ÀS ${v.horaVisita ?? ''} HRS.`

  const os = `${osBase}${ctoBlock(ctoType, cto, passante)}${SEP_OS}

INDICAÇÃO TÉCNICA:

${TECNICO}`

  let agenda = `MAN ${alarmeAgendaPrefix(alarme)} ${cliente} PROT:${v.protocolo ?? ''} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`
  if (ctoType === 'CTOI') {
    agenda += ' *CTOI*'
  }

  return {
    luzVmPjTextoProtocolo: protocolo,
    luzVmPjTextoOS: os,
    luzVmPjTextoAgenda: agenda,
  }
}

const CTO_RADIOS: OsTemplateField = {
  id: 'ctoType',
  label: 'Tipo CTO',
  control: 'radio',
  section: S_DET,
  defaultValue: 'CTOE',
  layout: { md: 4 },
  options: [
    { value: 'CTOE', label: 'CTOE' },
    { value: 'CTOI', label: 'CTOI' },
  ],
}

export const LUZ_VERMELHA_PJ_FIELDS: OsTemplateField[] = [
  {
    id: 'solicitante',
    label: 'Solicitante',
    control: 'text',
    placeholder: 'Nome completo de quem solicitou o suporte',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'cargo',
    label: 'Cargo/Função',
    control: 'text',
    placeholder: 'Ex.: Sócio, Admin, Técnico, Gerente...',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'cliente',
    label: 'Razão Social',
    control: 'text',
    placeholder: 'Informe o nome da empresa conforme cadastro no MK',
    section: S_ID,
    layout: { md: 12 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
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
    label: 'Alarme',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'LUZ VERMELHA ACESA', label: 'Luz vermelha' },
      { value: 'LUZ PON PISCANDO', label: 'Luz PON piscando' },
    ],
  },
  {
    id: 'onu',
    label: 'ONU/ONT',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'ONU', label: 'ONU' },
      { value: 'ONT', label: 'ONT' },
    ],
  },
  CTO_RADIOS,
  {
    id: 'cto',
    label: 'CTO',
    control: 'text',
    placeholder: 'Ex.: 1035-A',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'passante',
    label: 'Localização do passante',
    control: 'text',
    placeholder: "Ex.: 'Passante no poste próximo ao sobrado'",
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

export function getManutLuzVermelhaPjDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-luz-vermelha-pj',
    title: 'Luz vermelha — pessoa jurídica',
    demandCategory: 'manutencao',
    outputTemplate: LUZ_VERMELHA_PJ_OUTPUT,
    fields: LUZ_VERMELHA_PJ_FIELDS.map((f) => ({ ...f })),
  }
}
