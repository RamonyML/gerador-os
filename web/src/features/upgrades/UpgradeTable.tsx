import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import DownloadIcon from '@mui/icons-material/Download'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FlagIcon from '@mui/icons-material/Flag'
import RefreshIcon from '@mui/icons-material/Refresh'
import TvIcon from '@mui/icons-material/Tv'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useUpgradeLogger } from '../../hooks/useUpgradeLogger'
import { canViewAllUpgradesInRegistry } from '../../lib/permissions'
import {
  labelAssinatura,
  labelMeioContato,
  labelTipoUpgrade,
} from '../../lib/upgradesFormat'
import {
  MeioContato,
  TipoUpgrade,
  type Upgrade,
} from '../../types/upgrades'
import { MonthNavigator } from './MonthNavigator'
import { UpgradeForm } from './UpgradeForm'

type Order = 'asc' | 'desc'

type HeadId = keyof Upgrade | 'actions' | 'select'

const headCells: { id: HeadId; label: string; sortable: boolean }[] = [
  { id: 'select', label: '', sortable: false },
  { id: 'data', label: 'Data', sortable: true },
  { id: 'duplicado', label: '', sortable: false },
  { id: 'cliente', label: 'Cliente', sortable: true },
  { id: 'meioContato', label: 'Meio', sortable: true },
  { id: 'numeroContato', label: 'Número', sortable: true },
  { id: 'assinatura', label: 'Assinatura', sortable: true },
  { id: 'tipoUpgrade', label: 'Tipo', sortable: true },
  { id: 'operadorNome', label: 'Operador', sortable: true },
  { id: 'actions', label: 'Ações', sortable: false },
]

type ExcelRow = Record<string, string>

function stripPhone(s: string): string {
  return s.replace(/\D/g, '')
}

