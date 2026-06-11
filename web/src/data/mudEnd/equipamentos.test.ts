import { describe, expect, it } from 'vitest'
import {
  MUD_END_EQUIPAMENTOS_OUTPUT,
  buildMudEndEquipamentosTextos,
} from './equipamentos'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

type Entrada = {
  cliente: string
  canal: string
  contato: string
  sinalONU: string
  onuOnt: string
  cep: string
  adress: string
  num: string
  bairro: string
  complemento: string
  prumada: string
  autorizado: string
  parente: string
  contatoAut: string
  logradouroAntigo: string
  bairroAntigo: string
  dataVisita: string
  horaVisita: string
  formaPag: string
  protocolo: string
  operadorDisplayName: string
}

const SEP_AST = '*'.repeat(15)
const SEP_AST_OS = '*'.repeat(35)

function esperado(v: Entrada) {
  const cliente = v.cliente.toUpperCase()
  const clientePrimeiro = cliente.split(' ')[0]
  const contato = v.contato.replace(/\D/g, '')
  const contatoAut = v.contatoAut.replace(/\D/g, '')
  const autorizado = v.autorizado.toUpperCase()
  const autorizadoPrimeiro = autorizado.split(' ')[0]
  const parente = v.parente.toUpperCase()
  const adress = v.adress.toUpperCase()
  const complemento = v.complemento.toUpperCase()
  const bairro = v.bairro.toUpperCase()
  const logradouroAntigo = v.logradouroAntigo.toUpperCase()
  const bairroAntigo = v.bairroAntigo.toUpperCase()
  const equipPrefix = v.onuOnt.toUpperCase().startsWith('ONT') ? 'ONT' : 'ONU'
  const signalLine = `${equipPrefix} ${formatSinalFibraSaida(v.sinalONU)}`
  const operador =
    v.operadorDisplayName.trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ??
    ''

  const textoProtocolo = `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ${signalLine}.
    
${SEP_AST}
    
QUESTIONADO, ${clientePrimeiro} DISSE QUE VAI SE MUDAR E DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.
    
ENDEREÇO NOVO: ${adress}, ${v.num.replace(/\D/g, '')}
COMPLEMENTO: ${complemento}
CEP: ${v.cep}
BAIRRO: ${bairro}
    
${SEP_AST}
    
INFORMEI A ${clientePrimeiro} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.
RESSALTEI QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA).
    
${clientePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag}.

${clientePrimeiro} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizadoPrimeiro}: ${contatoAut}).    

        
MUDANÇA AGENDADA PARA DIA ${v.dataVisita} ${v.horaVisita} HRS.`

  const textoOS = `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal} (${contato}) E SOLICITOU MUDANÇA DE ENDEREÇO, RETIRAR EQUIPAMENTOS DO ENDEREÇO <b>${logradouroAntigo} - ${bairroAntigo}.</b> E INSTALAR NO ENDEREÇO DA O.S. ${clientePrimeiro} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizadoPrimeiro}: ${contatoAut}). INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag}. ${clientePrimeiro} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita} ${v.horaVisita} HRS.


${SEP_AST_OS}

INDICAÇÃO TÉCNICA:

REINSTALAR EQUIPAMENTOS NO LOCAL INDICADO PELO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DA CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. RECEBER R$100,00 NO ATO DA VISITA EM ${v.formaPag}. <b>${v.onuOnt}</b>`

  const textoAgenda = `MUD END ${cliente} PROT:${v.protocolo} ${v.formaPag} (${operador}) - ${bairro} ${v.prumada}`

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
  const full = renderTemplate(MUD_END_EQUIPAMENTOS_OUTPUT, {
    ...base,
    ...buildMudEndEquipamentosTextos(base, operadorPrimeiroNome),
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
  cep: '38400000',
  adress: 'Avenida dos Eucaliptos',
  num: '624',
  bairro: 'Saraiva',
  complemento: 'casa fundos',
  prumada: '**SOBRADO**',
  autorizado: 'Maria da Silva',
  parente: 'mãe',
  contatoAut: '(34) 98888-7777',
  logradouroAntigo: 'Rua antiga 123',
  bairroAntigo: 'Centro',
  dataVisita: '15/06/2026',
  horaVisita: 'ÀS 08:00',
  formaPag: 'PIX',
  protocolo: '123.456',
  operadorDisplayName: 'Gabriel Martins',
}

describe('MUD END buscar equipamentos', () => {
  it('Texto Protocolo preserva o padrão legado (titular)', () => {
    expect(gerarNovo(CENARIO).protocolo).toBe(esperado(CENARIO).textoProtocolo)
  })

  it('Texto O.S preserva o padrão legado (titular)', () => {
    expect(gerarNovo(CENARIO).os).toBe(esperado(CENARIO).textoOS)
  })

  it('Texto Agenda preserva o padrão legado com operador automático', () => {
    expect(gerarNovo(CENARIO).agenda).toBe(esperado(CENARIO).textoAgenda)
  })
})
