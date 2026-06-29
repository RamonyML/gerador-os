import type { TicketAttachment } from './ticket'

export type BugStatus = 'aberto' | 'em_analise' | 'resolvido' | 'nao_reproduzivel' | 'duplicado'

export const BUG_STATUSES: BugStatus[] = [
  'aberto',
  'em_analise',
  'resolvido',
  'nao_reproduzivel',
  'duplicado',
]

export const BUG_STATUS_LABELS: Record<BugStatus, string> = {
  aberto: 'Aberto',
  em_analise: 'Em análise',
  resolvido: 'Resolvido',
  nao_reproduzivel: 'Não reproduzível',
  duplicado: 'Duplicado',
}

export type BugModule =
  | 'gerador_os'
  | 'agenda'
  | 'chamados'
  | 'pausas'
  | 'escala'
  | 'chat'
  | 'avisos'
  | 'outros'

export const BUG_MODULES: BugModule[] = [
  'gerador_os',
  'agenda',
  'chamados',
  'pausas',
  'escala',
  'chat',
  'avisos',
  'outros',
]

export const BUG_MODULE_LABELS: Record<BugModule, string> = {
  gerador_os: 'Gerador de O.S.',
  agenda: 'Agenda',
  chamados: 'Chamados',
  pausas: 'Pausas',
  escala: 'Escala',
  chat: 'Chat',
  avisos: 'Avisos',
  outros: 'Outros',
}

export interface BugReport {
  id: string
  reportNum: number | null
  title: string
  description: string
  module: BugModule
  status: BugStatus
  authorUid: string
  authorName: string
  authorEmail: string | null
  authorSector: string | null
  devNote: string | null
  attachments: TicketAttachment[]
  createdAt: Date
  updatedAt: Date | null
  resolvedAt: Date | null
}

/** Draft usado na criação — sem campos gerados pelo servidor. */
export type BugReportDraft = Pick<BugReport, 'title' | 'description' | 'module' | 'attachments'>
