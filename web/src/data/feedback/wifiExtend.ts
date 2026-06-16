import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO'
const S_PLANO = 'PLANO E CONFIGURAÇÃO'
const S_R1 = 'ROTEADOR 1'
const S_R2 = 'ROTEADOR 2'
const S_R3 = 'ROTEADOR 3'
const S_OBS = 'OBSERVAÇÕES'

const CANAL_OPTIONS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const WIFI_CABO_OPTIONS = [
  { value: 'WI-FI', label: 'Wi-Fi' },
  { value: 'CABO DE REDE', label: 'Cabo de rede' },
]

const ENERGIA_OPTIONS = [
  { value: 'RÉGUA', label: 'Régua' },
  { value: 'ESTABILIZADOR', label: 'Estabilizador' },
  { value: 'NOBREAK', label: 'Nobreak' },
  { value: 'TOMADA INDIVIDUAL', label: 'Tomada individual' },
]

const TIPO_EQUIP_OPTIONS = [
  { value: 'NOVO', label: 'Novo (adquirido agora)' },
  { value: 'EXISTENTE', label: 'Existente (já possuía)' },
]

const CONECTADO_OPTIONS = [
  { value: 'WI-FI', label: 'Wi-Fi' },
  { value: 'CABO DE REDE', label: 'Cabo de rede' },
]

