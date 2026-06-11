import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  Switch,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useAuth } from '../contexts/AuthContext'
import { canManageNotices } from '../lib/permissions'
import { SECTOR_LABELS, SECTORS, type Sector } from '../types/profile'
import { createNotice, deleteNotice, updateNotice } from '../lib/noticesFirestore'
import { useNotices } from '../hooks/useNotices'
import type { NoticePriority, NoticeStatus, NoticeTarget } from '../types/notices'
import { db } from '../lib/firebase'
import { NoticeDialog } from '../components/NoticeDialog'
import { AppPageChrome } from '../components/AppPageChrome'

function targetLabel(target: NoticeTarget) {
  if (target.scope === 'all') return 'Para todos'
  return `Para ${SECTOR_LABELS[target.sector] ?? target.sector}`
}

function priorityLabel(p: NoticePriority) {
  if (p === 'critical') return 'Crítico'
  if (p === 'important') return 'Importante'
  return 'Normal'
}

function statusLabel(s: NoticeStatus) {
  return s === 'draft' ? 'Rascunho' : 'Publicado'
}

export function AvisosPage() {
  const theme = useTheme()
  const { user, profile, profileMissing } = useAuth()
  const notices = useNotices({ uid: user?.uid ?? null, profile })
  const canCreate = canManageNotices(profile)
  const canDelete = profile?.isDev === true

  const [scope, setScope] = useState<'all' | 'sector'>('sector')
  const [sector, setSector] = useState<Sector>(profile?.sector ?? 'suporte')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<NoticeStatus>('published')
  const [priority, setPriority] = useState<NoticePriority>('normal')
  const [pinned, setPinned] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const sorted = useMemo(() => {
    const base = notices.state.notices
    if (filter === 'unread') return base.filter((n) => notices.state.unreadIds.has(n.id))
    return base
  }, [notices.state.notices, notices.state.unreadIds, filter])
  const unreadIds = notices.state.unreadIds

  const authorName = profile?.displayName?.trim() || user?.email?.split('@')[0] || 'Gerente'

  const sectorOptions = useMemo(() => SECTORS, [])

  const onCreate = async () => {
    if (!user) return
    setSaveError(null)
    const trimmed = message.trim()
    if (!trimmed) {
      setSaveError('Escreva uma mensagem para o aviso.')
      return
    }
    const target: NoticeTarget =
      scope === 'all' ? { scope: 'all' } : { scope: 'sector', sector }

    setSaving(true)
    try {
      await createNotice(db, { uid: user.uid, name: authorName }, { message: trimmed, target, status, pinned, priority, startsAt: null, endsAt: null })
      setMessage('')
      setScope('sector')
      setSector(profile?.sector ?? 'suporte')
      setStatus('published')
      setPriority('normal')
      setPinned(false)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Falha ao criar aviso.')
    } finally {
      setSaving(false)
    }
  }

  if (profileMissing) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 } }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Seu perfil não foi encontrado no Firestore. Fale com um administrador.
        </Alert>
      </Container>
    )
  }

  return (
    <>
      <AppPageChrome
        overline="Comunicados"
        title="Avisos"
        subtitle={
          <Typography variant="body1" color="text.secondary">
            Comunicados gerais ou direcionados por setor. Os avisos aparecem aqui permanentemente.
          </Typography>
        }
        maxWidth="lg"
        illustration="announcements"
        illustrationAlt="Comunicados e avisos"
      >
        <Stack spacing={2.5}>
          {canCreate ? (
            <Paper
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2.5,
                p: { xs: 2, sm: 2.5 },
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Novo aviso
              </Typography>

              {saveError ? (
                <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
                  {saveError}
                </Alert>
              ) : null}

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="avisos-status">Status</InputLabel>
                    <Select
                      labelId="avisos-status"
                      value={status}
                      label="Status"
                      onChange={(e) => setStatus(e.target.value as NoticeStatus)}
                    >
                      <MenuItem value="published">{statusLabel('published')}</MenuItem>
                      <MenuItem value="draft">{statusLabel('draft')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="avisos-priority">Prioridade</InputLabel>
                    <Select
                      labelId="avisos-priority"
                      value={priority}
                      label="Prioridade"
                      onChange={(e) => setPriority(e.target.value as NoticePriority)}
                    >
                      <MenuItem value="normal">{priorityLabel('normal')}</MenuItem>
                      <MenuItem value="important">{priorityLabel('important')}</MenuItem>
                      <MenuItem value="critical">{priorityLabel('critical')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Switch checked={pinned} onChange={(e) => setPinned(e.target.checked)} />}
                    label="Fixar"
                  />
                </Box>
                <RadioGroup
                  row
                  value={scope}
                  onChange={(e) => setScope(e.target.value as 'all' | 'sector')}
                >
                  <FormControlLabel value="sector" control={<Radio />} label="Somente um setor" />
                  <FormControlLabel value="all" control={<Radio />} label="Todos" />
                </RadioGroup>

                {scope === 'sector' ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 1.5,
                      alignItems: { sm: 'center' },
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                      Direcionar para
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
                      {sectorOptions.map((s) => (
                        <Chip
                          key={s}
                          label={SECTOR_LABELS[s] ?? s}
                          onClick={() => setSector(s)}
                          color={sector === s ? 'primary' : 'default'}
                          variant={sector === s ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                ) : null}

                <TextField
                  multiline
                  minRows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva o aviso…"
                  fullWidth
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => void onCreate()}
                    disabled={saving || message.trim().length === 0}
                  >
                    Publicar
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ) : null}

          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2.5,
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Mural
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notices.unreadCount > 0 ? `${notices.unreadCount} não lida(s)` : 'Tudo lido.'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="avisos-filter">Filtro</InputLabel>
                    <Select
                      labelId="avisos-filter"
                      value={filter}
                      label="Filtro"
                      onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="unread">Não lidos</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    size="small"
                    color="inherit"
                    disabled={notices.unreadCount === 0}
                    onClick={() => void Promise.all(notices.unreadNotices.map((n) => notices.markAsRead(n.id)))}
                  >
                    Marcar tudo como lido
                  </Button>
                </Box>
              </Box>
            </Box>
            <Divider />

            {notices.state.status === 'loading' ? (
              <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Carregando avisos…
                </Typography>
              </Box>
            ) : null}

            {notices.state.status === 'error' ? (
              <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {notices.state.message}
                </Alert>
              </Box>
            ) : null}

            {sorted.length === 0 && notices.state.status !== 'loading' ? (
              <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum aviso publicado ainda.
                </Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />} sx={{ p: 0 }}>
                {sorted.map((n) => {
                  const isUnread = unreadIds.has(n.id)
                  return (
                    <Box
                      key={n.id}
                      sx={{
                        px: { xs: 2, sm: 2.5 },
                        py: 2,
                        bgcolor: isUnread ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.06 : 0.04) : undefined,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: 1,
                          alignItems: { sm: 'center' },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, minWidth: 180 }}>
                          {n.authorName}
                        </Typography>
                        <Chip size="small" label={targetLabel(n.target)} variant="outlined" />
                        <Chip size="small" label={priorityLabel(n.priority)} variant="outlined" />
                        {n.pinned ? <Chip size="small" label="Fixado" variant="outlined" /> : null}
                        <Box sx={{ flex: 1 }} />
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => setSelectedId(n.id)}
                        >
                          Ler
                        </Button>
                        {isUnread ? (
                          <Button size="small" onClick={() => void notices.markAsRead(n.id)}>
                            Marcar como lido
                          </Button>
                        ) : (
                          <Chip size="small" label="Lido" variant="outlined" />
                        )}
                        {canCreate ? (
                          <Button
                            size="small"
                            color="inherit"
                            onClick={() => void updateNotice(db, n.id, { active: false })}
                          >
                            Desativar
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => void deleteNotice(db, n.id)}
                          >
                            Excluir
                          </Button>
                        ) : null}
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {n.createdAt.toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                  )
                })}
              </Stack>
            )}
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button size="small" color="inherit" onClick={() => notices.loadMore()}>
              Carregar mais
            </Button>
          </Box>
        </Stack>
      </AppPageChrome>
      <NoticeDialog
        notice={selectedId ? notices.state.notices.find((n) => n.id === selectedId) ?? null : null}
        open={selectedId != null}
        onClose={() => setSelectedId(null)}
        onMarkRead={async (id) => {
          await notices.markAsRead(id)
        }}
        isUnread={selectedId ? unreadIds.has(selectedId) : false}
      />
    </>
  )
}

