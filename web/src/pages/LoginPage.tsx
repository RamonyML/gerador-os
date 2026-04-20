import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { FirebaseError } from 'firebase/app'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
} from 'firebase/auth'
import { LoginHeroIllustration } from '../components/LoginHeroIllustration'
import { useColorMode } from '../contexts/ColorModeContext'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../lib/firebase'

const LOGIN_FONT = '"Poppins", "Ubuntu", "Segoe UI", system-ui, sans-serif'

function loginErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'E-mail ou senha errados. Tente novamente.'
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde um momento e tente de novo.'
      case 'auth/user-disabled':
        return 'Esta conta foi desativada. Procure o administrador.'
      case 'auth/network-request-failed':
        return 'Falha de conexão. Verifique sua internet.'
      default:
        return 'Não foi possível entrar. Tente novamente.'
    }
  }
  return 'Não foi possível entrar. Tente novamente.'
}

const FLOAT_ORBS: Array<{
  w: number
  top?: string
  left?: string
  right?: string
  bottom?: string
  delay: string
}> = [
  { w: 120, top: '5%', left: '10%', delay: '0s' },
  { w: 80, top: '15%', right: '15%', delay: '1s' },
  { w: 60, top: '45%', left: '20%', delay: '2s' },
  { w: 100, bottom: '15%', right: '5%', delay: '3s' },
  { w: 90, top: '60%', right: '30%', delay: '4s' },
  { w: 70, bottom: '25%', left: '15%', delay: '5s' },
  { w: 110, bottom: '5%', left: '50%', delay: '6s' },
]

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
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [resetHint, setResetHint] = useState<string | null>(null)

  const primary = theme.palette.primary.main
  const primaryDark = theme.palette.primary.dark
  const panelGradient =
    mode === 'light'
      ? `linear-gradient(155deg, ${alpha(primary, 0.12)} 0%, ${alpha(primary, 0.04)} 38%, ${theme.palette.background.default} 72%)`
      : `linear-gradient(155deg, ${alpha(primary, 0.22)} 0%, ${alpha('#000', 0.2)} 45%, ${theme.palette.background.default} 100%)`

  /** Painel esquerdo (desktop): gradiente verde forte como no login.html legado */
  const illustrationBg = `linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%)`

  const inputAccentSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      transition: 'all 0.2s ease',
      borderLeft: `3px solid ${alpha(primary, 0.35)}`,
      '&:hover': {
        bgcolor: alpha(primary, mode === 'dark' ? 0.12 : 0.06),
      },
      '&.Mui-focused': {
        borderLeft: `3px solid ${primary}`,
        boxShadow: `0 4px 14px ${alpha(primary, 0.22)}`,
      },
    },
  } as const

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
          fontFamily: LOGIN_FONT,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  async function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault()
    setResetHint(null)
    setError(null)
    const addr = email.trim()
    if (!addr) {
      setError('Informe o e-mail acima para recuperar a senha.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, addr)
      setResetHint('Enviamos um link de redefinição para o seu e-mail.')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível enviar o e-mail.'
      setError(message)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResetHint(null)
    setSubmitting(true)
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      )
      await signIn(email, password)
    } catch (err: unknown) {
      setError(loginErrorMessage(err))
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
        background: { md: illustrationBg },
        fontFamily: LOGIN_FONT,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flex: { md: '1 1 52%' },
          minHeight: { xs: 240, md: 'auto' },
          overflow: 'hidden',
          background: isMdUp ? 'transparent' : panelGradient,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          px: { md: 4, lg: 6 },
          py: { md: 6 },
        }}
      >
        {FLOAT_ORBS.map((o, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: o.w,
              height: o.w,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
              top: o.top,
              left: o.left,
              right: o.right,
              bottom: o.bottom,
              animation: 'login-panel-float 15s ease-in-out infinite',
              animationDelay: o.delay,
              pointerEvents: 'none',
            }}
          />
        ))}

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 520, width: '100%', textAlign: 'center', px: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              mb: 1.5,
              color: '#fff',
            }}
          >
            Bem-vindo de volta!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              maxWidth: 420,
              mx: 'auto',
              // Painel esquerdo: fundo verde em ambos os temas — texto sempre branco
              color: '#ffffff !important',
            }}
          >
            Acesse o Gerador de O.S. com seu e-mail e senha.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              '& img': {
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))',
              },
            }}
          >
            <Box
              component="img"
              src="/brand/mzlogo-login.png"
              alt="MZ NET"
              sx={{
                width: '100%',
                maxWidth: 280,
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>
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
          background: isMdUp ? theme.palette.background.default : panelGradient,
          // Recorte curvo no desktop (estilo modelo): revela o painel verde.
          overflow: { md: 'hidden' },
          '&::before': isMdUp
            ? ({
                content: '""',
                position: 'absolute',
                inset: 0,
                left: -10,
                width: 270,
                background: illustrationBg,
                pointerEvents: 'none',
                zIndex: 0,
                // Máscara em S-curve (fica parecido com o “recorte” do exemplo)
                WebkitMaskImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 220 100%27 preserveAspectRatio=%27none%27%3E%3Cpath fill=%27white%27 d=%27M0 0H168C118 10 128 38 172 50C206 60 126 90 184 100H0Z%27/%3E%3C/svg%3E")',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: '100% 100%',
                maskImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 220 100%27 preserveAspectRatio=%27none%27%3E%3Cpath fill=%27white%27 d=%27M0 0H168C118 10 128 38 172 50C206 60 126 90 184 100H0Z%27/%3E%3C/svg%3E")',
                maskRepeat: 'no-repeat',
                maskSize: '100% 100%',
              } as const)
            : undefined,
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
              opacity: 0.88,
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
            backdropFilter: 'blur(8px)',
            bgcolor:
              mode === 'light'
                ? alpha('#ffffff', 0.92)
                : alpha(theme.palette.background.paper, 0.92),
            boxShadow:
              mode === 'light'
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.12)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          }}
        >
          <Stack spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Gerador de O.S.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Use suas credenciais para entrar
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
              px: { xs: 0, sm: 0.5 },
              '& svg': {
                maxHeight: { xs: 200, md: 168 },
              },
            }}
            aria-hidden
          >
            <LoginHeroIllustration
              accent={primary}
              muted={alpha(primary, mode === 'dark' ? 0.22 : 0.12)}
            />
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            {resetHint ? (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setResetHint(null)}>
                {resetHint}
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
              placeholder="seu@email.com"
              sx={{ mb: 2, ...inputAccentSx }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: 'text.secondary', ml: 0.5 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              placeholder="••••••••"
              sx={{ ...inputAccentSx }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'text.secondary', ml: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                mt: 2,
                mb: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography variant="body2">Lembrar-me neste dispositivo</Typography>}
              />
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{
                  cursor: 'pointer',
                  color: 'primary.main',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.dark' },
                }}
              >
                Esqueceu a senha?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{
                mt: 2,
                py: 1.35,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: 13,
                background: `linear-gradient(to right, ${primary}, ${primaryDark})`,
                boxShadow: `0 4px 14px ${alpha(primary, 0.35)}`,
                '&:hover': {
                  background: `linear-gradient(to right, ${primaryDark}, ${theme.palette.primary.main})`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 10px 22px ${alpha(primary, 0.38)}`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
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
