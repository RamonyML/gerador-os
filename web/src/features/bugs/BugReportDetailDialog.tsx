import { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AttachmentGallery } from '../helpdesk/AttachmentGallery'
import { BugStatusChip } from './BugStatusChip'
import { BugModuleChip } from './BugModuleChip'
import {
  subscribeBugReport,
  updateBugReport,
  deleteBugReport,
} from '../../lib/bugReportFirestore'
import {
  BUG_STATUSES,
  BUG_STATUS_LABELS,
  type BugStatus,
} from '../../types/bugReport'

type Props = {
  reportId: string | null
  isDev?: boolean
  onClose: () => void
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function BugReportDetailDialog({ reportId, isDev = false, onClose }: Props) {
  const theme = useTheme()
  const [report, setReport] = useState<import('../../types/bugReport').BugReport | null>(null)
  const [loading, setLoading] = useState(true)

  // Dev edit state
  const [devStatus, setDevStatus] = useState<BugStatus>('aberto')
  const [devNote, setDevNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!reportId) return
    setLoading(true)
    setConfirmDelete(false)
    const unsub = subscribeBugReport(reportId, (r) => {
      setReport(r)
      if (r) {
        setDevStatus(r.status)
        setDevNote(r.devNote ?? '')
      }
      setLoading(false)
    })
    return unsub
  }, [reportId])

  const handleSave = async () => {
    if (!reportId) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateBugReport(reportId, {
        status: devStatus,
        devNote: devNote.trim() || undefined,
      })
    } catch {
      setSaveError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!reportId) return
    setSaving(true)
    try {
      await deleteBugReport(reportId)
      onClose()
    } catch {
      setSaveError('Erro ao excluir.')
      setSaving(false)
    }
  }

  const open = reportId !== null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          pb: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <CircularProgress size={20} />
          ) : report ? (
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                #{report.reportNum} — {report.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                <BugStatusChip status={report.status} />
                <BugModuleChip module={report.module} />
              </Box>
            </Stack>
          ) : (
            <Typography color="text.secondary">Relato não encontrado</Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ mt: 0.25 }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {!loading && report && (
          <Stack spacing={2.5}>
            {/* Author info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: 13,
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  flexShrink: 0,
                }}
              >
                {initialsFrom(report.authorName)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {report.authorName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {report.authorEmail ?? ''}{report.authorSector ? ` · ${report.authorSector}` : ''} ·{' '}
                  {format(report.createdAt, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                </Typography>
              </Box>
              {report.resolvedAt && (
                <Chip
                  label={`Resolvido em ${format(report.resolvedAt, 'dd/MM/yy', { locale: ptBR })}`}
                  size="small"
                  color="success"
                  sx={{ ml: 'auto', fontWeight: 700, fontSize: 11 }}
                />
              )}
            </Box>

            {/* Description */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Descrição
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  whiteSpace: 'pre-wrap',
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                {report.description}
              </Typography>
            </Box>

            {/* Attachments */}
            {report.attachments.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  Prints ({report.attachments.length})
                </Typography>
                <AttachmentGallery attachments={report.attachments} size={120} />
              </Box>
            )}

            <Divider />

            {/* Dev note (read for user, editable for dev) */}
            {!isDev && report.devNote && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.75 }}>
                  Resposta do desenvolvedor
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {report.devNote}
                </Typography>
              </Box>
            )}

            {/* Dev management panel */}
            {isDev && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Gerenciamento
                </Typography>

                {saveError && <Alert severity="error">{saveError}</Alert>}

                <FormControl size="small" fullWidth disabled={saving}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={devStatus}
                    onChange={(e) => setDevStatus(e.target.value as BugStatus)}
                  >
                    {BUG_STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>{BUG_STATUS_LABELS[s]}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Nota para o usuário (opcional)"
                  placeholder="Informe o status da correção, solução de contorno ou resposta ao relato"
                  value={devNote}
                  onChange={(e) => setDevNote(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                  size="small"
                  disabled={saving}
                />

                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                  <Tooltip title="Excluir relato permanentemente">
                    <span>
                      {confirmDelete ? (
                        <Button
                          color="error"
                          variant="outlined"
                          size="small"
                          disabled={saving}
                          onClick={() => void handleDelete()}
                        >
                          Confirmar exclusão
                        </Button>
                      ) : (
                        <IconButton
                          size="small"
                          color="error"
                          disabled={saving}
                          onClick={() => setConfirmDelete(true)}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </span>
                  </Tooltip>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}
                    onClick={() => void handleSave()}
                  >
                    {saving ? 'Salvando…' : 'Salvar'}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}
