import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DownloadingIcon from '@mui/icons-material/Downloading'
import { AppPageChrome } from '../components/AppPageChrome'
import { AppLoader } from '../components/AppLoader'
import { useCatalogo } from '../hooks/useCatalogo'
import {
  createCatalogoItem,
  deleteCatalogoItem,
  importarPadraoCatalogo,
  reorderCatalogoItem,
  updateCatalogoItem,
} from '../lib/catalogoFirestore'
import { db } from '../lib/firebase'
import {
  CATALOGO_CATEGORIAS,
  PLAN_CATEGORIAS,
  type CatalogoCategoria,
  type CatalogoItem,
  type PlanGrupo,
} from '../types/catalogo'
import { CATALOGO_SEED } from '../data/catalogoSeedData'

const TABS: CatalogoCategoria[] = [
  'planos-altplan',
  'planos-extend',
  'planos-mudend',
  'equipamentos',
  'formas-pag',
  'canais',
  'parentesco',
]

interface FormState {
  label: string
  value: string
  ativo: boolean
  grupo: PlanGrupo | ''
}

const FORM_EMPTY: FormState = { label: '', value: '', ativo: true, grupo: '' }

export function CatalogoPage() {
  const [categoria, setCategoria] = useState<CatalogoCategoria>('planos-altplan')
  const [planGrupo, setPlanGrupo] = useState<PlanGrupo>('atual')
  const { status, items } = useCatalogo(categoria)

  const isPlanCategoria = PLAN_CATEGORIAS.has(categoria)

  const visibleItems = isPlanCategoria
    ? items.filter((i) => i.grupo === planGrupo)
    : items

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(FORM_EMPTY)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<CatalogoItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  const catInfo = CATALOGO_CATEGORIAS[categoria]

  // ── Seed ────────────────────────────────────────────────────────────────
  async function handleImportar() {
    setImporting(true)
    setImportMsg(null)
    try {
      const n = await importarPadraoCatalogo(db, categoria, CATALOGO_SEED[categoria])
      setImportMsg(
        n > 0
          ? `${n} itens importados com sucesso.`
          : 'Esta categoria já possui itens — importação ignorada para não duplicar.',
      )
    } finally {
      setImporting(false)
    }
  }

  // ── Diálogo add/edit ────────────────────────────────────────────────────
  function openAdd() {
    setEditingId(null)
    setForm({ ...FORM_EMPTY, grupo: isPlanCategoria ? planGrupo : '' })
    setDialogOpen(true)
  }

  function openEdit(item: CatalogoItem) {
    setEditingId(item.id)
    setForm({
      label: item.label,
      value: item.value,
      ativo: item.ativo,
      grupo: item.grupo ?? '',
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    if (saving) return
    setDialogOpen(false)
    setEditingId(null)
    setForm(FORM_EMPTY)
  }

  async function handleSave() {
    const label = form.label.trim()
    if (!label) return
    const value = form.value.trim() || label
    const grupo = (form.grupo || undefined) as PlanGrupo | undefined
    setSaving(true)
    try {
      if (editingId) {
        await updateCatalogoItem(db, categoria, editingId, { label, value, ativo: form.ativo, grupo })
      } else {
        const base = visibleItems.length > 0 ? Math.max(...visibleItems.map((i) => i.ordem)) : 0
        await createCatalogoItem(db, categoria, {
          label,
          value,
          ativo: form.ativo,
          ordem: base + 10,
          grupo,
        })
      }
      closeDialog()
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle ativo inline ─────────────────────────────────────────────────
  async function handleToggleAtivo(item: CatalogoItem) {
    await updateCatalogoItem(db, categoria, item.id, { ativo: !item.ativo })
  }

  // ── Reordenação ─────────────────────────────────────────────────────────
  async function handleMove(item: CatalogoItem, direction: 'up' | 'down') {
    const idx = visibleItems.indexOf(item)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= visibleItems.length) return
    const neighbor = visibleItems[swapIdx]
    await Promise.all([
      reorderCatalogoItem(db, categoria, item.id, neighbor.ordem),
      reorderCatalogoItem(db, categoria, neighbor.id, item.ordem),
    ])
  }

  // ── Exclusão ────────────────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCatalogoItem(db, categoria, deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppPageChrome
      overline="Gerenciamento"
      title="Catálogo"
      subtitle="Gerencie planos, equipamentos, formas de pagamento, canais e vínculos usados em todos os formulários."
      illustration="operations"
      illustrationAlt="Gerenciamento do catálogo"
      accentColor="#6366f1"
    >
      {/* Abas de categoria */}
      <Box sx={{ overflowX: 'auto', pb: 0.5, mb: 3 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={categoria}
          onChange={(_, v) => {
            if (v) {
              setCategoria(v as CatalogoCategoria)
              setImportMsg(null)
            }
          }}
          sx={{ flexWrap: 'nowrap' }}
        >
          {TABS.map((cat) => (
            <ToggleButton key={cat} value={cat} sx={{ whiteSpace: 'nowrap', px: 2 }}>
              {CATALOGO_CATEGORIAS[cat].titulo}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Cabeçalho da categoria */}
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{catInfo.titulo}</Typography>
          <Typography variant="caption" color="text.secondary">{catInfo.hint}</Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Tooltip title="Importa os itens padrão do sistema. Só funciona se a lista estiver vazia.">
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={importing ? <CircularProgress size={14} /> : <DownloadingIcon />}
                disabled={importing || status !== 'ready'}
                onClick={handleImportar}
              >
                Importar padrão
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={openAdd}
            disableElevation
          >
            Adicionar item
          </Button>
        </Stack>
      </Stack>

      {importMsg && (
        <Alert
          severity={importMsg.includes('ignorada') ? 'warning' : 'success'}
          onClose={() => setImportMsg(null)}
          sx={{ mb: 2 }}
        >
          {importMsg}
        </Alert>
      )}

      {/* Sub-grupo de planos */}
      {isPlanCategoria && (
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={planGrupo}
            onChange={(_, v) => { if (v) setPlanGrupo(v as PlanGrupo) }}
          >
            <ToggleButton value="atual">Plano Atual</ToggleButton>
            <ToggleButton value="ofertado">Plano Ofertado</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Lista de itens */}
      {status === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <AppLoader size={9} />
        </Box>
      )}

      {status === 'error' && (
        <Alert severity="error">Erro ao carregar os itens. Verifique a conexão.</Alert>
      )}

      {status === 'ready' && visibleItems.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="body2">
            Nenhum item cadastrado.{' '}
            {isPlanCategoria
              ? `Clique em "Adicionar item" ou use "Importar padrão" para carregar os dados do sistema.`
              : `Clique em "Adicionar item" para começar.`}
          </Typography>
        </Paper>
      )}

      {status === 'ready' && visibleItems.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={72} align="center">Ordem</TableCell>
                <TableCell>Rótulo (select)</TableCell>
                <TableCell>Valor (texto O.S.)</TableCell>
                <TableCell width={90} align="center">Ativo</TableCell>
                <TableCell width={96} align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleItems.map((item, idx) => (
                <TableRow key={item.id} sx={{ opacity: item.ativo ? 1 : 0.45 }}>
                  <TableCell align="center">
                    <Stack direction="row" sx={{ justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        disabled={idx === 0}
                        onClick={() => handleMove(item, 'up')}
                      >
                        <KeyboardArrowUpIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={idx === visibleItems.length - 1}
                        onClick={() => handleMove(item, 'down')}
                      >
                        <KeyboardArrowDownIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 320 }}>
                    {item.value !== item.label ? (
                      <Chip
                        label={item.value}
                        size="small"
                        variant="outlined"
                        sx={{ fontFamily: 'monospace', fontSize: 11, height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">— igual ao rótulo</Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={item.ativo}
                      onChange={() => handleToggleAtivo(item)}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" sx={{ justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(item)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo add/edit */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Editar item' : 'Novo item'}</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 2, mt: 1 }}>
            {isPlanCategoria && (
              <Select
                size="small"
                value={form.grupo}
                onChange={(e) => setForm((f) => ({ ...f, grupo: e.target.value as PlanGrupo }))}
                displayEmpty
              >
                <MenuItem value="atual">Plano Atual</MenuItem>
                <MenuItem value="ofertado">Plano Ofertado</MenuItem>
              </Select>
            )}
            <TextField
              label="Rótulo"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              size="small"
              fullWidth
              autoFocus
              helperText="Texto exibido no select para o operador."
            />
            <TextField
              label="Valor no texto da O.S."
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              size="small"
              fullWidth
              multiline
              minRows={2}
              helperText="O que será inserido no protocolo/O.S. Se vazio, usa o rótulo."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.ativo}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                />
              }
              label="Ativo"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancelar</Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!form.label.trim() || saving || (isPlanCategoria && !form.grupo)}
            onClick={handleSave}
          >
            {saving ? <CircularProgress size={18} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação de exclusão */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => { if (!deleting) setDeleteTarget(null) }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Excluir item</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja excluir permanentemente o item <strong>"{deleteTarget?.label}"</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            disableElevation
            disabled={deleting}
            onClick={handleConfirmDelete}
          >
            {deleting ? <CircularProgress size={18} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppPageChrome>
  )
}
