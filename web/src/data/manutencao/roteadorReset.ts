import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Roteador resetado — fluxo com duas saídas legadas:
 * - index-roteador-reset.html: Protocolo + O.S + Agenda (visita técnica paga)
 * - rot-reset-loja/rot-reset-loja.html: apenas Protocolo (cliente traz na loja)
 *
 * Reproduz os separadores `*`×19/42 e os espaçamentos/trailing spaces do legado.
 */

export const M_VISITA = 'visita'
export const M_LOJA = 'loja'

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES DA CONEXÃO'
const S_AGE = 'AGENDAMENTO'

export const ROTEADOR_RESET_OUTPUT = '{{roteadorResetSaida}}'

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

function sp(n: number): string {
  return ' '.repeat(n)
}

export function buildRoteadorResetTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const modo = v.tipoSolicitacao || M_VISITA
  const clienteUpper = upper(v.cliente)
  const cp = first(clienteUpper)
  const canal = v.canal
  const contato = digits(v.contato)
  const sinalONU = upper(v.sinalONU)
  const oscila = v.oscila
  const roteador = v.roteador

  let protocoloTxt = ''
  let os = ''
  let agenda = ''

  if (modo === M_LOJA) {
    const [dataLigacao = '', horaLigacao = ''] = v.dataLigacao.split(' ')
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU} ${oscila}.`,
      '',
      SEP19,
      sp(4),
      `QUESTIONADO ${cp} DISSE QUE ESTÁ SEM CONEXÃO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NÃO ESTÁ APARECENDO MAIS.`,
      sp(4),
      `REMOTAMENTE, VERIFIQUEI QUE ONU ESTÁ ACESA (SINAL ${sinalONU}) ${oscila} E ROTEADOR (${roteador}) ESTÁ INACESSÍVEL. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${cp} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APÓS 30 SEGUNDOS. FEZ PORÉM REDE WI-FI NÃO VOLTOU A APARECER. `,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE O ROTEADOR ESTÁ RESETADO, E REPASSEI AO CLIENTE 2 OPÇÕES PARA SOLUÇÃO DO PROBLEMA.`,
      '',
      `1ª. AGENDAMENTO DE UMA VISITA TÉCNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,0 REFERENTE O DESLOCAMENTO TÉCNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`,
      '',
      `2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURÁ-LO. ESTA OPÇÃO NÃO TERÁ CUSTOS`,
      SEP19,
      sp(4),
      `${cp} OPTOU POR TRAZER O ROTEADOR NA LOJA EM ${dataLigacao} ÀS ${horaLigacao}.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')
  } else {
    const bairro = upper(v.bairro)
    const dataVisita = v.dataVisita
    const horaVisita = v.horaVisita
    const protocolo = v.protocolo
    const formaPag = v.formaPag

    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      '',
      SEP19,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU} ${oscila}.`,
      '',
      SEP19,
      sp(4),
      `QUESTIONADO ${cp} DISSE QUE ESTÁ SEM CONEXÃO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NÃO ESTÁ APARECENDO MAIS.`,
      sp(4),
      `REMOTAMENTE, VERIFIQUEI QUE ONU ESTÁ ACESA (SINAL ${sinalONU}) ${oscila} E ROTEADOR (${roteador}) ESTÁ INACESSÍVEL. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${cp} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APÓS 30 SEGUNDOS. FEZ PORÉM REDE WI-FI NÃO VOLTOU A APARECER. `,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE O ROTEADOR ESTÁ RESETADO, E REPASSEI AO CLIENTE 2 OPÇÕES PARA SOLUÇÃO DO PROBLEMA.`,
      '',
      `1ª. AGENDAMENTO DE UMA VISITA TÉCNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE O DESLOCAMENTO TÉCNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`,
      '',
      `2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURÁ-LO. ESTA OPÇÃO NÃO TERÁ CUSTOS`,
      SEP19,
      sp(4),
      `${cp} OPTOU PELA VISITA TÉCNICA, CONCORDOU COM OS TERMOS REPASSADOS E SOLICITOU PAGAR EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')

    const intro = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E INFORMOU QUE ESTÁ SEM CONEXÃO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE SUA REDE WIFI NÃO ESTÁ APARECENDO MAIS. REMOTAMENTE, VERIFIQUEI QUE ONU ESTÁ ACESA (SINAL ${sinalONU}) ${oscila} E ROTEADOR (${roteador}) ESTÁ INACESSÍVEL. ORIENTEI ${cp} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APÓS 30 SEGUNDOS. FEZ PORÉM REDE WI-FI NÃO VOLTOU A APARECER. INFORMEI QUE ROTEADOR ESTÁ RESETADO, É NECESSÁRIA VISITA TÉCNICA PARA RECONFIGURÁ-LO, QUE ESTE SERVIÇO POSSUI CUSTO R$50,00. ${cp} CONCORDOU E SOLICITOU PAGAR NO ATO EM ${formaPag}. VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    const tecnico = `TÉCNICO: ANALISAR ESTRUTURA INTERNA CONFERIR EQUIPAMENTOS SE DANIFICADOS, ANALISAR FONTE E ROTEADOR. CONFIGURAR EQUIPAMENTO, RESTABELECER CONEXÃO E REALIZAR OS DEVIDOS TESTES, FILMAR, FOTOGRAFAR E APRESENTAR A ${cp}. EXPLICAR SOBRE REDE 2 E 5GHZ, E SUAS ABRANGÊNCIAS.  ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 40 MIN.`
    os = `${intro}

${SEP42}

INDICAÇÃO TÉCNICA:

${tecnico}`

    agenda = `MAN ROTEADOR RESETADO ${clienteUpper} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`
  }

  const saida =
    modo === M_LOJA
      ? ['=== Texto Protocolo ===', protocoloTxt].join('\n')
      : [
          '=== Texto Protocolo ===',
          protocoloTxt,
          '',
          '=== Texto O.S ===',
          os,
          '',
          '=== Texto da Agenda ===',
          agenda,
        ].join('\n')

  return {
    roteadorResetTextoProtocolo: protocoloTxt,
    roteadorResetTextoOS: os,
    roteadorResetTextoAgenda: agenda,
    roteadorResetSaida: saida,
  }
}

