import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined'
import { AppPageChrome } from '../components/AppPageChrome'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { canManageCondominios } from '../lib/condominiosAccess'
import {
  countCondominios,
  createCondominio,
  deleteCondominio,
  importCondominios,
  subscribeCondominios,
  updateCondominio,
  updateCondominioLocation,
} from '../lib/condominiosFirestore'
import { geocodeCondominio, hasGeocodableAddress } from '../lib/condominiosGeocode'
import {
  CONDOMINIO_CATEGORIA_LABELS,
  emptyCondominioDraft,
  isCondominioCategoria,
  type Condominio,
  type CondominioCategoria,
  type CondominioDraft,
} from '../types/condominio'

const SEED_URL = '/data/condominios-seed.json'

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function CondominioForm({
  draft,
  onChange,
}: {
  draft: CondominioDraft
  onChange: (next: CondominioDraft) => void
}) {
  const set = (key: keyof CondominioDraft, value: string) =>
    onChange({ ...draft, [key]: value })
  const isViavel = draft.categoria === 'viavel'

  return (
    <Stack spacing={2} sx={{ mt: 0.5 }}>
      <TextField
        label="Nome do condomínio"
        value={draft.nome}
        onChange={(e) => set('nome', e.target.value)}
        fullWidth
        required
        autoFocus
      />
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          label="Rua / Avenida"
          value={draft.rua}
          onChange={(e) => set('rua', e.target.value)}
          sx={{ flex: '2 1 220px' }}
        />
        <TextField
          label="Número"
          value={draft.numero}
          onChange={(e) => set('numero', e.target.value)}
          sx={{ flex: '1 1 90px', maxWidth: 130 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          label="Bairro"
          value={draft.bairro}
          onChange={(e) => set('bairro', e.target.value)}
          sx={{ flex: '2 1 200px' }}
        />
        <TextField
          label="CEP"
          value={draft.cep}
          onChange={(e) => set('cep', e.target.value)}
          sx={{ flex: '1 1 130px', maxWidth: 180 }}
        />
      </Box>

      {isViavel ? (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            label="Síndico"
            value={draft.sindico}
            onChange={(e) => set('sindico', e.target.value)}
            sx={{ flex: '1 1 200px' }}
          />
          <TextField
            label="Vistoriador"
            value={draft.vistoriador}
            onChange={(e) => set('vistoriador', e.target.value)}
            sx={{ flex: '1 1 200px' }}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            label="Data da tentativa"
            value={draft.dataTentativa}
            onChange={(e) => set('dataTentativa', e.target.value)}
            sx={{ flex: '1 1 160px' }}
          />
          <TextField
            label="Nova vistoria"
            value={draft.novaVistoria}
            onChange={(e) => set('novaVistoria', e.target.value)}
            sx={{ flex: '1 1 160px' }}
          />
          <TextField
            label="Técnico responsável"
            value={draft.tecnicoResponsavel}
            onChange={(e) => set('tecnicoResponsavel', e.target.value)}
            sx={{ flex: '1 1 180px' }}
          />
        </Box>
      )}

      <TextField
        label={isViavel ? 'Observação' : 'Observação / motivo da inviabilidade'}
        value={draft.obs}
        onChange={(e) => set('obs', e.target.value)}
        fullWidth
        multiline
        minRows={isViavel ? 2 : 4}
      />
    </Stack>
  )
}

export function CondominiosPage() {
  const theme = useTheme()
  const { profile } = useAuth()
  const canManage = canManageCondominios(profile)

  const [items, setItems] = useState<Condominio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [tab, setTab] = useState<CondominioCategoria | 'todos'>('viavel')
  const [search, setSearch] = useState('')

  const [detail, setDetail] = useState<Condominio | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CondominioDraft>(emptyCondominioDraft('viavel'))
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Condominio | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [importing, setImporting] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const [geocoding, setGeocoding] = useState(false)
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 })

  useEffect(() => {
    const unsub = subscribeCondominios(
      db,
      (list) => {
        setItems(list)
        setLoading(false)
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Falha ao carregar condomínios.')
        setLoading(false)
      },
    )
    return unsub
  }, [])

  const counts = useMemo(
    () => ({
      viavel: items.filter((i) => i.categoria === 'viavel').length,
      inviavel: items.filter((i) => i.categoria === 'inviavel').length,
    }),
    [items],
  )

  const filtered = useMemo(() => {
    const term = normalize(search.trim())
    return items
      .filter((i) => tab === 'todos' || i.categoria === tab)
      .filter((i) => {
        if (!term) return true
        const haystack = normalize(
          [i.nome, i.bairro, i.rua, i.cep, i.tecnicoResponsavel].join(' '),
        )
        return haystack.includes(term)
      })
  }, [items, tab, search])

  const openCreate = () => {
    setEditingId(null)
    setDraft(emptyCondominioDraft(tab === 'todos' ? 'viavel' : tab))
    setActionError(null)
    setFormOpen(true)
  }

  const openEdit = (c: Condominio) => {
    setEditingId(c.id)
    setDraft({
      categoria: c.categoria,
      nome: c.nome,
      rua: c.rua,
      numero: c.numero,
      cep: c.cep,
      bairro: c.bairro,
      obs: c.obs,
      sindico: c.sindico,
      vistoriador: c.vistoriador,
      dataTentativa: c.dataTentativa,
      novaVistoria: c.novaVistoria,
      tecnicoResponsavel: c.tecnicoResponsavel,
      lat: c.lat,
      lng: c.lng,
      geocodeStatus: c.geocodeStatus,
    })
    setActionError(null)
    setFormOpen(true)
  }

  const saveForm = async () => {
    if (!draft.nome.trim()) {
      setActionError('Informe o nome do condomínio.')
      return
    }
    setSaving(true)
    setActionError(null)
    try {
      const original = editingId ? items.find((i) => i.id === editingId) ?? null : null
      const addressChanged =
        !original ||
        original.rua !== draft.rua.trim() ||
        original.numero !== draft.numero.trim() ||
        original.bairro !== draft.bairro.trim() ||
        original.cep !== draft.cep.trim()
      const alreadyLocated =
        original?.geocodeStatus === 'ok' &&
        original.lat != null &&
        original.lng != null

      let next = draft
      if (hasGeocodableAddress(draft) && (addressChanged || !alreadyLocated)) {
        try {
          const loc = await geocodeCondominio(draft)
          next = loc
            ? { ...draft, lat: loc.lat, lng: loc.lng, geocodeStatus: 'ok' }
            : { ...draft, lat: null, lng: null, geocodeStatus: 'failed' }
        } catch {
          next = { ...draft, lat: null, lng: null, geocodeStatus: 'failed' }
        }
      }

      if (editingId) {
        await updateCondominio(db, editingId, next)
      } else {
        await createCondominio(db, next)
      }
      setFormOpen(false)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Falha ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const pendingGeocode = useMemo(
    () =>
      items.filter(
        (i) => i.geocodeStatus !== 'ok' && hasGeocodableAddress(i),
      ),
    [items],
  )

  const runGeocodePending = async () => {
    if (pendingGeocode.length === 0 || geocoding) return
    setGeocoding(true)
    setActionError(null)
    setGeocodeProgress({ done: 0, total: pendingGeocode.length })
    try {
      for (let idx = 0; idx < pendingGeocode.length; idx++) {
        const c = pendingGeocode[idx]!
        try {
          const loc = await geocodeCondominio(c)
          await updateCondominioLocation(db, c.id, loc)
        } catch {
          try {
            await updateCondominioLocation(db, c.id, null)
          } catch {
            // ignora falha individual e segue para o próximo
          }
        }
        setGeocodeProgress({ done: idx + 1, total: pendingGeocode.length })
        // Respeita o limite do Nominatim (1 req/s) entre as buscas.
        await new Promise((resolve) => setTimeout(resolve, 1100))
      }
    } finally {
      setGeocoding(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteCondominio(db, deleteTarget.id)
      setDeleteTarget(null)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Falha ao excluir.')
    } finally {
      setDeleting(false)
    }
  }

  const runImport = async () => {
    setImporting(true)
    setActionError(null)
    try {
      const existing = await countCondominios(db)
      if (existing > 0) {
        setActionError(
          'Já existem condomínios cadastrados. A importação foi cancelada para evitar duplicidade.',
        )
        setImportOpen(false)
        return
      }
      const res = await fetch(SEED_URL)
      if (!res.ok) throw new Error('Não foi possível carregar a planilha base.')
      const raw = (await res.json()) as unknown
      if (!Array.isArray(raw)) throw new Error('Formato da planilha base inválido.')
      const drafts: CondominioDraft[] = raw
        .map((r) => r as Record<string, unknown>)
        .filter((r) => isCondominioCategoria(r.categoria) && typeof r.nome === 'string')
        .map((r) => ({
          ...emptyCondominioDraft(r.categoria as CondominioCategoria),
          categoria: r.categoria as CondominioCategoria,
          nome: String(r.nome ?? ''),
          rua: String(r.rua ?? ''),
          numero: String(r.numero ?? ''),
          cep: String(r.cep ?? ''),
          bairro: String(r.bairro ?? ''),
          obs: String(r.obs ?? ''),
          sindico: String(r.sindico ?? ''),
          vistoriador: String(r.vistoriador ?? ''),
          dataTentativa: String(r.dataTentativa ?? ''),
          novaVistoria: String(r.novaVistoria ?? ''),
          tecnicoResponsavel: String(r.tecnicoResponsavel ?? ''),
        }))
      await importCondominios(db, drafts)
      setImportOpen(false)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Falha na importação.')
    } finally {
      setImporting(false)
    }
  }

  const isViavelTab = tab === 'viavel'
  const isTodosTab = tab === 'todos'
  const showImport = canManage && !loading && items.length === 0

  return (
    <>
      <AppPageChrome
        overline="Consulta"
        title="Condomínios"
        subtitle={
          <Typography variant="body1" color="text.secondary">
            Base de consulta de condomínios com viabilidade de fibra óptica e
            registros de inviabilidade. {canManage
              ? 'Você pode editar este cadastro.'
              : 'Consulta somente leitura.'}
          </Typography>
        }
        maxWidth="xl"
        illustration="condominios"
        illustrationAlt="Condomínios e viabilidade de fibra"
        headerRight={
          canManage && items.length > 0 ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {pendingGeocode.length > 0 ? (
                <Tooltip title="Geocodificar os condomínios sem localização para exibi-los no mapa de cobertura">
                  <span>
                    <Button
                      variant="outlined"
                      startIcon={
                        geocoding ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <MyLocationOutlinedIcon />
                        )
                      }
                      onClick={() => void runGeocodePending()}
                      disabled={geocoding}
                    >
                      {geocoding
                        ? `Geolocalizando ${geocodeProgress.done}/${geocodeProgress.total}…`
                        : `Geolocalizar pendentes (${pendingGeocode.length})`}
                    </Button>
                  </span>
                </Tooltip>
              ) : null}
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreate}
              >
                Adicionar
              </Button>
            </Stack>
          ) : undefined
        }
      >
        <Stack spacing={2.5}>
          {error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          ) : null}
          {actionError ? (
            <Alert
              severity="error"
              sx={{ borderRadius: 2 }}
              onClose={() => setActionError(null)}
            >
              {actionError}
            </Alert>
          ) : null}

          {showImport ? (
            <Paper
              elevation={0}
              sx={{
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.4),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2.5,
                p: { xs: 2, sm: 2.5 },
                display: 'flex',
                gap: 2,
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Importar planilha inicial
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  O cadastro está vazio. Importe os registros da planilha
                  MZ_CONDOMINIOS (viáveis e inviáveis) para começar.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<UploadFileRoundedIcon />}
                onClick={() => setImportOpen(true)}
                disabled={importing}
              >
                Importar planilha
              </Button>
            </Paper>
          ) : null}

          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2.5,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v as CondominioCategoria | 'todos')}
              sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value="todos" label={`Todos (${items.length})`} />
              <Tab
                value="viavel"
                label={`${CONDOMINIO_CATEGORIA_LABELS.viavel} (${counts.viavel})`}
              />
              <Tab
                value="inviavel"
                label={`${CONDOMINIO_CATEGORIA_LABELS.inviavel} (${counts.inviavel})`}
              />
            </Tabs>

            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, bairro, rua, CEP…"
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" color="disabled" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Divider />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ px: 2.5, py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {items.length === 0
                    ? 'Nenhum condomínio cadastrado ainda.'
                    : 'Nenhum resultado para a busca atual.'}
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: '64vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Condomínio</TableCell>
                      {isTodosTab ? (
                        <TableCell sx={{ fontWeight: 700 }}>Viabilidade</TableCell>
                      ) : null}
                      <TableCell sx={{ fontWeight: 700 }}>Endereço</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Bairro</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>CEP</TableCell>
                      {!isTodosTab && isViavelTab ? (
                        <TableCell sx={{ fontWeight: 700 }}>Observação</TableCell>
                      ) : !isTodosTab ? (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Tentativa</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Motivo</TableCell>
                        </>
                      ) : null}
                      {canManage ? (
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Ações
                        </TableCell>
                      ) : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow
                        key={c.id}
                        hover
                        onClick={() => setDetail(c)}
                        sx={{ cursor: 'pointer', verticalAlign: 'top' }}
                      >
                        <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>
                          {c.nome}
                        </TableCell>
                        {isTodosTab ? (
                          <TableCell>
                            <Chip
                              size="small"
                              label={CONDOMINIO_CATEGORIA_LABELS[c.categoria]}
                              sx={{
                                fontWeight: 600,
                                fontSize: 11,
                                bgcolor: alpha(
                                  c.categoria === 'viavel'
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                                  0.12,
                                ),
                                color:
                                  c.categoria === 'viavel'
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                              }}
                            />
                          </TableCell>
                        ) : null}
                        <TableCell sx={{ minWidth: 160 }}>
                          {[c.rua, c.numero].filter(Boolean).join(', ') || '—'}
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>{c.bairro || '—'}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.cep || '—'}</TableCell>
                        {!isTodosTab && isViavelTab ? (
                          <TableCell sx={{ maxWidth: 360 }}>
                            <Box
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                color: c.obs ? 'text.primary' : 'text.disabled',
                              }}
                            >
                              {c.obs || '—'}
                            </Box>
                          </TableCell>
                        ) : !isTodosTab ? (
                          <>
                            <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 110 }}>
                              {c.dataTentativa || '—'}
                            </TableCell>
                            <TableCell sx={{ maxWidth: 420 }}>
                              <Box
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  color: c.obs ? 'text.primary' : 'text.disabled',
                                }}
                              >
                                {c.obs || '—'}
                              </Box>
                            </TableCell>
                          </>
                        ) : null}
                        {canManage ? (
                          <TableCell
                            align="right"
                            sx={{ whiteSpace: 'nowrap' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => openEdit(c)}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteTarget(c)}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {!loading && filtered.length > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {filtered.length} de {isViavelTab ? counts.viavel : counts.inviavel}{' '}
              {isViavelTab ? 'condomínios viáveis' : 'registros de inviabilidade'}.
            </Typography>
          ) : null}
        </Stack>
      </AppPageChrome>

      {/* Detalhes */}
      <Dialog
        open={detail != null}
        onClose={() => setDetail(null)}
        fullWidth
        maxWidth="sm"
      >
        {detail ? (
          <>
            <DialogTitle sx={{ pb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlaceOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {detail.nome}
                  </Typography>
                  <Chip
                    size="small"
                    label={CONDOMINIO_CATEGORIA_LABELS[detail.categoria]}
                    color={detail.categoria === 'viavel' ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1.5}>
                <DetailRow label="Endereço" value={[detail.rua, detail.numero].filter(Boolean).join(', ')} />
                <DetailRow label="Bairro" value={detail.bairro} />
                <DetailRow label="CEP" value={detail.cep} />
                {detail.categoria === 'viavel' ? (
                  <>
                    <DetailRow label="Síndico" value={detail.sindico} />
                    <DetailRow label="Vistoriador" value={detail.vistoriador} />
                  </>
                ) : (
                  <>
                    <DetailRow label="Data da tentativa" value={detail.dataTentativa} />
                    <DetailRow label="Nova vistoria" value={detail.novaVistoria} />
                    <DetailRow label="Técnico responsável" value={detail.tecnicoResponsavel} />
                  </>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {detail.categoria === 'viavel' ? 'OBSERVAÇÃO' : 'MOTIVO / OBSERVAÇÃO'}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>
                    {detail.obs || '—'}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              {canManage ? (
                <Button
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => {
                    const c = detail
                    setDetail(null)
                    openEdit(c)
                  }}
                >
                  Editar
                </Button>
              ) : null}
              <Button variant="contained" onClick={() => setDetail(null)}>
                Fechar
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      {/* Form criar/editar */}
      <Dialog
        open={formOpen}
        onClose={saving ? undefined : () => setFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId ? 'Editar condomínio' : 'Novo condomínio'} ·{' '}
          {CONDOMINIO_CATEGORIA_LABELS[draft.categoria]}
        </DialogTitle>
        <DialogContent>
          {actionError ? (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
              {actionError}
            </Alert>
          ) : null}
          <CondominioForm draft={draft} onChange={setDraft} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void saveForm()}
            disabled={saving || draft.nome.trim().length === 0}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Excluir */}
      <Dialog open={deleteTarget != null} onClose={deleting ? undefined : () => setDeleteTarget(null)}>
        <DialogTitle>Excluir condomínio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Esta
            ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} color="inherit">
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void confirmDelete()}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {deleting ? 'Excluindo…' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar importação */}
      <Dialog open={importOpen} onClose={importing ? undefined : () => setImportOpen(false)}>
        <DialogTitle>Importar planilha inicial</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Serão importados os registros da planilha MZ_CONDOMINIOS (viáveis e
            inviáveis) para o cadastro. Faça isso apenas uma vez. Deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)} disabled={importing} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void runImport()}
            disabled={importing}
            startIcon={importing ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {importing ? 'Importando…' : 'Importar agora'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 150, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1, minWidth: 120 }}>
        {value || '—'}
      </Typography>
    </Box>
  )
}
