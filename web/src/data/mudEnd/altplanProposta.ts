import type { OsTemplateField } from '../../types/osTemplate'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from './padrao'

/**
 * MUD END + ALT PLANO (proposta com isenção).
 * Origem: legado-exemplo/suporte/mud-end/mud-end-altplan-proposta/mud-altplan-prop.html
 */

const SEP = '='.repeat(30)
const SEP_OS = '='.repeat(34)
const TROCA_VALUE =
  'REALIZAR A SUBSTIUIÇÃO DO ROTEADOR POR OUTRO MODELO COMPATÍVEL COM O NOVO PLANO ESCOLHIDO, TAL EQUIPAMENTO IRÁ SUBSTITUIR O ROTEADOR INSTALADO ANTERIORMENTE E PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. INSTALAR'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_TERCEIRO = 'DADOS DE TERCEIRO / AUTORIZAÇÃO'
const S_END = 'NOVO ENDEREÇO DO CLIENTE'
const S_COMP = 'COMPROVANTE DE ENDEREÇO'
const S_PLAN = 'DETALHES DA ALTERAÇÃO DE PLANO'
const S_AGE = 'AGENDAMENTO'

const EQUIP_LEVOU_SIM =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO NÃO POSSUI IP. QUESTIONEI O CLIENTE E O MESMO DISSE QUE JÁ LEVOU OS EQUIPAMENTOS AO NOVO ENDEREÇO.'
const EQUIP_LEVOU_NAO =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO NÃO POSSUI IP. INFORMEI AO CLIENTE QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA). CLIENTE CONFIRMOU QUE LEVARÁ POSTERIORMENTE.'
const EQUIP_ESQUECEU_SIM =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO AINDA ESTAVA ATIVA (COM IP). QUESTIONANDO, CLIENTE DISSE QUE ESQUECEU OS EQUIPAMENTOS NO ANTIGO ENDEREÇO. INFORMEI AO CLIENTE QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA). CLIENTE CONFIRMOU QUE LEVARÁ ATÉ O DIA DA MUDANÇA.'
const EQUIP_ESQUECEU_NAO =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO AINDA ESTAVA ATIVA (COM IP). QUESTIONEI O CLIENTE E O MESMO DISSE QUE VAI BUSCAR OS EQUIPAMENTOS ATÉ O DIA DA MUDANÇA.'

const HORA_OPTIONS = [
  { value: 'ÀS 08:00', label: '08:00' },
  { value: 'ÀS 08:30', label: '08:30' },
  { value: 'ÀS 10:00', label: '10:00' },
  { value: 'ÀS 10:30', label: '10:30' },
  { value: 'ÀS 13:00', label: '13:00' },
  { value: 'ÀS 13:30', label: '13:30' },
  { value: 'ÀS 15:00', label: '15:00' },
  { value: 'ÀS 15:30', label: '15:30' },
  { value: 'ÀS 17:00', label: '17:00 (somente com autorização)' },
  { value: 'APÓS ÀS 11:00', label: 'Após às 11:00 (aos sábados)' },
]

const ONU_ONT_OPTIONS = [
  { value: 'ONU = DATA // CONECTOR = VERDE.', label: 'ONU DATA' },
  { value: 'ONU = ZTE // CONECTOR = VERDE.', label: 'ONU ZTE' },
  { value: 'ONU = TENDA // CONECTOR = VERDE.', label: 'ONU TENDA' },
  { value: 'ONU = SHORELINE // CONECTOR = AZUL.', label: 'ONU SHORELINE' },
  { value: 'ONU = FIBERHOME // CONECTOR = AZUL.', label: 'ONU FIBERHOME' },
  { value: 'ONT = ONT TP LINK 220 // CONECTOR = VERDE.', label: 'ONT TP LINK 220' },
  { value: 'ONT = ONT TP LINK 230 // CONECTOR = VERDE.', label: 'ONT TP LINK 230' },
  { value: 'ONT = ONT TP LINK 530 // CONECTOR = VERDE.', label: 'ONT TP LINK 530' },
  { value: 'ONT = ONT ZTE // CONECTOR = AZUL.', label: 'ONT ZTE (azul)' },
  { value: 'ONT = ONT ZTE // CONECTOR = VERDE.', label: 'ONT ZTE (verde)' },
]

