import type { OsTemplateField } from '../../types/osTemplate'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from './padrao'

/**
 * MUD END — buscar equipamentos no endereco antigo.
 * Caso titular baseado em:
 * legado-exemplo/suporte/mud-end/mud-end-equip/index-mud-end-equip.html
 * legado-exemplo/suporte/mud-end/mud-end-equip/script.js
 */

const SEP_AST = '*'.repeat(15)
const SEP_AST_OS = '*'.repeat(35)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_TERCEIRO = 'DADOS DE TERCEIRO / CONFIRMAÇÃO'
const S_END = 'NOVO ENDEREÇO DO CLIENTE'
const S_AUT = 'AUTORIZADO A ENTREGAR EQUIPAMENTOS'
const S_ANTIGO = 'ENDEREÇO ANTIGO (RETIRADA DOS EQUIPAMENTOS)'
const S_AGE = 'AGENDAMENTO'

const TIPO_OPTIONS = [
  {
    value: T_TITULAR,
    label: 'Titular solicita e acompanha',
    icon: 'user-round',
  },
  {
    value: T_TERCEIRO_TITULAR,
    label: 'Terceiro solicita e titular acompanha',
    icon: 'users-round',
  },
  {
    value: T_TERCEIRO_TERCEIRO,
    label: 'Terceiro solicita e terceiro acompanha',
    icon: 'users-round',
  },
  {
    value: T_TITULAR_TERCEIRO,
    label: 'Titular solicita e autoriza terceiro',
    icon: 'user-round',
  },
]

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
  {
    value: 'ONT = ONT TP LINK 220 // CONECTOR = VERDE.',
    label: 'ONT TP LINK 220',
  },
  {
    value: 'ONT = ONT TP LINK 230 // CONECTOR = VERDE.',
    label: 'ONT TP LINK 230',
  },
  {
    value: 'ONT = ONT TP LINK 530 // CONECTOR = VERDE.',
    label: 'ONT TP LINK 530',
  },
  { value: 'ONT = ONT ZTE // CONECTOR = AZUL.', label: 'ONT ZTE (azul)' },
  { value: 'ONT = ONT ZTE // CONECTOR = VERDE.', label: 'ONT ZTE (verde)' },
]

