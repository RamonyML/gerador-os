import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  TICKET_ARCHIVE_TAG_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  type TicketArchiveTag,
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

const ARCHIVE_TAG_COLOR: Record<TicketArchiveTag, ChipProps['color']> = {
  resolvido: 'success',
  nao_solucionado: 'error',
  teste: 'default',
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

export function TicketArchiveTagChip({
  tag,
  size = 'small',
}: {
  tag: TicketArchiveTag
  size?: ChipProps['size']
}) {
  const color = ARCHIVE_TAG_COLOR[tag]
  return (
    <Chip
      size={size}
      label={TICKET_ARCHIVE_TAG_LABELS[tag]}
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
    />
  )
}
