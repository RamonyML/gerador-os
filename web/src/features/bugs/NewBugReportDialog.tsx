import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import { useAuth } from '../../contexts/AuthContext'
import { AttachmentPicker } from '../helpdesk/AttachmentPicker'
import { uploadTicketImages } from '../../lib/ticketAttachments'
import { createBugReport } from '../../lib/bugReportFirestore'
import { BUG_MODULES, BUG_MODULE_LABELS, type BugModule } from '../../types/bugReport'

type Props = {
  open: boolean
  onClose: () => void
}

export function NewBugReportDialog({ open, onClose }: Props) {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [module, setModule] = useState<BugModule>('gerador_os')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitle('')
    setDescription('')
    setModule('gerador_os')
    setFiles([])
    setFileError(null)
    setError(null)
    setSaving(false)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!user || !profile) return
    setSaving(true)
    setError(null)
    try {
      // Upload temporary id for storage path, replaced after creation
      const tempId = `tmp_${Date.now()}`
      const attachments = files.length > 0
        ? await uploadTicketImages(tempId.replace('tmp_', 'bugs_'), files)
        : []

      await createBugReport(
        {
          uid: user.uid,
          name: profile.displayName ?? user.email ?? 'Usuário',
          email: user.email ?? null,
          sector: profile.sector ?? null,
        },
        { title, description, module, attachments },
      )
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar o relato. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = title.trim().length >= 5 && description.trim().length >= 10

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BugReportOutlinedIcon color="error" />
        Reportar problema
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Título"
            placeholder="Descreva o problema em poucas palavras"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            disabled={saving}
            helperText="Mínimo 5 caracteres"
            error={title.length > 0 && title.trim().length < 5}
          />

          <FormControl fullWidth disabled={saving}>
            <InputLabel id="bug-module-label">Módulo</InputLabel>
            <Select
              labelId="bug-module-label"
              label="Módulo"
              value={module}
              onChange={(e) => setModule(e.target.value as BugModule)}
            >
              {BUG_MODULES.map((m) => (
                <MenuItem key={m} value={m}>{BUG_MODULE_LABELS[m]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Descrição"
            placeholder="Descreva o que aconteceu, como reproduzir o problema e o resultado esperado"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            multiline
            minRows={4}
            disabled={saving}
            helperText="Mínimo 10 caracteres. Quanto mais detalhe, mais fácil de corrigir."
            error={description.length > 0 && description.trim().length < 10}
          />

          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Prints / capturas de tela (opcional)
            </Typography>
            {fileError && (
              <Alert severity="warning" sx={{ py: 0.5 }}>{fileError}</Alert>
            )}
            <AttachmentPicker
              files={files}
              onChange={setFiles}
              onError={setFileError}
              disabled={saving}
              label="Anexar print"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={saving || !canSubmit}
          onClick={() => void handleSubmit()}
          startIcon={<BugReportOutlinedIcon />}
        >
          {saving ? 'Enviando…' : 'Enviar relato'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
