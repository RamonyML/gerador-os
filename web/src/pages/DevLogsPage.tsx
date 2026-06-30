import { useEffect, useMemo, useState } from 'react'
import * as Sentry from '@sentry/react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Reveal } from '../components/Reveal'
import { logger } from '../lib/logger'
import { db } from '../lib/firebase'

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
const isSentryConfigured = Boolean(dsn)
const sentryEnv = import.meta.env.MODE as string
const firebaseProject = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined

type AppLog = {
  id: string
  level: 'warn' | 'error'
  message: string
  context: Record<string, unknown> | null
  env: string
  timestamp: Timestamp | null
}

type TabValue = 'all' | 'error' | 'warn'

function formatTs(ts: Timestamp | null): string {
  if (!ts) return '—'
  try {
    return format(ts.toDate(), 'dd/MM, HH:mm:ss', { locale: ptBR })
  } catch {
    return '—'
  }
}

function maskDsn(raw: string): string {
  try {
    const url = new URL(raw)
    return `${url.protocol}//*****@${url.host}${url.pathname}`
  } catch {
    return '••••••••'
  }
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem', fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, color: color ?? 'text.primary' }}>
        {value}
      </Typography>
    </Paper>
  )
}

// ── Bar chart (last 24h, 12 buckets of 2h each) ───────────────────────────
function EventsChart({ logs }: { logs: AppLog[] }) {
  const theme = useTheme()
  const CHART_H = 52

  const buckets = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const from = new Date(now)
      from.setHours(from.getHours() - (11 - i) * 2, 0, 0, 0)
      const to = new Date(from)
      to.setHours(to.getHours() + 2)

      const inRange = (l: AppLog) => {
        if (!l.timestamp) return false
        const d = l.timestamp.toDate()
        return d >= from && d < to
      }

      const errors = logs.filter(l => l.level === 'error' && inRange(l)).length
      const warns  = logs.filter(l => l.level === 'warn'  && inRange(l)).length
      return { label: format(from, 'HH:mm'), errors, warns, total: errors + warns }
    })
  }, [logs])

  const max = Math.max(...buckets.map(b => b.total), 1)

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}
      >
        Eventos nas últimas 24h
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: CHART_H + 20, mt: 1.5 }}>
        {buckets.map((b, i) => {
          const totalH  = (b.total / max) * CHART_H
          const errorH  = b.total > 0 ? (b.errors / b.total) * totalH : 0
          const warnH   = totalH - errorH

          return (
            <Tooltip
              key={i}
              title={`${b.label} — ${b.errors} erro${b.errors !== 1 ? 's' : ''}, ${b.warns} aviso${b.warns !== 1 ? 's' : ''}`}
              placement="top"
              arrow
            >
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'default' }}>
                <Box sx={{ width: '100%', height: CHART_H, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {b.total > 0 ? (
                    <>
                      {b.errors > 0 && (
                        <Box
                          sx={{
                            width: '100%',
                            height: errorH,
                            bgcolor: 'error.main',
                            borderRadius: b.warns === 0 ? '3px 3px 0 0' : 0,
                            minHeight: 3,
                          }}
                        />
                      )}
                      {b.warns > 0 && (
                        <Box
                          sx={{
                            width: '100%',
                            height: warnH,
                            bgcolor: 'warning.main',
                            borderRadius: b.errors === 0 ? '3px 3px 0 0' : 0,
                            minHeight: 3,
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <Box sx={{ width: '100%', height: 3, bgcolor: alpha(theme.palette.divider, 0.6), borderRadius: 1 }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ fontSize: '0.58rem', color: 'text.disabled', lineHeight: 1 }}>
                  {b.label}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        {[['error.main', 'Erros'], ['warning.main', 'Avisos']].map(([color, label]) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: color }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ── Log row (expandable) ──────────────────────────────────────────────────
function LogRow({ log }: { log: AppLog }) {
  const [expanded, setExpanded] = useState(false)
  const hasContext = Boolean(log.context)

  return (
    <Box
      onClick={() => hasContext && setExpanded(e => !e)}
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        cursor: hasContext ? 'pointer' : 'default',
        '&:hover': hasContext ? { bgcolor: 'action.hover' } : undefined,
        borderLeft: 2,
        borderColor: log.level === 'error' ? 'error.main' : 'warning.main',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Chip
          label={log.level === 'error' ? 'ERRO' : 'AVISO'}
          color={log.level === 'error' ? 'error' : 'warning'}
          size="small"
          sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontSize: '0.7rem' }}>
          {formatTs(log.timestamp)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
        >
          {log.message}
        </Typography>
        {log.env && (
          <Chip
            label={log.env}
            size="small"
            variant="outlined"
            sx={{ height: 16, fontSize: '0.58rem', flexShrink: 0 }}
          />
        )}
        {hasContext && (
          <ExpandMoreRoundedIcon
            sx={{
              fontSize: 16,
              color: 'text.disabled',
              flexShrink: 0,
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        )}
      </Box>

      {expanded && log.context && (
        <Box
          component="pre"
          sx={{
            mt: 0.75,
            mb: 0,
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            color: 'text.secondary',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {JSON.stringify(log.context, null, 2)}
        </Box>
      )}
    </Box>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export function DevLogsPage() {
  const [testResult, setTestResult] = useState<'error' | 'warn' | null>(null)
  const [logs, setLogs]             = useState<AppLog[]>([])
  const [logsError, setLogsError]   = useState<string | null>(null)
  const [tab, setTab]               = useState<TabValue>('all')

  useEffect(() => {
    const q = query(collection(db, 'appLogs'), orderBy('timestamp', 'desc'), limit(100))
    return onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppLog)))
        setLogsError(null)
      },
      (err) => setLogsError(err.message),
    )
  }, [])

  const errorCount   = useMemo(() => logs.filter(l => l.level === 'error').length, [logs])
  const warnCount    = useMemo(() => logs.filter(l => l.level === 'warn').length, [logs])
  const filteredLogs = useMemo(
    () => tab === 'all' ? logs : logs.filter(l => l.level === tab),
    [logs, tab],
  )
  const lastEventStr = useMemo(() => {
    const first = logs[0]
    if (!first?.timestamp) return '—'
    try {
      return formatDistanceToNow(first.timestamp.toDate(), { addSuffix: true, locale: ptBR })
    } catch {
      return '—'
    }
  }, [logs])

  const handleTestError = () => {
    logger.error(new Error('[Teste] Erro capturado via DevLogsPage'), { source: 'DevLogsPage', test: true })
    setTestResult('error')
  }

  const handleTestWarn = () => {
    logger.warn('[Teste] Aviso capturado via DevLogsPage')
    setTestResult('warn')
  }

  const handleTestNativeError = () => {
    Sentry.captureException(new Error('[Teste] Erro nativo Sentry via DevLogsPage'))
    setTestResult('error')
  }

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Header */}
          <Reveal>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <RadarOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
                  Área Dev
                </Typography>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Monitoramento
                </Typography>
              </Box>
            </Box>
          </Reveal>

          {/* Stat cards */}
          <Reveal>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
              <StatCard label="Total"         value={logs.length} />
              <StatCard label="Erros"         value={errorCount}  color="error.main" />
              <StatCard label="Avisos"        value={warnCount}   color="warning.main" />
              <StatCard label="Último evento" value={lastEventStr} />
            </Box>
          </Reveal>

          {/* Chart + filtered log list */}
          <Reveal>
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>

              <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
                <EventsChart logs={logs} />
              </Box>

              <Divider />

              <Tabs
                value={tab}
                onChange={(_, v: TabValue) => setTab(v)}
                sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
                slotProps={{ indicator: { style: { height: 2 } } }}
              >
                <Tab label={`Todos (${logs.length})`}  value="all"   sx={{ fontSize: '0.8rem', textTransform: 'none', minHeight: 42 }} />
                <Tab label={`Erros (${errorCount})`}   value="error" sx={{ fontSize: '0.8rem', textTransform: 'none', minHeight: 42 }} />
                <Tab label={`Avisos (${warnCount})`}   value="warn"  sx={{ fontSize: '0.8rem', textTransform: 'none', minHeight: 42 }} />
              </Tabs>

              <Box sx={{ p: 2, minHeight: 80 }}>
                {logsError && <Alert severity="warning">{logsError}</Alert>}

                {!logsError && filteredLogs.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    Nenhum evento registrado ainda.
                  </Typography>
                )}

                {filteredLogs.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    {filteredLogs.map(log => <LogRow key={log.id} log={log} />)}
                  </Box>
                )}
              </Box>
            </Paper>
          </Reveal>

          {/* Sentry info + Test buttons */}
          <Reveal>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>

              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Sentry</Typography>
                  <Chip
                    icon={isSentryConfigured ? <CheckCircleOutlineRoundedIcon /> : <ErrorOutlineRoundedIcon />}
                    label={isSentryConfigured ? 'Conectado' : 'Não configurado'}
                    color={isSentryConfigured ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ambiente</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{sentryEnv}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Firebase Project</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{firebaseProject ?? '—'}</Typography>
                  </Box>
                  {isSentryConfigured && dsn && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">DSN</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all' }}>
                        {maskDsn(dsn)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {isSentryConfigured && (
                  <Button
                    href="https://sentry.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    endIcon={<LaunchRoundedIcon sx={{ fontSize: 13 }} />}
                    sx={{ textTransform: 'none', mt: 2, p: 0 }}
                  >
                    Abrir painel Sentry
                  </Button>
                )}
                {!isSentryConfigured && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Adicione <code>VITE_SENTRY_DSN</code> ao <code>.env</code>.
                  </Alert>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Testes de Captura</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                  Dispara um evento de teste. O resultado aparece na lista acima em tempo real.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined" color="error" size="small"
                    startIcon={<BugReportOutlinedIcon />}
                    onClick={handleTestError}
                    sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                  >
                    Erro via logger
                  </Button>
                  <Button
                    variant="outlined" color="warning" size="small"
                    startIcon={<WarningAmberRoundedIcon />}
                    onClick={handleTestWarn}
                    sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                  >
                    Aviso via logger
                  </Button>
                  <Button
                    variant="outlined" color="error" size="small"
                    startIcon={<BugReportOutlinedIcon />}
                    onClick={handleTestNativeError}
                    sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                  >
                    Erro nativo Sentry
                  </Button>
                </Box>
                {testResult && (
                  <Alert
                    severity={testResult === 'error' ? 'error' : 'warning'}
                    sx={{ mt: 1.5 }}
                    onClose={() => setTestResult(null)}
                  >
                    {testResult === 'error' ? 'Erro enviado.' : 'Aviso enviado.'}{' '}
                    Verifique a lista acima.
                  </Alert>
                )}
              </Paper>

            </Box>
          </Reveal>

        </Box>
      </Container>
    </Box>
  )
}
