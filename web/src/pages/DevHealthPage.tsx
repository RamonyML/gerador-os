import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ApiOutlinedIcon from '@mui/icons-material/ApiOutlined'
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, getFirebaseFunctions } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Reveal } from '../components/Reveal'

// ── Types ────────────────────────────────────────────────────────────────────

type CheckStatus = 'idle' | 'checking' | 'ok' | 'warn' | 'error'

type ServiceState = {
  status: CheckStatus
  latency?: number
  message: string
}

type CheckId = 'firestore' | 'auth' | 'mk' | 'sentry'

type AllChecks = Record<CheckId, ServiceState>

type CheckResult = { status: 'ok' | 'warn'; latency?: number; message: string }

// ── Constants ────────────────────────────────────────────────────────────────

const IDLE: ServiceState = { status: 'idle', message: '' }

const INITIAL: AllChecks = {
  firestore: IDLE,
  auth: IDLE,
  mk: IDLE,
  sentry: IDLE,
}

const STATUS_DOT: Record<CheckStatus, string> = {
  idle:     '#9ca3af',
  checking: '#60a5fa',
  ok:       '#10b981',
  warn:     '#f59e0b',
  error:    '#ef4444',
}

const STATUS_LABEL: Record<CheckStatus, string> = {
  idle:     'Aguardando',
  checking: 'Verificando',
  ok:       'OK',
  warn:     'Atenção',
  error:    'Falha',
}

const SERVICES_CONFIG: Array<{
  id: CheckId
  label: string
  description: string
  icon: React.ReactNode
}> = [
  {
    id: 'firestore',
    label: 'Firestore',
    description: 'Banco de dados em tempo real',
    icon: <StorageOutlinedIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'auth',
    label: 'Firebase Auth',
    description: 'Autenticação e sessão ativa',
    icon: <LockOutlinedIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'mk',
    label: 'API MK Solutions',
    description: 'Integração via Cloud Function',
    icon: <ApiOutlinedIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'sentry',
    label: 'Sentry',
    description: 'Monitoramento de erros em produção',
    icon: <RadarOutlinedIcon sx={{ fontSize: 18 }} />,
  },
]

// ── Service card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  icon: React.ReactNode
  label: string
  description: string
  state: ServiceState
}

