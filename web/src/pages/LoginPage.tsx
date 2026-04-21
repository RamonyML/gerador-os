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
import { useColorMode } from '../contexts/ColorModeContext'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../lib/firebase'
import { brandLogoSrc } from '../lib/brandAssets'

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
  const surface =
    mode === 'light' ? alpha('#ffffff', 0.9) : alpha(theme.palette.background.paper, 0.9)
  const pageBg =
    mode === 'light'
      ? `radial-gradient(1200px 500px at 12% 12%, ${alpha(primary, 0.14)} 0%, transparent 60%), radial-gradient(900px 450px at 85% 20%, ${alpha(primary, 0.08)} 0%, transparent 55%), ${theme.palette.background.default}`
      : `radial-gradient(1100px 520px at 18% 12%, ${alpha(primary, 0.16)} 0%, transparent 55%), ${theme.palette.background.default}`

  const inputAccentSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      transition: 'background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      bgcolor: alpha(theme.palette.background.paper, mode === 'dark' ? 0.22 : 0.4),
      borderLeft: `2px solid ${alpha(primary, mode === 'dark' ? 0.42 : 0.28)}`,
      '& fieldset': {
        borderColor: alpha(theme.palette.text.primary, mode === 'dark' ? 0.16 : 0.12),
      },
      '&:hover': {
        bgcolor: alpha(theme.palette.background.paper, mode === 'dark' ? 0.28 : 0.55),
        '& fieldset': {
          borderColor: alpha(theme.palette.text.primary, mode === 'dark' ? 0.24 : 0.18),
        },
      },
      '&.Mui-focused': {
        borderLeft: `2px solid ${primary}`,
        boxShadow: `0 10px 30px ${alpha(primary, 0.18)}`,
        '& fieldset': {
          borderColor: alpha(primary, 0.55),
        },
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
          background: pageBg,
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
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        bgcolor: 'background.default',
        background: pageBg,
        fontFamily: LOGIN_FONT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: mode === 'dark' ? 0.7 : 0.55,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: { xs: 320, sm: 420 },
            height: { xs: 320, sm: 420 },
            borderRadius: '50%',
            filter: 'blur(42px)',
            background:
              mode === 'light'
                ? `radial-gradient(circle at 30% 30%, ${alpha(primary, 0.22)} 0%, transparent 62%)`
                : `radial-gradient(circle at 30% 30%, ${alpha(primary, 0.32)} 0%, transparent 62%)`,
            animation: 'login-ambient-float 18s ease-in-out infinite',
          },
          '&::before': {
            top: { xs: -120, sm: -160 },
            left: { xs: -120, sm: -160 },
          },
          '&::after': {
            bottom: { xs: -140, sm: -180 },
            right: { xs: -140, sm: -180 },
            animationDelay: '3.5s',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '&::before, &::after': { animation: 'none' },
          },
        }}
      />

      <Tooltip title={mode === 'dark' ? 'Tema claro' : 'Tema escuro'} placement="left">
        <IconButton
          onClick={() => toggle()}
          aria-label="Alternar tema claro ou escuro"
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            bgcolor: alpha(theme.palette.text.primary, 0.06),
            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) },
          }}
        >
          {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
      </Tooltip>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: surface,
          overflow: 'hidden',
          opacity: 0,
          transform: 'translateY(8px)',
          animation: 'login-card-enter 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
          '@keyframes login-card-enter': {
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            opacity: 1,
            transform: 'none',
          },
          boxShadow:
            mode === 'light'
              ? '0 24px 60px -18px rgba(0, 0, 0, 0.16)'
              : '0 24px 60px -18px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Box
          sx={{
            height: 6,
            bgcolor: primary,
          }}
        />

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5} sx={{ mb: 2.5, alignItems: 'center' }}>
            <Box
              component="img"
              src={brandLogoSrc(mode)}
              alt="MZ NET"
              sx={{
                height: 54,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 750, letterSpacing: '-0.02em' }}>
                Entrar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Acesse com seu e-mail e senha.
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error ? (
              <Alert
                severity="error"
                icon={false}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  py: 1,
                  bgcolor: alpha(theme.palette.error.main, mode === 'dark' ? 0.12 : 0.08),
                  border: 1,
                  borderColor: alpha(theme.palette.error.main, mode === 'dark' ? 0.24 : 0.18),
                  color: 'text.primary',
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.45 }}>
                  {error}
                </Typography>
              </Alert>
            ) : null}
            {resetHint ? (
              <Alert
                severity="success"
                icon={false}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  py: 1,
                  bgcolor: alpha(theme.palette.success.main, mode === 'dark' ? 0.12 : 0.08),
                  border: 1,
                  borderColor: alpha(theme.palette.success.main, mode === 'dark' ? 0.24 : 0.18),
                  color: 'text.primary',
                }}
                onClose={() => setResetHint(null)}
              >
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.45 }}>
                  {resetHint}
                </Typography>
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
                mt: 1.5,
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
                label={<Typography variant="body2">Lembrar-me</Typography>}
              />
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{
                  cursor: 'pointer',
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.dark' },
                }}
              >
                Esqueci minha senha
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
                py: 1.3,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                letterSpacing: 0,
                boxShadow: `0 10px 24px ${alpha(primary, 0.24)}`,
                '&:hover': {
                  boxShadow: `0 14px 32px ${alpha(primary, 0.3)}`,
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0)' },
              }}
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 2 }}
            >
              {isMdUp ? 'Acesso restrito para colaboradores.' : 'Acesso restrito.'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
