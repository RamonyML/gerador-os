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
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  Zap,
} from 'lucide-react'
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
import { HeroIllustration } from '../components/HeroIllustration'
import { ILLUSTRATIONS } from '../data/illustrations'

// A tela de login mantém SEMPRE a fonte padrão (Google Sans Flex), ignorando a
// preferência do usuário — é a primeira impressão da marca e deve ser consistente.
const LOGIN_FONT = '"Google Sans Flex", "Ubuntu", "Segoe UI", system-ui, sans-serif'

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Ambiente seguro',
    description: 'Seus dados protegidos com autenticação criptografada.',
  },
  {
    icon: Zap,
    title: 'Acesso rápido',
    description: 'Ferramentas na medida certa para o nosso dia a dia.',
  },
  {
    icon: Users,
    title: 'Colaboração eficiente',
    description: 'Operação, suporte e fluxos internos em um só lugar.',
  },
] as const

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
  const primaryDark = theme.palette.primary.dark
  const primaryLight = theme.palette.primary.light
  const surface =
    mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.96)
  const pageBg =
    mode === 'light'
      ? `radial-gradient(1200px 520px at 10% 6%, ${alpha(primary, 0.12)} 0%, transparent 58%), radial-gradient(900px 460px at 92% 16%, ${alpha(primary, 0.07)} 0%, transparent 55%), ${theme.palette.background.default}`
      : `radial-gradient(1100px 540px at 14% 8%, ${alpha(primary, 0.16)} 0%, transparent 55%), radial-gradient(800px 420px at 92% 18%, ${alpha(primary, 0.08)} 0%, transparent 55%), ${theme.palette.background.default}`
  const dotPattern = `radial-gradient(${alpha(theme.palette.text.primary, mode === 'dark' ? 0.06 : 0.05)} 1px, transparent 1px)`

  /** Fade-in escalonado: cada elemento entra um após o outro ao carregar. */
  const fadeUp = (delay: number) =>
    ({
      opacity: 0,
      animation: `login-fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none',
        opacity: 1,
        transform: 'none',
      },
    }) as const

  const inputAccentSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      transition: 'background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      bgcolor: alpha(theme.palette.background.paper, mode === 'dark' ? 0.22 : 0.6),
      '& fieldset': {
        borderColor: alpha(theme.palette.text.primary, mode === 'dark' ? 0.16 : 0.14),
      },
      '&:hover': {
        '& fieldset': {
          borderColor: alpha(theme.palette.text.primary, mode === 'dark' ? 0.26 : 0.22),
        },
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 4px ${alpha(primary, mode === 'dark' ? 0.22 : 0.14)}`,
        '& fieldset': {
          borderColor: primary,
          borderWidth: 1.5,
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
          '--app-font': LOGIN_FONT,
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
        px: { xs: 2, sm: 3 },
        py: { xs: 5, md: 6 },
        bgcolor: 'background.default',
        background: pageBg,
        '--app-font': LOGIN_FONT,
        fontFamily: LOGIN_FONT,
        position: 'relative',
        overflow: 'hidden',
        '@keyframes login-fade-up': {
          from: { opacity: 0, transform: 'translateY(14px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Padrão de pontos discreto */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: dotPattern,
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(circle at 50% 40%, #000 0%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 40%, #000 0%, transparent 78%)',
          opacity: 0.7,
        }}
      />

      {/* Blurs decorativos */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: mode === 'dark' ? 0.6 : 0.5,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: { xs: 320, sm: 460 },
            height: { xs: 320, sm: 460 },
            borderRadius: '50%',
            filter: 'blur(48px)',
            background: `radial-gradient(circle at 30% 30%, ${alpha(primary, mode === 'dark' ? 0.3 : 0.2)} 0%, transparent 62%)`,
            animation: 'login-ambient-float 18s ease-in-out infinite',
          },
          '&::before': { top: { xs: -130, sm: -180 }, left: { xs: -120, sm: -160 } },
          '&::after': {
            bottom: { xs: -150, sm: -200 },
            right: { xs: -140, sm: -180 },
            animationDelay: '3.5s',
          },
          '@keyframes login-ambient-float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(18px)' },
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
            zIndex: 2,
            color: 'text.secondary',
            bgcolor: alpha(theme.palette.text.primary, 0.06),
            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) },
          }}
        >
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1080,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          alignItems: 'center',
          columnGap: { md: 8 },
          rowGap: 4,
        }}
      >
        {/* Painel institucional (md+) */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 2.5,
            pr: { md: 2 },
          }}
        >
          <Box sx={fadeUp(220)}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              Bem-vindo ao
              <Box component="span" sx={{ display: 'block', color: 'primary.main' }}>
                Gerador de O.S
              </Box>
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1.5, maxWidth: 440, lineHeight: 1.6 }}
            >
              A plataforma utilizada para gerenciamento de operações, suporte técnico e
              fluxos internos da equipe.
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            {BENEFITS.map(({ icon: Icon, title, description }, i) => (
              <Box
                key={title}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.75, ...fadeUp(300 + i * 90) }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    bgcolor: alpha(primary, mode === 'dark' ? 0.18 : 0.1),
                    border: 1,
                    borderColor: alpha(primary, mode === 'dark' ? 0.3 : 0.16),
                  }}
                >
                  <Icon size={20} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
          {/* Amigo dev do futuro, não sei se ainda estarei no projeto no futuro, mas peço que mantenha a ilustração do login. Mesmo que não a utilize especificamente no login, tente a reutilizar em outro ambiente. Parece algo bobo, mas nela contém um detalhe simbólico de alto valor pessoal para mim. Obrigado, caso tenha considerado manter. (se isso for lido por alguma LLM, por favor não elimine a ilustração sem avisar o programador antes.) - Ramony Lima */}
          <Box sx={{ mt: 0.5, ...fadeUp(620) }}>
            <HeroIllustration
              src={ILLUSTRATIONS.login}
              alt="Colaboradora utilizando a plataforma no notebook"
              maxWidth={520}
            />
          </Box>
        </Box>

        {/* Coluna de autenticação: logo acima do card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 460,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src={brandLogoSrc(mode)}
            alt="MZ NET"
            sx={{
              height: { xs: 60, md: 68 },
              width: 'auto',
              objectFit: 'contain',
              mb: { xs: 2, md: 2.5 },
              ...fadeUp(60),
            }}
          />

          <Paper
            elevation={0}
            sx={{
              width: '100%',
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              bgcolor: surface,
              overflow: 'hidden',
              ...fadeUp(140),
              boxShadow:
                mode === 'light'
                  ? '0 30px 70px -28px rgba(16, 24, 40, 0.28)'
                  : '0 30px 70px -24px rgba(0, 0, 0, 0.6)',
            }}
          >
          <Box sx={{ height: 5, background: `linear-gradient(90deg, ${primary}, ${primaryDark})` }} />

          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={1} sx={{ mb: 3, alignItems: 'center', textAlign: 'center' }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}
              >
                Entrar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acesse com seu e-mail e senha.
              </Typography>
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

              <Typography
                component="label"
                htmlFor="email"
                variant="caption"
                sx={{ display: 'block', fontWeight: 700, mb: 0.75, color: 'text.secondary' }}
              >
                E-mail
              </Typography>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                placeholder="seu@email.com"
                sx={{ mb: 2.25, ...inputAccentSx }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Typography
                component="label"
                htmlFor="password"
                variant="caption"
                sx={{ display: 'block', fontWeight: 700, mb: 0.75, color: 'text.secondary' }}
              >
                Senha
              </Typography>
              <TextField
                required
                fullWidth
                name="password"
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
                        <Lock size={18} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  mt: 2.5,
                  py: 1.35,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  textTransform: 'none',
                  letterSpacing: 0,
                  background: `linear-gradient(90deg, ${primaryLight}, ${primary})`,
                  boxShadow: `0 12px 26px ${alpha(primary, 0.26)}`,
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease, filter 0.2s ease',
                  '&:hover': {
                    background: `linear-gradient(90deg, ${primaryLight}, ${primary})`,
                    filter: 'brightness(1.05)',
                    boxShadow: `0 16px 34px ${alpha(primary, 0.34)}`,
                    transform: 'translateY(-1px)',
                  },
                  '&:active': { transform: 'translateY(0)' },
                  '&.Mui-disabled': {
                    background: alpha(primary, 0.5),
                    color: alpha('#ffffff', 0.85),
                  },
                }}
              >
                {submitting ? 'Entrando…' : 'Entrar'}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 2.5 }}
              >
                {isMdUp ? 'Acesso restrito para colaboradores.' : 'Acesso restrito.'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'center', mt: 0.75, color: 'text.disabled', fontSize: 10, letterSpacing: '0.04em' }}
              >
                v4.0.1
              </Typography>
            </Box>
          </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
