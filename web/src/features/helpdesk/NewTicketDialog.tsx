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
} from '@mui/material'
import { db } from '../../lib/firebase'
import { createTicket, type TicketActor } from '../../lib/ticketsFirestore'
import {
  TICKET_CATEGORIES,
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABELS,
  type TicketCategory,
  type TicketPriority,
} from '../../types/ticket'
import { AttachmentPicker } from './AttachmentPicker'

type Props = {
  open: boolean
  actor: TicketActor | null
  onClose: () => void
  onCreated: (ticketId: string) => void
}

export function NewTicketDialog({ open, actor, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TicketCategory>('suporte_sistemas')
  const [priority, setPriority] = useState<TicketPriority>('normal')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitle('')
    setCategory('suporte_sistemas')
    setPriority('normal')
    setDescription('')
    setFiles([])
    setError(null)
  }

  const handleClose = () => {
    if (saving) return
    onClose()
  }

  const submit = async () => {
    if (!actor) return
    const t = title.trim()
    const d = description.trim()
    if (!t) {
      setError('Informe um título para o chamado.')
      return
    }
    if (!d) {
      setError('Descreva o problema ou a solicitação.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const id = await createTicket(
        db,
        actor,
        {
          title: t,
          description: d,
          category,
          priority,
        },
        files,
      )
      reset()
      onCreated(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao abrir o chamado.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Abrir chamado interno</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resumo do problema ou solicitação"
            required
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="ticket-category">Categoria</InputLabel>
            <Select
              labelId="ticket-category"
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
            >
              {TICKET_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {TICKET_CATEGORY_LABELS[c]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="ticket-priority">Prioridade</InputLabel>
            <Select
              labelId="ticket-priority"
              label="Prioridade"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              {TICKET_PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {TICKET_PRIORITY_LABELS[p]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhe o ocorrido: equipamento, sistema, mensagens de erro, setor/sala, etc."
            multiline
            minRows={4}
            required
            fullWidth
          />
          <AttachmentPicker
            files={files}
            onChange={setFiles}
            onError={(msg) => msg && setError(msg)}
            disabled={saving}
            label="Anexar print ou foto"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void submit()}
          disabled={saving || !title.trim() || !description.trim()}
        >
          {saving ? 'Enviando…' : 'Abrir chamado'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
