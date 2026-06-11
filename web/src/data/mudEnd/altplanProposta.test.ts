import { describe, expect, it } from 'vitest'
import {
  MUD_END_ALTPLAN_PROPOSTA_OUTPUT,
  buildMudEndAltplanPropostaTextos,
} from './altplanProposta'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

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
  planoAtual: string
  planoEscolhido: string
  roteador: string
  troca: string
  dataContrato: string
  dataVisita: string
  horaVisita: string
  protocolo: string
  operadorDisplayName: string
}

const SEP = '='.repeat(30)
const SEP_OS = '='.repeat(34)
const TROCA =
  'REALIZAR A SUBSTIUIÇÃO DO ROTEADOR POR OUTRO MODELO COMPATÍVEL COM O NOVO PLANO ESCOLHIDO, TAL EQUIPAMENTO IRÁ SUBSTITUIR O ROTEADOR INSTALADO ANTERIORMENTE E PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. INSTALAR'

function esperado(v: Entrada) {
  const cliente = v.cliente.toUpperCase()
  const c0 = cliente.split(' ')[0]
  const contato = v.contato.replace(/\D/g, '')
  const equipPrefix = v.onuOnt.toUpperCase().startsWith('ONT') ? 'ONT' : 'ONU'
  const sinal = formatSinalFibraSaida(v.sinalONU)
  const adress = v.adress.toUpperCase()
  const complemento = v.complemento.toUpperCase()
  const bairro = v.bairro.toUpperCase()
  const quandoMud = v.quandoMud.toUpperCase()
  const comprovante = v.comprovante.toUpperCase()
  const tipoComp = v.tipoComp.toUpperCase()
  const comprovanteFinal = comprovante === 'OUTROS' ? tipoComp : comprovante
  const nomeComprov = v.nomeComprov.toUpperCase()
  const grauComp = v.grauComp.toUpperCase()
  const trocaAgenda = v.troca === TROCA ? '*TROCA DE EQUIPAMENTO*' : ''
  const extendAgenda = v.extend.replace(/<b>|<\/b>/g, '**')
  const operador =
    v.operadorDisplayName.trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ??
    ''

  const textoProtocolo = `${c0} ENTROU EM CONTATO POR ${v.canal} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP}
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ${equipPrefix} ${sinal}.
    
${SEP}
    
QUESTIONADO, ${c0} DISSE QUE ${v.mudou} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${v.num.replace(/\D/g, '')}
COMPLEMENTO: ${complemento}
CEP: ${v.cep}
BAIRRO: ${bairro}
${quandoMud}
    
${SEP}
    
INFORMEI A ${c0} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO E QUE PARA REALIZAÇÃO DA NOVA INSTALAÇÃO.

${v.equipSituacao}

VISTO QUE O CLIENTE NÃO POSSUI FIDELIDADE NO MOMENTO DA SOLICITAÇÃO, REPASSEI DUAS PROPOSTAS PARA A EXECUÇÃO DO SERVIÇO.

1. FORMA PADRÃO:

COBRAMOS O VALOR REFERENTE AO SERVIÇO E MATERIAL UTILIZADO, DE R$100,00 A SER PAGO PARA O TÉCNICO NO ATO (EM DINHEIRO, CARTÃO OU PIX), VISTO QUE CLIENTE NÃO TEVE INTERESSE NA RENOVAÇÃO DO PLANO APÓS OFERTA, MANTENDO PLANO ATUAL SEM FIDELIDADE.

2. ALTERANDO O PLANO (VISITA ISENTA DE CUSTOS):

PLANO ATUAL: ${v.planoAtual} CONTRATADO EM ${v.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${v.roteador}

PLANO OFERTADO: ${v.planoEscolhido}

ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE.

SENDO ASSIM, ${c0} OPTOU PELA ALTERAÇÃO DE PLANO (EXPLIQUEI AO CLIENTE QUE DESSA FORMA SERIA REINSERIDO EM NOSSA BASE COMO UM NOVO CLIENTE) TENDO COMO BENEFÍCIO VISITA ISENTA DE CUSTOS.

${SEP}

CIENTE QUE OS BENEFÍCIOS SÃO LIBERADOS APÓS ASSINATURA DO CONTRATO.

${c0} CONCORDOU COM OS TERMOS DE ALTERAÇÃO, ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE.

MUDANÇA E ALTERAÇÃO DE PLANO AGENDADA PARA DIA ${v.dataVisita} ${v.horaVisita} HRS.

${SEP}

COMPROVANTE DE ENDEREÇO (${comprovanteFinal}) EM ANEXO
NOME NO COMPROVANTE: ${nomeComprov} (${grauComp})`

  const textoOS = `${c0} ENTROU EM CONTATO VIA ${v.canal} (${contato}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE "QUE MUDOU PARA ESTE ENDEREÇO E LEVOU OS EQUIPAMENTOS". VALOR DO SERVIÇO: R$100,00. SOLICITOU TAMBÉM A RENOVAÇÃO DO SEU CONTRATO E UPGRADE DE PLANO, PLANO ATUAL: ${v.planoAtual}. PLANO OFERTADO: ${v.planoEscolhido}. COM A ALTERACAO DE PLANO O SERVICO DE MUDANÇA DE ENDEREÇO FOI ISENTO, E COM ESSE BENEFICIO RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. ${c0} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E CONTRATO. VISITA AGENDADA PARA DIA ${v.dataVisita} ${v.horaVisita} HRS.
${trocaAgenda}

${SEP_OS}

INDICAÇÃO TÉCNICA:

TÉCNICO: ${v.extend} ${v.troca} OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DO CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. VISITA ISENTA DE CUSTOS. <b>${v.onuOnt}</b>`

  const textoAgenda = `MUD END + ALT PLANO ${cliente} PROT:${v.protocolo} ISENTO (${operador}) - ${bairro} ${v.prumada} // ${extendAgenda} ${trocaAgenda}`

  return { textoProtocolo, textoOS, textoAgenda }
}

function gerarNovo(v: Entrada) {
  const operadorPrimeiroNome =
    v.operadorDisplayName.trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ??
    ''
  const base = {
    ...v,
    tipoSolicitacao: 'titular-solicita-titular-acompanha',
    operadorPrimeiroNome,
  }
  const full = renderTemplate(MUD_END_ALTPLAN_PROPOSTA_OUTPUT, {
    ...base,
    ...buildMudEndAltplanPropostaTextos(base, operadorPrimeiroNome),
  })
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
  planoAtual: '300 MEGA/69,90',
  planoEscolhido:
    '600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
  roteador: 'ZTE H199-A',
  troca: 'REINSTALAR',
  dataContrato: '01/2024',
  dataVisita: '15/06/2026',
  horaVisita: 'ÀS 08:00',
  protocolo: '123.456',
  operadorDisplayName: 'Gabriel Martins',
}

describe('MUD END + Alt Plano proposta', () => {
  it('Texto Protocolo preserva o padrão legado (titular)', () => {
    expect(gerarNovo(CENARIO).protocolo).toBe(esperado(CENARIO).textoProtocolo)
  })

  it('Texto O.S preserva o padrão legado (titular)', () => {
    expect(gerarNovo(CENARIO).os).toBe(esperado(CENARIO).textoOS)
  })

  it('Texto Agenda preserva o padrão legado com operador automático', () => {
    expect(gerarNovo(CENARIO).agenda).toBe(
      esperado(CENARIO).textoAgenda.replace(/\s+$/, ''),
    )
  })
})
