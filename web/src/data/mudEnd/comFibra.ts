import type { OsTemplateField } from '../../types/osTemplate'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'
import {
  MUD_END_PADRAO_FIELDS,
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from './padrao'

/**
 * MUD END — COM FIBRA EXISTENTE (mznet pré-existente no novo endereço).
 * O caso "titular solicita e acompanha" mantém paridade com
 * legado-exemplo/suporte/mud-end/mud-end-comfibramz/index-mud-end-cfibra.html.
 *
 * Reutiliza os mesmos campos do fluxo padrão e a mesma lógica de terceiros.
 */

const SEP_AST = '*'.repeat(15)
const SEP_AST_OS = '*'.repeat(35)

export const MUD_END_COM_FIBRA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{mudEndTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{mudEndTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{mudEndTextoAgenda}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

/** Bloco de custo do protocolo (fibra existente: R$50 ou R$100). */
function protCustoFibra(nome: string): string {
  return `INFORMEI A ${nome} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO, E ${nome} DISSE QUE NA RESIDÊNCIA JÁ POSSUI FIBRA DA MZNET.
EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVIÇO É DE R$50,00. EXPLIQUEI TAMBÉM QUE CASO DROP (CABO/FIBRA) ESTEJA DANIFICADO OU FOR NECESSÁRIO SER SUBSTITUÍDO POR OUTRO O CUSTO PASSA A SER DE R$100,00 (INCLUI PEÇAS E SERVIÇOS).

TAIS VALORES PODEM SER PAGOS NO ATO EM DINHEIRO, CARTÃO OU PIX.`
}

/** Trecho de custo no corpo da O.S (fibra existente). */
function osCustoFibra(formaPag: string): string {
  return `EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVIÇO É DE R$50,00. EXPLIQUEI TAMBÉM QUE CASO DROP (CABO/FIBRA) ESTEJA DANIFICADO OU FOR NECESSÁRIO SER SUBSTITUÍDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PEÇAS E SERVIÇOS). CLIENTE CONCORDOU E SOLICITOU PAGAR NO ATO EM ${formaPag}.`
}

const DISSE_DROP =
  'DISSE "QUE MUDOU PARA ESTE ENDEREÇO, LEVOU OS EQUIPAMENTOS E QUE A CASA JÁ POSSUI DROP DA MZNET INSTALADO".'

function lineOsTecnica(v: Record<string, string>): string {
  return `TÉCNICO: ${v.extend ?? ''}REINSTALAR OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DO CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. RECEBER R$50,00 OU R$100,00 NO ATO DA VISITA EM ${v.formaPag ?? ''}.`
}

function osBody(inicio: string, v: Record<string, string>): string {
  return `${inicio}

${SEP_AST_OS}

INDICAÇÃO TÉCNICA:

${lineOsTecnica(v)}
<b>${v.onuOnt ?? ''}</b>`
}

export function buildMudEndComFibraTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || T_TITULAR
  const cliente = upper(v.cliente)
  const clientePrimeiro = first(cliente)
  const solicitante = upper(v.solicitante)
  const solicitantePrimeiro = first(solicitante)
  const autorizado = upper(v.autorizado)
  const autorizadoPrimeiro = first(autorizado)
  const parente = upper(v.parente)
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const contatoAut = digits(v.contatoAut)
  const equipPrefix = upper(v.onuOnt).startsWith('ONT') ? 'ONT' : 'ONU'
  const sinalSaida = formatSinalFibraSaida(v.sinalONU)
  const adress = upper(v.adress)
  const complemento = upper(v.complemento)
  const bairro = upper(v.bairro)
  const tipoComp = upper(v.tipoComp)
  const comprovante = upper(v.comprovante)
  const comprovanteFinal = comprovante === 'OUTROS' ? tipoComp : comprovante
  const nomeComprov = upper(v.nomeComprov)
  const grauComp = upper(v.grauComp)
  const num = digits(v.num)
  const quandoMud = upper(v.quandoMud)
  const extendAgenda = String(v.extend ?? '').replace(/<b>|<\/b>/g, '**')
  const equipSituacao = v.equipSituacao ?? ''
  const agenda = `MUD END ${cliente} PROT:${v.protocolo ?? ''} ${v.formaPag ?? ''} (${operadorPrimeiroNome}) - ${bairro} ${v.prumada ?? ''} // COM FIBRA EXISTENTE ${extendAgenda}`

  if (tipo === T_TERCEIRO_TITULAR) {
    const protocolo = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinalSaida}.

${SEP_AST}

QUESTIONADO, ${solicitantePrimeiro} DISSE QUE VAI SE MUDAR E DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${v.num ?? ''}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}

COMPROVANTE DE ENDEREÇO (${comprovanteFinal}) EM ANEXO
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP_AST}

${protCustoFibra(solicitantePrimeiro)}
RESSALTEI QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA).


${solicitantePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag ?? ''}.

POR PROCEDIMENTO PADRÃO, ENTREI EM CONTATO POR ${v.canal ?? ''} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE AUTORIZOU E CONFIRMOU QUE ESTARÁ PRESENTE NO ATO DA VISITA.

