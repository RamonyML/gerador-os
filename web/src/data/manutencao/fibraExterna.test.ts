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
  'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.'

const INFORMEI_TERC =
  'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.'

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
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${TECNICO}`
}

function tailExt1(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n${sp(20)}\n${TECNICO}`
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
    `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP19,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    '',
    SEP19,
    '',
    `QUESTIONADO, DISSE DISSE QUE "${v.motivo}".`,
    `PERGUNTEI SOBRE ${v.onu} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${v.onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    '',
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
    '',
    SEP19,
    '',
    `INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${cp} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.`,
    sp(4),
    SEP19,
    sp(4),
    `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita}HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE "${v.motivo}", E FICOU SEM CONEXAO COM A INTERNET. PERGUNTEI SOBRE ${v.onu} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA PISCANDO. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${cp} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita}HRS.`
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
    `${sp_} (${v.cargo}) ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO A INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${v.onu} ESTA DESCONECTADO/APAGADA.`,
    '',
    SEP19,
    '',
    INFORMEI_TERC,
    '',
    SEP19,
    '',
    `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${v.formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${v.dataVisita} AS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.cargo}) ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO A INTERNET. PERGUNTEI SOBRE A ${op}, E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ${op} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${sp_} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} AUTORIZOU VISITA E PAGARA EM ${v.formaPag} NO ATO. VISITA AGENDADA PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`
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
    `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, ${sp_} DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO A INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${v.onu} ESTA DESCONECTADO/APAGADA.`,
    sp(4),
    `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    '',
    SEP42,
    '',
    INFORMEI_TERC,
    sp(4),
    SEP42,
    '',
    `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${v.formaPag}. VISITA AGENDADA PARA O DIA ${v.dataVisita} AS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${sp_} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${v.solicitante} (${v.parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`
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
    `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP19,
    sp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(4),
    SEP19,
    sp(4),
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO A INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${v.onu} ESTA DESCONECTADO/APAGADA.`,
    sp(4),
    SEP19,
    '',
    INFORMEI_TERC,
    sp(4),
    SEP19,
    '',
    `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${v.formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA ${v.dataVisita} AS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${sp_} (${v.parente} DE ${cp}) ENTROU EM CONTATO POR ${v.canal} (${v.contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${sp_} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${v.canal} (${v.contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`
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
    `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    sp(20),
    SEP19,
    sp(24),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(24),
    SEP19,
    sp(24),
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${v.motivo}", E FICOU SEM ACESSO A INTERNET.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${v.onu} ESTA DESCONECTADO/APAGADA. `,
    sp(24),
    SEP19,
    sp(20),
    INFORMEI_TERC,
    sp(20),
    SEP19,
    sp(20),
    `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${v.canal} (${v.contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${v.motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${cp} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${v.formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${v.solicitante} (${v.parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} AS ${v.horaVisita} HRS.`
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
  solicitante: 'JOAO PEDRO OLIVEIRA',
  parente: 'FILHO',
  cargo: 'GERENTE',
  canal: 'WHATSAPP',
  contato: '34991112233',
  contatoSol: '34988887766',
  alarme: 'LUZ VERMELHA ACESA',
  onu: 'ONU',
  bairro: 'SARAIVA',
  motivo: 'UM VEICULO ALTO PASSOU NA RUA ROMPENDO O CABO DROP',
  dataVisita: '18/06/2026',
  horaVisita: '14:30',
  protocolo: '456.789',
  formaPag: 'PIX',
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
  { nome: 'pessoa juridica', tipo: T_PJ, legado: legadoPj },
  { nome: 'terceiro 1 (titular ausente)', tipo: T_TERCEIRO_TERCEIRO, legado: legadoExt1 },
  { nome: 'terceiro 2 (titular presente)', tipo: T_TERCEIRO_TITULAR, legado: legadoExt2 },
  { nome: 'titular autoriza terceiro', tipo: T_TITULAR_TERCEIRO, legado: legadoExt3 },
]

describe('Fibra optica externa — paridade com HTML legado', () => {
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
