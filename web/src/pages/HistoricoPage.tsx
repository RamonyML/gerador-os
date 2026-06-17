import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import { useAuth } from '../contexts/AuthContext'
import { useOsHistory } from '../hooks/useOsHistory'
import { db } from '../lib/firebase'
import { deleteOsHistoryEntry } from '../lib/osHistoryFirestore'
import type { OsHistoryEntry } from '../lib/osHistoryFirestore'
import { SUPPORT_DEMANDS } from '../data/supportDemands'
import { CADASTRO_DEMANDS } from '../data/cadastroDemands'
import { INSTALACAO_DEMANDS } from '../data/instalacaoDemands'
import { ILLUSTRATIONS } from '../data/illustrations'

const ALL_DEMANDS = [...SUPPORT_DEMANDS, ...CADASTRO_DEMANDS, ...INSTALACAO_DEMANDS]

function demandLabel(id: string): string {
  return ALL_DEMANDS.find((d) => d.id === id)?.title ?? id
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function dayLabel(key: string): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (key === dayKey(today)) return 'Hoje'
  if (key === dayKey(yesterday)) return 'Ontem'
  const [y, m, d] = key.split('-').map(Number)
  return formatDate(new Date(y!, m! - 1, d!))
}

const SECTOR_HUB: Record<string, string> = {
  suporte: '/suporte',
  cadastro: '/cadastro',
  instalacao: '/instalacao',
}

export function HistoricoPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const histState = useOsHistory(user?.uid ?? null)

  const [previewEntry, setPreviewEntry] = useState<OsHistoryEntry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copyOk, setCopyOk] = useState<string | null>(null)

  const hubRoute = profile ? (SECTOR_HUB[profile.sector] ?? '/gerar-os') : '/gerar-os'

  const grouped = useMemo(() => {
    if (histState.status !== 'ready') return []
    const map = new Map<string, OsHistoryEntry[]>()
    for (const e of histState.entries) {
      const key = dayKey(e.createdAt)
      const arr = map.get(key) ?? []
      arr.push(e)
      map.set(key, arr)
    }
    return [...map.entries()].map(([key, entries]) => ({ key, label: dayLabel(key), entries }))
  }, [histState])

  const handleCopy = async (entry: OsHistoryEntry) => {
    try {
      await navigator.clipboard.writeText(entry.preview)
      setCopyOk(entry.id)
      setTimeout(() => setCopyOk(null), 1500)
    } catch {
      /* ignore */
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    await deleteOsHistoryEntry(db, deletingId)
    setDeletingId(null)
  }

  if (histState.status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box
        component="img"
        src={ILLUSTRATIONS.historico}
        alt="Histórico"
        sx={{ width: '100%', maxWidth: 320, mx: 'auto', display: 'block', mb: 2 }}
      />

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
          <HistoryRoundedIcon sx={{ color: 'primary.main', fontSize: 26 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Histórico de O.S
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Últimas 50 O.S salvas pela sua conta
        </Typography>
      </Box>

      {grouped.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Nenhuma O.S salva ainda
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Salve uma O.S no gerador e ela aparecerá aqui.
          </Typography>
          <Button
            variant="contained"
            disableElevation
            sx={{ borderRadius: 2 }}
            onClick={() => navigate(hubRoute)}
          >
            Ir para o hub
          </Button>
        </Box>
      ) : (
        <Stack spacing={3}>
          {grouped.map(({ key, label, entries }) => (
            <Box key={key}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  px: 0.5,
                  mb: 1,
                  display: 'block',
                  color: 'text.secondary',
                }}
              >
                {label}
              </Typography>
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {entries.map((entry, idx) => (
                  <Box key={entry.id}>
                    {idx > 0 && <Divider />}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ fontWeight: 600, maxWidth: { xs: 180, sm: 280 } }}
                          >
                            {entry.title}
                          </Typography>
                          <Chip
                            label={demandLabel(entry.demandCategory)}
                            size="small"
                            sx={{
                              fontSize: 11,
                              height: 20,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              fontWeight: 600,
                            }}
                          />
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formatTime(entry.createdAt)}
                          </Typography>
                          {entry.clientName ? (
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{ color: 'text.primary', fontWeight: 500, maxWidth: { xs: 200, sm: 360 } }}
                            >
                              — {entry.clientName}
                            </Typography>
                          ) : null}
                          {entry.obs ? (
                            <Chip
                              label={entry.obs}
                              size="small"
                              sx={{
                                fontSize: 11,
                                height: 20,
                                bgcolor: alpha(theme.palette.warning.main, 0.15),
                                color: 'warning.dark',
                                fontWeight: 600,
                              }}
                            />
                          ) : null}
                        </Stack>
                      </Box>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title={copyOk === entry.id ? 'Copiado!' : 'Copiar texto'}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(entry)}
                            sx={{ color: copyOk === entry.id ? 'success.main' : 'text.secondary' }}
                          >
                            <ContentCopyRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver texto completo">
                          <IconButton
                            size="small"
                            onClick={() => setPreviewEntry(entry)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <OpenInNewRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir do histórico">
                          <IconButton
                            size="small"
                            onClick={() => setDeletingId(entry.id)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
          ))}
        </Stack>
      )}

      {/* Dialog: ver texto completo */}
      <Dialog
        open={previewEntry != null}
        onClose={() => setPreviewEntry(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {previewEntry && (
          <>
            <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
              {previewEntry.title}
              {previewEntry.clientName ? (
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {previewEntry.clientName}
                </Typography>
              ) : null}
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                {formatDate(previewEntry.createdAt)} às {formatTime(previewEntry.createdAt)}
                {previewEntry.obs ? ` — ${previewEntry.obs}` : ''}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  bgcolor: alpha(theme.palette.grey[500], 0.06),
                  borderRadius: 2,
                  p: 2,
                  mt: 1,
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                {previewEntry.preview}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
              <Button onClick={() => setPreviewEntry(null)}>Fechar</Button>
              <Button
                variant="contained"
                disableElevation
                onClick={() => handleCopy(previewEntry)}
              >
                Copiar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog: confirmar exclusão */}
      <Dialog
        open={deletingId != null}
        onClose={() => setDeletingId(null)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Remover do histórico?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Este registro será excluído permanentemente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeletingId(null)}>Cancelar</Button>
          <Button variant="contained" color="error" disableElevation onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
