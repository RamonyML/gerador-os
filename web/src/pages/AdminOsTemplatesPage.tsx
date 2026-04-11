import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { Add, DeleteOutlined, Edit } from '@mui/icons-material'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useAdminOsTemplates } from '../hooks/useAdminOsTemplates'
import type { OsTemplate, OsTemplateField } from '../types/osTemplate'
import {
  SECTOR_LABELS,
  SECTORS,
  type Sector,
} from '../types/profile'

function emptyField(): OsTemplateField {
  return { id: '', label: '', placeholder: '', multiline: false }
}

export function AdminOsTemplatesPage() {
  const { profile } = useAuth()
  const { state, reload } = useAdminOsTemplates(profile)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [sector, setSector] = useState<Sector>('suporte')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [version, setVersion] = useState(1)
  const [active, setActive] = useState(true)
  const [outputTemplate, setOutputTemplate] = useState('')
  const [fields, setFields] = useState<OsTemplateField[]>([emptyField()])

  const canPickSector = profile?.isDev === true || profile?.isAdmin === true

  const openNew = () => {
    setEditingId(null)
    setFormError(null)
    setSector((profile?.sector as Sector) ?? 'suporte')
    setSlug('')
    setTitle('')
    setVersion(1)
    setActive(true)
    setOutputTemplate('')
    setFields([emptyField()])
    setDialogOpen(true)
  }

  const openEdit = (t: OsTemplate) => {
    setEditingId(t.id)
    setFormError(null)
    setSector(t.sector)
    setSlug(t.slug)
    setTitle(t.title)
    setVersion(t.version)
    setActive(t.active)
    setOutputTemplate(t.outputTemplate)
    setFields(t.fields.length > 0 ? t.fields.map((f) => ({ ...f })) : [emptyField()])
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (!saving) setDialogOpen(false)
  }

  const normalizedFields = useMemo(() => {
    return fields
      .map((f) => ({
        id: f.id.trim(),
        label: f.label.trim(),
        placeholder: f.placeholder?.trim() || undefined,
        multiline: f.multiline === true,
      }))
      .filter((f) => f.id && f.label)
  }, [fields])

  async function handleSave() {
    setFormError(null)
    if (!profile) return
    const slugT = slug.trim()
    const titleT = title.trim()
    if (!slugT || !titleT) {
      setFormError('Preencha slug e título.')
      return
    }
    if (!outputTemplate.trim()) {
      setFormError('Preencha o texto de saída (outputTemplate).')
      return
    }

    const payload = {
      sector,
      slug: slugT,
      title: titleT,
      version: Number(version) || 1,
      active,
      outputTemplate: outputTemplate,
      fields: normalizedFields,
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateDoc(doc(db, 'osTemplates', editingId), payload)
      } else {
        await addDoc(collection(db, 'osTemplates'), payload)
      }
      setDialogOpen(false)
      reload()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(t: OsTemplate) {
    if (
      !window.confirm(
        `Excluir o modelo "${t.title}"? Esta ação não pode ser desfeita pelo app.`,
      )
    ) {
      return
    }
    try {
      await deleteDoc(doc(db, 'osTemplates', t.id))
      reload()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir.')
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Modelos de O.S
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crie e edite fluxos sem usar o Console do Firebase. Operadores
            continuam vendo só modelos <strong>ativos</strong> do setor.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openNew}>
          Novo modelo
        </Button>
      </Box>

      {state.status === 'loading' ? (
        <Typography color="text.secondary">Carregando…</Typography>
      ) : null}
      {state.status === 'error' ? (
        <Alert severity="error">{state.message}</Alert>
      ) : null}

      {state.status === 'ready' ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Setor</TableCell>
                <TableCell align="right">Versão</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">
                      Nenhum modelo. Clique em &quot;Novo modelo&quot;.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                state.templates.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>
                      <code>{t.slug}</code>
                    </TableCell>
                    <TableCell>{SECTOR_LABELS[t.sector]}</TableCell>
                    <TableCell align="right">{t.version}</TableCell>
                    <TableCell>{t.active ? 'Sim' : 'Não'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="Editar"
                        onClick={() => openEdit(t)}
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="Excluir"
                        onClick={() => void handleDelete(t)}
                        size="small"
                        color="error"
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingId ? 'Editar modelo' : 'Novo modelo'}
        </DialogTitle>
        <DialogContent dividers>
          {formError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          ) : null}

          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <FormControl fullWidth disabled={!canPickSector}>
              <InputLabel id="sector-label">Setor</InputLabel>
              <Select
                labelId="sector-label"
                label="Setor"
                value={sector}
                onChange={(e) => setSector(e.target.value as Sector)}
              >
                {SECTORS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {SECTOR_LABELS[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!canPickSector ? (
              <Typography variant="caption" color="text.secondary">
                O setor do modelo é o do seu perfil. Dev/Admin podem escolher
                qualquer setor.
              </Typography>
            ) : null}

            <TextField
              label="Slug (identificador único legível)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              fullWidth
              required
              helperText="Ex.: mud-end-atendimento (sem espaços; use hífen)."
            />
            <TextField
              label="Título (aparece no gerador)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Versão"
              type="number"
              value={version}
              onChange={(e) => setVersion(Number(e.target.value))}
              fullWidth
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
              }
              label="Modelo ativo (inativo some para operadores)"
            />

            <TextField
              label="Texto de saída (placeholders {{campo}})"
              value={outputTemplate}
              onChange={(e) => setOutputTemplate(e.target.value)}
              fullWidth
              required
              multiline
              minRows={6}
            />

            <Typography variant="subtitle2">Campos do formulário</Typography>
            <Typography variant="caption" color="text.secondary">
              Cada <code>id</code> deve coincidir com um{' '}
              <code>{'{{id}}'}</code> no texto acima (ex.: cliente, protocolo).
            </Typography>

            {fields.map((f, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Campo {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="Remover campo"
                      onClick={() =>
                        setFields((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                  <TextField
                    size="small"
                    label="id (chave)"
                    value={f.id}
                    onChange={(e) =>
                      setFields((prev) => {
                        const n = [...prev]
                        n[index] = { ...n[index], id: e.target.value }
                        return n
                      })
                    }
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Rótulo"
                    value={f.label}
                    onChange={(e) =>
                      setFields((prev) => {
                        const n = [...prev]
                        n[index] = { ...n[index], label: e.target.value }
                        return n
                      })
                    }
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Placeholder (opcional)"
                    value={f.placeholder ?? ''}
                    onChange={(e) =>
                      setFields((prev) => {
                        const n = [...prev]
                        n[index] = { ...n[index], placeholder: e.target.value }
                        return n
                      })
                    }
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={f.multiline === true}
                        onChange={(e) =>
                          setFields((prev) => {
                            const n = [...prev]
                            n[index] = {
                              ...n[index],
                              multiline: e.target.checked,
                            }
                            return n
                          })
                        }
                      />
                    }
                    label="Várias linhas"
                  />
                </Stack>
              </Paper>
            ))}

            <Button
              startIcon={<Add />}
              onClick={() => setFields((prev) => [...prev, emptyField()])}
            >
              Adicionar campo
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
