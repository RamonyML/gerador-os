import { describe, it, expect } from 'vitest'
import {
  LUZ_VERMELHA_OUTPUT,
  buildLuzVermelhaTextos,
} from './luzVermelha'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'

/**
 * Paridade caractere-a-caractere com legado-exemplo/suporte/luz-vermelha/
 * (index-luzverm-padrao, luz-padrao1/2/3).
 */

type BaseEntrada = {
  cliente: string
  canal: string
  contato: string
  alarme: string
  bairro: string
  dataVisita: string
  horaVisita: string
  protocolo: string
  formaPag: string
  cto: string
  passante: string
  onu: string
  ctoType: 'CTOE' | 'CTOI'
  operadorDisplayName: string
}

type EntradaTerceiro = BaseEntrada & {
  solicitante: string
  parente: string
  contatoSol: string
}

const SEP28 = '='.repeat(28)
const SEP19 = '*'.repeat(19)
const SEP_OS = '='.repeat(39)
const sp = (n: number) => ' '.repeat(n)

const TECNICO =
  'TÉCNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE É DE OBRIGAÇÃO DO PROVEDOR, TOMAR PROVIDÊNCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZAÇÃO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.'

function operadorPrimeiro(displayName: string): string {
  return displayName.trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ?? ''
}