export const MUD_END_EQUIPAMENTOS_OUTPUT = [
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

function osTecnica(v: Record<string, string>): string {
  return `REINSTALAR EQUIPAMENTOS NO LOCAL INDICADO PELO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DA CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. RECEBER R$100,00 NO ATO DA VISITA EM ${v.formaPag ?? ''}. <b>${v.onuOnt ?? ''}</b>`
}

function osBody(inicio: string, v: Record<string, string>): string {
  return `${inicio}


${SEP_AST_OS}

INDICAÇÃO TÉCNICA:

${osTecnica(v)}`
}

function protocoloBase({
  quemPrimeiro,
  canal,
  contato,
  signalLine,
  adress,
  num,
  complemento,
  cep,
  bairro,
  formaPag,
  autorizado,
  parente,
  autorizadoPrimeiro,
  contatoAut,
  dataVisita,
  horaVisita,
}: {
  quemPrimeiro: string
  canal: string
  contato: string
  signalLine: string
  adress: string
  num: string
  complemento: string
  cep: string
  bairro: string
  formaPag: string
  autorizado: string
  parente: string
  autorizadoPrimeiro: string
  contatoAut: string
  dataVisita: string
  horaVisita: string
}): string {
  return `${quemPrimeiro} ENTROU EM CONTATO POR ${canal} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ${signalLine}.
    
${SEP_AST}
    
QUESTIONADO, ${quemPrimeiro} DISSE QUE VAI SE MUDAR E DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.
    
ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${cep}
BAIRRO: ${bairro}
    
${SEP_AST}
    
INFORMEI A ${quemPrimeiro} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.
RESSALTEI QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA).
    
${quemPrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${formaPag}.

${quemPrimeiro} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizadoPrimeiro}: ${contatoAut}).    

        
MUDANÇA AGENDADA PARA DIA ${dataVisita} ${horaVisita} HRS.`
}

export function buildMudEndEquipamentosTextos(
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
  const parenteSol = upper(v.parenteSol)
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const contatoAut = digits(v.contatoAut)
  const autorizado = upper(v.autorizado)
  const autorizadoPrimeiro = first(autorizado)
  const parente = upper(v.parente)
  const adress = upper(v.adress)
  const complemento = upper(v.complemento)
  const bairro = upper(v.bairro)
  const num = digits(v.num)
  const logradouroAntigo = upper(v.logradouroAntigo)
  const bairroAntigo = upper(v.bairroAntigo)
  const equipPrefix = upper(v.onuOnt).startsWith('ONT') ? 'ONT' : 'ONU'
  const sinalSaida = formatSinalFibraSaida(v.sinalONU)
  const signalLine = `${equipPrefix} ${sinalSaida}`.trim()
  const agenda = `MUD END ${cliente} PROT:${v.protocolo ?? ''} ${v.formaPag ?? ''} (${operadorPrimeiroNome}) - ${bairro} ${v.prumada ?? ''}`

  if (tipo === T_TERCEIRO_TITULAR) {
    const protocolo = protocoloBase({
      quemPrimeiro: solicitantePrimeiro,
      canal: v.canal ?? '',
      contato: contatoSol,
      signalLine,
      adress,
      num,
      complemento,
      cep: v.cep ?? '',
      bairro,
      formaPag: v.formaPag ?? '',
      autorizado,
      parente,
      autorizadoPrimeiro,
      contatoAut,
      dataVisita: v.dataVisita ?? '',
      horaVisita: v.horaVisita ?? '',
    }) + `

POR PROCEDIMENTO PADRÃO, ENTREI EM CONTATO POR ${v.canal ?? ''} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE AUTORIZOU A SOLICITAÇÃO E CONFIRMOU QUE ESTARÁ PRESENTE NO ATO DA VISITA.`

    const os = osBody(
      `${solicitantePrimeiro} (${parenteSol} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E SOLICITOU MUDANÇA DE ENDEREÇO, RETIRAR EQUIPAMENTOS DO ENDEREÇO <b>${logradouroAntigo} - ${bairroAntigo}.</b> E INSTALAR NO ENDEREÇO DA O.S. ${clientePrimeiro} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizadoPrimeiro}: ${contatoAut}). INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag ?? ''}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal ?? ''} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU A SOLICITAÇÃO DE ${solicitantePrimeiro}. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
    )
    return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
  }

  if (tipo === T_TERCEIRO_TERCEIRO) {
    const partes = String(v.dataLigacao ?? '').trim().split(/\s+/)
    const dataLigacao = partes[0] ?? ''
    const horaLigacao = partes[1] ?? ''
    const protocolo = protocoloBase({
      quemPrimeiro: solicitantePrimeiro,
      canal: v.canal ?? '',
      contato: contatoSol,
      signalLine,
      adress,
      num,
      complemento,
      cep: v.cep ?? '',
      bairro,
      formaPag: v.formaPag ?? '',
      autorizado,
      parente,
      autorizadoPrimeiro,
      contatoAut,
      dataVisita: v.dataVisita ?? '',
      horaVisita: v.horaVisita ?? '',
    }) + `

POR PROCEDIMENTO PADRÃO, ENTREI EM CONTATO POR ${v.canalTit ?? ''} (${contato}) DIA ${dataLigacao} ÀS ${horaLigacao}HRS COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parenteSol}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.`

    const os = osBody(
      `${solicitantePrimeiro} (${parenteSol} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E SOLICITOU MUDANÇA DE ENDEREÇO, RETIRAR EQUIPAMENTOS DO ENDEREÇO <b>${logradouroAntigo} - ${bairroAntigo}.</b> E INSTALAR NO ENDEREÇO DA O.S. ${clientePrimeiro} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizadoPrimeiro}: ${contatoAut}). INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag ?? ''}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canalTit ?? ''} (${contato}) DIA ${dataLigacao} ${horaLigacao}HRS COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parenteSol}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
    )
    return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    const protocolo = protocoloBase({
      quemPrimeiro: clientePrimeiro,
      canal: v.canal ?? '',
      contato,
      signalLine,
      adress,
      num,
      complemento,
      cep: v.cep ?? '',
      bairro,
      formaPag: v.formaPag ?? '',
      autorizado,
      parente,
      autorizadoPrimeiro,
      contatoAut,
      dataVisita: v.dataVisita ?? '',
      horaVisita: v.horaVisita ?? '',
    }) + `

${clientePrimeiro} DISSE QUE ${autorizado} (${parente}) TAMBÉM ESTARÁ PRESENTE NO NOVO ENDEREÇO PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.`

    const os = osBody(
      `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E SOLICITOU MUDANÇA DE ENDEREÇO, RETIRAR EQUIPAMENTOS DO ENDEREÇO <b>${logradouroAntigo} - ${bairroAntigo}.</b> E INSTALAR NO ENDEREÇO DA O.S. ${clientePrimeiro} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizadoPrimeiro}: ${contatoAut}). INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag ?? ''}. ${clientePrimeiro} DISSE QUE ${autorizado} (${parente}) ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
    )
    return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
  }

  const protocolo = protocoloBase({
    quemPrimeiro: clientePrimeiro,
    canal: v.canal ?? '',
    contato,
    signalLine,
    adress,
    num,
    complemento,
    cep: v.cep ?? '',
    bairro,
    formaPag: v.formaPag ?? '',
    autorizado,
    parente,
    autorizadoPrimeiro,
    contatoAut,
    dataVisita: v.dataVisita ?? '',
    horaVisita: v.horaVisita ?? '',
  })

  const os = osBody(
    `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E SOLICITOU MUDANÇA DE ENDEREÇO, RETIRAR EQUIPAMENTOS DO ENDEREÇO <b>${logradouroAntigo} - ${bairroAntigo}.</b> E INSTALAR NO ENDEREÇO DA O.S. ${clientePrimeiro} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizadoPrimeiro}: ${contatoAut}). INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag ?? ''}. ${clientePrimeiro} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
    v,
  )
  return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
}

