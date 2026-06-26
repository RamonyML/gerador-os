import { describe, expect, it } from 'vitest'
import {
  LUZ_VERMELHA_PJ_OUTPUT,
  buildLuzVermelhaPjTextos,
} from './luzVermelhaPj'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'

/**
 * Paridade caractere-a-caractere com
 * legado-exemplo/suporte/luz-vermelha/luzv-pj-padrao/index-luzverm-padrao-pj.html.
 */

type Entrada = {
  solicitante: string
  cargo: string
  cliente: string
  canal: string
  contato: string
  bairro: string
  alarme: string
  onu: string
  ctoType: 'CTOE' | 'CTOI'
  cto: string
  passante: string
  protocolo: string
  dataVisita: string
  horaVisita: string
  formaPag: string
  operadorDisplayName: string
}

const SEP_AST = '*'.repeat(19)
const SEP_OS = '='.repeat(39)
const sp = (n: number) => ' '.repeat(n)

const TECNICO =
  'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.'

function operadorPrimeiro(displayName: string): string {
  return displayName.trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ?? ''
}

function ctoOsBlock(v: Entrada): string {
  const cto = v.cto.toUpperCase()
  const passante = v.passante.toUpperCase()
  if (v.ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`
  return `\nCTOI // ${passante}.\n`
}

function legado(v: Entrada) {
  const cliente = v.cliente.toUpperCase()
  const solicitante = v.solicitante.toUpperCase()
  const solicitantePrimeiro = solicitante.split(' ')[0]
  const cargo = v.cargo.toUpperCase()
  const canal = v.canal
  const contato = v.contato.replace(/\D/g, '')
  const alarme = v.alarme
  const bairro = v.bairro.toUpperCase()
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const protocolo = v.protocolo
  const formaPag = v.formaPag
  const onu = v.onu
  const onuPrimeiro = onu.split(' ')[0]
  const operador = operadorPrimeiro(v.operadorDisplayName)

  const textoProtocolo = `${solicitantePrimeiro} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.

${SEP_AST}
${sp(4)}
CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuPrimeiro} SEM SINAL.
${sp(4)}
${SEP_AST}
${sp(4)}
QUESTIONADO, DISSE QUE A ${onuPrimeiro} ESTA COM ${alarme}.
${sp(4)}
REMOTAMENTE VERIFIQUEI QUE ${onuPrimeiro} ESTA DESCONECTADO/APAGADA. 
ORIENTEI ${solicitantePrimeiro} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. 
${sp(4)}
PERGUNTEI A ${solicitantePrimeiro} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. 
${sp(4)}
${SEP_AST}
${sp(4)}
INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.
${sp(4)}
${SEP_AST}
${sp(4)}
${solicitantePrimeiro} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`

  let textoOS = `${solicitantePrimeiro} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${onuPrimeiro} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ONU ESTA DESCONECTADO/APAGADA. ORIENTEI ${solicitantePrimeiro} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${solicitantePrimeiro} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solicitantePrimeiro} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
  textoOS += ctoOsBlock(v)
  textoOS += `${SEP_OS}

INDICACAO TECNICA:

${TECNICO}`

  let textoAgenda = `MAN ${alarme.split(' ').slice(0, 2).join(' ')} ${cliente} PROT:${protocolo} ${formaPag} (${operador}) - ${bairro}`
  if (v.ctoType === 'CTOI') textoAgenda += ' *CTOI*'

  return { textoProtocolo, textoOS, textoAgenda }
}

function gerarNovo(v: Entrada) {
  const operadorPrimeiroNome = operadorPrimeiro(v.operadorDisplayName)
  const full = renderTemplate(LUZ_VERMELHA_PJ_OUTPUT, {
    ...v,
    ...buildLuzVermelhaPjTextos(v, operadorPrimeiroNome),
  })
  const secs = splitOsPreviewSections(full)
  return {
    protocolo: secs[0]?.body ?? '',
    os: secs[1]?.body ?? '',
    agenda: secs[2]?.body ?? '',
  }
}

const CENARIO: Entrada = {
  solicitante: 'Carlos Pereira',
  cargo: 'gerente',
  cliente: 'Empresa Exemplo LTDA',
  canal: 'WHATSAPP',
  contato: '(34) 99999-8888',
  bairro: 'Saraiva',
  alarme: 'LUZ PON PISCANDO',
  onu: 'ONT',
  ctoType: 'CTOE',
  cto: '1035-a',
  passante: 'passante no poste proximo ao sobrado',
  protocolo: '456.789',
  dataVisita: '18/06/2026',
  horaVisita: '14:30',
  formaPag: 'PIX',
  operadorDisplayName: 'Gabriel Martins',
}

describe('Luz vermelha PJ — paridade com HTML legado', () => {
  it('Texto Protocolo identico', () => {
    expect(gerarNovo(CENARIO).protocolo).toBe(legado(CENARIO).textoProtocolo)
  })

  it('Texto O.S identico', () => {
    expect(gerarNovo(CENARIO).os).toBe(legado(CENARIO).textoOS)
  })

  it('Texto Agenda identico', () => {
    expect(gerarNovo(CENARIO).agenda).toBe(legado(CENARIO).textoAgenda)
  })

  it('CTOI — sufixo na agenda e bloco de O.S.', () => {
    const ctoi: Entrada = { ...CENARIO, ctoType: 'CTOI', cto: '' }
    expect(gerarNovo(ctoi).agenda).toBe(legado(ctoi).textoAgenda)
    expect(gerarNovo(ctoi).os).toBe(legado(ctoi).textoOS)
  })
})
