import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Luz vermelha / PON piscando — fluxo único com variações de terceiro.
 * Paridade com legado-exemplo/suporte/luz-vermelha/:
 * - index-luzverm-padrao.html (titular)
 * - luz-padrao1.html (terceiro 1)
 * - luz-padrao2.html (terceiro 2)
 * - luz-padrao3.html (titular autoriza terceiro)
 */

const SEP28 = '='.repeat(28)
const SEP19 = '*'.repeat(19)
const SEP_OS = '='.repeat(39)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_TERCEIRO = 'DADOS DE TERCEIRO / AUTORIZAÇÃO'
const S_DET = 'DETALHES DA OCORRÊNCIA'
const S_AGE = 'AGENDAMENTO'

const TECNICO =
  'TÉCNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE É DE OBRIGAÇÃO DO PROVEDOR, TOMAR PROVIDÊNCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZAÇÃO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.'

export const LUZ_VERMELHA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{luzVmTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{luzVmTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{luzVmTextoAgenda}}',
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

function onuPrimeiroFrom(onu: string): string {
  return first(onu.trim().toUpperCase())
}

function alarmeAgendaPrefix(alarme: string): string {
  return alarme.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ')
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

function osTailTitular(): string {
  return `${SEP_OS}

> INDICAÇÃO TÉCNICA:

${TECNICO}`
}

function osTailP1(): string {
  return `${SEP_OS}
${sp(18)}
INDICAÇÃO TÉCNICA:
${sp(20)}
${TECNICO}`
}

function osTailP2(): string {
  return `${SEP_OS}

INDICAÇÃO TÉCNICA:

${TECNICO}`
}

function osTailP3(): string {
  return `${SEP_OS}

INDICAÇÃO TÉCNICA:
${sp(20)}
${TECNICO}`
}

function buildAgenda(
  v: Record<string, string>,
  clienteUpper: string,
  operadorPrimeiroNome: string,
): string {
  const ctoType = v.ctoType || 'CTOE'
  let agenda = `MAN ${alarmeAgendaPrefix(v.alarme ?? '')} ${clienteUpper} PROT:${v.protocolo ?? ''} ${v.formaPag ?? ''} (${operadorPrimeiroNome}) - ${upper(v.bairro)}`
  if (ctoType === 'CTOI') {
    agenda += ' *CTOI*'
  }
  return agenda
}

function buildProtocoloTitular(v: Record<string, string>, cp: string, op: string): string {
  const { canal, contato, alarme, formaPag, dataVisita, horaVisita, onu } = v
  return [
    `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP28,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(8),
    SEP28,
    sp(8),
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.`,
    sp(8),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
    sp(8),
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO.`,
    sp(8),
    SEP28,
    '',
    `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
    sp(8),
    SEP28,
    sp(8),
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
}

function buildProtocoloTerceiro1(
  v: Record<string, string>,
  sp_: string,
  cp: string,
  solicitanteUpper: string,
  op: string,
): string {
  const { canal, contato, contatoSol, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v
  return [
    `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.`,
    sp(4),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
    `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
    sp(4),
    `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
    '',
    SEP19,
    '',
    `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
    sp(4),
    SEP19,
    '',
    `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
}

function buildProtocoloTerceiro2(
  v: Record<string, string>,
  sp_: string,
  cp: string,
  op: string,
): string {
  const { canal, contato, contatoSol, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v
  return [
    `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.`,
    sp(4),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
    `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
    sp(4),
    `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
    sp(4),
    SEP19,
    '',
    `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
    sp(4),
    SEP19,
    '',
    `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
}

function buildProtocoloTitularTerceiro(
  v: Record<string, string>,
  cp: string,
  op: string,
  solicitanteUpper: string,
): string {
  const { canal, contato, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v
  return [
    `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    sp(20),
    SEP19,
    sp(24),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(24),
    SEP19,
    sp(24),
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.`,
    sp(24),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
    sp(24),
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
    sp(24),
    SEP19,
    sp(20),
    `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
    sp(20),
    SEP19,
    sp(20),
    `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
}

export function buildLuzVermelhaTextos(
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
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const onu = upper(v.onu)
  const op = onuPrimeiroFrom(onu)
  const ctoType = v.ctoType || 'CTOE'
  const cto = upper(v.cto)
  const passante = upper(v.passante)
  const ctoLine = ctoBlock(ctoType, cto, passante)
  const agenda = buildAgenda(v, clienteUpper, operadorPrimeiroNome)

  v.contato = contato
  v.contatoSol = contatoSol
  v.parente = parente
  v.onu = onu

  if (tipo === T_TERCEIRO_TERCEIRO) {
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${v.alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
    return {
      luzVmTextoProtocolo: buildProtocoloTerceiro1(v, sp_, cp, solicitanteUpper, op),
      luzVmTextoOS: osBase + ctoLine + osTailP1(),
      luzVmTextoAgenda: agenda,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${v.alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
    return {
      luzVmTextoProtocolo: buildProtocoloTerceiro2(v, sp_, cp, op),
      luzVmTextoOS: osBase + ctoLine + osTailP2(),
      luzVmTextoAgenda: agenda,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${v.alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
    return {
      luzVmTextoProtocolo: buildProtocoloTitularTerceiro(v, cp, op, solicitanteUpper),
      luzVmTextoOS: osBase + ctoLine + osTailP3(),
      luzVmTextoAgenda: agenda,
    }
  }

  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${v.alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  return {
    luzVmTextoProtocolo: buildProtocoloTitular(v, cp, op),
    luzVmTextoOS: osBase + ctoLine + osTailTitular(),
    luzVmTextoAgenda: agenda,
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

export const LUZ_VERMELHA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: T_TITULAR,
    options: [
      {
        value: T_TITULAR,
        label: 'Titular solicita e acompanha',
        icon: 'user-round',
      },
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
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO],
    },
    layout: { md: 8 },
  },
  {
    id: 'parente',
    label: 'Grau de relacionamento',
    control: 'text',
    placeholder: 'Ex.: Mãe, Filho, Irmão, Esposa…',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO],
    },
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
    id: 'contatoSol',
    label: 'Contato do solicitante',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO],
    },
    layout: { md: 4 },
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

export function getManutLuzVermelhaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-luz-vermelha',
    title: 'Luz vermelha — padrão',
    demandCategory: 'manutencao',
    outputTemplate: LUZ_VERMELHA_OUTPUT,
    fields: LUZ_VERMELHA_FIELDS.map((f) => ({ ...f })),
  }
}
