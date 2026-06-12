import { describe, it, expect } from 'vitest'
import {
  FIBRA_EXTERNA_OUTPUT,
  buildFibraExternaTextos,
  T_PJ,
} from './fibraExterna'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'

/**
 * Paridade caractere-a-caractere com
 * legado-exemplo/suporte/luz-vermelha/fibra-externa/*.html
 * (fibra-ext-padrao, fibra-ext-pj, fibra-ext1/2/3).
 */

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)
const SEP_OS = '='.repeat(39)
const sp = (n: number) => ' '.repeat(n)

const TECNICO =
  'TÉCNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE É DE OBRIGAÇÃO DO PROVEDOR, TOMAR PROVIDÊNCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZAÇÃO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.'

const INFORMEI_TERC =
  'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.'

type Vars = {
  cliente: string
  solicitante: string
  parente: string
  cargo: string
  canal: string
  contato: string
  contatoSol: string
  alarme: string
  onu: string
  bairro: string
  motivo: string
  dataVisita: string
  horaVisita: string
  protocolo: string
  formaPag: string
  cto: string
  passante: string
  operador: string
}

function ctoBlock(ctoType: 'CTOE' | 'CTOI', cto: string, passante: string): string {
  if (ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`
  return `\nCTOI // ${passante}.\n`
}

function tailBlank(): string {
  return `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${TECNICO}`
}

function tailExt1(): string {
  return `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n${sp(20)}\n${TECNICO}`
}

function agenda(v: Vars, ctoType: 'CTOE' | 'CTOI'): string {
  const prefix = v.alarme.split(' ').slice(0, 2).join(' ')
  let texto = `MAN ${prefix} ${v.cliente} PROT:${v.protocolo} ${v.formaPag} (${v.operador}) - ${v.bairro}`
  if (ctoType === 'CTOI') texto += ' *CTOI*'
  return texto
}

function legadoPadrao(v: Vars, ctoType: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP19,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    '',
    SEP19,
    '',
    `QUESTIONADO, DISSE DISSE QUE "${v.motivo}".`,
    `PERGUNTEI SOBRE ${v.onu} E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA ACESA.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${v.onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
    '',
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO.`,
    '',
    SEP19,
    '',
    `INFORMEI QUE SERÁ NECESSÁRIO VISITA TÉCNICA E CASO SEJA NECESSÁRIO A TROCA DO CABO DROP, IRÍAMOS TROCAR DO POSTE ATÉ OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NÃO OCASIONADO PELO CLIENTE A MANUTENÇÃO NÃO TEM CUSTO. ${cp} TAMBÉM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS.`,
    sp(4),
    SEP19,
    sp(4),
    `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita}HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE "${v.motivo}", E FICOU SEM CONEXÃO COM A INTERNET. PERGUNTEI SOBRE ${v.onu} E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA PISCANDO. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE SERÁ NECESSÁRIO VISITA TÉCNICA E CASO SEJA NECESSÁRIO A TROCA DO CABO DROP, IRÍAMOS TROCAR DO POSTE ATÉ OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NÃO OCASIONADO PELO CLIENTE A MANUTENÇÃO NÃO TEM CUSTO. ${cp} TAMBÉM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita}HRS.`
  return {
    protocolo,
    os: osBase + ctoBlock(ctoType, v.cto, v.passante) + tailBlank(),
    agenda: agenda(v, ctoType),
  }
}

function legadoPj(v: Vars, ctoType: 'CTOE' | 'CTOI') {
  const sp_ = v.solicitante.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${sp_} (${v.cargo}) ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO À INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${v.onu} ESTÁ DESCONECTADO/APAGADA.`,
    '',
    SEP19,
    '',
    INFORMEI_TERC,
    '',
    SEP19,
    '',
    `${sp_} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${v.formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.cargo}) ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. PERGUNTEI SOBRE A ${op}, E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ${op} APAGADA. INFORMEI QUE SERÁ NECESSÁRIO VISITA TÉCNICA E CASO SEJA NECESSÁRIO A TROCA DO CABO DROP, IRÍAMOS TROCAR DO POSTE ATÉ OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NÃO OCASIONADO PELO CLIENTE A MANUTENÇÃO NÃO TEM CUSTO. ${sp_} TAMBÉM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} AUTORIZOU VISITA E PAGARÁ EM ${v.formaPag} NO ATO. VISITA AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  return {
    protocolo,
    os: osBase + ctoBlock(ctoType, v.cto, v.passante) + tailBlank(),
    agenda: agenda(v, ctoType),
  }
}

