import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material'
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  type TicketPriority,
  type TicketStatus,
} from '../../types/ticket'

const STATUS_COLOR: Record<TicketStatus, ChipProps['color']> = {
  aberto: 'info',
  em_atendimento: 'primary',
  aguardando_solicitante: 'warning',
  resolvido: 'success',
}

const PRIORITY_COLOR: Record<TicketPriority, ChipProps['color']> = {
  baixa: 'default',
  normal: 'default',
  alta: 'warning',
  critica: 'error',
}

export function TicketStatusChip({
  status,
  size = 'small',
}: {
  status: TicketStatus
  size?: ChipProps['size']
}) {
  return (
    <Chip
      size={size}
      label={TICKET_STATUS_LABELS[status]}
      color={STATUS_COLOR[status]}
      variant={status === 'aberto' ? 'outlined' : 'filled'}
    />
  )
}

export function TicketPriorityChip({
  priority,
  size = 'small',
}: {
  priority: TicketPriority
  size?: ChipProps['size']
}) {
  const color = PRIORITY_COLOR[priority]
  return (
    <Chip
      size={size}
      label={`Prioridade: ${TICKET_PRIORITY_LABELS[priority]}`}
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
    />
  )
}
