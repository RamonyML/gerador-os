import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  type TicketPriority,
  type TicketStatus,
} from '../../types/ticket'

const STATUS_COLOR: Record<TicketStatus, ChipProps['color']> = {
  aberto: 'info',
  em_atendimento: 'info',
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
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const emAtendimento = status === 'em_atendimento'

  return (
    <Chip
      size={size}
      label={TICKET_STATUS_LABELS[status]}
      color={STATUS_COLOR[status]}
      variant={status === 'aberto' ? 'outlined' : 'filled'}
      sx={
        emAtendimento
          ? {
              bgcolor: alpha(theme.palette.info.main, isDark ? 0.28 : 0.15),
              color: isDark ? theme.palette.info.light : theme.palette.info.dark,
              fontWeight: 600,
            }
          : undefined
      }
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
