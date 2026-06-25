import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO'
const S_INST = 'INSTALAÇÃO'
const S_OS = 'DADOS DA O.S'

const CANAL_OPTIONS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const STB_ROKU_OPTIONS = [
  { value: 'STB', label: 'STB (Set-top box)' },
  { value: 'ROKU TV', label: 'Roku TV' },
]

const WIFI_CABO_OPTIONS = [
  { value: 'WI-FI', label: 'Wi-Fi' },
  { value: 'CABO DE REDE', label: 'Cabo de rede' },
]

const ENERGIA_OPTIONS = [
  { value: 'NA RÉGUA', label: 'Régua' },
  { value: 'NO ESTABILIZADOR', label: 'Estabilizador' },
  { value: 'NO NOBREAK', label: 'Nobreak' },
  { value: 'EM TOMADA INDIVIDUAL', label: 'Tomada individual' },
]

const FORMA_PAG_OPTIONS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO', label: 'Cartão' },
]

export const FEEDBACK_STB_ROKU_OUTPUT = [
  '=== Texto Feedback ===',
  '{{feedbackStbRokuTexto}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function buildFeedbackStbRokuTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const clienteUpper = upper(v.cliente)
  const cp = first(clienteUpper)
  const canal = v.canal || ''
  const contato = v.contato.replace(/\D/g, '')
  const dataHora = v.dataHora || ''
  const stbRoku = v.stbRoku || 'STB'
  const wifiCabo = v.wifiCabo || ''
  const energia = v.energia || ''
  const appMztv = v.appMztv || 'nao'
  const valorOS = v.valorOS || ''
  const formaPagamento = v.formaPagamento || ''
  const obs = v.obs?.trim() || ''

  const lines: string[] = [
    `FIZ FEEDBACK COM ${cp} POR ${canal} (${contato}) DIA ${dataHora} HRS.`,
    `${cp} CONFIRMOU INSTALAÇÃO E CONFIGURAÇÃO DO APARELHO ${stbRoku}.`,
    `APARELHO CONECTADO VIA ${wifiCabo}.`,
    `${stbRoku} LIGADO ${energia}.`,
  ]

  if (appMztv === 'sim') {
    lines.push(`APP MZTV INSTALADO E CONFIGURADO NO APARELHO ${stbRoku}.`)
  }

  lines.push(
    `O.S COM CUSTO DE R$ ${valorOS} QUE FOI PAGO EM ${formaPagamento}.`,
    'CLIENTE SEM DUVIDAS',
  )

  if (obs) {
    lines.push('', `OBS: ${obs}`)
  }

  return { feedbackStbRokuTexto: lines.join('\n') }
}

export const FEEDBACK_STB_ROKU_FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome do cliente',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
    options: CANAL_OPTIONS,
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
    id: 'dataHora',
    label: 'Data e hora do feedback',
    control: 'datetime',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'stbRoku',
    label: 'Tipo de aparelho',
    control: 'select',
    highlight: true,
    section: S_INST,
    layout: { md: 4 },
    options: STB_ROKU_OPTIONS,
  },
  {
    id: 'wifiCabo',
    label: 'Conexão do aparelho',
    control: 'select',
    section: S_INST,
    layout: { md: 4 },
    options: WIFI_CABO_OPTIONS,
  },
  {
    id: 'energia',
    label: 'Aparelho ligado',
    control: 'select',
    section: S_INST,
    layout: { md: 4 },
    options: ENERGIA_OPTIONS,
  },
  {
    id: 'appMztv',
    label: 'App MZTV instalado?',
    control: 'radio',
    defaultValue: 'nao',
    section: S_INST,
    layout: { md: 12 },
    options: [
      { value: 'sim', label: 'Sim — instalado e configurado' },
      { value: 'nao', label: 'Não se aplica' },
    ],
  },
  {
    id: 'valorOS',
    label: 'Valor da O.S (R$)',
    control: 'text',
    placeholder: '80,00',
    section: S_OS,
    layout: { md: 4 },
  },
  {
    id: 'formaPagamento',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_OS,
    layout: { md: 4 },
    options: FORMA_PAG_OPTIONS,
  },
  {
    id: 'obs',
    label: 'Observação',
    control: 'textarea',
    placeholder: 'Informações adicionais (opcional)',
    section: S_OS,
    layout: { md: 12 },
  },
]

export function getFeedbackStbRokuDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'feedback-stb-roku',
    title: 'Feedback — STB / Roku TV',
    demandCategory: 'feedback',
    outputTemplate: FEEDBACK_STB_ROKU_OUTPUT,
    fields: FEEDBACK_STB_ROKU_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Orientação — Instalação de STB / Roku TV',
      items: [
        'Confirme o tipo de aparelho instalado: STB (set-top box) ou Roku TV.',
        'Verifique o tipo de conexão (Wi-Fi ou cabo de rede) e a tomada de energia.',
        'Informe se o app MZTV foi instalado e configurado.',
      ],
    },
  }
}
