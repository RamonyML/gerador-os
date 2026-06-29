import { Chip } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import type { BugModule } from '../../types/bugReport'
import { BUG_MODULE_LABELS } from '../../types/bugReport'

export function BugModuleChip({ module }: { module: BugModule }) {
  const theme = useTheme()
  return (
    <Chip
      label={BUG_MODULE_LABELS[module]}
      size="small"
      variant="outlined"
      sx={{
        height: 20,
        fontSize: 11,
        fontWeight: 600,
        color: 'text.secondary',
        borderColor: alpha(theme.palette.text.secondary, 0.3),
      }}
    />
  )
}
