import { describe, it, expect } from 'vitest'
import { ALTPLAN_REMOTO_OUTPUT, buildAltplanRemotoTextos } from './remoto'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

/**
 * Paridade caractere-a-caractere com os HTML legados de altplan-remoto
 * (titular / terceiro / PJ). O sinal usa a convenção padronizada
 * (formatSinalFibraSaida → -00.00DBM), como nos fluxos de mud-end.
 */

const AST = '*'.repeat(14)

type Entrada = Record<string, string>

function sig(v: Entrada): string {
  const s = formatSinalFibraSaida(v.sinalONU ?? '')
  return v.semSinal === 'sim' || !s ? 'SEM SINAL' : s
}

function up(s: string): string {
  return (s ?? '').trim().toUpperCase()
}

function first(s: string): string {
  return up(s).split(/\s+/).filter(Boolean)[0] ?? ''
}

function legado(v: Entrada): { protocolo: string; os: string } {
  const cli1 = first(v.cliente ?? '')
  const sol1 = first(v.solicitante ?? '')
  const parente = up(v.parente ?? '')
  const cargo = up(v.cargo ?? '')
  const canal = v.canal ?? ''
  const contato = (v.contato ?? '').replace(/\D/g, '')
  const contatoSol = (v.contatoSol ?? '').replace(/\D/g, '')
  const motivo = up(v.motivo ?? '')
  const planoAtual = v.planoAtual ?? ''
  const planoEscolhido = v.planoEscolhido ?? ''
  const roteador = v.roteador ?? ''
  const dataContrato = v.dataContrato ?? ''
  const protocolo = v.protocolo ?? ''
  const s = sig(v)
  const [dataLigacao, horaLigacao] = (v.dataLigacao ?? '').trim().split(/\s+/)
  const [dataProtocolo, horaProtocolo] = (v.dataProtocolo ?? '').trim().split(/\s+/)

  if (v.tipoSolicitacao === 'terceiro') {
    const protocoloTexto = `${sol1} (${parente} DE ${cli1}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.

${AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${s}.

${AST}
QUESTIONADO, CLIENTE DISSE QUE "${motivo}".

PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}

PLANO SOLICITADO: ${planoEscolhido}

ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. 


${AST}
INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.
DISPONIBILIZEI AO CLIENTE 2 OPÇÕES PARA PROSSEGUIR COM O UPGRADE:

1° - AGENDAR UMA VISITA PRESENCIAL PARA REALIZAR TESTES, INSTRUÇÕES DO USO DE INTERNET, INFORMAÇÕES SOBRE COBERTURA WI-FI, REDE ELÉTRICA ETC; VISITA ESTA COM O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

2° - REALIZAR A ALTERAÇÃO DE PLANO REMOTAMENTE (DENTRO DO PRAZO DE ATÉ 72 HORAS) E APÓS CONCLUÍDO A ALTERAÇÃO O CLIENTE REALIZAR A ASSINATURA DO CONTRATO DIGITAL POR MEIO DO APP "MZNET" OU ATÉ MESMO COMPARECER DIRETAMENTE NA EMPRESA E REALIZAR ESTA ASSINATURA PRESENCIAL.
PROCEDIMENTO ESTE QUE NÃO GERA CUSTOS AO ASSINANTE.
CIENTE QUE OS BENEFÍCIOS SÃO LIBERADOS APÓS ASSINATURA DO CONTRATO.

${AST}
POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${cli1} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${dataLigacao} ÀS ${horaLigacao}HRS.

${cli1} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.

CLIENTE NÃO TEM DÚVIDAS`
    const os = `${sol1} (${parente} DE ${cli1}) SOLICITOU POR ${canal} (${contatoSol}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${sol1} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${cli1} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${dataLigacao} ÀS ${horaLigacao} HRS.`
    return { protocolo: protocoloTexto, os }
  }

  if (v.tipoSolicitacao === 'pj') {
    const protocoloTexto = `${sol1} (${cargo}) ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.

${AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${s}

${AST}
QUESTIONADO, CLIENTE DISSE QUE "${motivo}".

PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}

PLANO SOLICITADO: ${planoEscolhido}

${AST}
INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.
DISPONIBILIZEI AO CLIENTE 2 OPÇÕES PARA PROSSEGUIR COM O UPGRADE:

1° - AGENDAR UMA VISITA PRESENCIAL PARA REALIZAR TESTES, INSTRUÇÕES DO USO DE INTERNET, INFORMAÇÕES SOBRE COBERTURA WI-FI, REDE ELÉTRICA ETC; VISITA ESTA COM O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

2° - REALIZAR A ALTERAÇÃO DE PLANO REMOTAMENTE (DENTRO DO PRAZO DE ATÉ 72 HORAS) E APÓS CONCLUÍDO A ALTERAÇÃO O CLIENTE REALIZAR A ASSINATURA DO CONTRATO DIGITAL POR MEIO DO APP "MZNET" OU ATÉ MESMO COMPARECER DIRETAMENTE NA EMPRESA E REALIZAR ESTA ASSINATURA PRESENCIAL.
PROCEDIMENTO ESTE QUE NÃO GERA CUSTOS AO ASSINANTE.

${AST}

${sol1} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR ${canal} (${contato}) DIA ${dataLigacao} ÀS ${horaLigacao} HRS.`
    const os = `${sol1} (${cargo}) SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${sol1} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº${protocolo} EM ${dataProtocolo} ÀS ${horaProtocolo} HRS.`
    return { protocolo: protocoloTexto, os }
  }

  // titular
  const protocoloTexto = `${cli1} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.

${AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${s}

${AST}
QUESTIONADO, CLIENTE DISSE QUE "${motivo}".

PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}

PLANO SOLICITADO: ${planoEscolhido}

ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. 


${AST}
INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.
DISPONIBILIZEI AO CLIENTE 2 OPÇÕES PARA PROSSEGUIR COM O UPGRADE:

1° - AGENDAR UMA VISITA PRESENCIAL PARA REALIZAR TESTES, INSTRUÇÕES DO USO DE INTERNET, INFORMAÇÕES SOBRE COBERTURA WI-FI, REDE ELÉTRICA ETC; VISITA ESTA COM O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

2° - REALIZAR A ALTERAÇÃO DE PLANO REMOTAMENTE (DENTRO DO PRAZO DE ATÉ 72 HORAS) E APÓS CONCLUÍDO A ALTERAÇÃO O CLIENTE REALIZAR A ASSINATURA DO CONTRATO DIGITAL POR MEIO DO APP "MZNET" OU ATÉ MESMO COMPARECER DIRETAMENTE NA EMPRESA E REALIZAR ESTA ASSINATURA PRESENCIAL.
PROCEDIMENTO ESTE QUE NÃO GERA CUSTOS AO ASSINANTE.
CIENTE QUE OS BENEFÍCIOS SÃO LIBERADOS APÓS ASSINATURA DO CONTRATO.

${AST}

${cli1} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR ${canal} (${contato}) DIA ${dataLigacao} ÀS ${horaLigacao} HRS.`
  const os = `${cli1} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${cli1} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº${protocolo} EM ${dataProtocolo} ÀS ${horaProtocolo} HRS.`
  return { protocolo: protocoloTexto, os }
}

