import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Popover,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { UtensilsIcon } from './UtensilsIcon'
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import { useAuth } from '../contexts/AuthContext'
import {
  encerrarPausa,
  iniciarPausa,
  retomarPausa,
  subscribeMinhaPausa,
  subscribeMinhaPausaSchedule,
} from '../lib/pausaFirestore'
import {
  elapsedMs,
  formatElapsed,
  getPausaDurationMs,
  getPausaDurationLabel,
  getPausaStatus,
  todayISO,
  type PausaEntry,
} from '../types/pausa'

function useNow(interval = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

function requestBrowserNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    void Notification.requestPermission()
  }
}

function fireBrowserNotification(message: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('MZ NET — Pausa', { body: message, icon: '/favicon.ico' })
  }
}

function formatOverdue(overdueMs: number): string {
  const totalSec = Math.floor(overdueMs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `+${h}h${String(m).padStart(2, '0')}m`
  return `+${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`
}

export function PausaWidget() {
  const { user, profile } = useAuth()
  const theme = useTheme()
  const [entry, setEntry] = useState<PausaEntry | null>(null)
  const [scheduledHorario, setScheduledHorario] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const today = todayISO()
  const now = useNow()
  const notifiedRef = useRef(false)
  const pausaDurationMs = getPausaDurationMs(profile?.sector)
  const pausaDurationLabel = getPausaDurationLabel(profile?.sector)

  // Subscribe to daily entry
  useEffect(() => {
    if (!user) return
    return subscribeMinhaPausa(user.uid, today, setEntry)
  }, [user?.uid, today]) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to permanent schedule
  useEffect(() => {
    if (!user) return
    return subscribeMinhaPausaSchedule(user.uid, setScheduledHorario)
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Request browser notification permission once
  useEffect(() => {
    requestBrowserNotificationPermission()
  }, [])

  // Merged entry: use schedule's horarioAgendado when daily doc doesn't have one
  const mergedEntry: PausaEntry | null = entry
    ? { ...entry, horarioAgendado: entry.horarioAgendado ?? scheduledHorario }
    : scheduledHorario
      ? { uid: user?.uid ?? '', displayName: '', date: today, horarioAgendado: scheduledHorario, inicioEfetivo: null, fimEfetivo: null }
      : null

  const status = getPausaStatus(mergedEntry)
  const elapsed = status === 'em_pausa'
    ? now.getTime() - (mergedEntry?.inicioEfetivo?.getTime() ?? now.getTime())
    : mergedEntry ? elapsedMs(mergedEntry) : 0
  const overdue = status === 'em_pausa' && elapsed > pausaDurationMs
  const overdueMs = overdue ? elapsed - pausaDurationMs : 0

  // Reset notification flag when schedule changes or status leaves 'agendada'
  useEffect(() => {
    notifiedRef.current = false
  }, [mergedEntry?.horarioAgendado])

  // 10-minute pre-pause notification using real clock
  useEffect(() => {
    if (status !== 'agendada' || !mergedEntry?.horarioAgendado) return

    const [hStr, mStr] = mergedEntry.horarioAgendado.split(':')
    const pauseHour = parseInt(hStr ?? '0', 10)
    const pauseMin = parseInt(mStr ?? '0', 10)
    if (isNaN(pauseHour) || isNaN(pauseMin)) return

    const pauseTime = new Date(now)
    pauseTime.setHours(pauseHour, pauseMin, 0, 0)

    const diffMs = pauseTime.getTime() - now.getTime()
    const tenMin = 10 * 60 * 1000

    // Fire when 10 minutes or less remaining (and more than 9m50s to avoid re-firing)
    if (diffMs > 0 && diffMs <= tenMin && !notifiedRef.current) {
      notifiedRef.current = true
      const msg = 'Seu intervalo inicia em 10 minutos. Se programe para não atrasar!'
      setToastMsg(msg)
      fireBrowserNotification(msg)
    }
  }, [status, now, mergedEntry?.horarioAgendado]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleIniciar = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      await iniciarPausa(user.uid, today)
    } finally {
      setLoading(false)
    }
  }, [user?.uid, today]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEncerrar = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      await encerrarPausa(user.uid, today)
    } finally {
      setLoading(false)
    }
  }, [user?.uid, today]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetomar = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      await retomarPausa(user.uid, today)
    } finally {
      setLoading(false)
    }
  }, [user?.uid, today]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || status === 'sem_pausa') return null

  const chipColor =
    status === 'em_pausa'
      ? overdue
        ? theme.palette.error.main
        : theme.palette.warning.main
      : status === 'concluida'
        ? theme.palette.success.main
        : theme.palette.primary.main

  const chipLabel =
    status === 'agendada'
      ? `Pausa: ${mergedEntry?.horarioAgendado ?? ''}`
      : status === 'em_pausa'
        ? overdue
          ? formatOverdue(overdueMs)
          : formatElapsed(elapsed)
        : 'Pausa concluída'

  const ChipIcon =
    status === 'concluida'
      ? CheckCircleOutlineRoundedIcon
      : status === 'em_pausa'
        ? PauseCircleOutlineRoundedIcon
        : UtensilsIcon

  const open = Boolean(anchorEl)

  return (
    <>
      <Tooltip title="Minha pausa" disableHoverListener={open}>
        <Chip
          icon={<ChipIcon sx={{ fontSize: '14px !important' }} />}
          label={chipLabel}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: 12,
            height: 28,
            cursor: 'pointer',
            bgcolor: alpha(chipColor, 0.12),
            color: chipColor,
            border: 1,
            borderColor: alpha(chipColor, 0.25),
            '& .MuiChip-icon': { color: chipColor },
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: alpha(chipColor, 0.2) },
            fontVariantNumeric: 'tabular-nums',
          }}
        />
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 260,
              borderRadius: 1.5,
              border: 1,
              borderColor: alpha(chipColor, 0.2),
              mt: 0.5,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: alpha(chipColor, 0.07),
            borderBottom: 1,
            borderColor: alpha(chipColor, 0.15),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <ChipIcon sx={{ fontSize: 16, color: chipColor }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: chipColor }}>
              Minha Pausa
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setAnchorEl(null)} sx={{ p: 0.25 }}>
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ px: 2, py: 1.75 }}>
          {status === 'agendada' && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Agendada para as <strong>{mergedEntry?.horarioAgendado}</strong>
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="small"
                disabled={loading}
                onClick={() => void handleIniciar()}
                startIcon={<PauseCircleOutlineRoundedIcon />}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Iniciar pausa
              </Button>
            </>
          )}

          {status === 'em_pausa' && (
            <>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: chipColor, lineHeight: 1 }}>
                  {formatElapsed(elapsed)}
                </Typography>
                {overdue ? (
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                    ⚠️ {formatOverdue(overdueMs)} além de {pausaDurationLabel}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    de {pausaDurationLabel}
                  </Typography>
                )}
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <Button
                fullWidth
                variant="outlined"
                size="small"
                disabled={loading}
                onClick={() => void handleEncerrar()}
                color={overdue ? 'error' : 'primary'}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Encerrar pausa
              </Button>
            </>
          )}

          {status === 'concluida' && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Você já utilizou sua pausa hoje.{' '}
                <strong style={{ color: theme.palette.success.main }}>
                  {formatElapsed(elapsedMs(mergedEntry!))}
                </strong>{' '}
                de {pausaDurationLabel}.
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Button
                fullWidth
                variant="outlined"
                size="small"
                disabled={loading}
                onClick={() => void handleRetomar()}
                startIcon={<ReplayRoundedIcon />}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Retomar pausa
              </Button>
            </>
          )}
        </Box>
      </Popover>

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={12000}
        onClose={() => setToastMsg(null)}
        message={toastMsg}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ content: { sx: { fontWeight: 600, bgcolor: 'warning.dark' } } }}
      />
    </>
  )
}