const PLANO_ATUAL_OPTIONS = [
  { value: '100 MEGA/59,90', label: '100MB/59,90' },
  { value: '100 MEGA/79,90', label: '100MB/79,90' },
  { value: '150 MEGA/59,90', label: '150MB/59,90' },
  { value: '250 MEGA/69,90', label: '250MB/69,90' },
  { value: '300 MEGA/69,90', label: '300MB/69,90' },
  { value: '400 MEGA/79,90', label: '400MB/79,90' },
  { value: '500 MEGA/79,90', label: '500MB/79,90' },
  { value: '500 MEGA/99,90', label: '500MB/99,90' },
  { value: '600 MEGA/79,90', label: '600MB/79,90' },
  { value: '1000 MEGA/99,90', label: '1000MB/99,90' },
  { value: '1000 MEGA/149,80', label: '1000MB/149,80' },
  { value: '500 MEGA + WI-FI EXTEND/119,90', label: '500MB/119,90 - WI-FI EXTEND' },
  { value: '1000 MEGA + WI-FI EXTEND/139,90', label: '1000MB/139,90 - WI-FI EXTEND' },
]

const PLANO_ESCOLHIDO_OPTIONS = [
  {
    value: '150 MEGA/59,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '150 MEGA/59,90 + MZTV (CDNTV+)',
  },
  {
    value: '300 MEGA/69,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '300 MEGA/69,90 + MZTV (CDNTV+)',
  },
  {
    value: '600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/79,90 + MZTV (CDNTV+)',
  },
  {
    value: '1 GIGA (1.000 MEGA) R$99,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/99,90 + MZTV (CDNTV+) + VOD',
  },
  {
    value: '150 MEGA/80,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '150 MEGA/80,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value: '300 MEGA/90,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '300 MEGA/90,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value: '600 MEGA/100,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/100,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value: '1 GIGA (1.000 MEGA) R$120,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/120,00 + MZTV (CDNTV+) + VOD + IP DIN',
  },
  {
    value: '600 MEGA/109,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV',
    label: '600 MEGA/109,90 + MZTV + VOD + ITTV PLUS',
  },
  {
    value: '1 GIGA (1.000 MEGA) R$129,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV + VOD',
    label: '1000 MEGA/129,90 + MZTV + VOD + ITTV PLUS',
  },
  {
    value: '600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/114,90 + BENEFÍCIOS + WI-FI EXTEND',
  },
  {
    value: '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/134,90 + BENEFÍCIOS + WI-FI EXTEND',
  },
]

const ROTEADOR_OPTIONS = [
  'MULTILASER',
  'TP-LINK 840',
  'TP LINK C-20',
  'D-LINK DIR 842',
  'TP LINK C-5',
  'TP LINK G-5',
  'TP-LINK EX511',
  'GREATEK',
  'INTELBRAS',
  'HUAWEI AX2',
  'ZTE H196-MESH',
  'ZTE H199-A',
  'ONT ZTE F 670-L',
  'ONT TP-LINK XC220',
  'ONT TP-LINK XC230',
  'ONT TP-LINK X530',
  'ONT TP-LINK X530v2',
  'ZTE H199-A + ZTE H199-A',
  'ZTE H199-A + ZTE H196',
  'ONT ZTE F 670-L + ZTE H199-A',
  'ONT ZTE F 670-L + ZTE H196',
  'PARTICULAR DO CLIENTE',
].map((value) => ({ value, label: value }))

