import { Chip } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import type { BugStatus } from '../../types/bugReport'
import { BUG_STATUS_LABELS } from '../../types/bugReport'

const CONFIG: Record<BugStatus, { color: string; icon: React.ElementType }> = {
  aberto: { color: 'info', icon: FiberNewOutlinedIcon },
  em_analise: { color: 'warning', icon: SearchOutlinedIcon },
  resolvido: { color: 'success', icon: CheckCircleOutlineRoundedIcon },
  nao_reproduzivel: { color: 'default', icon: BlockOutlinedIcon },
  duplicado: { color: 'default', icon: ContentCopyOutlinedIcon },
}

export function BugStatusChip({ status, size = 'small' }: { status: BugStatus; size?: 'small' | 'medium' }) {
  const theme = useTheme()
  const cfg = CONFIG[status]
  const Icon = cfg.icon

  const paletteColor =
    cfg.color === 'info' ? theme.palette.info.main
    : cfg.color === 'warning' ? theme.palette.warning.main
    : cfg.color === 'success' ? theme.palette.success.main
    : theme.palette.text.secondary

  const isColored = cfg.color !== 'default'

  return (
    <Chip
      icon={<Icon sx={{ fontSize: '13px !important' }} />}
      label={BUG_STATUS_LABELS[status]}
      size={size}
      variant={status === 'aberto' ? 'outlined' : 'filled'}
      sx={{
        height: size === 'small' ? 22 : undefined,
        fontSize: size === 'small' ? 11 : 12,
        fontWeight: 700,
        ...(isColored
          ? {
              bgcolor: status === 'aberto' ? 'transparent' : alpha(paletteColor, 0.12),
              color: paletteColor,
              borderColor: alpha(paletteColor, 0.35),
              '& .MuiChip-icon': { color: paletteColor },
            }
          : {
              bgcolor: alpha(theme.palette.text.secondary, 0.08),
              color: 'text.secondary',
              '& .MuiChip-icon': { color: 'text.secondary' },
            }),
      }}
    />
  )
}
