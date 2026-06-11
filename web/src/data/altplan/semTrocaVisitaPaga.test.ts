import { describe, expect, it } from 'vitest'
import {
  ALTPLAN_SEM_TROCA_VISITA_PAGA_OUTPUT,
  STVP_TITULAR,
  STVP_TITULAR_TERCEIRO,
  STVP_TERCEIRO_TITULAR,
  STVP_TERCEIRO_TERCEIRO,
  buildAltplanSemTrocaVisitaPagaTextos,
} from './semTrocaVisitaPaga'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

type Entrada = Record<string, string>

const AST = '*'.repeat(14)
const OS_SEP = '*'.repeat(35)

const INDICACAO_TECNICA = `TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO.  FAZER TESTE DA BANDA CONTRATADA.  PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.`

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

function osComIndicacao(inicio: string): string {
  return `${inicio}

${OS_SEP}

INDICAÇÃO TÉCNICA:

${INDICACAO_TECNICA}`
}

function esperado(
  v: Entrada,
): { protocolo: string; os: string; agenda: string } {
  const tipo = v.tipoSolicitacao || STVP_TITULAR
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
  const motivo = upper(v.motivo)
  const formaPag = v.formaPag

  const introTitular = `${clientePrimeiro} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`
  const introTerceiro = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`

  const base = (intro: string): string => `${intro}

${AST}
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}
    
${AST}
QUESTIONADO, CLIENTE DISSE QUE "${motivo}".

PLANO ATUAL: ${v.planoAtual} CONTRATADO EM ${v.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${v.roteador}

PLANO SOLICITADO: ${v.planoEscolhido}

ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. 


${AST}
`

  const informei = (nome: string): string =>
    `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${v.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${nome} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${nome} POSSA TER, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE O DESLOCAMENTO TÉCNICO, ESTE VALOR A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`

  const agenda = `ALT PLANO ${cliente} PROT:${v.protocolo} ${formaPag} (${v.operadorPrimeiroNome}) - ${bairro}`

  if (tipo === STVP_TITULAR_TERCEIRO) {
    const protocolo = `${base(introTitular)}
${informei(clientePrimeiro)}

${AST}

${clientePrimeiro} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const os = osComIndicacao(
      `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${clientePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. ${clientePrimeiro} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}. AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    )
    return { protocolo, os, agenda }
  }

  if (tipo === STVP_TERCEIRO_TITULAR) {
    const protocolo = `${base(introTerceiro)}
${informei(solicitantePrimeiro)}

${AST}

POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const os = osComIndicacao(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}. AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    )
    return { protocolo, os, agenda }
  }

  if (tipo === STVP_TERCEIRO_TERCEIRO) {
    const protocolo = `${base(introTerceiro)}
${informei(solicitantePrimeiro)}

${AST}

POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const os = osComIndicacao(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}. AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    )
    return { protocolo, os, agenda }
  }

  const protocolo = `${base(introTitular)}
${informei(clientePrimeiro)}

${AST}

${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${formaPag}, E FOI AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`
  const os = osComIndicacao(
    `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO:${v.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${clientePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO EM ${formaPag}. AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
  )
  return { protocolo, os, agenda }
}

function gerarNovo(v: Entrada) {
  const context = {
    ...v,
    ...buildAltplanSemTrocaVisitaPagaTextos(v, v.operadorPrimeiroNome),
  }
  const sections = splitOsPreviewSections(
    renderTemplate(ALTPLAN_SEM_TROCA_VISITA_PAGA_OUTPUT, context),
  )
  return {
    protocolo: sections[0]?.body ?? '',
    os: sections[1]?.body ?? '',
    agenda: sections[2]?.body ?? '',
  }
}

const BASE: Entrada = {
  cliente: 'João da Silva',
  canal: 'WHATSAPP',
  contato: '(34) 99999-8888',
  semSinal: 'nao',
  sinalONU: '19.20',
  bairro: 'Saraiva',
  solicitante: 'Maria Souza Pereira',
  contatoSol: '(34) 98888-7777',
  autorizado: 'Carlos Souza',
  parente: 'esposa',
  motivo: 'precisa de mais velocidade',
  planoAtual: '300 MEGA/69,90',
  planoEscolhido:
    '600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
  roteador: 'ZTE H199-A',
  dataContrato: '03/2024',
  dataVisita: '15/06/2026',
  horaVisita: '10:30',
  protocolo: '123.456',
  formaPag: 'PIX',
  operadorPrimeiroNome: 'GABRIEL',
}

const VARIACOES: Array<{ nome: string; tipo: string }> = [
  { nome: 'Titular solicita e acompanha', tipo: STVP_TITULAR },
  { nome: 'Titular solicita e autoriza terceiro', tipo: STVP_TITULAR_TERCEIRO },
  { nome: 'Terceiro solicita e titular acompanha', tipo: STVP_TERCEIRO_TITULAR },
  {
    nome: 'Terceiro solicita e terceiro acompanha',
    tipo: STVP_TERCEIRO_TERCEIRO,
  },
]

describe('Alteração de plano — sem troca visita paga', () => {
  for (const { nome, tipo } of VARIACOES) {
    const cenario: Entrada = { ...BASE, tipoSolicitacao: tipo }

    describe(nome, () => {
      it('Texto Protocolo conforme esperado', () => {
        expect(gerarNovo(cenario).protocolo).toBe(esperado(cenario).protocolo)
      })

      it('Texto O.S conforme esperado', () => {
        expect(gerarNovo(cenario).os).toBe(esperado(cenario).os)
      })

      it('Texto Agenda conforme esperado', () => {
        expect(gerarNovo(cenario).agenda).toBe(esperado(cenario).agenda)
      })
    })
  }
})

describe('Alteração de plano — sem troca visita paga (ofertado)', () => {
  for (const tipo of [STVP_TITULAR, STVP_TERCEIRO_TERCEIRO]) {
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
