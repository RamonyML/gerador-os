import { describe, it, expect } from 'vitest'
import {
  MUD_END_COM_FIBRA_OUTPUT,
  buildMudEndComFibraTextos,
} from './comFibra'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

/**
 * Paridade do caso "titular solicita e acompanha" com
 * legado-exemplo/suporte/mud-end/mud-end-comfibramz/index-mud-end-cfibra.html
 * (aplicando as convenções de UI já definidas: sinal -00.00DBM, prefixo
 * ONU/ONT dinâmico, comprovante condicional e operador automático).
 */

type Entrada = {
  cliente: string
  canal: string
  contato: string
  sinalONU: string
  onuOnt: string
  extend: string
  cep: string
  adress: string
  num: string
  bairro: string
  complemento: string
  prumada: string
  mudou: string
  quandoMud: string
  equipSituacao: string
  comprovante: string
  tipoComp: string
  nomeComprov: string
  grauComp: string
  dataVisita: string
  horaVisita: string
  formaPag: string
  protocolo: string
  operadorDisplayName: string
}

const SEP_AST = '*'.repeat(15)
const SEP_AST_OS = '*'.repeat(35)
const IND4 = ' '.repeat(4)
const IND8 = ' '.repeat(8)

function tecnica(extend: string, formaPag: string): string {
  return `TÉCNICO: ${extend}REINSTALAR OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DO CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. RECEBER R$50,00 OU R$100,00 NO ATO DA VISITA EM ${formaPag}.`
}

/** Saída esperada do caso titular (cfibra). */
function esperado(v: Entrada) {
  const cliente = v.cliente.toUpperCase()
  const c0 = cliente.split(' ')[0]
  const canal = v.canal
  const contato = v.contato.replace(/\D/g, '')
  const equipPrefix = v.onuOnt.toUpperCase().startsWith('ONT') ? 'ONT' : 'ONU'
  const sinalSaida = formatSinalFibraSaida(v.sinalONU)
  const adress = v.adress.toUpperCase()
  const num = v.num.replace(/\D/g, '')
  const complemento = v.complemento.toUpperCase()
  const cep = v.cep
  const bairro = v.bairro.toUpperCase()
  const quandoMud = v.quandoMud.toUpperCase()
  const tipoComp = v.tipoComp.toUpperCase()
  const comprovante = v.comprovante.toUpperCase()
  const comprovanteFinal = comprovante === 'OUTROS' ? tipoComp : comprovante
  const nomeComprov = v.nomeComprov.toUpperCase()
  const grauComp = v.grauComp.toUpperCase()
  const mudou = v.mudou
  const equipSituacao = v.equipSituacao
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const protocolo = v.protocolo
  const onuOnt = v.onuOnt
  const prumada = v.prumada
  const extend = v.extend
  const extendAgenda = extend.replace(/<b>|<\/b>/g, '**')
  const operador =
    v.operadorDisplayName.trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ??
    ''

  const textoProtocolo = `${c0} ENTROU EM CONTATO POR ${canal} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}
${IND4}
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinalSaida}.

${SEP_AST}
${IND4}
QUESTIONADO, ${c0} DISSE QUE ${mudou} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${cep}
BAIRRO: ${bairro}
${quandoMud}

COMPROVANTE DE ENDEREÇO (${comprovanteFinal}) EM ANEXO
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP_AST}
${IND4}
INFORMEI A ${c0} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO, E ${c0} DISSE QUE NA RESIDÊNCIA JÁ POSSUI FIBRA DA MZNET.
EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVIÇO É DE R$50,00. EXPLIQUEI TAMBÉM QUE CASO DROP (CABO/FIBRA) ESTEJA DANIFICADO OU FOR NECESSÁRIO SER SUBSTITUÍDO POR OUTRO O CUSTO PASSA A SER DE R$100,00 (INCLUI PEÇAS E SERVIÇOS).

TAIS VALORES PODEM SER PAGOS NO ATO EM DINHEIRO, CARTÃO OU PIX.

${equipSituacao}
${IND4}
${c0} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${formaPag}.
${IND8}
MUDANÇA AGENDADA PARA DIA ${dataVisita} ${horaVisita} HRS.`

  const textoOS = `${c0} ENTROU EM CONTATO VIA ${canal} (${contato}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE QUE MUDOU PARA ESTE ENDEREÇO, LEVOU OS EQUIPAMENTOS E QUE A CASA JÁ POSSUI DROP DA MZNET INSTALADO. EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVIÇO É DE R$50,00. EXPLIQUEI TAMBÉM QUE CASO DROP (CABO/FIBRA) ESTEJA DANIFICADO OU FOR NECESSÁRIO SER SUBSTITUÍDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PEÇAS E SERVIÇOS). CLIENTE CONCORDOU E SOLICITOU PAGAR NO ATO EM ${formaPag}.  ${c0} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${dataVisita} ${horaVisita}HR.

${SEP_AST_OS}

INDICAÇÃO TÉCNICA:

${tecnica(extend, formaPag)}
<b>${onuOnt}</b>`

  const textoAgenda = `MUD END ${cliente} PROT:${protocolo} ${formaPag} (${operador}) - ${bairro} ${prumada} // COM FIBRA EXISTENTE ${extendAgenda}`

  return { textoProtocolo, textoOS, textoAgenda }
}

