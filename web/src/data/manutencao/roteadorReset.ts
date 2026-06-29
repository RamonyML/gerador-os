import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Roteador resetado — três modos de resolução:
 * - visita:  Protocolo + O.S + Agenda (visita técnica paga)
 * - loja:    apenas Protocolo (cliente traz na loja)
 * - remoto:  apenas Protocolo (operador orienta o cliente remotamente)
 */

export const M_VISITA = 'visita'
export const M_LOJA   = 'loja'
export const M_REMOTO = 'remoto'

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)

const S_ID  = 'IDENTIFICACAO DO CLIENTE'
const S_DET = 'DETALHES DA CONEXAO'
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

  const modo       = v.tipoSolicitacao || M_VISITA
  const clienteUpper = upper(v.cliente)
  const cp         = first(clienteUpper)
  const canal      = v.canal
  const contato    = digits(v.contato)
  const sinalONU   = upper(v.sinalONU)
  const oscila     = v.oscila
  const roteador   = v.roteador

  let protocoloTxt = ''
  let os = ''
  let agenda = ''

  if (modo === M_LOJA) {
    const [dataLigacao = '', horaLigacao = ''] = v.dataLigacao.split(' ')
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU} ${oscila}.`,
      '',
      SEP19,
      sp(4),
      `QUESTIONADO ${cp} DISSE QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NAO ESTA APARECENDO MAIS.`,
      sp(4),
      `REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${sinalONU}) ${oscila} E ROTEADOR (${roteador}) ESTA INACESSIVEL. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${cp} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. `,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE O ROTEADOR ESTA RESETADO, E REPASSEI AO CLIENTE 2 OPCOES PARA SOLUCAO DO PROBLEMA.`,
      '',
      `1ª. AGENDAMENTO DE UMA VISITA TECNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,0 REFERENTE O DESLOCAMENTO TECNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTAO.`,
      '',
      `2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURA-LO. ESTA OPCAO NAO TERA CUSTOS`,
      SEP19,
      sp(4),
      `${cp} OPTOU POR TRAZER O ROTEADOR NA LOJA EM ${dataLigacao} AS ${horaLigacao}.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')

  } else if (modo === M_REMOTO) {
    const ssid      = v.ssid?.trim() ?? ''
    const senhaWifi = v.senhaWifi?.trim() ?? ''
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU} ${oscila}.`,
      '',
      SEP19,
      sp(4),
      `QUESTIONADO ${cp} DISSE QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NAO ESTA APARECENDO MAIS.`,
      sp(4),
      `REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${sinalONU}) ${oscila} E ROTEADOR (${roteador}) ESTA INACESSIVEL. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${cp} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. `,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI ${cp} QUE O ROTEADOR ESTA RESETADO E ORIENTEI O MESMO A REALIZAR O PROCESSO DE RECONFIGURACAO REMOTA CONFORME TUTORIAL DA MZNET. ${cp} SEGUIU AS ORIENTACOES, CONFIGUROU O ROTEADOR E CONFIRMOU QUE A REDE WI-FI VOLTOU NORMALMENTE.`,
      '',
      `SSID: ${ssid}`,
      `SENHA: ${senhaWifi}`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')

  } else {
    // M_VISITA
    const bairro    = upper(v.bairro)
    const dataVisita = v.dataVisita
    const horaVisita = v.horaVisita
    const protocolo  = v.protocolo
    const formaPag   = v.formaPag

    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      '',
      SEP19,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU} ${oscila}.`,
      '',
      SEP19,
      sp(4),
      `QUESTIONADO ${cp} DISSE QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NAO ESTA APARECENDO MAIS.`,
      sp(4),
      `REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${sinalONU}) ${oscila} E ROTEADOR (${roteador}) ESTA INACESSIVEL. `,
      sp(4),
      SEP19,
      sp(4),
      `ORIENTEI ${cp} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. `,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE O ROTEADOR ESTA RESETADO, E REPASSEI AO CLIENTE 2 OPCOES PARA SOLUCAO DO PROBLEMA.`,
      '',
      `1ª. AGENDAMENTO DE UMA VISITA TECNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE O DESLOCAMENTO TECNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTAO.`,
      '',
      `2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURA-LO. ESTA OPCAO NAO TERA CUSTOS`,
      SEP19,
      sp(4),
      `${cp} OPTOU PELA VISITA TECNICA, CONCORDOU COM OS TERMOS REPASSADOS E SOLICITOU PAGAR EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')

    const intro = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E INFORMOU QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE SUA REDE WIFI NAO ESTA APARECENDO MAIS. REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${sinalONU}) ${oscila} E ROTEADOR (${roteador}) ESTA INACESSIVEL. ORIENTEI ${cp} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. INFORMEI QUE ROTEADOR ESTA RESETADO, E NECESSARIA VISITA TECNICA PARA RECONFIGURA-LO, QUE ESTE SERVICO POSSUI CUSTO R$50,00. ${cp} CONCORDOU E SOLICITOU PAGAR NO ATO EM ${formaPag}. VISITA AGENDADA PARA ${dataVisita} AS ${horaVisita} HRS.`
    const tecnico = `TECNICO: ANALISAR ESTRUTURA INTERNA CONFERIR EQUIPAMENTOS SE DANIFICADOS, ANALISAR FONTE E ROTEADOR. CONFIGURAR EQUIPAMENTO, RESTABELECER CONEXAO E REALIZAR OS DEVIDOS TESTES, FILMAR, FOTOGRAFAR E APRESENTAR A ${cp}. EXPLICAR SOBRE REDE 2 E 5GHZ, E SUAS ABRANGENCIAS.  ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 40 MIN.`
    os = `${intro}