function gerarNovo(v: Entrada): { protocolo: string; os: string } {
  const context = { ...v, ...buildAltplanRemotoTextos(v) }
  const secs = splitOsPreviewSections(renderTemplate(ALTPLAN_REMOTO_OUTPUT, context))
  return { protocolo: secs[0]?.body ?? '', os: secs[1]?.body ?? '' }
}

const TITULAR: Entrada = {
  tipoSolicitacao: 'titular',
  cliente: 'João da Silva',
  canal: 'WHATSAPP',
  contato: '(34) 99999-8888',
  semSinal: 'nao',
  sinalONU: '19.20',
  motivo: 'deseja cortar gastos',
  planoAtual: '100 MEGA/59,90',
  planoEscolhido: '300 MEGA/69,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
  roteador: 'ZTE H199-A',
  dataContrato: '03/2024',
  protocolo: '123.456',
  dataLigacao: '10/06/2026 14:30',
  dataProtocolo: '10/06/2026 15:00',
}

const TERCEIRO: Entrada = {
  tipoSolicitacao: 'terceiro',
  solicitante: 'Maria Souza',
  parente: 'esposa',
  cliente: 'Carlos Souza',
  canal: 'LIGAÇÃO',
  contato: '34911112222',
  contatoSol: '34933334444',
  semSinal: 'nao',
  sinalONU: '8.50',
  motivo: 'precisa de mais velocidade',
  planoAtual: '150 MEGA/59,90',
  planoEscolhido: '600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
  roteador: 'HUAWEI AX2',
  dataContrato: '01/2025',
  protocolo: '987.654',
  dataLigacao: '11/06/2026 09:15',
}

const PJ: Entrada = {
  tipoSolicitacao: 'pj',
  solicitante: 'Pedro Lima',
  cargo: 'gerente',
  canal: 'WHATSAPP',
  contato: '34955556666',
  semSinal: 'sim',
  sinalONU: '',
  motivo: 'precisa de upgrade',
  planoAtual: '300 MEGA/69,90',
  planoEscolhido:
    '1 GIGA (1.000 MEGA) R$99,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
  roteador: 'INTELBRAS',
  dataContrato: '06/2023',
  protocolo: '555.111',
  dataLigacao: '11/06/2026 16:45',
  dataProtocolo: '11/06/2026 17:00',
}

describe('Alteração de plano — remoto (paridade com HTML legado)', () => {
  for (const [nome, v] of [
    ['titular', TITULAR],
    ['terceiro', TERCEIRO],
    ['PJ (sem sinal)', PJ],
  ] as const) {
    it(`Texto Protocolo idêntico — ${nome}`, () => {
      expect(gerarNovo(v).protocolo).toBe(legado(v).protocolo)
    })
    it(`Texto O.S idêntico — ${nome}`, () => {
      expect(gerarNovo(v).os).toBe(legado(v).os)
    })
  }
})
