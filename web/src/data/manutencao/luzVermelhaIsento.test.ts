import { describe, it, expect } from 'vitest'
import {
  LUZ_VERMELHA_ISENTO_OUTPUT,
  buildLuzVermelhaIsentoTextos,
} from './luzVermelhaIsento'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'

/**
 * Paridade com legado-exemplo/suporte/luz-vermelha-7dias/ (versao ISENTA):
 * - index-luzverm-padrao.html (titular)
 * - luz-padrao1.html (terceiro 1 — titular ausente)
 * - luz-padrao2.html (terceiro 2 — titular presente)
 *
 * luz-padrao3 (titular autoriza terceiro) e COMPOSTO por analogia (o legado
 * nao foi atualizado para isento), entao e validado contra a redacao composta.
 */

const SEP28 = '='.repeat(28)
const SEP19 = '*'.repeat(19)
const SEP_OS = '='.repeat(39)
const sp = (n: number) => ' '.repeat(n)

const INFORMEI =
  'INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS.'

const tecnico = (quem: string) =>
  `TECNICO: VERIFICAR CONECTOR, DROP INTERNO E EXTERNO. ACHANDO O PROBLEMA, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. APOS TERMINO DO SERVICO, PERGUNTA A ${quem} (OU QUEM ESTIVER ACOMPANHADO SERVICO) SE HA NECESSIDADE DE QUALQUER OUTRA ORIENTACAO SOBRE A INTERNET.`

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
  dataVisita: string
  horaVisita: string
  protocolo: string
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
  let t = `DENTRO DOS 7 DIAS // MAN ${prefix} ${v.cliente} PROT:${v.protocolo} ISENTO (${v.operador}) - ${v.bairro}`
  if (c === 'CTOI') t += ' *CTOI*'
  return t
}

function legadoPadrao(v: Vars, c: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP28,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(8),
    SEP28,
    sp(8),
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${v.alarme}.`,
    sp(8),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${v.onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    sp(8),
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
    sp(8),
    SEP28,
    '',
    INFORMEI,
    sp(8),
    SEP28,
    sp(8),
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA. DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${v.dataVisita} AS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTA COM ${v.alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${v.onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. ${INFORMEI} VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`
  const os = osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n\n> INDICACAO TECNICA:\n\n${tecnico(cp)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function legadoP1(v: Vars, c: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const sp_ = v.solicitante.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${v.alarme}.`,
    sp(4),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${v.onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    sp(4),
    `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    '',
    SEP19,
    '',
    INFORMEI,
    '',
    SEP19,
    '',
    '',
    `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTA COM ${v.alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${v.onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. ${INFORMEI} POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`
  const os =
    osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n${sp(18)}\nINDICACAO TECNICA:\n${sp(20)}\n${tecnico(sp_)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function legadoP2(v: Vars, c: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const sp_ = v.solicitante.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${v.alarme}.`,
    sp(4),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${v.onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    sp(4),
    `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    sp(4),
    SEP19,
    '',
    INFORMEI,
    '',
    SEP19,
    '',
    `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTA COM ${v.alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${v.onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. ${INFORMEI} POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`
  const os = osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${tecnico(sp_)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function compostoP3(v: Vars, c: 'CTOE' | 'CTOI') {
  const cp = v.cliente.split(' ')[0]
  const op = v.onu.split(' ')[0]
  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    sp(20),
    SEP19,
    sp(24),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(24),
    SEP19,
    sp(24),
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${v.alarme}.`,
    sp(24),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${v.onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    sp(24),
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    sp(24),
    SEP19,
    sp(20),
    INFORMEI,
    sp(20),
    SEP19,
    sp(20),
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTA COM ${v.alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${v.onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. ${INFORMEI} ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`
  const os = osBase + ctoBlock(c, v.cto, v.passante) + `${SEP_OS}\n\nINDICACAO TECNICA:\n${sp(20)}\n${tecnico(cp)}`
  return { protocolo, os, agenda: agenda(v, c) }
}

function gerarNovo(tipo: string, v: Vars, c: 'CTOE' | 'CTOI') {
  const raw = { ...v, ctoType: c, tipoSolicitacao: tipo }
  const ctx = { ...raw, ...buildLuzVermelhaIsentoTextos(raw, v.operador) }
  const full = renderTemplate(LUZ_VERMELHA_ISENTO_OUTPUT, ctx)
  const secs = splitOsPreviewSections(full)
  return {
    protocolo: secs[0]?.body ?? '',
    os: secs[1]?.body ?? '',
    agenda: secs[2]?.body ?? '',
  }
}

const BASE: Vars = {
  cliente: 'MARIA OLIVEIRA SANTOS',
  solicitante: 'JOAO PEDRO OLIVEIRA',
  parente: 'FILHO',
  canal: 'WHATSAPP',
  contato: '34991112233',
  contatoSol: '34988887766',
  alarme: 'LUZ VERMELHA ACESA',
  onu: 'ONU',
  bairro: 'SARAIVA',
  dataVisita: '18/06/2026',
  horaVisita: '14:30',
  protocolo: '456.789',
  cto: '1035-A',
  passante: 'PASSANTE NO POSTE PROXIMO AO SOBRADO',
  operador: 'GABRIEL',
}

const CASOS: Array<{
  nome: string
  tipo: string
  legado: (v: Vars, c: 'CTOE' | 'CTOI') => { protocolo: string; os: string; agenda: string }
}> = [
  { nome: 'titular (padrao)', tipo: T_TITULAR, legado: legadoPadrao },
  { nome: 'terceiro 1 (titular ausente)', tipo: T_TERCEIRO_TERCEIRO, legado: legadoP1 },
  { nome: 'terceiro 2 (titular presente)', tipo: T_TERCEIRO_TITULAR, legado: legadoP2 },
  { nome: 'titular autoriza terceiro (composto)', tipo: T_TITULAR_TERCEIRO, legado: compostoP3 },
]

describe('Luz vermelha isento (7 dias) — paridade com HTML legado', () => {
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
