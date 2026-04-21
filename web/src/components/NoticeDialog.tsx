import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import type { Notice } from '../types/notices'
import { SECTOR_LABELS } from '../types/profile'

function targetLabel(n: Notice) {
  return n.target.scope === 'all'
    ? 'Para todos'
    : `Para ${SECTOR_LABELS[n.target.sector] ?? n.target.sector}`
}

function priorityLabel(p: Notice['priority']) {
  if (p === 'critical') return 'Crítico'
  if (p === 'important') return 'Importante'
  return 'Normal'
}

export function NoticeDialog(props: {
  notice: Notice | null
  open: boolean
  onClose: () => void
  onMarkRead?: (id: string) => Promise<void> | void
  isUnread?: boolean
}) {
  const { notice: n, open, onClose, onMarkRead, isUnread } = props
  if (!n) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        Aviso
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip size="small" label={targetLabel(n)} variant="outlined" />
          <Chip size="small" label={priorityLabel(n.priority)} variant="outlined" />
          {n.pinned ? <Chip size="small" label="Fixado" variant="outlined" /> : null}
          {n.stats?.readCount != null ? (
            <Chip size="small" label={`Lido por ${n.stats.readCount}`} variant="outlined" />
          ) : null}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {n.authorName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {n.createdAt.toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {n.message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
        {onMarkRead ? (
          <Button
            onClick={async () => {
              await onMarkRead(n.id)
              onClose()
            }}
            disabled={!isUnread}
            variant="contained"
          >
            {isUnread ? 'Marcar como lido' : 'Já lido'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}