MUDANÇA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`
    const os = osBody(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, ${DISSE_DROP} ${osCustoFibra(v.formaPag ?? '')} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal ?? ''} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU A SOLICITAÇÃO DE ${solicitantePrimeiro}. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
    )
    return {
      mudEndTextoProtocolo: protocolo,
      mudEndTextoOS: os,
      mudEndTextoAgenda: agenda,
    }
  }

  if (tipo === T_TERCEIRO_TERCEIRO) {
    const partes = String(v.dataLigacao ?? '').trim().split(/\s+/)
    const dataLigacao = partes[0] ?? ''
    const horaLigacao = partes[1] ?? ''
    const protocolo = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinalSaida}.
    
${SEP_AST}
    
QUESTIONADO, ${solicitantePrimeiro} DISSE QUE VAI SE MUDAR E DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.
    
ENDEREÇO NOVO: ${adress}, ${v.num ?? ''}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}

COMPROVANTE DE ENDEREÇO (${comprovanteFinal}) EM ANEXO.
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP_AST}

${protCustoFibra(solicitantePrimeiro)}

${equipSituacao}

${solicitantePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag ?? ''}.

POR PROCEDIMENTO PADRÃO, ENTREI EM CONTATO POR ${v.canalTit ?? ''} (${contato}) DIA ${dataLigacao} ÀS ${horaLigacao}HRS COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.

MUDANÇA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`
    const os = osBody(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, ${DISSE_DROP} ${osCustoFibra(v.formaPag ?? '')} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canalTit ?? ''} (${contato}) DIA ${dataLigacao} ${horaLigacao}HRS COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
    )
    return {
      mudEndTextoProtocolo: protocolo,
      mudEndTextoOS: os,
      mudEndTextoAgenda: agenda,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    const protocolo = `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinalSaida}.

${SEP_AST}

QUESTIONADO, ${clientePrimeiro} DISSE QUE ${v.mudou ?? ''} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}
${quandoMud}

COMPROVANTE DE ENDEREÇO (${comprovanteFinal}) EM ANEXO
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP_AST}

${protCustoFibra(clientePrimeiro)}

${equipSituacao}

${clientePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag ?? ''}.

${clientePrimeiro} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.
${clientePrimeiro} INFORMOU O NÚMERO DE CONTATO (${contatoAut}) PARA CASO SEJA NECESSÁRIO FALAR COM ${autorizadoPrimeiro}.

MUDANÇA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`
    const os = osBody(
      `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, ${DISSE_DROP} ${osCustoFibra(v.formaPag ?? '')} ${clientePrimeiro} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
    )
    return {
      mudEndTextoProtocolo: protocolo,
      mudEndTextoOS: os,
      mudEndTextoAgenda: agenda,
    }
  }

  // Caso padrão: titular solicita e acompanha (paridade com o HTML legado).
  const protocolo = `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinalSaida}.

${SEP_AST}
    
QUESTIONADO, ${clientePrimeiro} DISSE QUE ${v.mudou ?? ''} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}
${quandoMud}

COMPROVANTE DE ENDEREÇO (${comprovanteFinal}) EM ANEXO
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP_AST}
    
${protCustoFibra(clientePrimeiro)}

${equipSituacao}
    
${clientePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag ?? ''}.
        
MUDANÇA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`

  const os = osBody(
    `${clientePrimeiro} ENTROU EM CONTATO VIA ${v.canal ?? ''} (${contato}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE QUE MUDOU PARA ESTE ENDEREÇO, LEVOU OS EQUIPAMENTOS E QUE A CASA JÁ POSSUI DROP DA MZNET INSTALADO. ${osCustoFibra(v.formaPag ?? '')}  ${clientePrimeiro} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''}HR.`,
    v,
  )
  return {
    mudEndTextoProtocolo: protocolo,
    mudEndTextoOS: os,
    mudEndTextoAgenda: agenda,
  }
}

export function buildMudEndComFibraSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[]; osDescricao: string; osIndicacoes: string } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo               = v.tipoSolicitacao || T_TITULAR
  const clientePrimeiro    = first(upper(v.cliente))
  const solicitantePrimeiro = first(upper(v.solicitante))
  const parente            = upper(v.parente)
  const contato            = digits(v.contato)
  const contatoSol         = digits(v.contatoSol)
  const equipPrefix        = upper(v.onuOnt).startsWith('ONT') ? 'ONT' : 'ONU'
  const sinalSaida         = formatSinalFibraSaida(v.sinalONU)
  const canal              = v.canal ?? ''

  const ehTerceiro  = tipo === T_TERCEIRO_TITULAR || tipo === T_TERCEIRO_TERCEIRO
  const quem        = ehTerceiro ? `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro})` : clientePrimeiro
  const contatoInfo = ehTerceiro ? contatoSol : contato

  const info = `${quem} ENTROU EM CONTATO POR ${canal} (${contatoInfo}) E SOLICITOU MUDANÇA DE ENDEREÇO (FIBRA EXISTENTE).\n\nCLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinalSaida}.`

  const { mudEndTextoProtocolo, mudEndTextoOS } = buildMudEndComFibraTextos(rawValues, '')
  const _mark = 'INDICAÇÃO TÉCNICA:'
  const _midx = mudEndTextoOS.indexOf(_mark)
  const osDescricao  = _midx >= 0 ? mudEndTextoOS.slice(0, _midx).replace(/[\s=>*]+$/, '') : mudEndTextoOS
  const osIndicacoes = _midx >= 0 ? mudEndTextoOS.slice(_midx + _mark.length).trimStart() : ''

  return { info, comentarios: [mudEndTextoProtocolo], osDescricao, osIndicacoes }
}

/** Mesmos campos do fluxo padrão (mesma UI e lógica de terceiros). */
export const MUD_END_COM_FIBRA_FIELDS: OsTemplateField[] = MUD_END_PADRAO_FIELDS

export function getMudEndComFibraDefaults() {
  return {
    slug: 'mud-end-com-fibra',
    title: 'Mudança de endereço — com fibra existente',
    outputTemplate: MUD_END_COM_FIBRA_OUTPUT,
    demandCategory: 'mudanca-endereco',
    fields: MUD_END_COM_FIBRA_FIELDS.map((f) => ({ ...f })),
  }
}
