import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { UtensilsIcon } from './UtensilsIcon'
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useAuth } from '../contexts/AuthContext'
import {
  encerrarPausa,
  iniciarPausa,
  subscribeMinhaPausa,
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

export function PausaWidget() {
  const { user, profile } = useAuth()
  const theme = useTheme()
  const [entry, setEntry] = useState<PausaEntry | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [loading, setLoading] = useState(false)
  const today = todayISO()
  const now = useNow()
  const autoEndedRef = useRef(false)
  const pausaDurationMs = getPausaDurationMs(profile?.sector)
  const pausaDurationLabel = getPausaDurationLabel(profile?.sector)

  useEffect(() => {
    if (!user) return
    return subscribeMinhaPausa(user.uid, today, setEntry)
  }, [user?.uid, today]) // eslint-disable-line react-hooks/exhaustive-deps

  const status = getPausaStatus(entry)
  const elapsed = status === 'em_pausa'
    ? now.getTime() - (entry?.inicioEfetivo?.getTime() ?? now.getTime())
    : entry ? elapsedMs(entry) : 0
  const overdue = status === 'em_pausa' && elapsed > pausaDurationMs

  useEffect(() => {
    if (!user || status !== 'em_pausa' || autoEndedRef.current) return
    if (elapsed >= pausaDurationMs) {
      autoEndedRef.current = true
      void encerrarPausa(user.uid, today)
    }
  }, [user?.uid, status, elapsed, today]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status === 'agendada') autoEndedRef.current = false
  }, [status])

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
      ? `Pausa: ${entry?.horarioAgendado ?? ''}`
      : status === 'em_pausa'
        ? formatElapsed(elapsed)
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
                Agendada para as <strong>{entry?.horarioAgendado}</strong>
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
                <Typography variant="caption" color="text.secondary">
                  {overdue ? `⚠️ Pausa ultrapassou ${pausaDurationLabel}` : `de ${pausaDurationLabel}`}
                </Typography>
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
            <Typography variant="body2" color="text.secondary">
              Você já utilizou sua pausa hoje.{' '}
              <strong style={{ color: theme.palette.success.main }}>
                {formatElapsed(elapsedMs(entry!))}
              </strong>{' '}
              de {pausaDurationLabel}.
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  )
}
