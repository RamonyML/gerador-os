import { describe, expect, it } from 'vitest'
import {
  ALTPLAN_SEM_TROCA_VISITA_ISENTA_OUTPUT,
  STVI_TERCEIRO_TERCEIRO,
  STVI_TERCEIRO_TITULAR,
  STVI_TITULAR,
  STVI_TITULAR_TERCEIRO,
  buildAltplanSemTrocaVisitaIsentaTextos,
} from './semTrocaVisitaIsenta'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

type Entrada = Record<string, string>

const AST = '*'.repeat(14)
const OS_SEP = '*'.repeat(35)

function upper(value: string): string {
  return String(value ?? '').trim().toUpperCase()
}

function first(value: string): string {
  return upper(value).split(/\s+/).filter(Boolean)[0] ?? ''
}

function digits(value: string): string {
  return String(value ?? '').replace(/\D/g, '')
}

function sinalSaida(v: Entrada): string {
  const sig = formatSinalFibraSaida(v.sinalONU ?? '')
  return v.semSinal === 'sim' || !sig ? 'SEM SINAL' : sig
}

function planoBloco(v: Entrada): string {
  return `QUESTIONADO, CLIENTE DISSE QUE "${upper(v.motivo)}".

PLANO ATUAL: ${v.planoAtual} CONTRATADO EM ${v.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${v.roteador}

PLANO SOLICITADO: ${v.planoEscolhido}

ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. 


${AST}
`
}

function indicacao(doubleSpace = false): string {
  const space = doubleSpace ? '  ' : ' '
  return `TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. FAZER TESTE DA BANDA CONTRATADA.${space}PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.`
}

function os(inicio: string, doubleSpace = false): string {
  return `${inicio}

${OS_SEP}

INDICAÇÃO TÉCNICA:

${indicacao(doubleSpace)}`
}

function legado(v: Entrada): { protocolo: string; os: string; agenda: string } {
  const cliente = upper(v.cliente)
  const clientePrimeiro = first(v.cliente)
  const solicitante = upper(v.solicitante)
  const solicitantePrimeiro = first(v.solicitante)
  const autorizado = upper(v.autorizado)
  const parente = upper(v.parente)
  const canal = v.canal
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const sig = sinalSaida(v)
  const bairro = upper(v.bairro)
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const agenda = `ALT PLANO ${cliente} PROT:${v.protocolo} ISENTO (${v.operadorPrimeiroNome}) - ${bairro}`

  if (v.tipoSolicitacao === STVI_TITULAR_TERCEIRO) {
    const protocolo = `${clientePrimeiro} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.

${AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}

${AST}
${planoBloco(v)}
INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${v.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${clientePrimeiro} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${clientePrimeiro} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.

${AST}

${clientePrimeiro} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const textoOS = os(
      `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${clientePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. ${clientePrimeiro} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return { protocolo, os: textoOS, agenda }
  }

  if (v.tipoSolicitacao === STVI_TERCEIRO_TITULAR) {
    const protocolo = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.

${AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}

${AST}
${planoBloco(v)}
INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${v.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${solicitantePrimeiro} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${solicitantePrimeiro} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.

${AST}

POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S.VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const textoOS = os(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return { protocolo, os: textoOS, agenda }
  }

  if (v.tipoSolicitacao === STVI_TERCEIRO_TERCEIRO) {
    const protocolo = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.

${AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}

${AST}
${planoBloco(v)}
INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${v.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${solicitantePrimeiro} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${solicitantePrimeiro} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.

${AST}

POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const textoOS = os(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    )
    return { protocolo, os: textoOS, agenda }
  }

  const protocolo = `${clientePrimeiro} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.

${AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}

${AST}
${planoBloco(v)}
INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${v.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${clientePrimeiro} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${clientePrimeiro} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.

${AST}

${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`
  const textoOS = os(
    `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${clientePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    true,
  )
  return { protocolo, os: textoOS, agenda }
}

function gerarNovo(v: Entrada) {
  const context = {
    ...v,
    ...buildAltplanSemTrocaVisitaIsentaTextos(v, v.operadorPrimeiroNome),
  }
  const sections = splitOsPreviewSections(
    renderTemplate(ALTPLAN_SEM_TROCA_VISITA_ISENTA_OUTPUT, context),
  )
  return {
    protocolo: sections[0]?.body ?? '',
    os: sections[1]?.body ?? '',
    agenda: sections[2]?.body ?? '',
  }
}

const BASE: Entrada = {
  tipoSolicitacao: STVI_TITULAR,
  cliente: 'João da Silva',
  solicitante: 'Maria Souza',
  autorizado: 'Pedro Alves',
  parente: 'irmão',
  canal: 'WHATSAPP',
  contato: '(34) 99999-8888',
  contatoSol: '(34) 98888-7777',
  semSinal: 'nao',
  sinalONU: '19.20',
  bairro: 'Saraiva',
  motivo: 'precisa de mais velocidade',
  planoAtual: '300 MEGA/69,90',
  planoEscolhido:
    '600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
  roteador: 'ZTE H199-A',
  dataContrato: '03/2024',
  dataVisita: '15/06/2026',
  horaVisita: '10:30',
  protocolo: '123.456',
  operadorPrimeiroNome: 'GABRIEL',
}

describe('Alteração de plano — sem troca visita isenta', () => {
  for (const tipo of [
    STVI_TITULAR,
    STVI_TITULAR_TERCEIRO,
    STVI_TERCEIRO_TITULAR,
    STVI_TERCEIRO_TERCEIRO,
  ]) {
    const v = { ...BASE, tipoSolicitacao: tipo }

    it(`Texto Protocolo idêntico — ${tipo}`, () => {
      expect(gerarNovo(v).protocolo).toBe(legado(v).protocolo)
    })

    it(`Texto O.S idêntico — ${tipo}`, () => {
      expect(gerarNovo(v).os).toBe(legado(v).os)
    })

    it(`Texto Agenda idêntico — ${tipo}`, () => {
      expect(gerarNovo(v).agenda).toBe(legado(v).agenda)
    })
  }
})

describe('Alteração de plano — sem troca visita isenta (ofertado)', () => {
  for (const tipo of [STVI_TITULAR, STVI_TERCEIRO_TERCEIRO]) {
    const base = { ...BASE, tipoSolicitacao: tipo }
    const padrao = gerarNovo(base)
    const ofertado = gerarNovo({ ...base, origem: 'ofertado' })

    it(`Protocolo vira OFERTEI e remove QUESTIONADO — ${tipo}`, () => {
      expect(ofertado.protocolo.startsWith('OFERTEI A ')).toBe(true)
      expect(ofertado.protocolo).toContain('ALTERAÇÃO DE PLANO.')
      expect(ofertado.protocolo).not.toContain('QUESTIONADO')
      expect(ofertado.protocolo).not.toContain('ENTROU EM CONTATO')
      expect(ofertado.protocolo).toContain('PLANO OFERTADO:')
      expect(ofertado.protocolo).not.toContain('PLANO SOLICITADO:')
    })

    it(`O.S vira OFERTEI e usa PLANO OFERTADO — ${tipo}`, () => {
      expect(ofertado.os.startsWith('OFERTEI A ')).toBe(true)
      expect(ofertado.os).toContain('ALTERAÇÃO DE PLANO DE INTERNET:')
      expect(ofertado.os).toContain('PLANO OFERTADO:')
      expect(ofertado.os).not.toContain('PLANO ESCOLHIDO:')
    })

    it(`Agenda inalterada — ${tipo}`, () => {
      expect(ofertado.agenda).toBe(padrao.agenda)
    })
  }
})
