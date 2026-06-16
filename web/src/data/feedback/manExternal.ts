import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO'
const S_OS = 'DADOS DA O.S'

const CANAL_OPTIONS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const FORMA_PAG_OPTIONS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO', label: 'Cartão' },
]

export const FEEDBACK_MAN_EXTERNAL_OUTPUT = [
  '=== Texto Feedback ===',
  '{{feedbackManExternalTexto}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function buildFeedbackManExternalTextos(
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
  const osComCustos = v.osComCustos || 'nao'
  const valorOS = v.valorOS || ''
  const formaPagamento = v.formaPagamento || ''
  const obs = v.obs?.trim() || ''

  const lines: string[] = [
    `FIZ FEEDBACK COM ${cp} POR ${canal} (${contato}) DIA ${dataHora} HORAS.`,
    'CLIENTE CONFIRMOU ACESSO NORMALIZADO APÓS REPARO TÉCNICO REALIZADO.',
  ]

  if (osComCustos === 'sim') {
    lines.push(`O.S TEVE O CUSTO DE R$${valorOS} PAGO EM ${formaPagamento}.`)
  } else {
    lines.push('O.S SEM CUSTO.')
  }

  lines.push('CLIENTE SEM DÚVIDA.')

  if (obs) {
    lines.push('', obs)
  }

  return { feedbackManExternalTexto: lines.join('\n') }
}

export const FEEDBACK_MAN_EXTERNAL_FIELDS: OsTemplateField[] = [
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
    id: 'osComCustos',
    label: 'A O.S teve custos?',
    control: 'radio',
    defaultValue: 'nao',
    highlight: true,
    section: S_OS,
    layout: { md: 12 },
    options: [
      { value: 'sim', label: 'Sim — com custos' },
      { value: 'nao', label: 'Não — sem custos' },
    ],
  },
  {
    id: 'valorOS',
    label: 'Valor da O.S (R$)',
    control: 'text',
    placeholder: '50,00',
    section: S_OS,
    layout: { md: 4 },
    showWhen: { field: 'osComCustos', equals: 'sim' },
  },
  {
    id: 'formaPagamento',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_OS,
    layout: { md: 4 },
    options: FORMA_PAG_OPTIONS,
    showWhen: { field: 'osComCustos', equals: 'sim' },
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

export function getFeedbackManExternalDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'feedback-man-externa',
    title: 'Feedback — Manutenção externa',
    demandCategory: 'feedback',
    outputTemplate: FEEDBACK_MAN_EXTERNAL_OUTPUT,
    fields: FEEDBACK_MAN_EXTERNAL_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Orientação — Manutenção externa',
      items: [
        'Confirme com o cliente que o acesso foi normalizado após o reparo técnico.',
        'Informe o custo da O.S (se houver) e a forma de pagamento utilizada.',
        'Registre qualquer observação relevante no campo "Observação".',
      ],
    },
  }
}
