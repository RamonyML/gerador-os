import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO'
const S_EQUIP = 'EQUIPAMENTOS'
const S_TESTES = 'TESTES DE VELOCIDADE'

const CANAL_OPTIONS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const TIPO_EQUIP_OPTIONS = [
  { value: 'ONU', label: 'ONU' },
  { value: 'ONT', label: 'ONT' },
  { value: 'ROTEADOR', label: 'Roteador' },
]

export const FEEDBACK_TROCA_EQUIP_OUTPUT = [
  '=== Texto Feedback ===',
  '{{feedbackTrocaEquipTexto}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function buildFeedbackTrocaEquipTextos(
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
  const tipoEquipRemovido = v.tipoEquipRemovido || 'ONU'
  const equipamentoRemovido = upper(v.equipamentoRemovido)
  const tipoEquipInstalado = v.tipoEquipInstalado || 'ONU'
  const equipamentoInstalado = upper(v.equipamentoInstalado)
  const velocidadeCabo = v.velocidadeCabo || ''
  const velocidadeWifi = v.velocidadeWifi || ''

  const equipAtual = `${tipoEquipRemovido}: ${equipamentoRemovido}`
  const equipNovo = `${tipoEquipInstalado}: ${equipamentoInstalado}`

  const lines: string[] = [
    `FIZ FEEDBACK COM ${cp} POR ${canal} (${contato}) DIA ${dataHora} ÁS HRS.`,
    'VISITA REALIZADA REFERENTE A UM PROBLEMA NO EQUIPAMENTO EMPRESTADO. FOI EFETUADA A TROCA DO EQUIPAMENTO E O ACESSO FOI RESTABELECIDO.',
    'CLIENTE CONFIRMOU A TROCA DO EQUIPAMENTO.',
    `DESINSTALADO: ${equipAtual}`,
    `INSTALADO: ${equipNovo}`,
    'CLIENTE CONFIRMOU QUE FOI REALIZADO TESTES DE AFERIÇÃO DA VELOCIDADE E REDE 2.4G E 5G.',
    `NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU ${velocidadeCabo}MEGA. VIA WI-FI CONECTADO NA REDE 5G AFERIU ${velocidadeWifi}MEGA.`,
    'EQUIPAMENTOS INSTALADOS EM TOMADA INDIVIDUAL.',
    'O.S. SEM CUSTOS.',
  ]

  return { feedbackTrocaEquipTexto: lines.join('\n') }
}

export const FEEDBACK_TROCA_EQUIP_FIELDS: OsTemplateField[] = [
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
    id: 'tipoEquipRemovido',
    label: 'Tipo do equipamento removido',
    control: 'radio',
    defaultValue: 'ONU',
    section: S_EQUIP,
    layout: { md: 12 },
    options: TIPO_EQUIP_OPTIONS,
  },
  {
    id: 'equipamentoRemovido',
    label: 'Modelo do equipamento removido',
    control: 'text',
    placeholder: 'Ex.: ZTE F670L',
    section: S_EQUIP,
    layout: { md: 6 },
  },
  {
    id: 'tipoEquipInstalado',
    label: 'Tipo do equipamento instalado',
    control: 'radio',
    defaultValue: 'ONU',
    section: S_EQUIP,
    layout: { md: 12 },
    options: TIPO_EQUIP_OPTIONS,
  },
  {
    id: 'equipamentoInstalado',
    label: 'Modelo do equipamento instalado',
    control: 'text',
    placeholder: 'Ex.: ZTE F670L',
    section: S_EQUIP,
    layout: { md: 6 },
  },
  {
    id: 'velocidadeCabo',
    label: 'Velocidade — cabo (Mbps)',
    control: 'text',
    placeholder: 'Ex.: 200',
    section: S_TESTES,
    layout: { md: 4 },
  },
  {
    id: 'velocidadeWifi',
    label: 'Velocidade — Wi-Fi 5G (Mbps)',
    control: 'text',
    placeholder: 'Ex.: 150',
    section: S_TESTES,
    layout: { md: 4 },
  },
]

export function getFeedbackTrocaEquipDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'feedback-troca-equip',
    title: 'Feedback — Troca de equipamento',
    demandCategory: 'feedback',
    outputTemplate: FEEDBACK_TROCA_EQUIP_OUTPUT,
    fields: FEEDBACK_TROCA_EQUIP_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Orientação — Troca de equipamento',
      items: [
        'Confirme o modelo do equipamento removido e do novo instalado.',
        'Registre as velocidades aferidas pelo notebook do técnico via cabo e Wi-Fi 5G.',
        'A O.S de troca de equipamento defeituoso é sempre sem custos.',
      ],
    },
  }
}
