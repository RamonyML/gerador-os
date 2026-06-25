import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_T1 = '1ª TENTATIVA'
const S_T2   = '2ª TENTATIVA'
const S_INFO = 'INFORMAÇÕES DA CONEXÃO'

const CANAL_OPTIONS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

export const FEEDBACK_SEM_SUCESSO_OUTPUT = [
  '=== Texto Feedback ===',
  '{{feedbackSemSucessoTexto}}',
].join('\n')

export function buildFeedbackSemSucessoTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const canal1 = v.canal1 || ''
  const contato1 = v.contato1.replace(/\D/g, '')
  const dataHora1 = v.dataHora1 || ''
  const canal2 = v.canal2 || ''
  const contato2 = v.contato2.replace(/\D/g, '')
  const dataHora2 = v.dataHora2 || ''
  const sinal = v.sinal || ''
  const dispositivosRadio = v.dispositivosRadio || 'nao'
  const equipWifi = v.equipWifi || ''
  const equipCabo = v.equipCabo || ''

  const lines: string[] = [
    `TENTATIVA DE FEEDBACK VIA ${canal1} (${contato1}) DIA ${dataHora1} HORAS, E NÃO FUI ATENDIDO`,
    '',
    `TENTATIVA DE CONTATO VIA ${canal2} (${contato2}) DIA ${dataHora2} HORAS. NÃO HOUVE RETORNO POR PARTE DO CLIENTE`,
    '',
    'PROTOCOLO SERÁ ENCERRADO COMO CONCLUÍDO',
    `CONEXÃO ATIVA COM IP E SINAL DE FIBRA (${sinal})`,
    '',
  ]

  if (dispositivosRadio === 'sim') {
    lines.push(`(${equipWifi}) EQUIPAMENTOS CONECTADOS VIA WI-FI. E (${equipCabo}) VIA CABO DE REDE (PRINT EM ANEXO)`)
  } else {
    lines.push('NÃO HÁ DISPOSITIVOS CONECTADOS NA INTERNET NO MOMENTO (PRINT EM ANEXO)')
  }

  return { feedbackSemSucessoTexto: lines.join('\n') }
}

export const FEEDBACK_SEM_SUCESSO_FIELDS: OsTemplateField[] = [
  {
    id: 'canal1',
    label: 'Canal (1ª tentativa)',
    control: 'select',
    section: S_T1,
    layout: { md: 4 },
    options: CANAL_OPTIONS,
  },
  {
    id: 'contato1',
    label: 'Contato (1ª tentativa)',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_T1,
    layout: { md: 4 },
  },
  {
    id: 'dataHora1',
    label: 'Data e hora (1ª tentativa)',
    control: 'datetime',
    section: S_T1,
    layout: { md: 4 },
  },
  {
    id: 'canal2',
    label: 'Canal (2ª tentativa)',
    control: 'select',
    section: S_T2,
    layout: { md: 4 },
    options: CANAL_OPTIONS,
  },
  {
    id: 'contato2',
    label: 'Contato (2ª tentativa)',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_T2,
    layout: { md: 4 },
  },
  {
    id: 'dataHora2',
    label: 'Data e hora (2ª tentativa)',
    control: 'datetime',
    section: S_T2,
    layout: { md: 4 },
  },
  {
    id: 'sinal',
    label: 'Sinal de fibra',
    control: 'text',
    placeholder: 'Ex.: -19.50 dBm',
    section: S_INFO,
    layout: { md: 4 },
  },
  {
    id: 'dispositivosRadio',
    label: 'Há dispositivos conectados?',
    control: 'radio',
    defaultValue: 'nao',
    highlight: true,
    section: S_INFO,
    layout: { md: 12 },
    options: [
      { value: 'sim', label: 'Sim — há dispositivos conectados' },
      { value: 'nao', label: 'Não — sem dispositivos' },
    ],
  },
  {
    id: 'equipWifi',
    label: 'Qtd. via Wi-Fi',
    control: 'text',
    placeholder: 'Ex.: 03',
    section: S_INFO,
    layout: { md: 3 },
    showWhen: { field: 'dispositivosRadio', equals: 'sim' },
  },
  {
    id: 'equipCabo',
    label: 'Qtd. via Cabo',
    control: 'text',
    placeholder: 'Ex.: 01',
    section: S_INFO,
    layout: { md: 3 },
    showWhen: { field: 'dispositivosRadio', equals: 'sim' },
  },
]

export function getFeedbackSemSucessoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'feedback-sem-sucesso',
    title: 'Feedback — Sem sucesso (2 tentativas)',
    demandCategory: 'feedback',
    outputTemplate: FEEDBACK_SEM_SUCESSO_OUTPUT,
    fields: FEEDBACK_SEM_SUCESSO_FIELDS.map((f) => ({ ...f })),
  }
}