${SEP42}

INDICACAO TECNICA:

${tecnico}`

    agenda = `MAN ROTEADOR RESETADO ${clienteUpper} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`
  }

  const saida =
    modo === M_LOJA || modo === M_REMOTO
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
const SO_LOJA    = [M_LOJA]
const SO_REMOTO  = [M_REMOTO]

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
      { value: M_VISITA, label: 'Visita tecnica',           icon: 'router' },
      { value: M_LOJA,   label: 'Trazer roteador na loja',  icon: 'router' },
      { value: M_REMOTO, label: 'Orientação remota',        icon: 'router' },
    ],
    layout: { md: 12 },
  },
  {
    id: 'cpf',
    label: 'CPF / CNPJ',
    control: 'text',
    placeholder: 'Somente numeros',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo do titular da conexao',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
    options: [
      { value: 'LIGACAO',   label: 'Telefone' },
      { value: 'WHATSAPP',  label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os numeros',
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
    label: 'Oscilacao',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'COM OSCILACAO', label: 'Sim' },
      { value: 'SEM OSCILACAO', label: 'Nao' },
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
    id: 'ssid',
    label: 'SSID (nome da rede)',
    control: 'text',
    placeholder: 'Ex: MinhaRede_2G',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: SO_REMOTO },
    layout: { md: 4 },
  },
  {
    id: 'senhaWifi',
    label: 'Senha Wi-Fi',
    control: 'text',
    placeholder: 'Ex: senha123',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: SO_REMOTO },
    layout: { md: 4 },
  },
  {
    id: 'dataLigacao',
    label: 'Quando o cliente vira a loja?',
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
      { value: 'CARTAO',   label: 'Cartao' },
      { value: 'DINHEIRO', label: 'Dinheiro' },
      { value: 'PIX',      label: 'Pix' },
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

export function buildRoteadorResetSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const modo     = v.tipoSolicitacao || M_VISITA
  const cp       = first(upper(v.cliente))
  const canal    = upper(v.canal)
  const contato  = digits(v.contato)
  const sinalONU = upper(v.sinalONU)
  const oscila   = upper(v.oscila)
  const roteador = upper(v.roteador)

  const info = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`

  const sharedCards = [
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU} ${oscila}.`,
    `QUESTIONADO ${cp} DISSE QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NAO ESTA APARECENDO MAIS.`,
    `REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${sinalONU}) ${oscila} E ROTEADOR (${roteador}) ESTA INACESSIVEL.`,
    `ORIENTEI ${cp} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER.`,
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
  ]

  if (modo === M_REMOTO) {
    const ssid      = v.ssid?.trim() ?? ''
    const senhaWifi = v.senhaWifi?.trim() ?? ''
    return {
      info,
      comentarios: [
        ...sharedCards,
        `INFORMEI ${cp} QUE O ROTEADOR ESTA RESETADO E ORIENTEI O MESMO A REALIZAR O PROCESSO DE RECONFIGURACAO REMOTA CONFORME TUTORIAL DA MZNET.`,
        `${cp} SEGUIU AS ORIENTACOES, CONFIGUROU O ROTEADOR E CONFIRMOU QUE A REDE WI-FI VOLTOU NORMALMENTE.\n\nSSID: ${ssid}\nSENHA: ${senhaWifi}\n\nCLIENTE SEM DUVIDAS.`,
      ],
    }
  }

  const twoOptions = [
    `INFORMEI QUE O ROTEADOR ESTA RESETADO, E REPASSEI AO CLIENTE 2 OPCOES PARA SOLUCAO DO PROBLEMA.`,
    `1ª. AGENDAMENTO DE UMA VISITA TECNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE O DESLOCAMENTO TECNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTAO.`,
    `2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURA-LO. ESTA OPCAO NAO TERA CUSTOS.`,
  ]

  if (modo === M_LOJA) {
    const [dataLoja = '', horaLoja = ''] = v.dataLigacao.split(' ')
    return {
      info,
      comentarios: [
        ...sharedCards,
        ...twoOptions,
        `${cp} OPTOU POR TRAZER O ROTEADOR NA LOJA EM ${dataLoja} AS ${horaLoja}.\n\nCLIENTE SEM DUVIDAS.`,
      ],
    }
  }

  // M_VISITA
  const formaPag = upper(v.formaPag)
  const dataV    = v.dataVisita || 'XX/XX/XXXX'
  const horaV    = v.horaVisita || 'XX:XX'

  return {
    info,
    comentarios: [
      ...sharedCards,
      ...twoOptions,
      `${cp} OPTOU PELA VISITA TECNICA, CONCORDOU COM OS TERMOS REPASSADOS E SOLICITOU PAGAR EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
    ],
  }
}

export function getManutRoteadorResetDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-roteador-reset',
    title: 'Roteador resetado',
    demandCategory: 'manutencao',
    outputTemplate: ROTEADOR_RESET_OUTPUT,
    fields: ROTEADOR_RESET_FIELDS.map((f) => ({ ...f })),
  }
}
