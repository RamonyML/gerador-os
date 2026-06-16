import { useCallback, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { AppPageChrome } from '../components/AppPageChrome'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import {
  canManageModelosOs,
} from '../lib/permissions'
import {
  createModeloOs,
  deleteModeloOs,
  seedModelosOsIfEmpty,
  updateModeloOs,
  MODELOS_OS_CATEGORIES,
  type ModeloOsCategory,
  type ModeloOsDoc,
  type ModeloOsDraft,
} from '../lib/modelosOsFirestore'
import { useModelosOsFirestore } from '../hooks/useModelosOsFirestore'

const CATEGORY_COLORS: Record<string, string> = {
  manutencao: '#f97316',
  altplan: '#3b82f6',
  variadas: '#8b5cf6',
}

type FormState = {
  category: ModeloOsCategory
  title: string
  subtitle: string
  description: string
  text: string
}

const EMPTY_FORM: FormState = {
  category: 'manutencao',
  title: '',
  subtitle: '',
  description: '',
  text: '',
}

export function ModelosOsPage() {
  const theme = useTheme()
  const { profile } = useAuth()
  const canManage = canManageModelosOs(profile)
  const firestoreState = useModelosOsFirestore()

  const [activeTab, setActiveTab] = useState(0)
  const [expanded, setExpanded] = useState<string | false>(false)
  const [copyOk, setCopyOk] = useState(false)
  const [snackMsg, setSnackMsg] = useState('Texto copiado para a área de transferência')

  // Create/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ModeloOsDoc | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<ModeloOsDoc | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Seed
  const [seeding, setSeeding] = useState(false)

  const categories =
    firestoreState.status === 'ready'
      ? firestoreState.byCategory
      : MODELOS_OS_CATEGORIES.map((c) => ({ id: c.id, label: c.label, modelos: [] }))

  const activeCategory = categories[activeTab] ?? categories[0]!
  const accent = CATEGORY_COLORS[activeCategory.id] ?? theme.palette.primary.main

  const handleCopy = useCallback(async (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setSnackMsg('Texto copiado para a área de transferência')
      setCopyOk(true)
    } catch {
      /* ignore */
    }
  }, [])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setExpanded(false)
  }

  // ── Create/edit ──────────────────────────────────────────────────────────

  function openCreate() {
    setEditTarget(null)
    setForm({ ...EMPTY_FORM, category: (activeCategory.id as ModeloOsCategory) })
    setFormError(null)
    setDialogOpen(true)
  }

  function openEdit(modelo: ModeloOsDoc, e: React.MouseEvent) {
    e.stopPropagation()
    setEditTarget(modelo)
    setForm({
      category: modelo.category,
      title: modelo.title,
      subtitle: modelo.subtitle,
      description: modelo.description,
      text: modelo.text,
    })
    setFormError(null)
    setDialogOpen(true)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError('Título é obrigatório.'); return }
    if (!form.description.trim()) { setFormError('Observação é obrigatória.'); return }
    if (!form.text.trim()) { setFormError('Texto da O.S. é obrigatório.'); return }

    setSaving(true)
    setFormError(null)
    try {
      const draft: ModeloOsDraft = {
        category: form.category,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        text: form.text.trim(),
        order: editTarget?.order ?? Date.now(),
      }
      if (editTarget) {
        await updateModeloOs(db, editTarget.id, draft)
        setSnackMsg('Modelo atualizado com sucesso.')
      } else {
        await createModeloOs(db, draft)
        setSnackMsg('Modelo criado com sucesso.')
      }
      setCopyOk(true)
      setDialogOpen(false)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  function openDelete(modelo: ModeloOsDoc, e: React.MouseEvent) {
    e.stopPropagation()
    setDeleteTarget(modelo)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteModeloOs(db, deleteTarget.id)
      setSnackMsg('Modelo excluído.')
      setCopyOk(true)
      setDeleteTarget(null)
      setExpanded(false)
    } catch {
      /* ignore */
    } finally {
      setDeleting(false)
    }
  }

  // ── Seed ──────────────────────────────────────────────────────────────────

  async function handleSeed() {
    setSeeding(true)
    try {
      await seedModelosOsIfEmpty(db)
    } finally {
      setSeeding(false)
    }
  }

  // ── Empty state ───────────────────────────────────────────────────────────

  const isEmpty =
    firestoreState.status === 'ready' && firestoreState.modelos.length === 0

  return (
    <AppPageChrome
      overline="Suporte"
      title="Modelos de O.S."
      maxWidth="lg"
      headerRight={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canManage && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openCreate}
              sx={{
                bgcolor: accent,
                '&:hover': { bgcolor: alpha(accent, 0.85) },
              }}
            >
              Novo Modelo
            </Button>
          )}
          <Button
            component={RouterLink}
            to="/suporte"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ borderColor: 'divider' }}
          >
            Hub Suporte
          </Button>
        </Box>
      }
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Referências de texto para casos atípicos sem fluxo de formulário dedicado. Expanda o modelo,
          leia o contexto e copie o texto base para adaptar ao atendimento.
        </Typography>
      }
    >
      <Container maxWidth="lg" disableGutters>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14, minHeight: 48 },
              '& .MuiTabs-indicator': { backgroundColor: accent },
              '& .Mui-selected': { color: `${accent} !important` },
            }}
          >
            {categories.map((cat, i) => (
              <Tab
                key={cat.id}
                value={i}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {cat.label}
                    <Chip
                      label={cat.modelos.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: alpha(
                          CATEGORY_COLORS[cat.id] ?? theme.palette.primary.main,
                          activeTab === i ? 0.15 : 0.08,
                        ),
                        color: CATEGORY_COLORS[cat.id] ?? theme.palette.primary.main,
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Loading */}
        {firestoreState.status === 'loading' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
            <CircularProgress size={22} thickness={5} />
            <Typography variant="body2" color="text.secondary">Carregando modelos…</Typography>
          </Box>
        )}

        {/* Empty state — seed button for managers */}
        {isEmpty && (
          <Box
            sx={{
              py: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Nenhum modelo cadastrado ainda.
            </Typography>
            {canManage && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                  Inicialize os modelos padrão do sistema ou crie o primeiro modelo manualmente.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleSeed}
                  disabled={seeding}
                  startIcon={seeding ? <CircularProgress size={16} /> : undefined}
                >
                  {seeding ? 'Inicializando…' : 'Carregar modelos padrão'}
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Model list */}
        {firestoreState.status === 'ready' && activeCategory.modelos.length === 0 && !isEmpty && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum modelo nesta categoria.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activeCategory.modelos.map((modelo) => (
            <Accordion
              key={modelo.id}
              expanded={expanded === modelo.id}
              onChange={(_, isExpanded) => setExpanded(isExpanded ? modelo.id : false)}
              elevation={0}
              disableGutters
              sx={{
                border: 1,
                borderColor: expanded === modelo.id ? alpha(accent, 0.45) : 'divider',
                borderRadius: '12px !important',
                bgcolor: 'background.paper',
                transition: 'border-color 0.2s ease',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? `0 8px 24px ${alpha('#000', 0.4)}`
                      : `0 8px 24px ${alpha(accent, 0.1)}`,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon />}
                sx={{
                  px: 2.5,
                  py: 1,
                  minHeight: 64,
                  '& .MuiAccordionSummary-content': { alignItems: 'flex-start', gap: 2, my: 1 },
                  '& .MuiAccordionSummary-expandIconWrapper': { color: 'text.secondary', mt: 0.5 },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    flexShrink: 0,
                    mt: 0.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(accent, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                    color: accent,
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>

                {/* Text content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {modelo.title}
                  </Typography>
                  {modelo.subtitle ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.75 }}
                    >
                      {modelo.subtitle}
                    </Typography>
                  ) : null}
                  <Typography
                    variant="body2"
                    sx={{ lineHeight: 1.5, fontWeight: 700, color: accent }}
                  >
                    {modelo.description}
                  </Typography>
                </Box>

                {/* Action buttons */}
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, mt: 0.25 }}
                >
                  {canManage && (
                    <>
                      <Tooltip title="Editar modelo">
                        <IconButton
                          size="small"
                          onClick={(e) => openEdit(modelo, e)}
                          sx={{ color: 'text.secondary', '&:hover': { color: accent } }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir modelo">
                        <IconButton
                          size="small"
                          onClick={(e) => openDelete(modelo, e)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': { color: theme.palette.error.main },
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Copiar texto">
                    <IconButton
                      size="small"
                      onClick={(e) => void handleCopy(modelo.text, e)}
                      sx={{ color: 'text.secondary', '&:hover': { color: accent } }}
                    >
                      <ContentCopyRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.04)'
                          : 'grey.100',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, letterSpacing: '0.06em' }}
                    >
                      TEXTO BASE
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyRoundedIcon />}
                      onClick={(e) => void handleCopy(modelo.text, e)}
                      sx={{
                        height: 28,
                        fontSize: 12,
                        borderColor: alpha(accent, 0.4),
                        color: accent,
                        '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.06) },
                      }}
                    >
                      Copiar
                    </Button>
                  </Box>

                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: theme.typography.fontFamily,
                      fontSize: { xs: 13, sm: 13.5 },
                      lineHeight: 1.65,
                      color: 'text.primary',
                      maxHeight: 400,
                      overflowY: 'auto',
                    }}
                  >
                    {modelo.text}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* ── Create/Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editTarget ? 'Editar Modelo' : 'Novo Modelo de O.S.'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          {/* Category */}
          <FormControl fullWidth size="small">
            <InputLabel>Categoria</InputLabel>
            <Select
              label="Categoria"
              value={form.category}
              onChange={(e) => setField('category', e.target.value as ModeloOsCategory)}
            >
              {MODELOS_OS_CATEGORIES.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Title */}
          <TextField
            label="Título"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            size="small"
            fullWidth
            required
          />

          {/* Subtitle */}
          <TextField
            label="Subtítulo (opcional)"
            value={form.subtitle}
            onChange={(e) => setField('subtitle', e.target.value)}
            size="small"
            fullWidth
            placeholder="Ex.: ONT TP-LINK XC220 / XC230"
          />

          {/* Description / observation */}
          <TextField
            label="Observação"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            size="small"
            fullWidth
            required
            multiline
            minRows={2}
            maxRows={4}
            helperText="Contexto exibido em destaque no card (negrito + cor da categoria)."
          />

          <Divider />

          {/* Text */}
          <TextField
            label="Texto da O.S."
            value={form.text}
            onChange={(e) => setField('text', e.target.value)}
            fullWidth
            required
            multiline
            minRows={8}
            maxRows={20}
            slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontSize: 13 } } }}
            helperText="Texto completo que será copiado pelo atendente."
          />

          {formError && (
            <Typography variant="body2" color="error">
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              bgcolor: accent,
              '&:hover': { bgcolor: alpha(accent, 0.85) },
            }}
          >
            {saving ? 'Salvando…' : editTarget ? 'Salvar alterações' : 'Criar modelo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir Modelo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o modelo{' '}
            <strong>"{deleteTarget?.title}"</strong>? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {deleting ? 'Excluindo…' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ──────────────────────────────────────────────────────────── */}
      <Snackbar
        open={copyOk}
        autoHideDuration={2200}
        onClose={() => setCopyOk(false)}
        message={snackMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </AppPageChrome>
  )
}
