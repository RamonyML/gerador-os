import { useCallback, useEffect, useMemo, useState } from 'react'
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
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  LinearProgress,
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
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { Add, Edit, Search as SearchIcon } from '@mui/icons-material'
import { HeroIllustration } from '../components/HeroIllustration'
import { ILLUSTRATIONS } from '../data/illustrations'
import { AppPageChrome } from '../components/AppPageChrome'
import { useAuth } from '../contexts/AuthContext'
import {
  callableErrorMessage,
  manageUsersCreate,
  manageUsersList,
  manageUsersUpdate,
  type ManagedUserRow,
} from '../lib/userManagementApi'
import {
  SECTOR_LABELS,
  SECTORS,
  type Hierarchy,
  type Sector,
} from '../types/profile'
import { isProtectedManagementAccount } from '../lib/protectedUserManagement'

const HIERARCHY_LABELS: Record<Hierarchy, string> = {
  gerente: 'Gestor',
  supervisor: 'Supervisor',
  operador: 'Operador',
}

function rowDisplayName(row: ManagedUserRow): string {
  return (
    row.displayName?.trim() ||
    row.email?.trim() ||
    row.uid.slice(0, 8)
  )
}

export function AdminUsersPage() {
  const theme = useTheme()
  const { user, profile } = useAuth()
  const isDev = profile?.isDev === true
  const canEditAdminFlag =
    profile?.isDev === true || profile?.isAdmin === true
  const canPickSector = profile?.isDev === true || profile?.isAdmin === true
  const isCurrentUserProtected = isProtectedManagementAccount(
    user?.email ?? profile?.email,
  )

  const [rows, setRows] = useState<ManagedUserRow[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  /** Primeira página / atualizar lista — consulta ao Auth + Firestore por usuário pode levar alguns segundos. */
  const [loadingInitial, setLoadingInitial] = useState(true)
  /** Paginação “carregar mais” (não bloqueia a tabela já exibida). */
  const [loadingMore, setLoadingMore] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedUserRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [sector, setSector] = useState<Sector>('suporte')
  const [hierarchy, setHierarchy] = useState<Hierarchy>('operador')
  const [active, setActive] = useState(true)
  const [flagAdmin, setFlagAdmin] = useState(false)
  const [flagDev, setFlagDev] = useState(false)
  const [flagTi, setFlagTi] = useState(false)
  const [flagValidacao, setFlagValidacao] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterSector, setFilterSector] = useState<Sector | ''>('')
  const [filterHierarchy, setFilterHierarchy] = useState<Hierarchy | ''>('')

  const loadFirstPage = useCallback(async () => {
    setLoadingInitial(true)
    setListError(null)
    try {
      const res = await manageUsersList()
      setRows(res.users)
      setNextPageToken(res.nextPageToken)
    } catch (e) {
      setListError(callableErrorMessage(e))
      setRows([])
      setNextPageToken(null)
    } finally {
      setLoadingInitial(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!nextPageToken) return
    setLoadingMore(true)
    setListError(null)
    try {
      const res = await manageUsersList(nextPageToken)
      setRows((prev) => [...prev, ...res.users])
      setNextPageToken(res.nextPageToken)
    } catch (e) {
      setListError(callableErrorMessage(e))
    } finally {
      setLoadingMore(false)
    }
  }, [nextPageToken])

  useEffect(() => {
    void loadFirstPage()
  }, [loadFirstPage])

  const defaultSector = useMemo((): Sector => {
    if (profile?.sector) return profile.sector
    return 'suporte'
  }, [profile?.sector])

  const filteredRows = useMemo(() => {
    let list = rows
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((r) => {
        const name = rowDisplayName(r).toLowerCase()
        const mail = (r.email ?? '').toLowerCase()
        return name.includes(q) || mail.includes(q)
      })
    }
    if (filterSector) {
      list = list.filter((r) => r.sector === filterSector)
    }
    if (filterHierarchy) {
      list = list.filter((r) => r.hierarchy === filterHierarchy)
    }
    return [...list].sort((a, b) =>
      rowDisplayName(a).localeCompare(rowDisplayName(b), 'pt', {
        sensitivity: 'base',
      }),
    )
  }, [rows, searchQuery, filterSector, filterHierarchy])

  const hasActiveFilters =
    searchQuery.trim().length > 0 || filterSector !== '' || filterHierarchy !== ''

  const openCreate = () => {
    setEditing(null)
    setFormError(null)
    setEmail('')
    setPassword('')
    setDisplayName('')
    setSector(
      canPickSector
        ? defaultSector
        : ((profile?.sector as Sector) ?? 'suporte'),
    )
    setHierarchy('operador')
    setActive(true)
    setFlagAdmin(false)
    setFlagDev(false)
    setFlagTi(false)
    setDialogOpen(true)
  }

  const openEdit = (row: ManagedUserRow) => {
    setEditing(row)
    setFormError(null)
    setEmail(row.email ?? '')
    setPassword('')
    setDisplayName(row.displayName ?? '')
    setSector((row.sector as Sector) ?? defaultSector)
    setHierarchy((row.hierarchy as Hierarchy) ?? 'operador')
    const accountActive = !row.disabled && (row.profileActive !== false)
    setActive(accountActive)
    setFlagAdmin(row.isAdmin === true)
    setFlagDev(row.isDev === true)
    setFlagTi(row.isTi === true)
    setFlagValidacao(row.isValidacao === true)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (saving) return
    setDialogOpen(false)
  }

  const submit = async () => {
    setSaving(true)
    setFormError(null)
    try {
      if (
        editing &&
        !isCurrentUserProtected &&
        isProtectedManagementAccount(editing.email)
      ) {
        setFormError('Você não pode editar ou excluir o DEV fundador.')
        return
      }
      if (!editing) {
        await manageUsersCreate({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          sector,
          hierarchy,
          active,
          ...(canEditAdminFlag ? { isAdmin: flagAdmin } : {}),
          ...(isDev ? { isDev: flagDev } : {}),
          ...(canEditAdminFlag ? { isTi: flagTi } : {}),
          isValidacao: flagValidacao,
        })
      } else {
        const payload: Parameters<typeof manageUsersUpdate>[0] = {
          uid: editing.uid,
          email: email.trim(),
          displayName: displayName.trim(),
          sector,
          hierarchy,
          active,
        }
        if (password.trim()) payload.password = password.trim()
        if (canEditAdminFlag) payload.isAdmin = flagAdmin
        if (isDev) payload.isDev = flagDev
        if (canEditAdminFlag) payload.isTi = flagTi
        payload.isValidacao = flagValidacao
        await manageUsersUpdate(payload)
      }
      setDialogOpen(false)
      await loadFirstPage()
    } catch (e) {
      setFormError(callableErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppPageChrome
        overline="Administração"
        title="Usuários"
        subtitle={
          <Typography variant="body1" color="text.secondary" component="div">
            Crie e atualize contas no Authentication e o documento em{' '}
            <code>users/&#123;uid&#125;</code> (setor, hierarquia, nome, flags). Somente{' '}
            <strong>gestor</strong>, <strong>administrador</strong> e{' '}
            <strong>dev</strong> acessam esta tela;
            gestores só enxergam o próprio setor. A senha só trafega ao
            salvar e exige Cloud Functions implantadas.
          </Typography>
        }
        headerRight={
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: 260, sm: 280 },
              alignSelf: { xs: 'center', sm: 'flex-end' },
              flexShrink: 0,
              filter:
                theme.palette.mode === 'light'
                  ? undefined
                  : `drop-shadow(0 8px 24px ${alpha('#000', 0.35)})`,
            }}
          >
            <HeroIllustration src={ILLUSTRATIONS.collaboration} alt="Colaboração" />
          </Box>
        }
      >
      {listError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {listError}
        </Alert>
      ) : null}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => openCreate()}>
          Novo usuário
        </Button>
        <Button
          variant="outlined"
          onClick={() => void loadFirstPage()}
          disabled={loadingInitial}
        >
          Atualizar lista
        </Button>
      </Stack>

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          opacity: loadingInitial && rows.length === 0 ? 0.7 : 1,
        }}
      >
        <Stack spacing={2}>
          <TextField
            size="small"
            placeholder="Buscar por nome ou e-mail…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            disabled={loadingInitial && rows.length === 0}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" aria-hidden />
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Buscar usuários por nome ou e-mail' },
            }}
          />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap', alignItems: { sm: 'flex-start' } }}
          >
            <FormControl
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 200 } }}
              disabled={loadingInitial && rows.length === 0}
            >
              <InputLabel id="lista-filtro-setor">Setor</InputLabel>
              <Select
                labelId="lista-filtro-setor"
                label="Setor"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value as Sector | '')}
              >
                <MenuItem value="">Todos os setores</MenuItem>
                {SECTORS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {SECTOR_LABELS[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 200 } }}
              disabled={loadingInitial && rows.length === 0}
            >
              <InputLabel id="lista-filtro-funcao">Função</InputLabel>
              <Select
                labelId="lista-filtro-funcao"
                label="Função"
                value={filterHierarchy}
                onChange={(e) => setFilterHierarchy(e.target.value as Hierarchy | '')}
              >
                <MenuItem value="">Todas as funções</MenuItem>
                {(Object.keys(HIERARCHY_LABELS) as Hierarchy[]).map((h) => (
                  <MenuItem key={h} value={h}>
                    {HIERARCHY_LABELS[h]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {hasActiveFilters ? (
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  setSearchQuery('')
                  setFilterSector('')
                  setFilterHierarchy('')
                }}
              >
                Limpar filtros
              </Button>
            ) : null}
          </Stack>
          {rows.length > 0 ? (
            <Typography variant="caption" color="text.secondary" component="div">
              Exibindo <strong>{filteredRows.length}</strong> de <strong>{rows.length}</strong>{' '}
              usuário(s) já carregado(s).
              {nextPageToken
                ? ' Carregue mais linhas para incluir mais pessoas na busca e nos filtros.'
                : null}
            </Typography>
          ) : null}
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          overflow: 'hidden',
          position: 'relative',
          minHeight: loadingInitial && rows.length === 0 ? 280 : undefined,
        }}
      >
        {loadingInitial ? (
          <LinearProgress
            color="primary"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              borderRadius: '9px 9px 0 0',
            }}
          />
        ) : null}
        <Table size="small" sx={{ position: 'relative' }}>
          <TableHead>
            <TableRow>
              <TableCell>Nome / e-mail</TableCell>
              <TableCell>Setor</TableCell>
              <TableCell>Função</TableCell>
              <TableCell align="center">Ativo</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingInitial && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8, border: 'none' }}>
                  <Stack spacing={2} sx={{ alignItems: 'center' }}>
                    <CircularProgress aria-label="Carregando lista de usuários" />
                    <Typography variant="body2" color="text.secondary">
                      Consultando usuários no banco de dados…
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredRows.map((r) => {
                  const editLocked =
                    !isCurrentUserProtected && isProtectedManagementAccount(r.email)
                  return (
                  <TableRow
                    key={r.uid}
                    hover
                    sx={editLocked ? { cursor: 'not-allowed' } : undefined}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={r.photoURL ?? undefined}
                          sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main', flexShrink: 0 }}
                        >
                          {rowDisplayName(r).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {rowDisplayName(r)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {r.email ?? '—'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>
                          {r.sector
                            ? SECTOR_LABELS[r.sector as Sector] ?? r.sector
                            : '—'}
                        </span>
                        {r.isTi ? (
                          <Chip size="small" color="primary" label="T.I" />
                        ) : null}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {r.hierarchy ? HIERARCHY_LABELS[r.hierarchy as Hierarchy] ?? r.hierarchy : '—'}
                    </TableCell>
                    <TableCell align="center">
                      {!r.disabled && r.profileActive !== false ? (
                        <Chip size="small" label="Sim" />
                      ) : (
                        <Chip size="small" color="error" label="Não" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={
                          editLocked
                            ? 'Você não pode editar ou excluir o DEV fundador'
                            : ''
                        }
                        disableHoverListener={!editLocked}
                      >
                        <span>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            disabled={editLocked}
                            onClick={() => openEdit(r)}
                          >
                            Editar
                          </Button>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  )
                })}
                {!loadingInitial && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum usuário listado (ou sem permissão de escopo).
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!loadingInitial && rows.length > 0 && filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum usuário corresponde à pesquisa ou aos filtros. Ajuste os critérios ou clique
                        em «Limpar filtros».
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {nextPageToken ? (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => void loadMore()}
            disabled={loadingMore || loadingInitial}
            startIcon={
              loadingMore ? (
                <CircularProgress color="inherit" size={18} aria-hidden />
              ) : undefined
            }
          >
            {loadingMore ? 'Carregando…' : 'Carregar mais'}
          </Button>
        </Box>
      ) : null}
      </AppPageChrome>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
        <DialogContent>
          {formError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          ) : null}

          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
              fullWidth
            />
            <TextField
              label={editing ? 'Nova senha (opcional)' : 'Senha'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required={!editing}
              fullWidth
              helperText={
                editing
                  ? 'Deixe em branco para manter a senha atual.'
                  : 'Mínimo de 6 caracteres (Firebase Auth).'
              }
            />
            <TextField
              label="Nome completo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              fullWidth
            />

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

            <FormControl fullWidth>
              <InputLabel id="hierarchy-label">Hierarquia</InputLabel>
              <Select
                labelId="hierarchy-label"
                label="Hierarquia"
                value={hierarchy}
                onChange={(e) => setHierarchy(e.target.value as Hierarchy)}
              >
                {(Object.keys(HIERARCHY_LABELS) as Hierarchy[]).map((h) => (
                  <MenuItem key={h} value={h}>
                    {HIERARCHY_LABELS[h]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
              label="Conta ativa (Auth desbloqueado e perfil ativo)"
            />

            {canEditAdminFlag ? (
              <FormControlLabel
                control={
                  <Switch
                    checked={flagAdmin}
                    onChange={(e) => setFlagAdmin(e.target.checked)}
                  />
                }
                label="Administrador (gestão de usuários em todos os setores)"
              />
            ) : null}
            {canEditAdminFlag ? (
              <FormControlLabel
                control={
                  <Switch
                    checked={flagTi}
                    onChange={(e) => setFlagTi(e.target.checked)}
                  />
                }
                label="Função T.I (gerencia chamados/GLPI, independente do setor)"
              />
            ) : null}
            {isDev ? (
              <FormControlLabel
                control={
                  <Switch checked={flagDev} onChange={(e) => setFlagDev(e.target.checked)} />
                }
                label="Desenvolvedor (acesso total aos templates e flag dev)"
              />
            ) : null}
            <FormControlLabel
              control={
                <Switch
                  checked={flagValidacao}
                  onChange={(e) => setFlagValidacao(e.target.checked)}
                />
              }
              label="Validação (editar histórico e status operacional na agenda)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void submit()}
            disabled={
              saving ||
              !email.trim() ||
              !displayName.trim() ||
              (!editing && password.length < 6)
            }
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