export function UpgradeTable() {
  const { user, profile } = useAuth()
  const { logAction } = useUpgradeLogger()

  const canSeeAll = profile != null && canViewAllUpgradesInRegistry(profile)

  const [rawUpgrades, setRawUpgrades] = useState<Upgrade[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [allRowsOption, setAllRowsOption] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [filterMeio, setFilterMeio] = useState<MeioContato | ''>('')
  const [filterTipo, setFilterTipo] = useState<TipoUpgrade | ''>('')
  const [filterOperador, setFilterOperador] = useState('')
  const [operadores, setOperadores] = useState<{ id: string; nome: string }[]>(
    [],
  )
  const [orderBy, setOrderBy] = useState<keyof Upgrade>('data')
  const [order, setOrder] = useState<Order>('desc')
  const [editing, setEditing] = useState<Upgrade | null>(null)
  const [viewing, setViewing] = useState<Upgrade | null>(null)
  const [deleteOne, setDeleteOne] = useState<Upgrade | null>(null)
  const [deleteMultiOpen, setDeleteMultiOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const loadUpgrades = useCallback(async () => {
    try {
      setLoading(true)
      const startDate = startOfMonth(selectedMonth)
      const endDate = endOfMonth(selectedMonth)

      const constraints = [
        where('data', '>=', Timestamp.fromDate(startDate)),
        where('data', '<=', Timestamp.fromDate(endDate)),
      ]
      if (!canSeeAll && user?.email) {
        constraints.push(where('operadorId', '==', user.email))
      }

      const snap = await getDocs(query(collection(db, 'upgrades'), ...constraints))

      let rows = snap.docs.map((d) => {
        const data = d.data() as Omit<Upgrade, 'id'>
        return { id: d.id, ...data } as Upgrade
      })

      if (filterMeio) rows = rows.filter((u) => u.meioContato === filterMeio)
      if (filterTipo) rows = rows.filter((u) => u.tipoUpgrade === filterTipo)
      if (filterOperador)
        rows = rows.filter((u) => u.operadorId === filterOperador)

      setRawUpgrades(rows)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [
    selectedMonth,
    filterMeio,
    filterTipo,
    filterOperador,
    canSeeAll,
    user?.email,
  ])

  useEffect(() => {
    void loadUpgrades()
  }, [loadUpgrades])

  const upgrades = useMemo(() => {
    const rows = [...rawUpgrades]
    rows.sort((a, b) => {
      const av = a[orderBy]
      const bv = b[orderBy]
      if (!av || !bv) return 0
      if (orderBy === 'data') {
        return order === 'asc'
          ? (av as Timestamp).toMillis() - (bv as Timestamp).toMillis()
          : (bv as Timestamp).toMillis() - (av as Timestamp).toMillis()
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return order === 'asc'
          ? av.localeCompare(bv)
          : bv.localeCompare(av)
      }
      return 0
    })
    return rows
  }, [rawUpgrades, orderBy, order])

  useEffect(() => {
    const map = new Map<string, string>()
    rawUpgrades.forEach((u) => {
      if (u.operadorId && u.operadorNome) map.set(u.operadorId, u.operadorNome)
    })
    setOperadores(
      [...map.entries()].map(([id, nome]) => ({ id, nome })),
    )
  }, [rawUpgrades])

  const filtered = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return upgrades
    const q = debouncedSearch.toLowerCase()
    return upgrades.filter((u) =>
      u.cliente?.toLowerCase().includes(q),
    )
  }, [upgrades, debouncedSearch])

  const displayRows = filtered

  const handleSort = (property: keyof Upgrade) => {
    const asc = orderBy === property && order === 'asc'
    setOrder(asc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleExport = () => {
    const data: ExcelRow[] = upgrades.map((u) => ({
      'Data do Upgrade': u.data ? format(u.data.toDate(), 'dd/MM/yyyy') : '',
      Cliente: u.cliente ?? '',
      'Meio de Contato': labelMeioContato(u.meioContato),
      Numero: stripPhone(u.numeroContato ?? ''),
      Assinatura: u.isRoku ? '' : labelAssinatura(u.assinatura),
      Tipo: labelTipoUpgrade(u.tipoUpgrade),
      Operador: u.operadorNome ?? '',
      Observacoes: u.observacao ?? '',
      Roku: u.isRoku ? 'Sim' : 'Não',
      'Registrado em': u.criadoEm
        ? format(u.criadoEm.toDate(), 'dd/MM/yyyy HH:mm')
        : '',
      'Registrado por': u.createdBy ?? u.operadorNome ?? '',
      'Ultima edicao': u.ultimaAtualizacao
        ? format(u.ultimaAtualizacao.toDate(), 'dd/MM/yyyy HH:mm')
        : '',
      'Editado por': u.updatedBy ?? u.operadorNome ?? '',
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Upgrades')

    let fileName = `upgrades_${format(selectedMonth, 'MMMM_yyyy', { locale: ptBR })}`
    if (filterOperador) {
      const op = operadores.find((o) => o.id === filterOperador)
      if (op) fileName += `_${op.nome}`
    }
    XLSX.writeFile(wb, `${fileName}.xlsx`)
  }

  const canModifyRow = (u: Upgrade) =>
    canSeeAll || u.operadorId === user?.email

  const sliceRows = displayRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  )

  const handleDeleteOne = async () => {
    if (!deleteOne?.id) return
    try {
      await deleteDoc(doc(db, 'upgrades', deleteOne.id))
      await logAction({
        action: 'delete',
        targetCollection: 'upgrades',
        targetId: deleteOne.id,
      })
      setDeleteOne(null)
      void loadUpgrades()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteMulti = async () => {
    try {
      setLoading(true)
      for (const id of selected) {
        await deleteDoc(doc(db, 'upgrades', id))
        await logAction({
          action: 'delete',
          targetCollection: 'upgrades',
          targetId: id,
        })
      }
      setSelected([])
      setDeleteMultiOpen(false)
      void loadUpgrades()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string | undefined) => {
    if (!id) return
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const selectAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelected([])
      return
    }
    const src = debouncedSearch.length >= 2 ? filtered : upgrades
    const ids = src
      .filter((u) => u.id && canModifyRow(u))
      .map((u) => u.id!)
    setSelected(ids)
  }

  if (loading && rawUpgrades.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Carregando…</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Buscar cliente"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Mínimo 2 caracteres para filtrar"
          sx={{ maxWidth: 420 }}
        />

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <MonthNavigator
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />

          {!canSeeAll ? (
            <Typography variant="body2" color="text.secondary">
              Você vê apenas os seus registros.
            </Typography>
          ) : null}

          {canSeeAll ? (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Operador</InputLabel>
              <Select
                value={filterOperador}
                label="Operador"
                onChange={(e) => setFilterOperador(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {operadores.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Meio</InputLabel>
            <Select
              value={filterMeio}
              label="Meio"
              onChange={(e) =>
                setFilterMeio(e.target.value as MeioContato | '')
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {(Object.values(MeioContato) as MeioContato[]).map((m) => (
                <MenuItem key={m} value={m}>
                  {labelMeioContato(m)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filterTipo}
              label="Tipo"
              onChange={(e) =>
                setFilterTipo(e.target.value as TipoUpgrade | '')
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {(Object.values(TipoUpgrade) as TipoUpgrade[]).map((t) => (
                <MenuItem key={t} value={t}>
                  {labelTipoUpgrade(t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Atualizar">
            <IconButton onClick={() => void loadUpgrades()} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Exportar Excel
          </Button>

          {selected.length > 0 ? (
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlinedIcon />}
              onClick={() => setDeleteMultiOpen(true)}
            >
              Excluir ({selected.length})
            </Button>
          ) : null}
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < displayRows.filter((u) => canModifyRow(u)).length
                  }
                  checked={
                    displayRows.filter((u) => canModifyRow(u)).length > 0 &&
                    selected.length ===
                      displayRows.filter((u) => canModifyRow(u)).length
                  }
                  onChange={(e) => selectAllVisible(e.target.checked)}
                />
              </TableCell>
              {headCells
                .filter((h) => h.id !== 'select')
                .map((h) => (
                  <TableCell
                    key={String(h.id)}
                    sortDirection={
                      h.sortable && orderBy === h.id ? order : false
                    }
                  >
                    {h.sortable ? (
                      <TableSortLabel
                        active={orderBy === h.id}
                        direction={orderBy === h.id ? order : 'asc'}
                        onClick={() => handleSort(h.id as keyof Upgrade)}
                      >
                        {h.label}
                      </TableSortLabel>
                    ) : (
                      h.label
                    )}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sliceRows.map((u) => {
              const sel = u.id ? selected.includes(u.id) : false
              const mod = canModifyRow(u)
              return (
                <TableRow key={u.id} hover>
                  <TableCell padding="checkbox">
                    {mod && u.id ? (
                      <Checkbox
                        checked={sel}
                        onChange={() => toggleSelect(u.id)}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {u.data
                      ? format(u.data.toDate(), 'dd/MM/yyyy', { locale: ptBR })
                      : ''}
                  </TableCell>
                  <TableCell sx={{ width: 72 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {u.duplicado ? (
                        <Tooltip title="Possível duplicidade">
                          <FlagIcon color="warning" fontSize="small" />
                        </Tooltip>
                      ) : null}
                      {u.isRoku ? (
                        <Tooltip title="Roku TV">
                          <TvIcon sx={{ color: 'secondary.main' }} fontSize="small" />
                        </Tooltip>
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell>{u.cliente}</TableCell>
                  <TableCell>{labelMeioContato(u.meioContato)}</TableCell>
                  <TableCell>{u.numeroContato}</TableCell>
                  <TableCell>
                    {u.isRoku ? '—' : labelAssinatura(u.assinatura)}
                  </TableCell>
                  <TableCell>{labelTipoUpgrade(u.tipoUpgrade)}</TableCell>
                  <TableCell>{u.operadorNome}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={() => setViewing(u)}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <span>
                        <IconButton
                          size="small"
                          disabled={!mod}
                          onClick={() => mod && setEditing(u)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={!mod}
                          onClick={() => mod && setDeleteOne(u)}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={displayRows.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={
          allRowsOption ? Math.max(displayRows.length, 1) : rowsPerPage
        }
        onRowsPerPageChange={(e) => {
          const v = e.target.value
          if (v === '-1') {
            setAllRowsOption(true)
            setRowsPerPage(displayRows.length)
          } else {
            setAllRowsOption(false)
            setRowsPerPage(Number.parseInt(v, 10))
          }
          setPage(0)
        }}
        rowsPerPageOptions={[10, 25, 50, 100, { label: 'Todos', value: -1 }]}
        labelRowsPerPage="Por página"
      />

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar upgrade</DialogTitle>
        <DialogContent>
          <UpgradeForm
            upgradeId={editing?.id}
            onSuccess={() => {
              setEditing(null)
              void loadUpgrades()
            }}
            onCancel={() => setEditing(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes</DialogTitle>
        <DialogContent>
          <UpgradeForm
            upgradeId={viewing?.id}
            readOnly
            onCancel={() => setViewing(null)}
          />
          {viewing ? (
            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Auditoria
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Registrado em
                  </Typography>
                  <Typography variant="body2">
                    {viewing.criadoEm
                      ? format(
                          viewing.criadoEm.toDate(),
                          'dd/MM/yyyy HH:mm',
                          { locale: ptBR },
                        )
                      : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Registrado por
                  </Typography>
                  <Typography variant="body2">
                    {viewing.createdBy ?? viewing.operadorNome ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Última edição
                  </Typography>
                  <Typography variant="body2">
                    {viewing.ultimaAtualizacao
                      ? format(
                          viewing.ultimaAtualizacao.toDate(),
                          'dd/MM/yyyy HH:mm',
                          { locale: ptBR },
                        )
                      : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Editado por
                  </Typography>
                  <Typography variant="body2">
                    {viewing.updatedBy ?? viewing.operadorNome ?? '—'}
                  </Typography>
                </Box>
              </Box>
              {viewing.criadoEm &&
              viewing.ultimaAtualizacao &&
              viewing.criadoEm.toMillis() !==
                viewing.ultimaAtualizacao.toMillis() ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Registro alterado após a criação.
                </Alert>
              ) : null}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)}>Fechar</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (viewing && canModifyRow(viewing)) {
                setEditing(viewing)
                setViewing(null)
              }
            }}
            disabled={!viewing || !canModifyRow(viewing)}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteOne} onClose={() => setDeleteOne(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Excluir o registro de <strong>{deleteOne?.cliente}</strong>? Esta
            ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOne(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDeleteOne}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteMultiOpen} onClose={() => setDeleteMultiOpen(false)}>
        <DialogTitle>Excluir vários</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Excluir {selected.length} registro(s) selecionado(s)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteMultiOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDeleteMulti}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
