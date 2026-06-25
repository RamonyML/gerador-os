import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO'
const S_LOCAL = 'LOCAIS'
const S_TESTES = 'TESTES'
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

export const FEEDBACK_MUDANCA_PONTO_OUTPUT = [
  '=== Texto Feedback ===',
  '{{feedbackMudancaPontoTexto}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function buildFeedbackMudancaPontoTextos(
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
  const comodoAnterior = upper(v.comodoAnterior)
  const comodoAtual = upper(v.comodoAtual)
  const dispensouTestes = v.dispensouTestes || 'nao'
  const aparelho = upper(v.aparelho)
  const marcaModelo = upper(v.marcaModelo)
  const velocidadeCliente = v.velocidadeCliente || ''
  const velocidadeCabo = v.velocidadeCabo || ''
  const velocidadeWifi = v.velocidadeWifi || ''
  const valorOS = v.valorOS || ''
  const formaPagamento = v.formaPagamento || ''

  const lines: string[] = [
    `FIZ FEEDBACK COM ${cp} POR ${canal} (${contato}) DIA ${dataHora} HRS.`,
    'CLIENTE CONFIRMOU MUDANÇA DE PONTO INTERNO, CONFIRMOU QUE NO LOCAL INSTALADO FICOU DE SEU AGRADO.',
    `EQUIPAMENTO DESINSTALADO DE: ${comodoAnterior}`,
    `REINSTALADO EM: ${comodoAtual}`,
    'CONFIRMOU QUE APÓS A TROCA FOI FEITO TODOS OS TESTES DE FUNCIONAMENTO DA INTERNET, TESTE DE ABRANGÊNCIA E AFERIÇÃO NOS APARELHOS DO TECNICO E EM SEUS PESSOAIS.',
  ]

  if (dispensouTestes === 'sim') {
    lines.push('CLIENTE DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.')
  } else {
    lines.push(
      `APARELHO TESTADO: ${aparelho} ${marcaModelo} AFERIU ${velocidadeCliente}MBPS. NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU ${velocidadeCabo}MBPS E ${velocidadeWifi}MBPS VIA WI-FI NA REDE 5G.`,
    )
  }

  lines.push(
    'EQUIPAMENTOS LIGADOS EM TOMADAS INDIVIDUAIS',
    `O.S COM CUSTO DE R$ ${valorOS} PAGO NO ${formaPagamento}.`,
    'CLIENTE SEM DUVIDAS.',
  )

  return { feedbackMudancaPontoTexto: lines.join('\n') }
}

export function buildFeedbackMudancaPontoSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  const { feedbackMudancaPontoTexto } = buildFeedbackMudancaPontoTextos(rawValues)
  return { info: feedbackMudancaPontoTexto, comentarios: [] }
}

export const FEEDBACK_MUDANCA_PONTO_FIELDS: OsTemplateField[] = [
  {
    id: 'cpf',
    label: 'CPF / CNPJ',
    control: 'text',
    placeholder: 'Somente números',
    section: S_ID,
    layout: { md: 5 },
  },
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
    id: 'comodoAnterior',
    label: 'Cômodo anterior (onde estava)',
    control: 'text',
    placeholder: 'Ex.: SALA, QUARTO',
    section: S_LOCAL,
    layout: { md: 6 },
  },
  {
    id: 'comodoAtual',
    label: 'Cômodo atual (onde foi reinstalado)',
    control: 'text',
    placeholder: 'Ex.: QUARTO, ESCRITÓRIO',
    section: S_LOCAL,
    layout: { md: 6 },
  },
  {
    id: 'dispensouTestes',
    label: 'Cliente dispensou testes?',
    control: 'radio',
    defaultValue: 'nao',
    highlight: true,
    section: S_TESTES,
    layout: { md: 12 },
    options: [
      { value: 'nao', label: 'Não — testes realizados' },
      { value: 'sim', label: 'Sim — dispensou os testes' },
    ],
  },
  {
    id: 'aparelho',
    label: 'Aparelho testado',
    control: 'text',
    placeholder: 'Ex.: CELULAR, NOTEBOOK',
    section: S_TESTES,
    layout: { md: 4 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  {
    id: 'marcaModelo',
    label: 'Marca / Modelo',
    control: 'text',
    placeholder: 'Ex.: SAMSUNG A54',
    section: S_TESTES,
    layout: { md: 4 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  {
    id: 'velocidadeCliente',
    label: 'Velocidade cliente (Mbps)',
    control: 'text',
    placeholder: 'Ex.: 150',
    section: S_TESTES,
    layout: { md: 4 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  {
    id: 'velocidadeCabo',
    label: 'Técnico via cabo (Mbps)',
    control: 'text',
    placeholder: 'Ex.: 200',
    section: S_TESTES,
    layout: { md: 4 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  {
    id: 'velocidadeWifi',
    label: 'Técnico Wi-Fi 5G (Mbps)',
    control: 'text',
    placeholder: 'Ex.: 180',
    section: S_TESTES,
    layout: { md: 4 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
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
]

export function getFeedbackMudancaPontoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'feedback-mudanca-ponto',
    title: 'Feedback — Mudança de ponto interno',
    demandCategory: 'feedback',
    outputTemplate: FEEDBACK_MUDANCA_PONTO_OUTPUT,
    fields: FEEDBACK_MUDANCA_PONTO_FIELDS.map((f) => ({ ...f })),
  }
}