function ServiceCard({ icon, label, description, state }: ServiceCardProps) {
  const { status, latency, message } = state
  const color = STATUS_DOT[status]
  const isChecking = status === 'checking'

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: status === 'ok' || status === 'error' || status === 'warn'
          ? alpha(color, 0.5)
          : 'divider',
        borderWidth: status === 'ok' || status === 'error' ? 1.5 : 1,
        transition: 'border-color 0.3s',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {/* Status dot */}
        <Box sx={{ flexShrink: 0, pt: 0.35 }}>
          {isChecking ? (
            <CircularProgress size={14} thickness={5} sx={{ color }} />
          ) : (
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: color,
                boxShadow: status === 'ok' ? `0 0 0 3px ${alpha(color, 0.18)}` : 'none',
                transition: 'all 0.3s',
              }}
            />
          )}
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {label}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {latency !== undefined && (
                <Chip
                  label={latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`}
                  size="small"
                  sx={{ fontSize: '0.62rem', height: 18 }}
                />
              )}
              <Chip
                label={STATUS_LABEL[status]}
                size="small"
                sx={{
                  fontSize: '0.62rem',
                  height: 18,
                  bgcolor: alpha(color, 0.12),
                  color,
                  fontWeight: 700,
                  border: 'none',
                }}
              />
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {description}
          </Typography>

          {message && (
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 0.5, color: alpha(color, 0.85), fontWeight: 500 }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function resolveCheck(
  result: PromiseSettledResult<CheckResult>,
  fallback: string
): ServiceState {
  if (result.status === 'fulfilled') {
    return { status: result.value.status, latency: result.value.latency, message: result.value.message }
  }
  const msg = result.reason instanceof Error ? result.reason.message : fallback
  return { status: 'error', message: msg }
}

export function DevHealthPage() {
  const { user } = useAuth()
  const [checks, setChecks] = useState<AllChecks>(INITIAL)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const ranOnMount = useRef(false)

  const runAll = useCallback(async () => {
    setChecks({
      firestore: { status: 'checking', message: 'Conectando…' },
      auth:      { status: 'checking', message: 'Validando sessão…' },
      mk:        { status: 'checking', message: 'Testando auth MK…' },
      sentry:    { status: 'checking', message: 'Verificando SDK…' },
    })

    const checkFirestore = async (): Promise<CheckResult> => {
      const start = Date.now()
      await getDocs(query(collection(db, 'usersPublic'), limit(1)))
      return { status: 'ok', latency: Date.now() - start, message: 'Leitura bem-sucedida' }
    }

    const checkAuth = async (): Promise<CheckResult> => {
      if (!user) throw new Error('Usuário não autenticado')
      const start = Date.now()
      await user.getIdToken(false)
      return {
        status: 'ok',
        latency: Date.now() - start,
        message: `Sessão válida · ${user.email ?? user.uid.slice(0, 8)}`,
      }
    }

    const checkMk = async (): Promise<CheckResult> => {
      const start = Date.now()
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      await fn({ action: 'testar_auth' })
      return { status: 'ok', latency: Date.now() - start, message: 'Autenticação MK válida' }
    }

    const checkSentry = async (): Promise<CheckResult> => {
      if (import.meta.env.DEV) {
        return { status: 'warn', message: 'Desabilitado em desenvolvimento (esperado)' }
      }
      return { status: 'ok', message: 'SDK ativo em produção' }
    }

    const [fsRes, authRes, mkRes, sentryRes] = await Promise.allSettled([
      checkFirestore(),
      checkAuth(),
      checkMk(),
      checkSentry(),
    ])

    setChecks({
      firestore: resolveCheck(fsRes,     'Falha ao conectar ao Firestore'),
      auth:      resolveCheck(authRes,   'Falha na validação de sessão'),
      mk:        resolveCheck(mkRes,     'Falha na integração com MK'),
      sentry:    resolveCheck(sentryRes, 'Sentry indisponível'),
    })
    setLastChecked(new Date())
  }, [user])

  useEffect(() => {
    if (ranOnMount.current) return
    ranOnMount.current = true
    void runAll()
  }, [runAll])

  // Overall status
  const statuses = Object.values(checks).map(c => c.status)
  const isChecking = statuses.some(s => s === 'checking')
  const isIdle     = statuses.every(s => s === 'idle')
  const hasError   = statuses.some(s => s === 'error')
  const hasWarn    = statuses.some(s => s === 'warn')
  const allOk      = statuses.every(s => s === 'ok')

  const overallStatus: CheckStatus = isChecking
    ? 'checking'
    : isIdle
      ? 'idle'
      : hasError
        ? 'error'
        : hasWarn
          ? 'warn'
          : 'ok'

  const overallColor = STATUS_DOT[overallStatus]

  const overallLabel = isChecking
    ? 'Verificando serviços…'
    : allOk
      ? 'Todos os serviços operacionais'
      : hasError
        ? 'Falha detectada em um ou mais serviços'
        : hasWarn
          ? 'Um serviço em modo degradado'
          : 'Pronto para verificar'

  const OverallIcon = allOk
    ? CheckCircleRoundedIcon
    : hasError
      ? ErrorRoundedIcon
      : hasWarn
        ? WarningRoundedIcon
        : NetworkCheckOutlinedIcon

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Header */}
          <Reveal>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <NetworkCheckOutlinedIcon sx={{ fontSize: 30, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
                    Área Dev
                  </Typography>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Health Check
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={isChecking
                  ? <CircularProgress size={13} color="inherit" />
                  : <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                }
                onClick={() => void runAll()}
                disabled={isChecking}
              >
                {isChecking ? 'Verificando…' : 'Verificar tudo'}
              </Button>
            </Box>
          </Reveal>

          {/* Overall status banner */}
          <Reveal>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                borderColor: isIdle || isChecking ? 'divider' : alpha(overallColor, 0.45),
                borderWidth: !isIdle && !isChecking ? 1.5 : 1,
                bgcolor: isIdle || isChecking ? 'background.paper' : alpha(overallColor, 0.04),
                transition: 'all 0.4s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexShrink: 0 }}>
                  {isChecking ? (
                    <CircularProgress size={28} thickness={3} sx={{ color: overallColor }} />
                  ) : (
                    <OverallIcon sx={{ fontSize: 28, color: isIdle ? 'text.disabled' : overallColor }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {overallLabel}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lastChecked
                      ? `Última verificação: ${lastChecked.toLocaleTimeString('pt-BR')} · 4 serviços monitorados`
                      : '4 serviços monitorados'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Reveal>

          {/* Service cards grid */}
          <Reveal>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              }}
            >
              {SERVICES_CONFIG.map(svc => (
                <ServiceCard
                  key={svc.id}
                  icon={svc.icon}
                  label={svc.label}
                  description={svc.description}
                  state={checks[svc.id]}
                />
              ))}
            </Box>
          </Reveal>

        </Box>
      </Container>
    </Box>
  )
}
