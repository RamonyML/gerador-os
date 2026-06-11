import { describe, it, expect } from 'vitest'
import { MUD_END_PADRAO_OUTPUT, buildMudEndPadraoTextos } from './padrao'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

/**
 * Garante paridade caractere-a-caractere com
 * legado-exemplo/suporte/mud-end/index-mud-end.html.
 *
 * `legado()` reproduz fielmente a função gerarTextos() do HTML antigo.
 * `gerarNovo()` usa o mesmo `context` derivado do OsGeneratorPage.
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
  /** Nome completo do operador logado (substitui o antigo select). */
  operadorDisplayName: string
}

const SEP = '='.repeat(35)
const SEP_OS = '='.repeat(37)

/** Replica exatamente as 3 template strings do HTML legado. */
function legado(v: Entrada) {
  const cliente = v.cliente.toUpperCase()
  const canal = v.canal
  const contato = v.contato.replace(/\D/g, '')
  const equipPrefix = v.onuOnt.toUpperCase().startsWith('ONT') ? 'ONT' : 'ONU'
  const sinalSaida = formatSinalFibraSaida(v.sinalONU)
  const complemento = v.complemento.toUpperCase()
  const adress = v.adress.toUpperCase()
  const cep = v.cep
  const bairro = v.bairro.toUpperCase()
  const tipoComp = v.tipoComp.toUpperCase()
  const comprovante = v.comprovante.toUpperCase()
  const comprovanteFinal = comprovante === 'OUTROS' ? tipoComp : comprovante
  const nomeComprov = v.nomeComprov.toUpperCase()
  const grauComp = v.grauComp.toUpperCase()
  const num = v.num.replace(/\D/g, '')
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const protocolo = v.protocolo
  const formaPag = v.formaPag
  const onuOnt = v.onuOnt
  // Agora a agenda usa o primeiro nome do operador logado (não mais um select).
  const operador =
    v.operadorDisplayName.trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ??
    ''
  const prumada = v.prumada
  const quandoMud = v.quandoMud.toUpperCase()
  const mudou = v.mudou
  const extend = v.extend
  const extendAgenda = extend.replace(/<b>|<\/b>/g, '**')
  // No legado o operador escolhe levou OU esqueceu; aqui o campo unificado.
  const levouEquip = v.equipSituacao
  const esqueceuEquip = ''

  const textoProtocolo = `${cliente.split(' ')[0]} ENTROU EM CONTATO POR ${canal} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinalSaida}.

${SEP}

QUESTIONADO, ${cliente.split(' ')[0]} DISSE QUE ${mudou} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${cep}
BAIRRO: ${bairro}
${quandoMud}

${SEP}

INFORMEI A ${cliente.split(' ')[0]} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

${levouEquip}${esqueceuEquip}

${cliente.split(' ')[0]} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${formaPag}.

MUDANÇA AGENDADA PARA DIA ${dataVisita} ${horaVisita} HRS.

${SEP}

>>> Este deve ser o ultimo comentário <<<

COMPROVANTE DE ENDEREÇO (${comprovanteFinal}) EM ANEXO
NOME NO COMPROVANTE: ${nomeComprov} (${grauComp})`

  const textoOS = `${cliente.split(' ')[0]} ENTROU EM CONTATO VIA ${canal} (${contato}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE "QUE MUDOU PARA ESTE ENDEREÇO E LEVOU OS EQUIPAMENTOS". INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cliente.split(' ')[0]} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${dataVisita} ${horaVisita} HRS.

${SEP_OS}

INDICAÇÃO TÉCNICA:

TÉCNICO: ${extend}REINSTALAR OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DO CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. RECEBER R$100,00 NO ATO DA VISITA EM ${formaPag}.
<b>${onuOnt}</b>`

  const textoAgenda = `MUD END ${cliente} PROT:${protocolo} ${formaPag} (${operador}) - ${bairro} ${prumada} ${extendAgenda}`

  return { textoProtocolo, textoOS, textoAgenda }
}

