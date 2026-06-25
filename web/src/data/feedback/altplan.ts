import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO'
const S_PLANO = 'ALTERAÇÃO DE PLANO'
const S_TESTES = 'TESTES'
const S_OS = 'DADOS DA O.S'

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
  { value: 'OUTRO', label: 'Outro' },
]

export const FEEDBACK_ALTPLAN_OUTPUT = [
  '=== Texto Feedback ===',
  '{{feedbackAltplanTexto}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function buildFeedbackAltplanTextos(
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
  const trocaRoteador = v.trocaRoteador || 'nao'
  const modeloRoteador = upper(v.modeloRoteador)
  const dispensouTestes = v.dispensouTestes || 'nao'
  const possuiEquipamento = v.possuiEquipamento || 'sim'
  const aparelho = upper(v.aparelho)
  const marcaModelo = upper(v.marcaModelo)
  const velocidade = v.velocidade || ''
  const wifiCabo = v.wifiCabo || ''
  const caboTec = v.caboTec || ''
  const wifiTec = v.wifiTec || ''
  const energiaRaw = v.energia || ''
  const energiaFinal = energiaRaw === 'OUTRO' ? upper(v.energiaOutro) : energiaRaw
  const osComCustos = v.osComCustos || 'nao'
  const valorOS = v.valorOS || ''
  const obs = v.obs?.trim() || ''

  const lines: string[] = [
    `FIZ FEEDBACK COM ${cp} POR ${canal} (${contato}) DIA ${dataHora} HRS.`,
  ]

  if (trocaRoteador === 'sim') {
    lines.push(`${cp} CONFIRMOU A TROCA DO ROTEADOR E CONFIRMOU A ALTERAÇÃO DO PLANO PARA: ${plano}.`)
  } else {
    lines.push(`${cp} CONFIRMOU A ALTERAÇÃO DO PLANO PARA: ${plano}. ROTEADOR INSTALADO: ${modeloRoteador}.`)
  }

  lines.push(`${cp} CONFIRMOU QUE FOI REALIZADO TESTES DE AFERIÇÃO DA VELOCIDADE, ORIENTAÇÃO DE COBERTURA WI-FI E REDE 2.4G E 5.8G.`)

  if (dispensouTestes === 'sim') {
    lines.push(`${cp} DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.`)
  } else {
    const possuiStr = possuiEquipamento === 'sim' ? 'POSSUI' : 'NÃO POSSUI'
    lines.push(`${cp} ${possuiStr} EQUIPAMENTO QUE AFERE A BANDA (${aparelho} ${marcaModelo} AFERIU ${velocidade}MB VIA ${wifiCabo}).`)
    lines.push(`NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU ${caboTec}MEGA E ${wifiTec}MEGA VIA WI-FI CONECTADO NA REDE 5G.`)
  }

  lines.push(`EQUIPAMENTOS INSTALADOS EM ${energiaFinal}.`)

  if (osComCustos === 'sim') {
    lines.push(`O.S COM O CUSTO DE R$${valorOS}`)
  } else {
    lines.push('O.S. SEM CUSTOS.')
  }

  lines.push('CLIENTE SEM DUVIDAS.')

  if (obs) {
    lines.push(`OBS: ${obs}`)
  }

  return { feedbackAltplanTexto: lines.join('\n') }
}

export const FEEDBACK_ALTPLAN_FIELDS: OsTemplateField[] = [
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
    label: 'Plano contratado',
    control: 'text',
    placeholder: 'Ex.: 300 MEGA',
    section: S_PLANO,
    layout: { md: 4 },
  },
  {
    id: 'trocaRoteador',
    label: 'Houve troca de roteador?',
    control: 'radio',
    defaultValue: 'nao',
    highlight: true,
    section: S_PLANO,
    layout: { md: 12 },
    options: [
      { value: 'sim', label: 'Sim — roteador trocado' },
      { value: 'nao', label: 'Não — mesmo roteador' },
    ],
  },
  {
    id: 'modeloRoteador',
    label: 'Modelo do roteador (sem troca)',
    control: 'text',
    placeholder: 'Ex.: TP-LINK 840',
    section: S_PLANO,
    layout: { md: 6 },
    showWhen: { field: 'trocaRoteador', equals: 'nao' },
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
    id: 'possuiEquipamento',
    label: 'Cliente possui aparelho para aferição?',
    control: 'radio',
    defaultValue: 'sim',
    section: S_TESTES,
    layout: { md: 12 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
    options: [
      { value: 'sim', label: 'Sim — possui' },
      { value: 'nao', label: 'Não — não possui' },
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
    id: 'velocidade',
    label: 'Velocidade cliente (Mbps)',
    control: 'text',
    placeholder: 'Ex.: 250',
    section: S_TESTES,
    layout: { md: 3 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  {
    id: 'wifiCabo',
    label: 'Via',
    control: 'select',
    section: S_TESTES,
    layout: { md: 3 },
    options: WIFI_CABO_OPTIONS,
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  {
    id: 'caboTec',
    label: 'Técnico — cabo (Mbps)',
    control: 'text',
    placeholder: 'Ex.: 300',
    section: S_TESTES,
    layout: { md: 3 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  {
    id: 'wifiTec',
    label: 'Técnico — Wi-Fi 5G (Mbps)',
    control: 'text',
    placeholder: 'Ex.: 270',
    section: S_TESTES,
    layout: { md: 3 },
    showWhen: { field: 'dispensouTestes', equals: 'nao' },
  },
  {
    id: 'energia',
    label: 'Equipamentos instalados em',
    control: 'select',
    section: S_OS,
    layout: { md: 4 },
    options: ENERGIA_OPTIONS,
  },
  {
    id: 'energiaOutro',
    label: 'Outro — especificar',
    control: 'text',
    placeholder: 'Ex.: FILTRO DE LINHA',
    section: S_OS,
    layout: { md: 4 },
    showWhen: { field: 'energia', equals: 'OUTRO' },
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
      { value: 'nao', label: 'Não — sem custos' },
      { value: 'sim', label: 'Sim — com custos' },
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
    id: 'obs',
    label: 'Observação',
    control: 'textarea',
    placeholder: 'Informações adicionais (opcional)',
    section: S_OS,
    layout: { md: 12 },
  },
]

export function getFeedbackAltplanDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'feedback-altplan',
    title: 'Feedback — Alteração de plano',
    demandCategory: 'feedback',
    outputTemplate: FEEDBACK_ALTPLAN_OUTPUT,
    fields: FEEDBACK_ALTPLAN_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Orientação — Feedback de alteração de plano',
      items: [
        'Confirme se houve troca de roteador junto à alteração do plano.',
        'Quando houve troca, não é necessário informar o modelo do roteador anterior.',
        'Registre as velocidades aferidas pelo técnico e pelo cliente (quando testes foram realizados).',
        'Informe a tomada/regime de energia em que os equipamentos foram instalados.',
      ],
    },
  }
}
