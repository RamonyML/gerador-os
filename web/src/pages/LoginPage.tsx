import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { LoginHeroIllustration } from '../components/LoginHeroIllustration'
import { useColorMode } from '../contexts/ColorModeContext'
import { useAuth } from '../contexts/AuthContext'
import { brandLogoSrc } from '../lib/brandAssets'

export function LoginPage() {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const { mode, toggle } = useColorMode()
  const { user, initializing, signIn } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const primary = theme.palette.primary.main
  const heroMuted = alpha(primary, mode === 'dark' ? 0.28 : 0.14)
  const panelGradient =
    mode === 'light'
      ? `linear-gradient(155deg, ${alpha(primary, 0.12)} 0%, ${alpha(primary, 0.04)} 38%, ${theme.palette.background.default} 72%)`
      : `linear-gradient(155deg, ${alpha(primary, 0.22)} 0%, ${alpha('#000', 0.2)} 45%, ${theme.palette.background.default} 100%)`

  if (initializing) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          background: panelGradient,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível entrar.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flex: { md: '1 1 52%' },
          minHeight: { xs: 240, md: 'auto' },
          overflow: 'hidden',
          background: panelGradient,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          px: { md: 4, lg: 6 },
          py: { md: 6 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '8%',
            left: '-8%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            bgcolor: alpha(primary, 0.12),
            filter: 'blur(48px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '12%',
            right: '-6%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            bgcolor: alpha(primary, mode === 'dark' ? 0.18 : 0.08),
            filter: 'blur(56px)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 520, width: '100%' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              mb: 1.5,
            }}
          >
            Gerador de O.S.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 440 }}>
            Entre com segurança para gerar ordens de serviço e acompanhar fluxos de suporte.
          </Typography>
          <LoginHeroIllustration accent={primary} muted={heroMuted} />
        </Box>
      </Box>

      <Box
        sx={{
          flex: { md: '1 1 48%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: { xs: 4, md: 6 },
          position: 'relative',
        }}
      >
        <Tooltip title={mode === 'dark' ? 'Tema claro' : 'Tema escuro'} placement="left">
          <IconButton
            onClick={() => toggle()}
            aria-label="Alternar tema claro ou escuro"
            sx={{
              position: 'absolute',
              top: { xs: 16, md: 24 },
              right: { xs: 16, md: 24 },
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) },
            }}
          >
            {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        {isMdUp ? null : (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: panelGradient,
              opacity: 0.85,
            }}
          />
        )}

        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 420,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.background.paper,
            boxShadow:
              mode === 'light'
                ? `0 12px 40px ${alpha(primary, 0.1)}`
                : '0 12px 40px rgba(0,0,0,0.45)',
          }}
        >
          <Stack spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Box
              component="img"
              src={brandLogoSrc(mode)}
              alt="MZ NET"
              sx={{
                height: 52,
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Entrar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Use seu e-mail e senha corporativos
              </Typography>
            </Box>
          </Stack>

          {isMdUp ? null : (
            <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
              <LoginHeroIllustration accent={primary} muted={heroMuted} />
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <TextField
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{
                mt: 3,
                py: 1.25,
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { boxShadow: `0 8px 24px ${alpha(primary, 0.35)}` },
              }}
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
