import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Sinal alto — fluxo único com variações.
 * Paridade com legado-exemplo/suporte/sinal-alto/:
 * - index-sinal-padrao.html (titular)
 * - index-sinal-pj.html (pessoa jurídica)
 * - sinal1.html (terceiro solicita, titular ausente)
 * - sinal2.html (terceiro solicita, titular presente)
 * - sinal3.html (titular solicita e autoriza terceiro)
 */

export const T_PJ = 'pessoa-juridica'

const SEP19 = '*'.repeat(19)
const SEP_OS = '='.repeat(39)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA OCORRÊNCIA'
const S_AGE = 'AGENDAMENTO'

const TECNICO =
  'TÉCNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE É DE OBRIGAÇÃO DO PROVEDOR, TOMAR PROVIDÊNCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZAÇÃO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 60 MIN.'

export const SINAL_ALTO_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{sinalAltoTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{sinalAltoTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{sinalAltoTextoAgenda}}',
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

function osTail(): string {
  return `${SEP_OS}

INDICAÇÃO TÉCNICA:

${TECNICO}`
}

export function buildSinalAltoTextos(
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
  const cargo = upper(v.cargo)
  const canal = v.canal
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const onu = upper(v.onu)
  const op = first(onu)
  const sinalONU = upper(v.sinalONU)
  const sinalONUan = upper(v.sinalONUan)
  const oscila = upper(v.oscila)
  const bairro = upper(v.bairro)
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const protocolo = upper(v.protocolo)
  const ctoType = v.ctoType || 'CTOE'
  const cto = upper(v.cto)
  const passante = upper(v.passante)
  const ctoLine = ctoBlock(ctoType, cto, passante)

  let agenda = `MAN SINAL ALTO ${clienteUpper} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`
  if (ctoType === 'CTOI') agenda += ' *CTOI*'

  let protocoloTxt = ''
  let osBase = ''

  if (tipo === T_PJ) {
    protocoloTxt = [
      `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E SINAL ${op} ${sinalONU} ${oscila}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO ${sp_} DISSE QUE ESTÁ SOFRENDO DESCONEXÕES REPETIDAS EM SUA REDE, ALEGA QUE OS DISPOSITIVOS ESTÃO CONECTADOS COM MENSAGEM DE CONECTADO SEM INTERNET OU APRESENTAM EXTREMA LENTIDÃO. `,
      sp(4),
      `VERIFIQUEI REMOTAMENTE ${op} ESTÁ COM SINAL ALTO FORA DO PADRÃO. REGISTRO DE ULTIMA MANUTENÇÃO ERA ${sinalONUan} , SINAL ATUAL ${sinalONU} ${oscila}. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
      sp(4),
      SEP19,
      sp(4),
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    osBase = `${sp_} (${cargo}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E DISSE QUE ESTÁ COM DESCONEXÕES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDÊNCIA PERDEM CONEXÃO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VÁRIAS DESCONEXÕES, ONU ACESA COM SINAL ALTO FORA DO PADRÃO (${sinalONU} ${oscila}), FOI INSTALADO COM ${sinalONUan}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS (${onu}) E RECONECTA-LOS APÓS 30 SEGUNDOS, FEITO PORÉM CONEXÃO E SINAL NÃO NORMALIZOU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI A ${sp_} QUE É NECESSÁRIO VISITA TÉCNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS DANIFICADOS. ${sp_} DISSE ESTÁ CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SERÁ PAGO NO ATO EM ${formaPag}. VISITA AGENDADA PARA DIA ${dataVisita} ÀS ${horaVisita} HRS.`
  } else if (tipo === T_TERCEIRO_TERCEIRO) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} ${sinalONU} ${oscila}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO ${sp_} DISSE QUE ESTÁ SOFRENDO DESCONEXÕES REPETIDAS EM SUA REDE, ALEGA QUE OS DISPOSITIVOS ESTÃO CONECTADOS COM MENSAGEM DE CONECTADO SEM INTERNET OU APRESENTAM EXTREMA LENTIDÃO. `,
      sp(4),
      `VERIFIQUEI REMOTAMENTE ${op} ESTÁ COM SINAL ALTO FORA DO PADRÃO. REGISTRO DE ULTIMA MANUTENÇÃO ERA ${sinalONUan} , SINAL ATUAL ${sinalONU} ${oscila}. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO.`,
      '',
      SEP19,
      sp(4),
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
      sp(4),
      SEP19,
      sp(4),
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTÁ COM DESCONEXÕES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDÊNCIA PERDEM CONEXÃO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VÁRIAS DESCONEXÕES, ONU ACESA COM SINAL ALTO FORA DO PADRÃO (${sinalONU} ${oscila}), FOI INSTALADO COM ${sinalONUan}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS (${onu}) E RECONECTA-LOS APÓS 30 SEGUNDOS, FEITO PORÉM CONEXÃO E SINAL NÃO NORMALIZOU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI A ${sp_} QUE É NECESSÁRIO VISITA TÉCNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS DANIFICADOS. ${sp_} DISSE ESTÁ CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SERÁ PAGO NO ATO EM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  } else if (tipo === T_TERCEIRO_TITULAR) {
    protocoloTxt = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} ${sinalONU} ${oscila}.`,
      '',
      SEP19,
      sp(4),
      `QUESTIONADO ${sp_} DISSE QUE ESTÁ SOFRENDO DESCONEXÕES REPETIDAS EM SUA REDE, ALEGA QUE OS DISPOSITIVOS ESTÃO CONECTADOS COM MENSAGEM DE CONECTADO SEM INTERNET OU APRESENTAM EXTREMA LENTIDÃO. `,
      sp(4),
      `VERIFIQUEI REMOTAMENTE ${op} ESTÁ COM SINAL ALTO FORA DO PADRÃO. REGISTRO DE ULTIMA MANUTENÇÃO ERA ${sinalONUan} , SINAL ATUAL ${sinalONU} ${oscila}. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
      sp(4),
      SEP19,
      sp(4),
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTÁ COM DESCONEXÕES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDÊNCIA PERDEM CONEXÃO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VÁRIAS DESCONEXÕES, ONU ACESA COM SINAL ALTO FORA DO PADRÃO (${sinalONU} ${oscila}), FOI INSTALADO COM ${sinalONUan}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS (${onu}) E RECONECTA-LOS APÓS 30 SEGUNDOS, FEITO PORÉM CONEXÃO E SINAL NÃO NORMALIZOU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI A ${sp_} QUE É NECESSÁRIO VISITA TÉCNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS DANIFICADOS. ${sp_} DISSE ESTÁ CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SERÁ PAGO NO ATO EM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  } else if (tipo === T_TITULAR_TERCEIRO) {
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} ${sinalONU} ${oscila}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO ${cp} DISSE QUE ESTÁ SOFRENDO DESCONEXÕES REPETIDAS EM SUA REDE, ALEGA QUE OS DISPOSITIVOS ESTÃO CONECTADOS COM MENSAGEM DE CONECTADO SEM INTERNET OU APRESENTAM EXTREMA LENTIDÃO. `,
      sp(4),
      `VERIFIQUEI REMOTAMENTE ${op} ESTÁ COM SINAL ALTO FORA DO PADRÃO. REGISTRO DE ULTIMA MANUTENÇÃO ERA ${sinalONUan} , SINAL ATUAL ${sinalONU} ${oscila}. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
      sp(4),
      SEP19,
      sp(4),
      `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    osBase = `${cp} ENTROU EM CONTATO VIA ${canal} (${contato}) E DISSE QUE ESTÁ COM DESCONEXÕES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDÊNCIA PERDEM CONEXÃO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VÁRIAS DESCONEXÕES, ONU ACESA COM SINAL ALTO FORA DO PADRÃO (${sinalONU} ${oscila}), FOI INSTALADO COM ${sinalONUan}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS (${onu}) E RECONECTA-LOS APÓS 30 SEGUNDOS, FEITO PORÉM CONEXÃO E SINAL NÃO NORMALIZOU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI A ${cp} QUE É NECESSÁRIO VISITA TÉCNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} DISSE ESTÁ CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SERÁ PAGO NO ATO EM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  } else {
    // T_TITULAR (padrão)
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E SINAL ${op} ${sinalONU} ${oscila}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO ${cp} DISSE QUE ESTÁ SOFRENDO DESCONEXÕES REPETIDAS EM SUA REDE, ALEGA QUE OS DISPOSITIVOS ESTÃO CONECTADOS COM MENSAGEM DE CONECTADO SEM INTERNET OU APRESENTAM EXTREMA LENTIDÃO. `,
      sp(4),
      `VERIFIQUEI REMOTAMENTE ${op} ESTÁ COM SINAL ALTO FORA DO PADRÃO. REGISTRO DE ULTIMA MANUTENÇÃO ERA ${sinalONUan} , SINAL ATUAL ${sinalONU} ${oscila}. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.`,
      sp(4),
      SEP19,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')

    osBase = `${cp} ENTROU EM CONTATO VIA ${canal} (${contato}) E DISSE QUE ESTÁ COM DESCONEXÕES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDÊNCIA PERDEM CONEXÃO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VÁRIAS DESCONEXÕES, ONU ACESA COM SINAL ALTO FORA DO PADRÃO (${sinalONU} ${oscila}), FOI INSTALADO COM ${sinalONUan}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS (${onu}) E RECONECTA-LOS APÓS 30 SEGUNDOS, FEITO PORÉM CONEXÃO E SINAL NÃO NORMALIZOU. PERGUNTEI ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI A ${cp} QUE É NECESSÁRIO VISITA TÉCNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS DANIFICADOS. ${cp} DISSE ESTÁ CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SERÁ PAGO NO ATO EM ${formaPag}. VISITA AGENDADA PARA DIA ${dataVisita} ÀS ${horaVisita} HRS.`
  }

  const os = osBase + ctoLine + osTail()

  return {
    sinalAltoTextoProtocolo: protocoloTxt,
    sinalAltoTextoOS: os,
    sinalAltoTextoAgenda: agenda,
  }
}

const COM_SOLICITANTE = [T_PJ, T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO]
const COM_TERCEIRO = [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO]
const COM_CONTATO_SOL = [T_PJ, T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO]
const COM_CONTATO_TITULAR = [
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
]

export const SINAL_ALTO_FIELDS: OsTemplateField[] = [
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
    layout: { md: 12 },
  },
  {
    id: 'solicitante',
    label: 'Solicitante',
    control: 'text',
    placeholder: 'Nome completo de quem entrou em contato',
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
    showWhen: { field: 'tipoSolicitacao', equals: COM_CONTATO_TITULAR },
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
    id: 'sinalONU',
    label: 'Sinal atual',
    control: 'text',
    placeholder: 'Ex.: -31.87 dBm',
    section: S_DET,
    layout: { md: 3 },
  },
  {
    id: 'sinalONUan',
    label: 'Sinal anterior',
    control: 'text',
    placeholder: 'Ex.: -17.45 dBm',
    section: S_DET,
    layout: { md: 3 },
  },
  {
    id: 'oscila',
    label: 'Oscilação',
    control: 'select',
    section: S_DET,
    layout: { md: 3 },
    options: [
      { value: 'SEM OSCILAÇÃO', label: 'Sem oscilação' },
      { value: 'COM OSCILAÇÃO', label: 'Com oscilação' },
    ],
  },
  {
    id: 'onu',
    label: 'ONU/ONT',
    control: 'select',
    section: S_DET,
    layout: { md: 3 },
    options: [
      { value: 'ONU E ROTEADOR', label: 'ONU' },
      { value: 'ONT', label: 'ONT' },
    ],
  },
  {
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
  },
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
    layout: { md: 4 },
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
    layout: { md: 3 },
    options: [
      { value: '08:30', label: '08:30' },
      { value: '09:30', label: '09:30' },
      { value: '10:30', label: '10:30' },
      { value: '11:30', label: '11:30' },
      { value: '13:30', label: '13:30' },
      { value: '14:30', label: '14:30' },
      { value: '15:30', label: '15:30' },
      { value: '16:30', label: '16:30' },
      { value: '17:30', label: '17:30' },
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
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    layout: { md: 3 },
  },
]

export function getManutSinalAltoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-sinal-alto',
    title: 'Sinal alto',
    demandCategory: 'manutencao',
    outputTemplate: SINAL_ALTO_OUTPUT,
    fields: SINAL_ALTO_FIELDS.map((f) => ({ ...f })),
  }
}