const COM_VISITA = [M_VISITA]
const SO_LOJA = [M_LOJA]

const ROTEADOR_OPTIONS = [
  'MULTILASER',
  'TP-LINK 840',
  'TP LINK C-20',
  'D-LINK DIR 842',
  'TP LINK C-5',
  'TP LINK G-5',
  'GREATEK',
  'INTELBRAS',
  'HUAWEI AX2',
  'ZTE H196-MESH',
  'ZTE H199-A',
  'ONT ZTE F 670-L',
  'ONT TP-LINK XC220',
  'ONT TP-LINK XC230',
].map((r) => ({ value: r, label: r }))

export const ROTEADOR_RESET_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Modo de atendimento',
    control: 'select',
    highlight: true,
    defaultValue: M_VISITA,
    options: [
      { value: M_VISITA, label: 'Visita técnica', icon: 'router' },
      { value: M_LOJA, label: 'Trazer roteador na loja', icon: 'router' },
    ],
    layout: { md: 12 },
  },
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo do titular da conexão',
    section: S_ID,
    layout: { md: 12 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Insira o bairro do cliente',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: COM_VISITA },
    layout: { md: 4 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-19.20 DBM ou SEM SINAL',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'oscila',
    label: 'Oscilação',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'COM OSCILAÇÃO', label: 'Sim' },
      { value: 'SEM OSCILAÇÃO', label: 'Não' },
    ],
  },
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: ROTEADOR_OPTIONS,
  },
  {
    id: 'dataLigacao',
    label: 'Quando o cliente virá à loja?',
    control: 'datetime',
    placeholder: 'dd/mm/aaaa hh:mm',
    section: S_AGE,
    showWhen: { field: 'tipoSolicitacao', equals: SO_LOJA },
    layout: { md: 4 },
  },
  {
    id: 'formaPag',
    label: 'Pagamento',
    control: 'select',
    section: S_AGE,
    showWhen: { field: 'tipoSolicitacao', equals: COM_VISITA },
    layout: { md: 3 },
    options: [
      { value: 'CARTÃO', label: 'Cartão' },
      { value: 'DINHEIRO', label: 'Dinheiro' },
      { value: 'PIX', label: 'Pix' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    showWhen: { field: 'tipoSolicitacao', equals: COM_VISITA },
    layout: { md: 3 },
  },
]

export function getManutRoteadorResetDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-roteador-reset',
    title: 'Roteador resetado',
    demandCategory: 'manutencao',
    outputTemplate: ROTEADOR_RESET_OUTPUT,
    fields: ROTEADOR_RESET_FIELDS.map((f) => ({ ...f })),
  }
}
