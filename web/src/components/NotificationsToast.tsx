import { useEffect, useRef, useState } from 'react'
import { Box, Chip, IconButton, LinearProgress, Paper, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { ToastNotice } from '../hooks/useNotificationToasts'

const DURATION_MS = 30_000

type Props = {
  toast: ToastNotice
  onDismiss: () => void
  onNavigate: () => void
}

export function NotificationsToast({ toast, onDismiss, onNavigate }: Props) {
  const theme = useTheme()
  const isCritical = toast.priority === 'critical'
  const accent = isCritical ? theme.palette.error.main : theme.palette.primary.main

  const [entered, setEntered] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)
  const [progress, setProgress] = useState(100)
  const startRef = useRef(0)
  const rafRef = useRef(0)
  const dismissedRef = useRef(false)

  // Slide-in após pequeno delay
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 350)
    return () => clearTimeout(t)
  }, [])

  // Countdown — crítico não fecha sozinho
  useEffect(() => {
    if (!entered || exiting || isCritical) return
    startRef.current = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100)
      setProgress(pct)
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        dismiss()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [entered, exiting, isCritical])

  const dismiss = () => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    cancelAnimationFrame(rafRef.current)
    setExiting(true)
    setTimeout(() => { setGone(true); onDismiss() }, 460)
  }

  if (gone) return null

  const visible = entered && !exiting
  const Icon = isCritical ? ErrorOutlineRoundedIcon : NotificationsNoneOutlinedIcon

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 70, sm: 76 },
        right: { xs: 12, sm: 24 },
        zIndex: theme.zIndex.snackbar,
        maxWidth: 340,
        width: 'calc(100vw - 24px)',
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 48px))',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          borderRadius: 2.5,
          overflow: 'hidden',
          border: 1,
          borderColor: alpha(accent, 0.3),
        }}
      >
        {/* Corpo clicável */}
        <Box
          onClick={() => { onNavigate(); dismiss() }}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 2,
            pb: 1.5,
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { bgcolor: alpha(accent, 0.04) },
          }}
        >
          {/* Ícone */}
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: alpha(accent, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            <Icon fontSize="small" sx={{ color: accent }} />
          </Box>

          {/* Conteúdo */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
              {isCritical ? (
                <Chip
                  label="Crítico"
                  size="small"
                  sx={{
                    bgcolor: alpha(accent, 0.12),
                    color: accent,
                    fontWeight: 700,
                    fontSize: 10,
                    height: 18,
                    borderRadius: 1,
                  }}
                />
              ) : null}
              <Typography variant="caption" color="text.secondary" noWrap>
                {toast.authorName}
              </Typography>
            </Box>

            {toast.title ? (
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.25 }}
              >
                {toast.title}
              </Typography>
            ) : null}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {toast.message}
            </Typography>
          </Box>

          {/* Botão fechar */}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); dismiss() }}
            aria-label="Fechar notificação"
            sx={{ flexShrink: 0, mt: -0.75, mr: -0.75, color: 'text.secondary' }}
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Barra de progresso: countdown animado (important) ou sólida estática (critical) */}
        <LinearProgress
          variant="determinate"
          value={isCritical ? 100 : progress}
          sx={{
            height: 3,
            bgcolor: alpha(accent, 0.12),
            '& .MuiLinearProgress-bar': {
              bgcolor: accent,
              transition: 'none',
            },
          }}
        />
      </Paper>
    </Box>
  )
}
