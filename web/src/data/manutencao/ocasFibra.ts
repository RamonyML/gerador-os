import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Dano ocasionado na fibra (externo) — fluxo único com variações de terceiro.
 * Paridade com legado-exemplo/suporte/luz-vermelha/ocasionado-fibra/:
 * - ocas-fibra-padrao.html (titular solicita e acompanha)
 * - ocas-fibra1.html (terceiro solicita, titular ausente)
 * - ocas-fibra2.html (terceiro solicita, titular presente)
 * - ocas-fibra3.html (titular solicita e autoriza terceiro)
 *
 * Obs.: os textos do legado são copiados caractere-a-caractere, inclusive
 * eventuais "erros" (ex.: "PAGAMENTOEM" no fluxo de terceiro 1).
 */

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)
const SEP_OS = '='.repeat(39)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA OCORRÊNCIA'
const S_AGE = 'AGENDAMENTO'

const VALOR_50 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSÁRIO FAZER EMENDA TÉCNICA, O VALOR É DE R$ 50,00 REFERENTE A MÃO DE OBRA TÉCNICA.'
const VALOR_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSÁRIO FAZER EMENDA TÉCNICA, O VALOR É DE R$ 100,00 REFERENTE A MÃO DE OBRA TÉCNICA.'
const VALOR_50_100 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVIÇO É DE R$50,00. EXPLIQUEI TAMBÉM QUE CASO DROP (CABO/FIBRA) NÃO TENHA SOBRA E FOR NECESSÁRIO SER SUBSTITUÍDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PEÇAS E SERVIÇOS).'

const CUSTO =
  'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TÉCNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.'

function tecnico(quem: string): string {
  return `TÉCNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TÉCNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXÃO. CASO NÃO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZAÇÃO COM ${quem}. TEMPO ESTIMADO 60 MIN.`
}

export const OCAS_FIBRA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{ocasFibraTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{ocasFibraTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{ocasFibraTextoAgenda}}',
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

function osTailPadrao(quem: string): string {
  return `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${tecnico(quem)}`
}

function osTailFibra1(quem: string): string {
  return `${SEP_OS}\n${sp(18)}\nINDICAÇÃO TÉCNICA:\n\n${tecnico(quem)}`
}

export function buildOcasFibraTextos(
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
  const valor = v.valor
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
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, ${sp_} DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${motivo}", E FICOU SEM ACESSO À INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA.`,
      '',
      SEP42,
      '',
      valor,
      sp(4),
      SEP42,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTOEM ${formaPag}. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENÇÃO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATÉ MESMO OS EQUIPAMENTOS. ${valor} ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    return {
      ocasFibraTextoProtocolo: protocolo,
      ocasFibraTextoOS: osBase + ctoLine + osTailFibra1(sp_),
      ocasFibraTextoAgenda: agenda,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    const protocolo = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${motivo}", E FICOU SEM ACESSO À INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA.`,
      sp(4),
      SEP19,
      '',
      CUSTO,
      '',
      SEP19,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTO EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. ${valor} ${sp_} CONCORDOU COM A VISITA E FARÁ O PAGAMENTO EM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    return {
      ocasFibraTextoProtocolo: protocolo,
      ocasFibraTextoOS: osBase + ctoLine + osTailPadrao(cp),
      ocasFibraTextoAgenda: agenda,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    const protocolo = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      sp(20),
      SEP19,
      sp(24),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
      sp(24),
      SEP19,
      sp(24),
      `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${motivo}", E FICOU SEM ACESSO À INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA.`,
      sp(24),
      SEP19,
      sp(20),
      valor,
      '',
      SEP19,
      sp(20),
      `${cp} CONCORDOU COM A VISITA E FARÁ O PAGAMENTO COM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. ${valor} ${cp} CONCORDOU COM A VISITA E FARÁ O PAGAMENTO COM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    return {
      ocasFibraTextoProtocolo: protocolo,
      ocasFibraTextoOS: osBase + ctoLine + osTailPadrao(cp),
      ocasFibraTextoAgenda: agenda,
    }
  }

  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP42,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(4),
    SEP42,
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO.`,
    '',
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${motivo}".`,
    '',
    valor,
    '',
    SEP42,
    '',
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTO EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO À INTERNET. PERGUNTEI SOBRE A ${op}, E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU APAGADA. ${valor} ${cp} AUTORIZOU VISITA E PAGARÁ EM ${formaPag} NO ATO. VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  return {
    ocasFibraTextoProtocolo: protocolo,
    ocasFibraTextoOS: osBase + ctoLine + osTailPadrao(cp),
    ocasFibraTextoAgenda: agenda,
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

export const OCAS_FIBRA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
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
    id: 'motivo',
    label: 'Resumo do ocorrido',
    control: 'text',
    placeholder: "Ex.: 'ao podar uma árvore, cliente cortou a fibra ótica externa'",
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
    id: 'valor',
    label: 'Valor',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: [
      { value: VALOR_50, label: 'R$50,00' },
      { value: VALOR_100, label: 'R$100,00' },
      { value: VALOR_50_100, label: 'R$50 ou R$100' },
    ],
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_AGE,
    layout: { md: 3 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
]

export function getManutOcasFibraDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-ocas-fibra',
    title: 'Dano ocasionado — fibra (externa)',
    demandCategory: 'manutencao',
    outputTemplate: OCAS_FIBRA_OUTPUT,
    fields: OCAS_FIBRA_FIELDS.map((f) => ({ ...f })),
  }
}
