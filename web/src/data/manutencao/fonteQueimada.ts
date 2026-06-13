import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Fonte queimada (equipamento queimado) — fluxo único com dois modos.
 * Paridade com legado-exemplo/suporte/equip-queimado/:
 * - fonte-queimada.html (com visita técnica): Protocolo + O.S + Agenda
 * - fonte-queimada-loja.html (retirar na loja): Protocolo + "Encaminhar no grupo LEIA"
 *
 * Observação: este fluxo tem duas formas de saída diferentes; por isso a saída é
 * composta dinamicamente (com ou sem O.S). Reproduz fielmente os separadores
 * `*`×19 e os espaçamentos/trailing spaces do legado.
 */

export const M_VISITA = 'com-visita'
export const M_LOJA = 'loja'

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES DA OCORRÊNCIA E AGENDAMENTO'

const PROC_INVERSAO =
  'ORIENTEI CLIENTE A INVERTER A FONTE DA ONU COM A DO ROTEADOR, E ASSIM EQUIPAMENTO FUNCIONOU'
const PROC_TOMADA =
  'ORIENTEI CLIENTE A CONECTAR A FONTE DE ENERGIA EM OUTRA TOMADA, E EQUIPAMENTO NÃO LIGOU'

export const FONTE_QUEIMADA_OUTPUT = '{{fonteQueimadaSaida}}'

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

export function buildFonteQueimadaTextos(
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
  const bairro = upper(v.bairro)
  const equip = v.equip
  const dataVisita = v.dataVisita
  const protocolo = v.protocolo
  const formaPag = v.formaPag

  let protocoloTxt = ''
  let os = ''
  let agenda = ''
  let agendaLabel = 'Texto da Agenda'

  if (modo === M_LOJA) {
    const proced = upper(v.proced)
    const periodo = v.periodo
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E FIBRA COM SINAL: ${sinalONU}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NÃO ESTÁ LIGANDO.`,
      sp(4),
      `REMOTAMENTE VERIFIQUEI QUE ${equip} ESTÁ DESCONECTADO. `,
      `${proced}`,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      '',
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA, E QUE DEVIDO ${cp} TER CONECTADO O EQUIPAMENTO À ENERGIA CONFORME RECOMENDAÇÃO DA MZNET, ESTARÁ ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANÇA DO DESLOCAMENTO DO TÉCNICO COM O CUSTO DE R$50,00.`,
      '',
      `SUGERI TAMBÉM, A POSSIBILIDADE DE COMPARECER À LOJA E RETIRAR UMA NOVA FONTE DE ENERGIA SEM NENHUM CUSTO ADICIONAL.`,
      '',
      SEP19,
      sp(4),
      `${cp} OPTOU POR VIR À LOJA, DISSE QUE VIRÁ NO DIA ${dataVisita} NO PERÍODO DA ${periodo}.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')
    agenda = `*${clienteUpper}*
CLIENTE VIRÁ NA LOJA RECOLHER UMA FONTE DE ${equip} SEM CUSTOS. EM  ${dataVisita} NO PERÍODO DA ${periodo}.
PROTOCOLO Nº:${protocolo}`
    agendaLabel = 'Encaminhar no grupo LEIA'
  } else {
    // M_VISITA (com visita técnica)
    const proced = v.proced
    const horaVisita = v.horaVisita
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NÃO ESTÁ LIGANDO.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${equip} ESTÁ DESCONECTADO. `,
      `${proced}.`,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO ${cp} CONECTAR O EQUIPAMENTO À ENERGIA CONFORME RECOMENDAÇÃO DA MZNET, ESTARÁ ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANÇA DO DESLOCAMENTO DO TÉCNICO COM O CUSTO DE R$50,00.`,
      sp(4),
      SEP19,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} A PARTIR DE ${horaVisita} HRS.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')
    const intro = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${equip} ESTÁ COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE ${equip} ESTÁ DESCONECTADO/APAGADA. ${proced}. PERGUNTEI ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA REALIZAR A SUBSTITUIÇÃO DA FONTE QUEIMADA POR OUTRA DE MODELO SIMILAR. VISITA TÉCNICA POSSUI O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO. ${cp} CONCORDOU E PAGARÁ NO ATO COM ${formaPag}. VISITA AGENDADA PARA ${dataVisita} A PARTIR DE ${horaVisita} HRS.`
    const tecnico = `TÉCNICO: CONFERIR EQUIPAMENTOS E PARTE ELÉTRICA. SUBSTITUIR FONTE QUEIMADA E RESTABELECER ACESSO À INTERNET. CASO HAJA EQUIPAMENTOS DANIFICADOS POR MAL USO ENTRAR EM CONTATO COM O SUPORTE DE IMEDIATO PARA TRATATIVA. TESTAR REDE WI-FI E DISPOSITIVOS LIGADOS POR CABOS, CONFERIR NAVEGAÇÃO IPv6 E AFERIR O PLANO CONTRATADO. SANAR TODAS AS DÚVIDAS DE ${cp}, COLHER ASSINATURA DA ORDEM DE SERVIÇO E RECEBER SERVIÇO.`
    os = `${intro}

${SEP42}

INDICAÇÃO TÉCNICA:

${tecnico}`
    agenda = `MAN TROCA FONTE ${clienteUpper} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`
  }

  const saida =
    modo === M_LOJA
      ? [
          '=== Texto Protocolo ===',
          protocoloTxt,
          '',
          `=== ${agendaLabel} ===`,
          agenda,
        ].join('\n')
      : [
          '=== Texto Protocolo ===',
          protocoloTxt,
          '',
          '=== Texto O.S ===',
          os,
          '',
          `=== ${agendaLabel} ===`,
          agenda,
        ].join('\n')

  return {
    fonteQueimadaTextoProtocolo: protocoloTxt,
    fonteQueimadaTextoOS: os,
    fonteQueimadaTextoAgenda: agenda,
    fonteQueimadaSaida: saida,
  }
}

