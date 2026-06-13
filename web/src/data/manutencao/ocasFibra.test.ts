import { describe, it, expect } from 'vitest'
import { OCAS_FIBRA_OUTPUT, buildOcasFibraTextos } from './ocasFibra'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'

/**
 * Paridade com legado-exemplo/suporte/luz-vermelha/ocasionado-fibra/*.html
 * (ocas-fibra-padrao, ocas-fibra1/2/3).
 */

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)
const SEP_OS = '='.repeat(39)
const sp = (n: number) => ' '.repeat(n)

const tecnico = (quem: string) =>
  `TÉCNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TÉCNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXÃO. CASO NÃO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZAÇÃO COM ${quem}. TEMPO ESTIMADO 60 MIN.`

const CUSTO =
  'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TÉCNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.'

const VALOR =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSÁRIO FAZER EMENDA TÉCNICA, O VALOR É DE R$ 50,00 REFERENTE A MÃO DE OBRA TÉCNICA.'

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
  valor: string
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

function legadoPadrao(v: Vars, c: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP42,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(4),
    SEP42,
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO.`,
    '',
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${v.motivo}".`,
    '',
    v.valor,
    '',
    SEP42,
    '',
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTO EM ${v.formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. PERGUNTEI SOBRE A ${op}, E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU APAGADA. ${v.valor} ${cp} AUTORIZOU VISITA E PAGARÁ EM ${v.formaPag} NO ATO. VISITA AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  const os = osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${tecnico(cp)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function legadoFibra1(v: Vars, c: 'CTOE' | 'CTOI') {
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
    '',
    SEP42,
    '',
    v.valor,
    sp(4),
    SEP42,
    '',
    `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTOEM ${v.formaPag}. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENÇÃO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATÉ MESMO OS EQUIPAMENTOS. ${v.valor} ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  const os =
    osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n${sp(18)}\nINDICAÇÃO TÉCNICA:\n\n${tecnico(sp_)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function legadoFibra2(v: Vars, c: 'CTOE' | 'CTOI') {
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
    CUSTO,
    '',
    SEP19,
    '',
    `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTO EM ${v.formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. ${v.valor} ${sp_} CONCORDOU COM A VISITA E FARÁ O PAGAMENTO EM ${v.formaPag}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  const os = osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${tecnico(cp)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function legadoFibra3(v: Vars, c: 'CTOE' | 'CTOI') {
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
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA.`,
    sp(24),
    SEP19,
    sp(20),
    v.valor,
    '',
    SEP19,
    sp(20),
    `${cp} CONCORDOU COM A VISITA E FARÁ O PAGAMENTO COM ${v.formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO À INTERNET. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO DO SISTEMA E ${op} APAGADA. ${v.valor} ${cp} CONCORDOU COM A VISITA E FARÁ O PAGAMENTO COM ${v.formaPag}. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  const os = osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${tecnico(cp)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function gerarNovo(tipo: string, v: Vars, c: 'CTOE' | 'CTOI') {
  const raw = { ...v, ctoType: c, tipoSolicitacao: tipo }
  const ctx = { ...raw, ...buildOcasFibraTextos(raw, v.operador) }
  const full = renderTemplate(OCAS_FIBRA_OUTPUT, ctx)
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
  motivo: 'AO PODAR UMA ÁRVORE, CLIENTE CORTOU A FIBRA ÓTICA EXTERNA',
  valor: VALOR,
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
  { nome: 'terceiro 1 (titular ausente)', tipo: T_TERCEIRO_TERCEIRO, legado: legadoFibra1 },
  { nome: 'terceiro 2 (titular presente)', tipo: T_TERCEIRO_TITULAR, legado: legadoFibra2 },
  { nome: 'titular autoriza terceiro', tipo: T_TITULAR_TERCEIRO, legado: legadoFibra3 },
]

describe('Dano ocasionado fibra — paridade com HTML legado', () => {
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
