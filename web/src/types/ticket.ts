import type { Sector } from './profile'

/**
 * Estados de um chamado interno (fluxo estilo GLPI).
 * - `aberto`: criado pelo solicitante, ainda sem responsável do T.I.
 * - `em_atendimento`: um agente do T.I resgatou/assumiu o chamado.
 * - `aguardando_solicitante`: T.I aguarda retorno/informação do autor.
 * - `resolvido`: encerrado com parecer resolutivo (somente T.I encerra).
 */
export type TicketStatus =
  | 'aberto'
  | 'em_atendimento'
  | 'aguardando_solicitante'
  | 'resolvido'

export const TICKET_STATUSES: TicketStatus[] = [
  'aberto',
  'em_atendimento',
  'aguardando_solicitante',
  'resolvido',
]

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: 'Aberto',
  em_atendimento: 'Em atendimento',
  aguardando_solicitante: 'Aguardando solicitante',
  resolvido: 'Resolvido',
}

export type TicketPriority = 'baixa' | 'normal' | 'alta' | 'critica'

export const TICKET_PRIORITIES: TicketPriority[] = [
  'baixa',
  'normal',
  'alta',
  'critica',
]

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  critica: 'Crítica',
}

export type TicketCategory =
  | 'suporte_sistemas'
  | 'suporte_hardware'
  | 'troca_equipamento'
  | 'manutencao_equipamento'
  | 'rede_conectividade'
  | 'acesso_senhas'
  | 'instalacao_software'
  | 'telefonia'
  | 'outros'

export const TICKET_CATEGORIES: TicketCategory[] = [
  'suporte_sistemas',
  'suporte_hardware',
  'troca_equipamento',
  'manutencao_equipamento',
  'rede_conectividade',
  'acesso_senhas',
  'instalacao_software',
  'telefonia',
  'outros',
]

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  suporte_sistemas: 'Suporte em sistemas',
  suporte_hardware: 'Suporte em hardware',
  troca_equipamento: 'Solicitação de troca de equipamento',
  manutencao_equipamento: 'Manutenção em equipamento',
  rede_conectividade: 'Rede e conectividade',
  acesso_senhas: 'Acessos e senhas',
  instalacao_software: 'Instalação/atualização de software',
  telefonia: 'Telefonia / ramal',
  outros: 'Outros',
}

export type TicketResolution = {
  text: string
  byUid: string
  byName: string
  at: Date
}

/** Imagem anexada a um chamado ou a uma atualização da linha do tempo. */
export type TicketAttachment = {
  /** Caminho no Firebase Storage. */
  path: string
  /** URL de download (com token) usada para exibir/baixar a imagem. */
  url: string
  /** Nome original do arquivo. */
  name: string
  /** MIME type (ex.: `image/png`). */
  contentType: string
  /** Tamanho em bytes. */
  size: number
}

export type Ticket = {
  id: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  authorUid: string
  authorName: string
  authorEmail: string | null
  authorPhotoURL: string | null
  authorSector: Sector | null
  assigneeUid: string | null
  assigneeName: string | null
  createdAt: Date
  updatedAt: Date | null
  resolvedAt: Date | null
  resolution: TicketResolution | null
  commentsCount: number
  attachments: TicketAttachment[]
}

export type TicketDraft = {
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
}

export type TicketComment = {
  id: string
  text: string
  authorUid: string
  authorName: string
  /** Foto de perfil do autor no momento do comentário (pode ser null). */
  authorPhotoURL: string | null
  /** `ti` quando o autor do comentário é agente do T.I; `solicitante` caso contrário. */
  authorRole: 'solicitante' | 'ti'
  createdAt: Date
  attachments: TicketAttachment[]
}

export function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    value === 'aberto' ||
    value === 'em_atendimento' ||
    value === 'aguardando_solicitante' ||
    value === 'resolvido'
  )
}

export function isTicketPriority(value: unknown): value is TicketPriority {
  return (
    value === 'baixa' ||
    value === 'normal' ||
    value === 'alta' ||
    value === 'critica'
  )
}

export function isTicketCategory(value: unknown): value is TicketCategory {
  return (
    typeof value === 'string' &&
    (TICKET_CATEGORIES as string[]).includes(value)
  )
}