const COM_VISITA = [M_VISITA]
const SO_LOJA = [M_LOJA]

export const FONTE_QUEIMADA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Modo de atendimento',
    control: 'select',
    highlight: true,
    defaultValue: M_VISITA,
    options: [
      { value: M_VISITA, label: 'Com visita técnica', icon: 'plug' },
      { value: M_LOJA, label: 'Retirar na loja', icon: 'plug' },
    ],
    layout: { md: 12 },
  },
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo do titular da conexão',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 3 },
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
    layout: { md: 3 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal atual',
    control: 'text',
    placeholder: 'Ex.: -31.87 dBm',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Insira o bairro do cliente',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: COM_VISITA },
    layout: { md: 3 },
  },
  {
    id: 'equip',
    label: 'Tipo da fonte',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'ONU', label: 'Fonte ONU' },
      { value: 'ONT', label: 'Fonte ONT' },
      { value: 'ROTEADOR', label: 'Fonte Roteador' },
    ],
  },
  {
    id: 'proced',
    label: 'Procedimento',
    control: 'select',
    section: S_DET,
    layout: { md: 8 },
    options: [
      { value: PROC_INVERSAO, label: 'Realizado inversão das fontes (ONU/Roteador)' },
      { value: PROC_TOMADA, label: 'Realizado teste em outra tomada (ONT)' },
    ],
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_VISITA },
    layout: { md: 4 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
  {
    id: 'dataVisita',
    label: 'Data da visita',
    control: 'date',
    placeholder: 'dd/mm/aaaa',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_VISITA },
    layout: { md: 4 },
    options: [
      { value: '08:30', label: '08:30' },
      { value: '09:30', label: '09:30' },
      { value: '10:30', label: '10:30' },
      { value: '11:30', label: '11:30' },
      { value: '13:30', label: '13:30' },
      { value: '14:30', label: '14:30' },
      { value: '15:30', label: '15:30' },
      { value: '16:30', label: '16:30' },
      { value: '17:30', label: '17:30' },
    ],
  },
  {
    id: 'periodo',
    label: 'Período (visita na loja)',
    control: 'select',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: SO_LOJA },
    layout: { md: 4 },
    options: [
      { value: 'MANHÃ', label: 'Manhã' },
      { value: 'TARDE', label: 'Tarde' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_DET,
    layout: { md: 4 },
  },
]

export function getManutFonteQueimadaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-fonte-queimada',
    title: 'Fonte queimada',
    demandCategory: 'manutencao',
    outputTemplate: FONTE_QUEIMADA_OUTPUT,
    fields: FONTE_QUEIMADA_FIELDS.map((f) => ({ ...f })),
  }
}
