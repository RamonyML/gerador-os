import { describe, expect, it } from 'vitest'
import {
  ALTPLAN_TROCA_VISITA_ISENTA_OUTPUT,
  TVI_TITULAR,
  TVI_TITULAR_TERCEIRO,
  TVI_TERCEIRO_TITULAR,
  TVI_TERCEIRO_TERCEIRO,
  buildAltplanTrocaVisitaIsentaTextos,
} from './trocaVisitaIsenta'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

type Entrada = Record<string, string>

const AST = '*'.repeat(14)
const OS_SEP = '*'.repeat(35)

const OS_TROCA_COMUM =
  'RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. É NECESSÁRIA VISITA TÉCNICA PARA TROCA DO ROTEADOR WI-FI POR OUTRO COMPATÍVEL COM O NOVO PLANO ESCOLHIDO, TAL EQUIPAMENTO IRÁ SUBSTITUIR O ROTEADOR INSTALADO ANTERIORMENTE E PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO.'

const INDICACAO_TECNICA = `TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO, FAZER TESTES ANTES E DEPOIS DA TROCA DO ROTEADOR. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), SOLICITAR ESCOLHA DA SENHA, CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.`

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

function esperado(v: Entrada): {
  protocolo: string
  os: string
  agenda: string
} {
  const tipo = v.tipoSolicitacao || TVI_TITULAR
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
  const compat = upper(v.compat)
  const roteadorSug = upper(v.roteadorSug)

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

INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${v.roteador}) ${compat} VISITA ISENTA DE CUSTOS.

${AST}
`

  const osIntroTitular = `${clientePrimeiro} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. ${OS_TROCA_COMUM}`
  const osIntroTerceiro = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. ${OS_TROCA_COMUM}`

  const agenda = `ALT PLANO ${cliente} PROT:${v.protocolo} ISENTO (${v.operadorPrimeiroNome}) - ${bairro} // ${roteadorSug}`

  if (tipo === TVI_TITULAR_TERCEIRO) {
    const protocolo = `${base(introTitular)}
${clientePrimeiro} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const os = osComIndicacao(
      `${osIntroTitular} ${clientePrimeiro} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    )
    return { protocolo, os, agenda }
  }

  if (tipo === TVI_TERCEIRO_TITULAR) {
    const protocolo = `${base(introTerceiro)}
POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S.VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const os = osComIndicacao(
      `${osIntroTerceiro} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    )
    return { protocolo, os, agenda }
  }

  if (tipo === TVI_TERCEIRO_TERCEIRO) {
    const protocolo = `${base(introTerceiro)}
POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS.

CLIENTE SEM DUVIDAS.`
    const os = osComIndicacao(
      `${osIntroTerceiro} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
    )
    return { protocolo, os, agenda }
  }

  const protocolo = `${base(introTitular)}
${clientePrimeiro} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS, E VISITA TÉCNICA ISENTA DE CUSTOS FOI AGENDADA PARA O DIA ${v.dataVisita} ÀS ${v.horaVisita} HRS, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO.`
  const os = osComIndicacao(
    `${osIntroTitular} VISITA TÉCNICA ISENTA DE CUSTOS. VISITA AGENDADA PARA ${v.dataVisita} ÀS ${v.horaVisita} HRS.`,
  )
  return { protocolo, os, agenda }
}

function gerarNovo(v: Entrada) {
  const context = {
    ...v,
    ...buildAltplanTrocaVisitaIsentaTextos(v, v.operadorPrimeiroNome),
  }
  const sections = splitOsPreviewSections(
    renderTemplate(ALTPLAN_TROCA_VISITA_ISENTA_OUTPUT, context),
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
  compat:
    'É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, PORÉM FAREMOS O AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO DE UM NOVO ROTEADOR COM VERSÃO ATUALIZADA. APÓS INSTALADO, FAREMOS OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER.',
  roteadorSug: 'ONT ZTE F 670-L',
  dataContrato: '03/2024',
  dataVisita: '15/06/2026',
  horaVisita: '10:30',
  protocolo: '123.456',
  operadorPrimeiroNome: 'GABRIEL',
}

const VARIACOES: Array<{ nome: string; tipo: string }> = [
  { nome: 'Titular solicita e acompanha', tipo: TVI_TITULAR },
  { nome: 'Titular solicita e autoriza terceiro', tipo: TVI_TITULAR_TERCEIRO },
  { nome: 'Terceiro solicita e titular acompanha', tipo: TVI_TERCEIRO_TITULAR },
  {
    nome: 'Terceiro solicita e terceiro acompanha',
    tipo: TVI_TERCEIRO_TERCEIRO,
  },
]

describe('Alteração de plano — com troca visita isenta', () => {
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

describe('Alteração de plano — com troca visita isenta (ofertado)', () => {
  for (const tipo of [TVI_TITULAR, TVI_TERCEIRO_TERCEIRO]) {
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
