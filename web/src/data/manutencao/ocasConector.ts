import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Dano ocasionado no conector (interno) — fluxo unico com variacoes de terceiro.
 * Paridade com legado-exemplo/suporte/luz-vermelha/ocasionado-conector/:
 * - ocas-conect-padrao.html (titular)
 * - ocas-conect1.html (terceiro solicita, titular ausente)
 * - ocas-conect2.html (terceiro solicita, titular presente)
 * - ocas-conect3.html (titular solicita e autoriza terceiro)
 *
 * Obs.: o gerador legado imprimia "INFORMAR VALOR DE undefined" na indicacao
 * tecnica (bug por ${onu.split(' ')[1]} ser sempre indefinido). Aqui o trecho
 * foi corrigido para "INFORMAR VALOR DO EQUIPAMENTO".
 */

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)
const SEP_OS = '='.repeat(39)

const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA OCORRENCIA'
const S_AGE = 'AGENDAMENTO'

function tecnico(op: string): string {
  return `TECNICO: ANALISAR ESTRUTURA INTERNA. CASO FOR FIBRA ROMPIDA OU CONECTOR DANIFICADO, CORRIGIR E RESTABELECER CONEXAO. DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIA NA INSTALACAO QUE NAO TIVER PADRAO E COBRAR VISITA MINIMA DE R$50,00. CASO ${op} ESTIVER DANIFICADA INFORMAR VALOR DO EQUIPAMENTO (CUSTO DO EQUIPAMENTO + MAO DE OBRA), CLIENTE CONCORDANDO COM A SUBSTITUICAO DA ${op} ENTRAR EM CONTATO COM RESPONSAVEL DO SUPORTE PARA VERIFICAR FORMA DE PAGAMENTO. ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO: 40 MIN.`
}

export const OCAS_CONECTOR_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{ocasConectTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{ocasConectTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{ocasConectTextoAgenda}}',
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
  if (ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`
  if (ctoType === 'CTOI') return `\nCTOI // ${passante}.\n`
  return ''
}

function alarmeAgendaPrefix(alarme: string): string {
  return alarme.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ')
}

function osTailBlank(op: string): string {
  return `${SEP_OS}

INDICACAO TECNICA:

${tecnico(op)}`
}

function osTailConect1(op: string): string {
  return `${SEP_OS}
${sp(18)}
INDICACAO TECNICA:
${sp(20)}
${tecnico(op)}`
}

function osTailConect3(op: string): string {
  return `${SEP_OS}
${sp(20)}
INDICACAO TECNICA:
${sp(20)}
${tecnico(op)}`
}

export function buildOcasConectorTextos(
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
  const canal = v.canal
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const onu = upper(v.onu)
  const op = first(onu)
  const motivo = upper(v.motivo)
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const ctoType = v.ctoType || 'CTOE'
  const cto = upper(v.cto)
  const passante = upper(v.passante)
  const ctoLine = ctoBlock(ctoType, cto, passante)

  let agenda = `MAN ${alarmeAgendaPrefix(v.alarme ?? '')} (OCASIONADO) ${clienteUpper} PROT:${v.protocolo ?? ''} ${formaPag} (${operadorPrimeiroNome}) - ${upper(v.bairro)}`
  if (ctoType === 'CTOI') agenda += ' *CTOI*'

  if (tipo === T_TERCEIRO_TERCEIRO) {
    const protocolo = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, ${sp_} DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.`,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      '',
      SEP42,
      '',
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TECNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
      '',
      SEP42,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO EM ${formaPag}. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A ${sp_} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      ocasConectTextoProtocolo: protocolo,
      ocasConectTextoOS: osBase + ctoLine + osTailConect1(op),
      ocasConectTextoAgenda: agenda,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    const protocolo = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.`,
      sp(4),
      SEP19,
      '',
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
      sp(4),
      SEP19,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A ${sp_} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      ocasConectTextoProtocolo: protocolo,
      ocasConectTextoOS: osBase + ctoLine + osTailBlank(op),
      ocasConectTextoAgenda: agenda,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    const protocolo = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      sp(20),
      SEP19,
      sp(24),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      sp(24),
      SEP19,
      sp(24),
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
      sp(24),
      SEP19,
      sp(20),
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
      sp(20),
      SEP19,
      sp(20),
      `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A ${cp} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      ocasConectTextoProtocolo: protocolo,
      ocasConectTextoOS: osBase + ctoLine + osTailConect3(op),
      ocasConectTextoAgenda: agenda,
    }
  }

  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    '',
    SEP19,
    '',
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.`,
    '',
    'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TECNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
    SEP19,
    '',
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A ${cp} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM OS TERMOS DA VISITA E PAGARA EM ${formaPag}. VISITA AGENDADA PARA ${dataVisita} A PARTIR DE ${horaVisita} HRS.`
  return {
    ocasConectTextoProtocolo: protocolo,
    ocasConectTextoOS: osBase + ctoLine + osTailBlank(op),
    ocasConectTextoAgenda: agenda,
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

const COM_TERCEIRO = [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO]
const COM_CONTATO_SOL = [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO]

export const OCAS_CONECTOR_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitacao',
    control: 'select',
    highlight: true,
    defaultValue: T_TITULAR,
    options: [
      { value: T_TITULAR, label: 'Titular solicita e acompanha', icon: 'user-round' },
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
    label: 'Solicitante',
    control: 'text',
    placeholder: 'Nome completo do terceiro que entrou em contato',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_TERCEIRO },
    layout: { md: 8 },
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
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo',
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
    id: 'motivo',
    label: 'Resumo do ocorrido',
    control: 'text',
    placeholder: "Ex.: 'ao mover o sofa de lugar, esbarrou na fibra e danificou o conector'",
    section: S_DET,
    layout: { md: 12 },
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

export function buildOcasConectorSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  const operadorPrimeiroNome = String(rawValues.operadorPrimeiroNome ?? '')
  const { ocasConectTextoProtocolo } = buildOcasConectorTextos(rawValues, operadorPrimeiroNome)
  const segments = ocasConectTextoProtocolo
    .split(/^[=*]{5,}$/gm)
    .map((s) => s.trim())
    .filter(Boolean)
  return { info: segments[0] ?? '', comentarios: segments.slice(1) }
}

export function getManutOcasConectorDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-ocas-conector',
    title: 'Dano ocasionado — conector (interno)',
    demandCategory: 'manutencao',
    outputTemplate: OCAS_CONECTOR_OUTPUT,
    fields: OCAS_CONECTOR_FIELDS.map((f) => ({ ...f })),
  }
}