function buildContext(v: Entrada): Record<string, unknown> {
  const base = {
    ...v,
    tipoSolicitacao: 'titular-solicita-titular-acompanha',
    operadorPrimeiroNome:
      v.operadorDisplayName
        .trim()
        .split(/\s+/)
        .filter(Boolean)[0]
        ?.toUpperCase() ?? '',
  }
  return {
    ...base,
    ...buildMudEndComFibraTextos(base, String(base.operadorPrimeiroNome)),
  }
}

function gerarNovo(v: Entrada) {
  const full = renderTemplate(MUD_END_COM_FIBRA_OUTPUT, buildContext(v))
  const secs = splitOsPreviewSections(full)
  return {
    protocolo: secs[0]?.body ?? '',
    os: secs[1]?.body ?? '',
    agenda: secs[2]?.body ?? '',
  }
}

const CENARIO: Entrada = {
  cliente: 'João da Silva',
  canal: 'WHATSAPP',
  contato: '(34) 99999-8888',
  sinalONU: '19.20',
  onuOnt: 'ONU = ZTE // CONECTOR = VERDE.',
  extend: '<b>(POSSUI WI-FI EXTEND)</b> ',
  cep: '38400000',
  adress: 'Avenida dos Eucaliptos',
  num: '624',
  bairro: 'Saraiva',
  complemento: 'casa fundos',
  prumada: '**SOBRADO**',
  mudou: 'MUDOU DE RESIDÊNCIA E',
  quandoMud: 'cliente já está no novo endereço',
  equipSituacao:
    'VERIFIQUEI EM SISTEMA QUE A CONEXÃO NÃO POSSUI IP. QUESTIONEI O CLIENTE E O MESMO DISSE QUE JÁ LEVOU OS EQUIPAMENTOS AO NOVO ENDEREÇO.',
  comprovante: 'CEMIG',
  tipoComp: '',
  nomeComprov: 'maria da silva',
  grauComp: 'mãe',
  dataVisita: '15/06/2026',
  horaVisita: 'ÀS 08:00',
  formaPag: 'PIX',
  protocolo: '123.456',
  operadorDisplayName: 'Gabriel Martins',
}

describe('MUD END com fibra existente', () => {
  it('Texto Protocolo idêntico (titular)', () => {
    expect(gerarNovo(CENARIO).protocolo).toBe(esperado(CENARIO).textoProtocolo)
  })

  it('Texto O.S idêntico (titular)', () => {
    expect(gerarNovo(CENARIO).os).toBe(esperado(CENARIO).textoOS)
  })

  it('Texto Agenda idêntico (titular, espaço final aparado)', () => {
    expect(gerarNovo(CENARIO).agenda).toBe(
      esperado(CENARIO).textoAgenda.replace(/\s+$/, ''),
    )
  })

  it('Terceiro: protocolo menciona DROP da MZNET e o solicitante', () => {
    const full = renderTemplate(
      MUD_END_COM_FIBRA_OUTPUT,
      (() => {
        const base = {
          ...CENARIO,
          tipoSolicitacao: 'terceiro-solicita-titular-acompanha',
          solicitante: 'Carlos Pereira',
          contatoSol: '34977776666',
          parente: 'FILHO',
          operadorPrimeiroNome: 'GABRIEL',
        }
        return {
          ...base,
          ...buildMudEndComFibraTextos(base, 'GABRIEL'),
        }
      })(),
    )
    const secs = splitOsPreviewSections(full)
    expect(secs[0]?.body ?? '').toContain('CARLOS (FILHO DE JOÃO)')
    expect(secs[1]?.body ?? '').toContain('DROP DA MZNET')
  })
})
