import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
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
import { stripUndefinedDeep } from '../lib/firestoreSanitize'
import { useAuth } from '../contexts/AuthContext'
import { useAdminOsTemplates } from '../hooks/useAdminOsTemplates'
import { getMudEndExampleDefaults } from '../data/mudEndExample'
import { SUPPORT_DEMANDS } from '../data/supportDemands'
import type {
  FieldControl,
  FieldLayout,
  OsTemplate,
  OsTemplateField,
} from '../types/osTemplate'
import {
  SECTOR_LABELS,
  SECTORS,
  type Sector,
} from '../types/profile'

const CONTROL_LABELS: Record<FieldControl, string> = {
  text: 'Texto curto',
  textarea: 'Texto longo',
  select: 'Lista (select)',
  radio: 'Opções (radio)',
  date: 'Data (calendário)',
}

function layoutPayload(f: OsTemplateField): FieldLayout | undefined {
  const L = f.layout
  if (!L) return undefined
  const o: FieldLayout = {}
  if (L.xs != null) o.xs = L.xs
  if (L.sm != null) o.sm = L.sm
  if (L.md != null) o.md = L.md
  return Object.keys(o).length > 0 ? o : undefined
}

function fieldMeta(f: OsTemplateField): Pick<OsTemplateField, 'layout' | 'section'> {
  const o: Pick<OsTemplateField, 'layout' | 'section'> = {}
  const lo = layoutPayload(f)
  if (lo) o.layout = lo
  const sec = f.section?.trim()
  if (sec) o.section = sec
  return o
}