function ctoOsBlock(ctoType: string, cto: string, passante: string): string {
  if (ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`
  if (ctoType === 'CTOI') return `\nCTOI // ${passante}.\n`
  return ''
}

function agendaLegado(v: BaseEntrada, operador: string): string {
  const cliente = v.cliente.toUpperCase()
  const alarmePrefix = v.alarme.split(' ').slice(0, 2).join(' ')
  const bairro = v.bairro.toUpperCase()
  let texto = `MAN ${alarmePrefix} ${cliente} PROT:${v.protocolo} ${v.formaPag} (${operador}) - ${bairro}`
  if (v.ctoType === 'CTOI') texto += ' *CTOI*'
  return texto
}

function legadoTitular(v: BaseEntrada) {
  const cliente = v.cliente.toUpperCase()
  const cp = cliente.split(' ')[0]
  const canal = v.canal
  const contato = v.contato.replace(/\D/g, '')
  const onu = v.onu
  const op = onu.split(' ')[0]
  const alarme = v.alarme
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const cto = v.cto.toUpperCase()
  const passante = v.passante.toUpperCase()
  const operador = operadorPrimeiro(v.operadorDisplayName)

  const textoProtocolo = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.

${SEP28}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.
${sp(8)}
${SEP28}
${sp(8)}
QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.
${sp(8)}
REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. 
ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. 
${sp(8)}
PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO.
${sp(8)}
${SEP28}

INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.
${sp(8)}
${SEP28}
${sp(8)}
${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`

  let textoOS = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  textoOS += ctoOsBlock(v.ctoType, cto, passante)
  textoOS += `${SEP_OS}

> INDICAÇÃO TÉCNICA:

${TECNICO}`

  return {
    textoProtocolo,
    textoOS,
    textoAgenda: agendaLegado(v, operador),
  }
}

function legadoP1(v: EntradaTerceiro) {
  const cliente = v.cliente.toUpperCase()
  const cp = cliente.split(' ')[0]
  const solicitante = v.solicitante.toUpperCase()
  const sp_ = solicitante.split(' ')[0]
  const parente = v.parente.toUpperCase()
  const canal = v.canal
  const contato = v.contato.replace(/\D/g, '')
  const contatoSol = v.contatoSol.replace(/\D/g, '')
  const onu = v.onu
  const op = onu.split(' ')[0]
  const alarme = v.alarme
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const cto = v.cto.toUpperCase()
  const passante = v.passante.toUpperCase()
  const operador = operadorPrimeiro(v.operadorDisplayName)

  const textoProtocolo = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.

${SEP19}
${sp(4)}
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.
${sp(4)}
${SEP19}
${sp(4)}
QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.
${sp(4)}
REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. 
ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. 
${sp(4)}
PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 

${SEP19}

INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.
${sp(4)}
${SEP19}

POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`

  let textoOS = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  textoOS += ctoOsBlock(v.ctoType, cto, passante)
  textoOS += `${SEP_OS}
${sp(18)}
INDICAÇÃO TÉCNICA:
${sp(20)}
${TECNICO}`

  return {
    textoProtocolo,
    textoOS,
    textoAgenda: agendaLegado(v, operador),
  }
}

function legadoP2(v: EntradaTerceiro) {
  const cliente = v.cliente.toUpperCase()
  const cp = cliente.split(' ')[0]
  const solicitante = v.solicitante.toUpperCase()
  const sp_ = solicitante.split(' ')[0]
  const parente = v.parente.toUpperCase()
  const canal = v.canal
  const contato = v.contato.replace(/\D/g, '')
  const contatoSol = v.contatoSol.replace(/\D/g, '')
  const onu = v.onu
  const op = onu.split(' ')[0]
  const alarme = v.alarme
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const cto = v.cto.toUpperCase()
  const passante = v.passante.toUpperCase()
  const operador = operadorPrimeiro(v.operadorDisplayName)

  const textoProtocolo = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.

${SEP19}
${sp(4)}
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.
${sp(4)}
${SEP19}
${sp(4)}
QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.
${sp(4)}
REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. 
ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. 
${sp(4)}
PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 
${sp(4)}
${SEP19}

INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.
${sp(4)}
${SEP19}

POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`

  let textoOS = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  textoOS += ctoOsBlock(v.ctoType, cto, passante)
  textoOS += `${SEP_OS}

INDICAÇÃO TÉCNICA:

${TECNICO}`

  return {
    textoProtocolo,
    textoOS,
    textoAgenda: agendaLegado(v, operador),
  }
}

function legadoP3(v: EntradaTerceiro) {
  const cliente = v.cliente.toUpperCase()
  const cp = cliente.split(' ')[0]
  const solicitante = v.solicitante.toUpperCase()
  const parente = v.parente.toUpperCase()
  const canal = v.canal
  const contato = v.contato.replace(/\D/g, '')
  const onu = v.onu
  const op = onu.split(' ')[0]
  const alarme = v.alarme
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const cto = v.cto.toUpperCase()
  const passante = v.passante.toUpperCase()
  const operador = operadorPrimeiro(v.operadorDisplayName)

  const textoProtocolo = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.
${sp(20)}
${SEP19}
${sp(24)}
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.
${sp(24)}
${SEP19}
${sp(24)}
QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.
${sp(24)}
REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. 
ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. 
${sp(24)}
PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 
${sp(24)}
${SEP19}
${sp(20)}
INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.
${sp(20)}
${SEP19}
${sp(20)}
${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitante} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`

  let textoOS = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitante} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  textoOS += ctoOsBlock(v.ctoType, cto, passante)
  textoOS += `${SEP_OS}

INDICAÇÃO TÉCNICA:
${sp(20)}
${TECNICO}`

  return {
    textoProtocolo,
    textoOS,
    textoAgenda: agendaLegado(v, operador),
  }
}

function gerarNovo(tipo: string, v: Record<string, string>, operadorDisplayName: string) {
  const operadorPrimeiroNome = operadorPrimeiro(operadorDisplayName)
  const ctx = {
    ...v,
    tipoSolicitacao: tipo,
    ...buildLuzVermelhaTextos({ ...v, tipoSolicitacao: tipo }, operadorPrimeiroNome),
  }
  const full = renderTemplate(LUZ_VERMELHA_OUTPUT, ctx)
  const secs = splitOsPreviewSections(full)
  return {
    protocolo: secs[0]?.body ?? '',
    os: secs[1]?.body ?? '',
    agenda: secs[2]?.body ?? '',
  }
}

const BASE: BaseEntrada = {
  cliente: 'Maria Oliveira Santos',
  canal: 'WHATSAPP',
  contato: '(34) 99111-2233',
  alarme: 'LUZ VERMELHA ACESA',
  bairro: 'Saraiva',
  dataVisita: '18/06/2026',
  horaVisita: '14:30',
  protocolo: '456.789',
  formaPag: 'PIX',
  cto: '1035-A',
  passante: 'PASSANTE NO POSTE PRÓXIMO AO SOBRADO',
  onu: 'ONU',
  ctoType: 'CTOE',
  operadorDisplayName: 'Gabriel Martins',
}

const TERCEIRO: EntradaTerceiro = {
  ...BASE,
  solicitante: 'João Pedro Oliveira',
  parente: 'FILHO',
  contatoSol: '34988887766',
}

describe('Luz vermelha — paridade com HTML legado', () => {
  it('titular — Texto Protocolo', () => {
    const v = { ...BASE, tipoSolicitacao: T_TITULAR }
    const leg = legadoTitular(BASE)
    expect(gerarNovo(T_TITULAR, v, BASE.operadorDisplayName).protocolo).toBe(
      leg.textoProtocolo,
    )
  })

  it('titular — Texto O.S', () => {
    const v = { ...BASE, tipoSolicitacao: T_TITULAR }
    expect(gerarNovo(T_TITULAR, v, BASE.operadorDisplayName).os).toBe(
      legadoTitular(BASE).textoOS,
    )
  })

  it('titular — Texto Agenda', () => {
    const v = { ...BASE, tipoSolicitacao: T_TITULAR }
    expect(gerarNovo(T_TITULAR, v, BASE.operadorDisplayName).agenda).toBe(
      legadoTitular(BASE).textoAgenda,
    )
  })

  it('terceiro 1 — Texto Protocolo', () => {
    const v = { ...TERCEIRO, tipoSolicitacao: T_TERCEIRO_TERCEIRO }
    expect(gerarNovo(T_TERCEIRO_TERCEIRO, v, TERCEIRO.operadorDisplayName).protocolo).toBe(
      legadoP1(TERCEIRO).textoProtocolo,
    )
  })

  it('terceiro 1 — Texto O.S', () => {
    const v = { ...TERCEIRO, tipoSolicitacao: T_TERCEIRO_TERCEIRO }
    expect(gerarNovo(T_TERCEIRO_TERCEIRO, v, TERCEIRO.operadorDisplayName).os).toBe(
      legadoP1(TERCEIRO).textoOS,
    )
  })

  it('terceiro 2 — Texto Protocolo', () => {
    const v = { ...TERCEIRO, tipoSolicitacao: T_TERCEIRO_TITULAR }
    expect(gerarNovo(T_TERCEIRO_TITULAR, v, TERCEIRO.operadorDisplayName).protocolo).toBe(
      legadoP2(TERCEIRO).textoProtocolo,
    )
  })

  it('terceiro 2 — Texto O.S', () => {
    const v = { ...TERCEIRO, tipoSolicitacao: T_TERCEIRO_TITULAR }
    expect(gerarNovo(T_TERCEIRO_TITULAR, v, TERCEIRO.operadorDisplayName).os).toBe(
      legadoP2(TERCEIRO).textoOS,
    )
  })

  it('titular autoriza terceiro — Texto Protocolo', () => {
    const v = { ...TERCEIRO, tipoSolicitacao: T_TITULAR_TERCEIRO }
    expect(gerarNovo(T_TITULAR_TERCEIRO, v, TERCEIRO.operadorDisplayName).protocolo).toBe(
      legadoP3(TERCEIRO).textoProtocolo,
    )
  })

  it('titular autoriza terceiro — Texto O.S', () => {
    const v = { ...TERCEIRO, tipoSolicitacao: T_TITULAR_TERCEIRO }
    expect(gerarNovo(T_TITULAR_TERCEIRO, v, TERCEIRO.operadorDisplayName).os).toBe(
      legadoP3(TERCEIRO).textoOS,
    )
  })

  it('CTOI — sufixo na agenda', () => {
    const ctoi = { ...BASE, ctoType: 'CTOI' as const, cto: '' }
    const v = { ...ctoi, tipoSolicitacao: T_TITULAR }
    expect(gerarNovo(T_TITULAR, v, BASE.operadorDisplayName).agenda).toBe(
      legadoTitular(ctoi).textoAgenda,
    )
  })
})