export const MUD_END_ALTPLAN_PROPOSTA_OUTPUT = [
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

function textoTecnico(v: Record<string, string>, troca: string): string {
  return `TÉCNICO: ${v.extend ?? ''} ${troca} OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DO CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. VISITA ISENTA DE CUSTOS. <b>${v.onuOnt ?? ''}</b>`
}

export function buildMudEndAltplanPropostaTextos(
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
  const parente = upper(v.parente)
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const contatoAut = digits(v.contatoAut)
  const adress = upper(v.adress)
  const complemento = upper(v.complemento)
  const bairro = upper(v.bairro)
  const num = digits(v.num)
  const quandoMud = upper(v.quandoMud)
  const tipoComp = upper(v.tipoComp)
  const comprovante = upper(v.comprovante)
  const comprovanteFinal = comprovante === 'OUTROS' ? tipoComp : comprovante
  const nomeComprov = upper(v.nomeComprov)
  const grauComp = upper(v.grauComp)
  const equipPrefix = upper(v.onuOnt).startsWith('ONT') ? 'ONT' : 'ONU'
  const sinalSaida = formatSinalFibraSaida(v.sinalONU)
  const equipSituacao = v.equipSituacao ?? ''
  const troca = v.troca ?? ''
  const trocaAgenda = troca === TROCA_VALUE ? '*TROCA DE EQUIPAMENTO*' : ''
  const extendAgenda = String(v.extend ?? '').replace(/<b>|<\/b>/g, '**')
  const primeiroContato =
    tipo === T_TERCEIRO_TITULAR || tipo === T_TERCEIRO_TERCEIRO
      ? solicitantePrimeiro
      : clientePrimeiro
  const contatoUsado =
    tipo === T_TERCEIRO_TITULAR || tipo === T_TERCEIRO_TERCEIRO
      ? contatoSol
      : contato

  const protocoloExtra =
    tipo === T_TERCEIRO_TITULAR
      ? `\n\nPOR PROCEDIMENTO PADRÃO, ENTREI EM CONTATO POR ${v.canal ?? ''} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE AUTORIZOU E CONFIRMOU A SOLICITAÇÃO.`
      : tipo === T_TERCEIRO_TERCEIRO
        ? (() => {
            const partes = String(v.dataLigacao ?? '').trim().split(/\s+/)
            return `\n\nPOR PROCEDIMENTO PADRÃO, ENTREI EM CONTATO POR ${v.canalTit ?? ''} (${contato}) DIA ${partes[0] ?? ''} ÀS ${partes[1] ?? ''}HRS COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR, ASSINAR O.S E CONTRATO.`
          })()
        : ''

  const autorizacaoProto =
    tipo === T_TITULAR_TERCEIRO
      ? `\n\n${clientePrimeiro} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${upper(v.autorizado)} (${parente}) A ACOMPANHAR, ASSINAR O.S E CONTRATO.\n${clientePrimeiro} INFORMOU O NÚMERO DE CONTATO (${contatoAut}) PARA CASO SEJA NECESSÁRIO FALAR COM ${first(upper(v.autorizado))}.`
      : ''

  const protocolo = `${primeiroContato} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoUsado}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP}
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ${equipPrefix} ${sinalSaida}.
    
${SEP}
    
QUESTIONADO, ${primeiroContato} DISSE QUE ${v.mudou ?? ''} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}
${quandoMud}
    
${SEP}
    
INFORMEI A ${primeiroContato} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO E QUE PARA REALIZAÇÃO DA NOVA INSTALAÇÃO.

${equipSituacao}

VISTO QUE O CLIENTE NÃO POSSUI FIDELIDADE NO MOMENTO DA SOLICITAÇÃO, REPASSEI DUAS PROPOSTAS PARA A EXECUÇÃO DO SERVIÇO.

1. FORMA PADRÃO:

COBRAMOS O VALOR REFERENTE AO SERVIÇO E MATERIAL UTILIZADO, DE R$100,00 A SER PAGO PARA O TÉCNICO NO ATO (EM DINHEIRO, CARTÃO OU PIX), VISTO QUE CLIENTE NÃO TEVE INTERESSE NA RENOVAÇÃO DO PLANO APÓS OFERTA, MANTENDO PLANO ATUAL SEM FIDELIDADE.

2. ALTERANDO O PLANO (VISITA ISENTA DE CUSTOS):

PLANO ATUAL: ${v.planoAtual ?? ''} CONTRATADO EM ${v.dataContrato ?? ''} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${v.roteador ?? ''}

PLANO OFERTADO: ${v.planoEscolhido ?? ''}

ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE.

SENDO ASSIM, ${primeiroContato} OPTOU PELA ALTERAÇÃO DE PLANO (EXPLIQUEI AO CLIENTE QUE DESSA FORMA SERIA REINSERIDO EM NOSSA BASE COMO UM NOVO CLIENTE) TENDO COMO BENEFÍCIO VISITA ISENTA DE CUSTOS.

${SEP}

CIENTE QUE OS BENEFÍCIOS SÃO LIBERADOS APÓS ASSINATURA DO CONTRATO.

${primeiroContato} CONCORDOU COM OS TERMOS DE ALTERAÇÃO, ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE.${autorizacaoProto}

MUDANÇA E ALTERAÇÃO DE PLANO AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.

${SEP}

COMPROVANTE DE ENDEREÇO (${comprovanteFinal}) EM ANEXO
NOME NO COMPROVANTE: ${nomeComprov} (${grauComp})${protocoloExtra}`

  const osPrefix =
    tipo === T_TERCEIRO_TITULAR || tipo === T_TERCEIRO_TERCEIRO
      ? `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO VIA ${v.canal ?? ''} (${contatoSol})`
      : `${clientePrimeiro} ENTROU EM CONTATO VIA ${v.canal ?? ''} (${contato})`
  const osPresenca =
    tipo === T_TITULAR_TERCEIRO
      ? `${clientePrimeiro} AUTORIZOU ${upper(v.autorizado)} (${parente}) A ACOMPANHAR, ASSINAR O.S E CONTRATO. CONTATO DO AUTORIZADO: (${contatoAut}).`
      : `${clientePrimeiro} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E CONTRATO.`

  const os = `${osPrefix} E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE "QUE MUDOU PARA ESTE ENDEREÇO E LEVOU OS EQUIPAMENTOS". VALOR DO SERVIÇO: R$100,00. SOLICITOU TAMBÉM A RENOVAÇÃO DO SEU CONTRATO E UPGRADE DE PLANO, PLANO ATUAL: ${v.planoAtual ?? ''}. PLANO OFERTADO: ${v.planoEscolhido ?? ''}. COM A ALTERACAO DE PLANO O SERVICO DE MUDANÇA DE ENDEREÇO FOI ISENTO, E COM ESSE BENEFICIO RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. ${osPresenca} VISITA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.
${trocaAgenda}

${SEP_OS}

INDICAÇÃO TÉCNICA:

${textoTecnico(v, troca)}`

  const agenda = `MUD END + ALT PLANO ${cliente} PROT:${v.protocolo ?? ''} ISENTO (${operadorPrimeiroNome}) - ${bairro} ${v.prumada ?? ''} // ${extendAgenda} ${trocaAgenda}`

  return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
}

export const MUD_END_ALTPLAN_PROPOSTA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: T_TITULAR,
    options: [
      { value: T_TITULAR, label: 'Titular solicita e acompanha', icon: 'user-round' },
      { value: T_TERCEIRO_TITULAR, label: 'Terceiro solicita e titular acompanha', icon: 'users-round' },
      { value: T_TERCEIRO_TERCEIRO, label: 'Terceiro solicita e terceiro acompanha', icon: 'users-round' },
      { value: T_TITULAR_TERCEIRO, label: 'Titular solicita e autoriza terceiro', icon: 'user-round' },
    ],
    layout: { md: 12 },
  },
  { id: 'cliente', label: 'Nome completo', control: 'text', placeholder: 'Nome completo', section: S_ID, layout: { md: 6 } },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    options: [{ value: 'LIGAÇÃO', label: 'Telefone' }, { value: 'WHATSAPP', label: 'WhatsApp' }],
    layout: { md: 3 },
  },
  { id: 'contato', label: 'Contato', control: 'phone', placeholder: 'Somente os números', section: S_ID, layout: { md: 3 } },
  { id: 'sinalONU', label: 'Sinal da fibra', control: 'signal', placeholder: 'Ex.: 12.34', section: S_ID, layout: { md: 3 } },
  { id: 'onuOnt', label: 'ONU/ONT', control: 'select', section: S_ID, options: ONU_ONT_OPTIONS, layout: { md: 3 } },
  {
    id: 'extend',
    label: 'Possui Wi-Fi extend?',
    control: 'radio',
    section: S_ID,
    options: [{ value: '<b>(POSSUI WI-FI EXTEND)</b> ', label: 'Possui' }, { value: '', label: 'Não possui' }],
    layout: { md: 6 },
  },
  { id: 'solicitante', label: 'Nome do terceiro solicitante', control: 'text', section: S_TERCEIRO, showWhen: { field: 'tipoSolicitacao', equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO] }, layout: { md: 5 } },
  { id: 'contatoSol', label: 'Contato do terceiro', control: 'phone', section: S_TERCEIRO, showWhen: { field: 'tipoSolicitacao', equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO] }, layout: { md: 3 } },
  { id: 'parente', label: 'Vínculo / parentesco', control: 'text', section: S_TERCEIRO, showWhen: { field: 'tipoSolicitacao', equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO] }, layout: { md: 4 } },
  { id: 'autorizado', label: 'Terceiro autorizado', control: 'text', section: S_TERCEIRO, showWhen: { field: 'tipoSolicitacao', equals: T_TITULAR_TERCEIRO }, layout: { md: 5 } },
  { id: 'contatoAut', label: 'Contato do autorizado', control: 'phone', placeholder: 'Somente os números', section: S_TERCEIRO, showWhen: { field: 'tipoSolicitacao', equals: T_TITULAR_TERCEIRO }, layout: { md: 3 } },
  { id: 'canalTit', label: 'Canal da confirmação com titular', control: 'select', section: S_TERCEIRO, showWhen: { field: 'tipoSolicitacao', equals: T_TERCEIRO_TERCEIRO }, options: [{ value: 'LIGAÇÃO', label: 'Telefone' }, { value: 'WHATSAPP', label: 'WhatsApp' }], layout: { md: 4 } },
  { id: 'dataLigacao', label: 'Data/hora da confirmação', control: 'datetime', section: S_TERCEIRO, showWhen: { field: 'tipoSolicitacao', equals: T_TERCEIRO_TERCEIRO }, layout: { md: 4 } },
  { id: 'cep', label: 'CEP', control: 'text', placeholder: 'Insira o CEP da rua', section: S_END, layout: { md: 3 } },
  { id: 'adress', label: 'Logradouro', control: 'text', placeholder: 'Preenchido pelo CEP', section: S_END, layout: { md: 7 } },
  { id: 'num', label: 'Nº', control: 'text', placeholder: 'Número', section: S_END, layout: { md: 2 } },
  { id: 'bairro', label: 'Bairro', control: 'text', placeholder: 'Preenchido pelo CEP', section: S_END, layout: { md: 5 } },
  { id: 'complemento', label: 'Complemento (cond. bl, ap)', control: 'text', section: S_END, layout: { md: 4 } },
  {
    id: 'prumada',
    label: 'Sobrado / Prumada',
    control: 'select',
    section: S_END,
    options: [
      { value: '**PRÉDIO COM PRUMADA**', label: 'Com prumada' },
      { value: '**PRÉDIO SEM PRUMADA - ENVIAR TÉCNICO DUPLADO**', label: 'Sem prumada (escolha 2 horários)' },
      { value: '**SOBRADO**', label: 'Sobrado' },
      { value: ' ', label: 'Casa ou Comércio' },
    ],
    layout: { md: 3 },
  },
  { id: 'quandoMud', label: 'Quando / observação da mudança', control: 'text', section: S_END, showWhen: { field: 'tipoSolicitacao', equals: [T_TITULAR, T_TITULAR_TERCEIRO] }, layout: { md: 12 } },
  {
    id: 'mudou',
    label: 'Situação da mudança',
    control: 'radio',
    defaultValue: 'AINDA NÃO SE MUDOU, PORÉM',
    section: S_END,
    options: [{ value: 'MUDOU DE RESIDÊNCIA E', label: 'Cliente já se mudou' }, { value: 'AINDA NÃO SE MUDOU, PORÉM', label: 'Cliente ainda vai se mudar' }],
    layout: { md: 12 },
  },
  {
    id: 'equipSituacao',
    label: 'Equipamentos (apenas se cliente já se mudou)',
    control: 'select',
    section: S_END,
    options: [
      { value: '', label: 'Não se aplica (cliente ainda vai se mudar)' },
      { value: EQUIP_LEVOU_SIM, label: 'Sem IP — já levou os equipamentos ao novo endereço' },
      { value: EQUIP_LEVOU_NAO, label: 'Sem IP — cliente levará os equipamentos posteriormente' },
      { value: EQUIP_ESQUECEU_SIM, label: 'Com IP — esqueceu no antigo endereço (orientado a levar)' },
      { value: EQUIP_ESQUECEU_NAO, label: 'Com IP — buscará os equipamentos até o dia da mudança' },
    ],
    layout: { md: 12 },
  },
  {
    id: 'comprovante',
    label: 'Comprovante',
    control: 'select',
    section: S_COMP,
    options: [
      { value: 'CEMIG', label: 'CEMIG' },
      { value: 'DMAE', label: 'DMAE' },
      { value: 'CONTRATO DE LOCAÇÃO', label: 'Contrato de Locação' },
      { value: 'CONTRATO DE HABITAÇÃO', label: 'Contrato de Habitação' },
      { value: 'OUTROS', label: 'Outros' },
    ],
    layout: { md: 3 },
  },
  { id: 'tipoComp', label: 'Informe o tipo (se “Outros”)', control: 'text', section: S_COMP, showWhen: { field: 'comprovante', equals: 'OUTROS' }, layout: { md: 3 } },
  { id: 'nomeComprov', label: 'Nome no comprovante', control: 'text', section: S_COMP, layout: { md: 3 } },
  { id: 'grauComp', label: 'Grau / vínculo', control: 'text', section: S_COMP, layout: { md: 3 } },
  { id: 'planoAtual', label: 'Plano atual', control: 'select', section: S_PLAN, options: PLANO_ATUAL_OPTIONS, layout: { md: 3 } },
  { id: 'planoEscolhido', label: 'Plano escolhido', control: 'select', section: S_PLAN, options: PLANO_ESCOLHIDO_OPTIONS, layout: { md: 6 } },
  { id: 'roteador', label: 'Roteador', control: 'select', section: S_PLAN, options: ROTEADOR_OPTIONS, layout: { md: 3 } },
  { id: 'troca', label: 'Trocar roteador?', control: 'select', section: S_PLAN, options: [{ value: TROCA_VALUE, label: 'Sim' }, { value: 'REINSTALAR', label: 'Não' }], layout: { md: 6 } },
  { id: 'dataContrato', label: 'Plano contratado em', control: 'text', placeholder: 'mês/ano', section: S_PLAN, layout: { md: 6 } },
  { id: 'dataVisita', label: 'Visita Técnica', control: 'date', placeholder: 'dd/mm/aaaa', section: S_AGE, layout: { md: 3 } },
  { id: 'horaVisita', label: 'Hora', control: 'select', section: S_AGE, options: HORA_OPTIONS, layout: { md: 3 } },
  { id: 'protocolo', label: 'Nº Protocolo', control: 'text', placeholder: '123.456', section: S_AGE, layout: { md: 3 } },
  { id: 'obs', label: 'Observações', control: 'text', placeholder: 'Observações adicionais (opcional)', section: S_AGE, layout: { md: 12 } },
]

export function getMudEndAltplanPropostaDefaults() {
  return {
    slug: 'mud-end-altplan-proposta',
    title: 'Mudança de endereço — alt plano proposta',
    outputTemplate: MUD_END_ALTPLAN_PROPOSTA_OUTPUT,
    demandCategory: 'mudanca-endereco',
    fields: MUD_END_ALTPLAN_PROPOSTA_FIELDS.map((f) => ({ ...f })),
  }
}
