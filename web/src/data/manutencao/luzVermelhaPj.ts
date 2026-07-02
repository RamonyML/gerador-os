import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Luz vermelha / PON piscando — Pessoa Juridica.
 * Paridade com legado-exemplo/suporte/luz-vermelha/luzv-pj-padrao/index-luzverm-padrao-pj.html.
 */

const SEP_AST = '*'.repeat(19)
const SEP_OS = '='.repeat(39)

const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_DET = 'DETALHES DA OCORRENCIA'
const S_AGE = 'AGENDAMENTO'

const TECNICO =
  'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.'

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

  const protocolo = `${solicitantePrimeiro} (${cargo}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.

${SEP_AST}
${sp(4)}
CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuPrimeiro} SEM SINAL.
${sp(4)}
${SEP_AST}
${sp(4)}
QUESTIONADO, DISSE QUE A ${onuPrimeiro} ESTA COM ${alarme}.
${sp(4)}
REMOTAMENTE VERIFIQUEI QUE ${onuPrimeiro} ESTA DESCONECTADO/APAGADA. 
ORIENTEI ${solicitantePrimeiro} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. 
${sp(4)}
PERGUNTEI A ${solicitantePrimeiro} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. 
${sp(4)}
${SEP_AST}
${sp(4)}
INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.
${sp(4)}
${SEP_AST}
${sp(4)}
${solicitantePrimeiro} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${v.dataVisita ?? ''} AS ${v.horaVisita ?? ''} HRS.

CLIENTE SEM DUVIDAS.`

  const osBase = `${solicitantePrimeiro} (${cargo}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${onuPrimeiro} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ONU ESTA DESCONECTADO/APAGADA. ORIENTEI ${solicitantePrimeiro} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${solicitantePrimeiro} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solicitantePrimeiro} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita ?? ''} AS ${v.horaVisita ?? ''} HRS.`

  const os = `${osBase}${ctoBlock(ctoType, cto, passante)}${SEP_OS}

INDICACAO TECNICA:

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
    label: 'Cargo/Funcao',
    control: 'text',
    placeholder: 'Ex.: Socio, Admin, Tecnico, Gerente...',
    section: S_ID,
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
    label: 'Razao Social',
    control: 'text',
    placeholder: 'Informe o nome da empresa conforme cadastro no MK',
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
    label: 'Localizacao do passante',
    control: 'text',
    placeholder: "Ex.: 'Passante no poste proximo ao sobrado'",
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

export function buildLuzVermelhaPjSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[]; osDescricao: string; osIndicacoes: string } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const solicitante = first(upper(v.solicitante))
  const cargo       = upper(v.cargo)
  const onu         = upper(v.onu) || 'ONU'
  const op          = first(onu)
  const alarmeUp    = upper(v.alarme) || 'LUZ VERMELHA ACESA'
  const canal       = upper(v.canal)
  const contato     = digits(v.contato)
  const formaPag    = upper(v.formaPag)
  const dataV       = v.dataVisita || 'XX/XX/XXXX'
  const horaV       = v.horaVisita || 'XX:XX'

  const _osRaw = buildLuzVermelhaPjTextos(rawValues, '').luzVmPjTextoOS
  const _mark = 'INDICACAO TECNICA:'
  const _midx = _osRaw.indexOf(_mark)
  const osDescricao = _midx >= 0 ? _osRaw.slice(0, _midx).replace(/[\s=>*]+$/, '') : _osRaw
  const osIndicacoes = _midx >= 0 ? _osRaw.slice(_midx + _mark.length).trimStart() : ''

  return {
    info: `${solicitante} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    comentarios: [
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarmeUp}.\nREMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.`,
      `ORIENTEI ${solicitante} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.`,
      `PERGUNTEI A ${solicitante} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
      `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS`,
      `MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
      `${solicitante} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
    ],
    osDescricao,
    osIndicacoes,
  }
}

export function getManutLuzVermelhaPjDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-luz-vermelha-pj',
    title: 'Luz vermelha — pessoa juridica',
    demandCategory: 'manutencao',
    outputTemplate: LUZ_VERMELHA_PJ_OUTPUT,
    fields: LUZ_VERMELHA_PJ_FIELDS.map((f) => ({ ...f })),
  }
}