function emptyField(): OsTemplateField {
  return {
    id: '',
    label: '',
    placeholder: '',
    control: 'text',
    options: [],
    multiline: false,
  }
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
  const [demandCategory, setDemandCategory] = useState('geral')
  const [fields, setFields] = useState<OsTemplateField[]>([emptyField()])

  const canPickSector = profile?.isDev === true || profile?.isAdmin === true

  const loadMudEndExampleIntoForm = () => {
    setFormError(null)
    const d = getMudEndExampleDefaults()
    setSlug(d.slug)
    setTitle(d.title)
    setOutputTemplate(d.outputTemplate)
    setDemandCategory(d.demandCategory)
    setVersion(1)
    setActive(true)
    setFields(
      d.fields.map((f) => ({
        ...f,
        options: f.options ? f.options.map((o) => ({ ...o })) : [],
      })),
    )
  }

  const openNew = () => {
    setEditingId(null)
    setFormError(null)
    setSector((profile?.sector as Sector) ?? 'suporte')
    setSlug('')
    setTitle('')
    setVersion(1)
    setActive(true)
    setOutputTemplate('')
    setDemandCategory('geral')
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
    setDemandCategory(t.demandCategory)
    setFields(
      t.fields.length > 0
        ? t.fields.map((f) => ({
            ...f,
            control: f.control ?? (f.multiline ? 'textarea' : 'text'),
            options: f.options ? f.options.map((o) => ({ ...o })) : [],
          }))
        : [emptyField()],
    )
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (!saving) setDialogOpen(false)
  }

  function buildFieldsPayload(): OsTemplateField[] | null {
    const out: OsTemplateField[] = []
    for (const f of fields) {
      const id = f.id.trim()
      const label = f.label.trim()
      if (!id || !label) continue
      const ctrl: FieldControl = f.control ?? 'text'
      const ph = f.placeholder?.trim()
      const opts = (f.options ?? [])
        .map((o) => ({
          value: o.value.trim(),
          label: o.label.trim(),
        }))
        .filter((o) => o.value && o.label)

      const meta = fieldMeta(f)

      if (ctrl === 'select' || ctrl === 'radio') {
        if (opts.length === 0) {
          setFormError(
            `Campo "${label}" (${id}): lista/radio precisa de pelo menos uma opção com valor e rótulo.`,
          )
          return null
        }
        const base = ph
          ? { id, label, placeholder: ph, control: ctrl, options: opts }
          : { id, label, control: ctrl, options: opts }
        out.push({ ...base, ...meta })
      } else if (ctrl === 'textarea') {
        const base = ph
          ? {
              id,
              label,
              placeholder: ph,
              control: 'textarea' as const,
              multiline: true,
            }
          : { id, label, control: 'textarea' as const, multiline: true }
        out.push({ ...base, ...meta })
      } else if (ctrl === 'date') {
        const base = ph
          ? { id, label, placeholder: ph, control: 'date' as const }
          : { id, label, control: 'date' as const }
        out.push({ ...base, ...meta })
      } else {
        const base = ph
          ? { id, label, placeholder: ph, control: 'text' as const }
          : { id, label, control: 'text' as const }
        out.push({ ...base, ...meta })
      }
    }
    return out
  }

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

    const fieldsPayload = buildFieldsPayload()
    if (fieldsPayload === null) return

    const payload = stripUndefinedDeep({
      sector,
      slug: slugT,
      title: titleT,
      version: Number(version) || 1,
      active,
      outputTemplate: outputTemplate,
      demandCategory: demandCategory.trim() || 'geral',
      fields: fieldsPayload,
    })

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
                <TableCell>Demanda</TableCell>
                <TableCell align="right">Versão</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
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
                    <TableCell>
                      {SUPPORT_DEMANDS.find((x) => x.id === t.demandCategory)
                        ?.title ?? t.demandCategory}
                    </TableCell>
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
            <FormControl fullWidth size="small">
              <InputLabel id="demand-cat-label">Demanda (hub Suporte)</InputLabel>
              <Select
                labelId="demand-cat-label"
                label="Demanda (hub Suporte)"
                value={demandCategory}
                onChange={(e) => setDemandCategory(e.target.value)}
              >
                {SUPPORT_DEMANDS.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Define em qual card do menu <strong>Suporte</strong> o modelo aparece.
            </Typography>
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Cada <code>id</code> deve coincidir com um{' '}
              <code>{'{{id}}'}</code> no texto acima. Para <strong>select</strong>{' '}
              e <strong>radio</strong>, defina opções (valor = o que entra no
              texto; pode ser um parágrafo inteiro).
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1, mb: 1 }}
              onClick={loadMudEndExampleIntoForm}
            >
              Carregar exemplo MUD END (protocolo do HTML)
            </Button>

            {fields.map((f, index) => {
              const ctrl: FieldControl = f.control ?? 'text'
              return (
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
                  <FormControl fullWidth size="small">
                    <InputLabel id={`ctrl-${index}`}>Tipo do campo</InputLabel>
                    <Select
                      labelId={`ctrl-${index}`}
                      label="Tipo do campo"
                      value={ctrl}
                      onChange={(e) => {
                        const next = e.target.value as FieldControl
                        setFields((prev) => {
                          const n = [...prev]
                          const cur = { ...n[index], control: next }
                          if (next === 'select' || next === 'radio') {
                            cur.options =
                              cur.options && cur.options.length > 0
                                ? cur.options
                                : [{ value: '', label: '' }]
                          } else {
                            cur.options = []
                          }
                          if (next === 'textarea') cur.multiline = true
                          else cur.multiline = false
                          n[index] = cur
                          return n
                        })
                      }}
                    >
                      {(Object.keys(CONTROL_LABELS) as FieldControl[]).map(
                        (k) => (
                          <MenuItem key={k} value={k}>
                            {CONTROL_LABELS[k]}
                          </MenuItem>
                        ),
                      )}
                    </Select>
                  </FormControl>
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
                  <TextField
                    size="small"
                    label="Seção (opcional, agrupa no gerador)"
                    value={f.section ?? ''}
                    placeholder="Ex.: IDENTIFICAÇÃO DO CLIENTE"
                    onChange={(e) =>
                      setFields((prev) => {
                        const n = [...prev]
                        n[index] = { ...n[index], section: e.target.value }
                        return n
                      })
                    }
                    fullWidth
                  />
                  {(ctrl === 'select' || ctrl === 'radio') && (
                    <Box sx={{ pl: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Opções (valor no texto · rótulo na tela)
                      </Typography>
                      {(f.options ?? [{ value: '', label: '' }]).map(
                        (opt, oi) => (
                          <Stack
                            key={oi}
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            sx={{ mt: 1, alignItems: 'flex-start' }}
                          >
                            <TextField
                              size="small"
                              label="Valor (vai para o protocolo)"
                              value={opt.value}
                              multiline
                              minRows={2}
                              fullWidth
                              onChange={(e) =>
                                setFields((prev) => {
                                  const n = [...prev]
                                  const opts = [
                                    ...(n[index].options ?? [
                                      { value: '', label: '' },
                                    ]),
                                  ]
                                  opts[oi] = {
                                    ...opts[oi],
                                    value: e.target.value,
                                  }
                                  n[index] = { ...n[index], options: opts }
                                  return n
                                })
                              }
                            />
                            <TextField
                              size="small"
                              label="Rótulo curto"
                              value={opt.label}
                              fullWidth
                              onChange={(e) =>
                                setFields((prev) => {
                                  const n = [...prev]
                                  const opts = [
                                    ...(n[index].options ?? [
                                      { value: '', label: '' },
                                    ]),
                                  ]
                                  opts[oi] = {
                                    ...opts[oi],
                                    label: e.target.value,
                                  }
                                  n[index] = { ...n[index], options: opts }
                                  return n
                                })
                              }
                            />
                            <IconButton
                              aria-label="Remover opção"
                              size="small"
                              onClick={() =>
                                setFields((prev) => {
                                  const n = [...prev]
                                  const opts = [
                                    ...(n[index].options ?? []),
                                  ].filter((_, j) => j !== oi)
                                  n[index] = {
                                    ...n[index],
                                    options:
                                      opts.length > 0
                                        ? opts
                                        : [{ value: '', label: '' }],
                                  }
                                  return n
                                })
                              }
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Stack>
                        ),
                      )}
                      <Button
                        size="small"
                        startIcon={<Add />}
                        sx={{ mt: 1 }}
                        onClick={() =>
                          setFields((prev) => {
                            const n = [...prev]
                            const opts = [
                              ...(n[index].options ?? []),
                              { value: '', label: '' },
                            ]
                            n[index] = { ...n[index], options: opts }
                            return n
                          })
                        }
                      >
                        Adicionar opção
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Paper>
              )
            })}

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
