import { describe, expect, it } from 'vitest'
import {
  MUD_END_ALTPLAN_PAGO_OUTPUT,
  buildMudEndAltplanPagoTextos,
} from './altplanPago'
import {
  T_TITULAR,
  T_TITULAR_TERCEIRO,
  T_TERCEIRO_TERCEIRO,
  T_TERCEIRO_TITULAR,
} from './padrao'
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
  formaPag: string
  protocolo: string
  operadorDisplayName: string
  solicitante?: string
  contatoSol?: string
  contatoAut?: string
  autorizado?: string
  parente?: string
  canalTit?: string
}

const SEP = '*'.repeat(22)
const SEP_OS = '*'.repeat(35)

function tecnico(v: Entrada) {
  return `TÉCNICO: ${v.extend} ${v.troca} OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DO CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. RECEBER R$100,00 NO ATO DA VISITA EM ${v.formaPag}.<b>${v.onuOnt}</b>`
}

/** Reproduz o titular (index-mud-altplan-pago.html), texto visível. */
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
  const nomeComprov = v.nomeComprov.toUpperCase()
  const grauComp = v.grauComp.toUpperCase()
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

COMPROVANTE DE ENDEREÇO (${comprovante}) EM ANEXO
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP}

INFORMEI A ${c0} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO E QUE PARA REALIZAÇÃO DA NOVA INSTALAÇÃO COBRAMOS O VALOR DE SERVIÇO R$100,00 A SER PAGO PARA O TÉCNICO NO ATO (EM DINHEIRO, CARTÃO OU PIX).

${v.equipSituacao}

${SEP}

NA OPORTUNIDADE, OFERTEI ALTERAÇÃO DE PLANO PARA ${c0}.

PLANO ATUAL: ${v.planoAtual} CONTRATADO EM ${v.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${v.roteador}

PLANO OFERTADO: ${v.planoEscolhido}

ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE.

${SEP}

CIENTE QUE OS BENEFÍCIOS SÃO LIBERADOS APÓS ASSINATURA DO CONTRATO.

${c0} CONCORDOU COM OS TERMOS DE ALTERAÇÃO E ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE.

MUDANÇA E ALTERAÇÃO DE PLANO AGENDADA PARA DIA ${v.dataVisita} ${v.horaVisita} HRS.
FORMA DE PAGAMENTO EM ${v.formaPag}`

  const textoOS = `${c0} ENTROU EM CONTATO VIA ${v.canal} (${contato}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE "QUE MUDOU PARA ESTE ENDEREÇO E LEVOU OS EQUIPAMENTOS". VALOR DO SERVIÇO: R$100,00. SOLICITOU TAMBÉM A RENOVAÇÃO DO SEU CONTRATO E UPGRADE DE PLANO, PLANO ATUAL: ${v.planoAtual}. PLANO ESCOLHIDO: ${v.planoEscolhido}. CIENTE QUE A ALTERAÇÃO DE PLANO RENOVA O CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. ${c0} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E CONTRATO E IRÁ REALIZAR O PAGAMENTO EM ${v.formaPag}. VISITA AGENDADA PARA DIA ${v.dataVisita} ${v.horaVisita} HRS.


${SEP_OS}

INDICAÇÃO TÉCNICA:

${tecnico(v)}`

  const extendAgenda = v.extend.replace(/<b>|<\/b>/g, '**')
  const textoAgenda = `MUD END + ALT PLANO ${cliente} PROT:${v.protocolo} ${v.formaPag} (${operador}) - ${bairro} ${v.prumada} // ${extendAgenda} `

  return { textoProtocolo, textoOS, textoAgenda }
}

function gerar(v: Entrada, tipo: string) {
  const operadorPrimeiroNome =
    v.operadorDisplayName.trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ??
    ''
  const base = { ...v, tipoSolicitacao: tipo, operadorPrimeiroNome }
  const full = renderTemplate(MUD_END_ALTPLAN_PAGO_OUTPUT, {
    ...base,
    ...buildMudEndAltplanPagoTextos(base, operadorPrimeiroNome),
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
  formaPag: 'PIX',
  protocolo: '123.456',
  operadorDisplayName: 'Gabriel Martins',
}

describe('MUD END + Alt Plano pago', () => {
  it('Texto Protocolo preserva o padrão legado (titular)', () => {
    expect(gerar(CENARIO, T_TITULAR).protocolo).toBe(
      esperado(CENARIO).textoProtocolo,
    )
  })

  it('Texto O.S preserva o padrão legado (titular)', () => {
    expect(gerar(CENARIO, T_TITULAR).os).toBe(esperado(CENARIO).textoOS)
  })

  it('Texto Agenda usa pagamento e operador automático', () => {
    expect(gerar(CENARIO, T_TITULAR).agenda).toBe(
      esperado(CENARIO).textoAgenda.replace(/\s+$/, ''),
    )
  })

  it('Variação titular autoriza terceiro cita o autorizado', () => {
    const out = gerar(
      { ...CENARIO, autorizado: 'Pedro Souza', contatoAut: '34977776666', parente: 'IRMÃO' },
      T_TITULAR_TERCEIRO,
    )
    expect(out.protocolo).toContain(
      'AUTORIZOU PEDRO SOUZA (IRMÃO) A ACOMPANHAR',
    )
    expect(out.protocolo).toContain('FALAR COM PEDRO')
    expect(out.os).toContain('NÃO ESTARÁ PRESENTE')
  })

  it('Variação terceiro/terceiro cita confirmação do assinante', () => {
    const out = gerar(
      {
        ...CENARIO,
        solicitante: 'Ana Lima',
        contatoSol: '34966665555',
        parente: 'FILHA',
        canalTit: 'LIGAÇÃO',
      },
      T_TERCEIRO_TERCEIRO,
    )
    expect(out.protocolo).toContain('ANA (FILHA DE JOÃO) ENTROU EM CONTATO')
    expect(out.protocolo).toContain(
      'AUTORIZOU ANA LIMA (FILHA) ACOMPANHAR',
    )
  })

  it('Variação terceiro/titular registra titular presente', () => {
    const out = gerar(
      {
        ...CENARIO,
        solicitante: 'Ana Lima',
        contatoSol: '34966665555',
        parente: 'FILHA',
      },
      T_TERCEIRO_TITULAR,
    )
    expect(out.protocolo).toContain('ANA (FILHA DE JOÃO) ENTROU EM CONTATO')
    expect(out.protocolo).toContain(
      'CONFIRMOU E DISSE QUE ESTARÁ PRESENTE',
    )
  })
})