export const FEEDBACK_WIFI_EXTEND_OUTPUT = [
  '=== Texto Feedback ===',
  '{{feedbackWifiExtendTexto}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

function routerBlock(
  index: number,
  v: Record<string, string>,
): string {
  const i = String(index)
  const local = upper(v[`local${i}`])
  const roteador = upper(v[`roteador${i}`])
  const mac = upper(v[`mac${i}`])
  const tecCabo = v[`tecCabo${i}`] || ''
  const tecWifi = v[`tecWifi${i}`] || ''
  const tipoEquip = v[`tipoEquip${i}`] || 'NOVO'
  const marca = upper(v[`marca${i}`])
  const veloCliente = v[`veloCliente${i}`] || ''
  const conectCliente = v[`conectCliente${i}`] || ''
  const energia = v[`energia${i}`] || ''

  return [
    `--- ROTEADOR ${index} ---`,
    `LOCAL: ${local}`,
    `MODELO: ${roteador}`,
    `MAC: ${mac}`,
    `NOTEBOOK DO TÉC. AFERIU: ${tecCabo}MEGA (CABO) | ${tecWifi}MEGA (WI-FI 5G)`,
    `EQUIPAMENTO ${tipoEquip}: ${marca}`,
    `CLIENTE AFERIU: ${veloCliente}MBPS VIA ${conectCliente}`,
    `LIGADO EM: ${energia}`,
  ].join('\n')
}

export function buildFeedbackWifiExtendTextos(
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
  const plano = upper(v.plano)
  const qtd = parseInt(v.qtdRoteadores || '1', 10)
  const wifiCabo = v.wifiCabo || ''
  const dispensouTestes = v.dispensouTestes || 'nao'
  const obs = v.obs?.trim() || ''

  const plural = qtd === 1 ? 'ROTEADOR' : 'ROTEADORES'

  const lines: string[] = [
    `FIZ FEEDBACK COM ${cp} POR ${canal} (${contato}) DIA ${dataHora} HRS.`,
    `${cp} CONFIRMOU INSTALAÇÃO DE ${qtd} ${plural} WI-FI EXTEND. PLANO ATUAL: ${plano}.`,
    `${cp} CONFIRMOU QUE FORAM REALIZADOS TESTES DE AFERIÇÃO DE VELOCIDADE, ORIENTAÇÃO DE COBERTURA WI-FI E REDE 2.4G E 5G.`,
  ]

  if (dispensouTestes === 'sim') {
    lines.push(`${cp} DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.`)
  } else {
    lines.push(`TESTES REALIZADOS VIA ${wifiCabo}.`)
  }

  lines.push('')

  for (let i = 1; i <= qtd; i++) {
    lines.push(routerBlock(i, v))
    if (i < qtd) lines.push('')
  }

  lines.push('', 'CLIENTE SEM DUVIDAS.')

  if (obs) {
    lines.push('', `OBS: ${obs}`)
  }

  return { feedbackWifiExtendTexto: lines.join('\n') }
}

function routerFields(index: number, showWhenValues: string[]): OsTemplateField[] {
  const i = String(index)
  const label = `Roteador ${index}`
  const section = index === 1 ? S_R1 : index === 2 ? S_R2 : S_R3
  const showWhen =
    index === 1
      ? undefined
      : { field: 'qtdRoteadores', equals: showWhenValues }

  return [
    {
      id: `local${i}`,
      label: `${label} — Local`,
      control: 'text' as const,
      placeholder: 'Ex.: SALA, QUARTO, ESCRITÓRIO',
      section,
      layout: { md: 6 },
      showWhen,
    },
    {
      id: `roteador${i}`,
      label: `${label} — Modelo`,
      control: 'text' as const,
      placeholder: 'Ex.: ZTE H196-MESH',
      section,
      layout: { md: 6 },
      showWhen,
    },
    {
      id: `mac${i}`,
      label: `${label} — MAC`,
      control: 'text' as const,
      placeholder: 'Ex.: A1:B2:C3:D4:E5:F6',
      section,
      layout: { md: 6 },
      showWhen,
    },
    {
      id: `tecCabo${i}`,
      label: `${label} — Téc. cabo (Mbps)`,
      control: 'text' as const,
      placeholder: 'Ex.: 200',
      section,
      layout: { md: 3 },
      showWhen,
    },
    {
      id: `tecWifi${i}`,
      label: `${label} — Téc. Wi-Fi 5G (Mbps)`,
      control: 'text' as const,
      placeholder: 'Ex.: 180',
      section,
      layout: { md: 3 },
      showWhen,
    },
    {
      id: `tipoEquip${i}`,
      label: `${label} — Tipo`,
      control: 'radio' as const,
      defaultValue: 'NOVO',
      section,
      layout: { md: 12 },
      options: TIPO_EQUIP_OPTIONS,
      showWhen,
    },
    {
      id: `marca${i}`,
      label: `${label} — Marca cliente`,
      control: 'text' as const,
      placeholder: 'Ex.: SAMSUNG A54',
      section,
      layout: { md: 4 },
      showWhen,
    },
    {
      id: `veloCliente${i}`,
      label: `${label} — Vel. cliente (Mbps)`,
      control: 'text' as const,
      placeholder: 'Ex.: 150',
      section,
      layout: { md: 3 },
      showWhen,
    },
    {
      id: `conectCliente${i}`,
      label: `${label} — Via`,
      control: 'select' as const,
      section,
      layout: { md: 3 },
      options: CONECTADO_OPTIONS,
      showWhen,
    },
    {
      id: `energia${i}`,
      label: `${label} — Ligado em`,
      control: 'select' as const,
      section,
      layout: { md: 4 },
      options: ENERGIA_OPTIONS,
      showWhen,
    },
  ]
}

export const FEEDBACK_WIFI_EXTEND_FIELDS: OsTemplateField[] = [
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
    id: 'plano',
    label: 'Plano atual',
    control: 'text',
    placeholder: 'Ex.: 300 MEGA',
    section: S_PLANO,
    layout: { md: 4 },
  },
  {
    id: 'qtdRoteadores',
    label: 'Quantidade de roteadores instalados',
    control: 'select',
    highlight: true,
    defaultValue: '1',
    section: S_PLANO,
    layout: { md: 4 },
    options: [
      { value: '1', label: '1 roteador' },
      { value: '2', label: '2 roteadores' },
      { value: '3', label: '3 roteadores' },
    ],
  },
  {
    id: 'dispensouTestes',
    label: 'Cliente dispensou testes?',
    control: 'radio',
    defaultValue: 'nao',
    section: S_PLANO,
    layout: { md: 12 },
    options: [
      { value: 'nao', label: 'Não — testes realizados' },
      { value: 'sim', label: 'Sim — dispensou' },
    ],
  },
  {
    id: 'wifiCabo',
    label: 'Testes realizados via',
    control: 'select',
    section: S_PLANO,
    layout: { md: 4 },
    options: WIFI_CABO_OPTIONS,
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  ...routerFields(1, []),
  ...routerFields(2, ['2', '3']),
  ...routerFields(3, ['3']),
  {
    id: 'obs',
    label: 'Observação',
    control: 'textarea',
    placeholder: 'Informações adicionais (opcional)',
    section: S_OBS,
    layout: { md: 12 },
  },
]

export function getFeedbackWifiExtendDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'feedback-wifi-extend',
    title: 'Feedback — Wi-Fi Extend',
    demandCategory: 'feedback',
    outputTemplate: FEEDBACK_WIFI_EXTEND_OUTPUT,
    fields: FEEDBACK_WIFI_EXTEND_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Orientação — Feedback Wi-Fi Extend',
      items: [
        'Selecione a quantidade total de roteadores instalados (1, 2 ou 3).',
        'Preencha os dados de cada roteador: local, modelo, MAC, velocidades e energia.',
        'Registre as velocidades aferidas pelo técnico e pelo dispositivo do cliente.',
        'Informe se o cliente dispensou os testes em seus dispositivos pessoais.',
      ],
    },
  }
}