/** Espelha o `context` derivado no OsGeneratorPage para os campos do MUD END. */
function buildContext(v: Entrada): Record<string, unknown> {
  const nome = v.cliente.trim()
  const upperTokens = nome.toUpperCase().split(/\s+/).filter(Boolean)
  const base = {
    ...v,
    tipoSolicitacao: 'titular-solicita-titular-acompanha',
    clientePrimeiro: upperTokens[0] ?? '',
    clienteUpper: nome.toUpperCase(),
    bairroUpper: v.bairro.trim().toUpperCase(),
    adressUpper: v.adress.trim().toUpperCase(),
    numNumerico: v.num.replace(/\D/g, ''),
    complementoUpper: v.complemento.trim().toUpperCase(),
    quandoMudUpper: v.quandoMud.trim().toUpperCase(),
    tipoCompUpper: v.tipoComp.trim().toUpperCase(),
    nomeComprovUpper: v.nomeComprov.trim().toUpperCase(),
    grauCompUpper: v.grauComp.trim().toUpperCase(),
    extendAgenda: v.extend.replace(/<b>|<\/b>/g, '**'),
    sinalONUUpper: v.sinalONU.trim().toUpperCase(),
    contatoNumerico: v.contato.replace(/\D/g, ''),
    operadorPrimeiroNome:
      v.operadorDisplayName
        .trim()
        .split(/\s+/)
        .filter(Boolean)[0]
        ?.toUpperCase() ?? '',
  }
  return {
    ...base,
    ...buildMudEndPadraoTextos(base, String(base.operadorPrimeiroNome)),
  }
}

function gerarNovo(v: Entrada) {
  const full = renderTemplate(MUD_END_PADRAO_OUTPUT, buildContext(v))
  const secs = splitOsPreviewSections(full)
  return {
    protocolo: secs[0]?.body ?? '',
    os: secs[1]?.body ?? '',
    agenda: secs[2]?.body ?? '',
  }
}

const CENARIO_A: Entrada = {
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

const CENARIO_B: Entrada = {
  cliente: 'Ana Souza',
  canal: 'LIGAÇÃO',
  contato: '34988887777',
  sinalONU: '8.50',
  onuOnt: 'ONT = ONT TP LINK 530 // CONECTOR = VERDE.',
  extend: '',
  cep: '38405100',
  adress: 'Rua das Flores',
  num: '10A',
  bairro: 'Centro',
  complemento: '',
  prumada: ' ',
  mudou: 'AINDA NÃO SE MUDOU, PORÉM',
  quandoMud: 'vai mudar na próxima semana',
  equipSituacao: '',
  comprovante: 'OUTROS',
  tipoComp: 'declaração de residência',
  nomeComprov: 'ana souza',
  grauComp: 'ASSINANTE',
  dataVisita: '20/06/2026',
  horaVisita: 'APÓS ÀS 11:00',
  formaPag: 'DINHEIRO',
  protocolo: '987.654',
  operadorDisplayName: 'Renata Souza',
}

describe('MUD END padrão — paridade com o HTML legado', () => {
  for (const [nome, v] of [
    ['cenário A (já mudou, possui extend, comprovante CEMIG)', CENARIO_A],
    ['cenário B (vai mudar, sem extend, comprovante Outros)', CENARIO_B],
  ] as const) {
    it(`Texto Protocolo idêntico — ${nome}`, () => {
      expect(gerarNovo(v).protocolo).toBe(legado(v).textoProtocolo)
    })

    it(`Texto O.S idêntico — ${nome}`, () => {
      expect(gerarNovo(v).os).toBe(legado(v).textoOS)
    })

    it(`Texto Agenda idêntico (ignorando espaço final aparado) — ${nome}`, () => {
      // O splitter de pré-visualização apara espaços ao fim de cada seção;
      // no legado a agenda termina em espaço quando "não possui extend".
      expect(gerarNovo(v).agenda).toBe(legado(v).textoAgenda.replace(/\s+$/, ''))
    })
  }
})