function legadoExt1(v: Vars, ctoType: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const sp_ = v.solicitante.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, ${sp_} DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO À INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${v.onu} ESTÁ DESCONECTADO/APAGADA.`,
    sp(4),
    `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
    '',
    SEP42,
    '',
    INFORMEI_TERC,
    sp(4),
    SEP42,
    '',
    `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${v.formaPag}. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERÁ NECESSÁRIO VISITA TÉCNICA E CASO SEJA NECESSÁRIO A TROCA DO CABO DROP, IRÍAMOS TROCAR DO POSTE ATÉ OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NÃO OCASIONADO PELO CLIENTE A MANUTENÇÃO NÃO TEM CUSTO. ${sp_} TAMBÉM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  return {
    protocolo,
    os: osBase + ctoBlock(ctoType, v.cto, v.passante) + tailExt1(),
    agenda: agenda(v, ctoType),
  }
}

function legadoExt2(v: Vars, ctoType: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const sp_ = v.solicitante.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO À INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${v.onu} ESTÁ DESCONECTADO/APAGADA.`,
    sp(4),
    SEP19,
    '',
    INFORMEI_TERC,
    sp(4),
    SEP19,
    '',
    `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${v.formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERÁ NECESSÁRIO VISITA TÉCNICA E CASO SEJA NECESSÁRIO A TROCA DO CABO DROP, IRÍAMOS TROCAR DO POSTE ATÉ OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NÃO OCASIONADO PELO CLIENTE A MANUTENÇÃO NÃO TEM CUSTO. ${sp_} TAMBÉM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  return {
    protocolo,
    os: osBase + ctoBlock(ctoType, v.cto, v.passante) + tailBlank(),
    agenda: agenda(v, ctoType),
  }
}

function legadoExt3(v: Vars, ctoType: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    sp(20),
    SEP19,
    sp(24),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(24),
    SEP19,
    sp(24),
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO À INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${v.onu} ESTÁ DESCONECTADO/APAGADA. `,
    sp(24),
    SEP19,
    sp(20),
    INFORMEI_TERC,
    sp(20),
    SEP19,
    sp(20),
    `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERÁ NECESSÁRIO VISITA TÉCNICA E CASO SEJA NECESSÁRIO A TROCA DO CABO DROP, IRÍAMOS TROCAR DO POSTE ATÉ OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NÃO OCASIONADO PELO CLIENTE A MANUTENÇÃO NÃO TEM CUSTO. ${cp} TAMBÉM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  return {
    protocolo,
    os: osBase + ctoBlock(ctoType, v.cto, v.passante) + tailBlank(),
    agenda: agenda(v, ctoType),
  }
}

function gerarNovo(tipo: string, v: Vars, ctoType: 'CTOE' | 'CTOI') {
  const raw = { ...v, ctoType, tipoSolicitacao: tipo }
  const ctx = { ...raw, ...buildFibraExternaTextos(raw, v.operador) }
  const full = renderTemplate(FIBRA_EXTERNA_OUTPUT, ctx)
  const secs = splitOsPreviewSections(full)
  return {
    protocolo: secs[0]?.body ?? '',
    os: secs[1]?.body ?? '',
    agenda: secs[2]?.body ?? '',
  }
}

const BASE: Vars = {
  cliente: 'MARIA OLIVEIRA SANTOS',
  solicitante: 'JOÃO PEDRO OLIVEIRA',
  parente: 'FILHO',
  cargo: 'GERENTE',
  canal: 'WHATSAPP',
  contato: '34991112233',
  contatoSol: '34988887766',
  alarme: 'LUZ VERMELHA ACESA',
  onu: 'ONU',
  bairro: 'SARAIVA',
  motivo: 'UM VEÍCULO ALTO PASSOU NA RUA ROMPENDO O CABO DROP',
  dataVisita: '18/06/2026',
  horaVisita: '14:30',
  protocolo: '456.789',
  formaPag: 'PIX',
  cto: '1035-A',
  passante: 'PASSANTE NO POSTE PRÓXIMO AO SOBRADO',
  operador: 'GABRIEL',
}

const CASOS: Array<{
  nome: string
  tipo: string
  legado: (v: Vars, c: 'CTOE' | 'CTOI') => { protocolo: string; os: string; agenda: string }
}> = [
  { nome: 'titular (padrão)', tipo: T_TITULAR, legado: legadoPadrao },
  { nome: 'pessoa jurídica', tipo: T_PJ, legado: legadoPj },
  { nome: 'terceiro 1 (titular ausente)', tipo: T_TERCEIRO_TERCEIRO, legado: legadoExt1 },
  { nome: 'terceiro 2 (titular presente)', tipo: T_TERCEIRO_TITULAR, legado: legadoExt2 },
  { nome: 'titular autoriza terceiro', tipo: T_TITULAR_TERCEIRO, legado: legadoExt3 },
]

describe('Fibra óptica externa — paridade com HTML legado', () => {
  for (const caso of CASOS) {
    it(`${caso.nome} — Texto Protocolo`, () => {
      expect(gerarNovo(caso.tipo, BASE, 'CTOE').protocolo).toBe(
        caso.legado(BASE, 'CTOE').protocolo,
      )
    })

    it(`${caso.nome} — Texto O.S (CTOE)`, () => {
      expect(gerarNovo(caso.tipo, BASE, 'CTOE').os).toBe(caso.legado(BASE, 'CTOE').os)
    })

    it(`${caso.nome} — Texto O.S (CTOI)`, () => {
      expect(gerarNovo(caso.tipo, BASE, 'CTOI').os).toBe(caso.legado(BASE, 'CTOI').os)
    })

    it(`${caso.nome} — Texto Agenda (CTOI)`, () => {
      expect(gerarNovo(caso.tipo, BASE, 'CTOI').agenda).toBe(
        caso.legado(BASE, 'CTOI').agenda,
      )
    })
  }
})