export const MUD_END_EQUIPAMENTOS_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: T_TITULAR,
    options: TIPO_OPTIONS,
    layout: { md: 12 },
  },
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
    layout: { md: 3 },
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal da fibra',
    control: 'signal',
    placeholder: 'Ex.: 12.34 (sai -12.34DBM)',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'onuOnt',
    label: 'ONU/ONT',
    control: 'select',
    section: S_ID,
    options: ONU_ONT_OPTIONS,
    layout: { md: 3 },
  },
  {
    id: 'solicitante',
    label: 'Nome do terceiro solicitante',
    control: 'text',
    placeholder: 'Nome completo de quem entrou em contato',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO],
    },
    layout: { md: 5 },
  },
  {
    id: 'contatoSol',
    label: 'Contato do terceiro',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO],
    },
    layout: { md: 3 },
  },
  {
    id: 'parenteSol',
    label: 'Vínculo do terceiro solicitante',
    control: 'text',
    placeholder: 'MÃE, IRMÃO, LOCATÁRIO, ETC...',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO],
    },
    layout: { md: 4 },
  },
  {
    id: 'canalTit',
    label: 'Canal da confirmação com titular',
    control: 'select',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: T_TERCEIRO_TERCEIRO },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
    layout: { md: 4 },
  },
  {
    id: 'dataLigacao',
    label: 'Data/hora da confirmação',
    control: 'datetime',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: T_TERCEIRO_TERCEIRO },
    layout: { md: 4 },
  },
  {
    id: 'cep',
    label: 'CEP',
    control: 'text',
    placeholder: 'Insira o CEP da rua',
    section: S_END,
    layout: { md: 3 },
  },
  {
    id: 'adress',
    label: 'Logradouro',
    control: 'text',
    placeholder: 'Preenchido pelo CEP',
    section: S_END,
    layout: { md: 7 },
  },
  {
    id: 'num',
    label: 'Nº',
    control: 'text',
    placeholder: 'Número',
    section: S_END,
    layout: { md: 2 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Preenchido pelo CEP',
    section: S_END,
    layout: { md: 5 },
  },
  {
    id: 'complemento',
    label: 'Complemento (cond. bl, ap)',
    control: 'text',
    placeholder: 'Casa frente, fundos, sobrado, cond. etc',
    section: S_END,
    layout: { md: 4 },
  },
  {
    id: 'prumada',
    label: 'Sobrado / Prumada',
    control: 'select',
    section: S_END,
    options: [
      { value: '**PRÉDIO COM PRUMADA**', label: 'Com prumada' },
      {
        value: '**PRÉDIO SEM PRUMADA - ENVIAR TÉCNICO DUPLADO**',
        label: 'Sem prumada (escolha 2 horários)',
      },
      { value: '**SOBRADO**', label: 'Sobrado' },
      { value: ' ', label: 'Casa ou Comércio' },
    ],
    layout: { md: 3 },
  },
  {
    id: 'autorizado',
    label: 'Nome do autorizado',
    control: 'text',
    placeholder: 'Quem entregará os equipamentos no endereço antigo',
    section: S_AUT,
    layout: { md: 5 },
  },
  {
    id: 'parente',
    label: 'Grau parentesco',
    control: 'text',
    placeholder: 'MÃE, IRMÃO, ESPOSA...',
    section: S_AUT,
    layout: { md: 3 },
  },
  {
    id: 'contatoAut',
    label: 'Contato do autorizado',
    control: 'phone',
    placeholder: 'Somente números',
    section: S_AUT,
    layout: { md: 4 },
  },
  {
    id: 'logradouroAntigo',
    label: 'Antigo endereço (Rua e Nº)',
    control: 'text',
    placeholder: 'Insira o antigo endereço do cliente',
    section: S_ANTIGO,
    layout: { md: 8 },
  },
  {
    id: 'bairroAntigo',
    label: 'Bairro antigo',
    control: 'text',
    placeholder: 'Insira o antigo bairro do cliente',
    section: S_ANTIGO,
    layout: { md: 4 },
  },
  {
    id: 'dataVisita',
    label: 'Visita Técnica',
    control: 'date',
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 3 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_AGE,
    options: HORA_OPTIONS,
    layout: { md: 3 },
  },
  {
    id: 'formaPag',
    label: 'Pagamento',
    control: 'select',
    section: S_AGE,
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
    layout: { md: 3 },
  },
  {
    id: 'protocolo',
    label: 'Nº Protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    layout: { md: 3 },
  },
  {
    id: 'obs',
    label: 'Observações',
    control: 'text',
    placeholder: 'Observações adicionais (opcional)',
    section: S_AGE,
    layout: { md: 12 },
  },
]

export function getMudEndEquipamentosDefaults() {
  return {
    slug: 'mud-end-buscar-equipamentos',
    title: 'Mudança de endereço — buscar equipamentos',
    outputTemplate: MUD_END_EQUIPAMENTOS_OUTPUT,
    demandCategory: 'mudanca-endereco',
    fields: MUD_END_EQUIPAMENTOS_FIELDS.map((f) => ({ ...f })),
  }
}
