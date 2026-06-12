import { describe, it, expect } from 'vitest'
import { OCAS_CONECTOR_OUTPUT, buildOcasConectorTextos } from './ocasConector'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'

/**
 * Paridade com legado-exemplo/suporte/luz-vermelha/ocasionado-conector/*.html
 * (ocas-conect-padrao, ocas-conect1/2/3).
 *
 * Divergência intencional: o legado imprimia "INFORMAR VALOR DE undefined"
 * (bug). Aqui esperamos "INFORMAR VALOR DO EQUIPAMENTO".
 */

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)
const SEP_OS = '='.repeat(39)
const sp = (n: number) => ' '.repeat(n)

const tecnico = (op: string) =>
  `TÉCNICO: ANALISAR ESTRUTURA INTERNA. CASO FOR FIBRA ROMPIDA OU CONECTOR DANIFICADO, CORRIGIR E RESTABELECER CONEXÃO. DAR EXPLICAÇÕES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIA NA INSTALAÇÃO QUE NÃO TIVER PADRÃO E COBRAR VISITA MÍNIMA DE R$50,00. CASO ${op} ESTIVER DANIFICADA INFORMAR VALOR DO EQUIPAMENTO (CUSTO DO EQUIPAMENTO + MÃO DE OBRA), CLIENTE CONCORDANDO COM A SUBSTITUIÇÃO DA ${op} ENTRAR EM CONTATO COM RESPONSÁVEL DO SUPORTE PARA VERIFICAR FORMA DE PAGAMENTO. ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO: 40 MIN.`

const CUSTO =
  'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TÉCNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.'
const RESP =
  'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.'

type Vars = {
  cliente: string
  solicitante: string
  parente: string
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

function ctoBlock(c: 'CTOE' | 'CTOI', cto: string, passante: string): string {
  if (c === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`
  return `\nCTOI // ${passante}.\n`
}

function agenda(v: Vars, c: 'CTOE' | 'CTOI'): string {
  const prefix = v.alarme.split(' ').slice(0, 2).join(' ')
  let t = `MAN ${prefix} (OCASIONADO) ${v.cliente} PROT:${v.protocolo} ${v.formaPag} (${v.operador}) - ${v.bairro}`
  if (c === 'CTOI') t += ' *CTOI*'
  return t
}

function osMiddle(quem: string): string {
  return `EXPLIQUEI QUE COM A QUEDA/INTERVENÇÃO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATÉ MESMO OS EQUIPAMENTOS. INFORMEI A ${quem} QUE É NECESSÁRIO VISITA TÉCNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS.`
}

function legadoPadrao(v: Vars, c: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    '',
    SEP19,
    '',
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO À INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA.`,
    '',
    CUSTO,
    SEP19,
    '',
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTO EM ${v.formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. ${osMiddle(cp)} ${cp} CONCORDOU COM OS TERMOS DA VISITA E PAGARÁ EM ${v.formaPag}. VISITA AGENDADA PARA ${v.dataVisita} À PARTIR DE ${v.horaVisita} HRS.`
  const os = osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${tecnico(op)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function legadoConect1(v: Vars, c: 'CTOE' | 'CTOI') {
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
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA.`,
    sp(4),
    `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
    '',
    SEP42,
    '',
    CUSTO,
    '',
    SEP42,
    '',
    `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTO EM ${v.formaPag}. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. ${osMiddle(sp_)} ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  const os =
    osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n${sp(18)}\nINDICAÇÃO TÉCNICA:\n${sp(20)}\n${tecnico(op)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function legadoConect2(v: Vars, c: 'CTOE' | 'CTOI') {
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
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA.`,
    sp(4),
    SEP19,
    '',
    RESP,
    sp(4),
    SEP19,
    '',
    `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${v.formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. ${osMiddle(sp_)} ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  const os = osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${tecnico(op)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function legadoConect3(v: Vars, c: 'CTOE' | 'CTOI') {
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
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
    sp(24),
    SEP19,
    sp(20),
    RESP,
    sp(20),
    SEP19,
    sp(20),
    `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. ${osMiddle(cp)} ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  const os =
    osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n${sp(20)}\nINDICAÇÃO TÉCNICA:\n${sp(20)}\n${tecnico(op)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function gerarNovo(tipo: string, v: Vars, c: 'CTOE' | 'CTOI') {
  const raw = { ...v, ctoType: c, tipoSolicitacao: tipo }
  const ctx = { ...raw, ...buildOcasConectorTextos(raw, v.operador) }
  const full = renderTemplate(OCAS_CONECTOR_OUTPUT, ctx)
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
  canal: 'WHATSAPP',
  contato: '34991112233',
  contatoSol: '34988887766',
  alarme: 'LUZ VERMELHA ACESA',
  onu: 'ONU',
  bairro: 'SARAIVA',
  motivo: 'AO MOVER O SOFÁ DE LUGAR, ESBARROU NA FIBRA E DANIFICOU O CONECTOR',
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
  { nome: 'terceiro 1 (titular ausente)', tipo: T_TERCEIRO_TERCEIRO, legado: legadoConect1 },
  { nome: 'terceiro 2 (titular presente)', tipo: T_TERCEIRO_TITULAR, legado: legadoConect2 },
  { nome: 'titular autoriza terceiro', tipo: T_TITULAR_TERCEIRO, legado: legadoConect3 },
]

describe('Dano ocasionado conector — paridade com HTML legado', () => {
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

