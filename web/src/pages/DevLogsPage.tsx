import { useState } from 'react'
import * as Sentry from '@sentry/react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded'
import { Reveal } from '../components/Reveal'
import { logger } from '../lib/logger'

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
const isSentryConfigured = Boolean(dsn)
const sentryEnv = import.meta.env.MODE as string
const firebaseProject = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined

function maskDsn(raw: string): string {
  try {
    const url = new URL(raw)
    return `${url.protocol}//*****@${url.host}${url.pathname}`
  } catch {
    return '••••••••'
  }
}

export function DevLogsPage() {
  const [testResult, setTestResult] = useState<'error' | 'warn' | null>(null)

  const handleTestError = () => {
    const err = new Error('[Teste] Erro capturado via DevLogsPage')
    logger.error(err, { source: 'DevLogsPage', test: true })
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
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          <Reveal>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <RadarOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
                >
                  Área Dev
                </Typography>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
                >
                  Monitoramento
                </Typography>
              </Box>
            </Box>
          </Reveal>

          <Reveal>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Sentry
                </Typography>
                <Chip
                  icon={
                    isSentryConfigured
                      ? <CheckCircleOutlineRoundedIcon />
                      : <ErrorOutlineRoundedIcon />
                  }
                  label={isSentryConfigured ? 'Conectado' : 'Não configurado'}
                  color={isSentryConfigured ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ambiente
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
                    {sentryEnv}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Firebase Project
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
                    {firebaseProject ?? '—'}
                  </Typography>
                </Box>
                {isSentryConfigured && dsn && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="caption" color="text.secondary">
                      DSN (mascarado)
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 0.25, wordBreak: 'break-all' }}
                    >
                      {maskDsn(dsn)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {isSentryConfigured && (
                <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Button
                    href="https://sentry.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    endIcon={<LaunchRoundedIcon sx={{ fontSize: 14 }} />}
                    sx={{ textTransform: 'none' }}
                  >
                    Abrir painel Sentry
                  </Button>
                </Box>
              )}

              {!isSentryConfigured && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Adicione <code>VITE_SENTRY_DSN</code> ao arquivo <code>.env</code> para ativar o monitoramento.
                </Alert>
              )}
            </Paper>
          </Reveal>

          <Reveal>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
                Testes de Captura
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Dispara um evento de teste para verificar se o Sentry está recebendo os dados corretamente.
                Em produção os eventos aparecem no painel em alguns segundos.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<BugReportOutlinedIcon />}
                  onClick={handleTestError}
                  sx={{ textTransform: 'none' }}
                >
                  Erro via logger
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<WarningAmberRoundedIcon />}
                  onClick={handleTestWarn}
                  sx={{ textTransform: 'none' }}
                >
                  Aviso via logger
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<BugReportOutlinedIcon />}
                  onClick={handleTestNativeError}
                  sx={{ textTransform: 'none' }}
                >
                  Erro nativo Sentry
                </Button>
              </Box>

              {testResult && (
                <Alert
                  severity={testResult === 'error' ? 'error' : 'warning'}
                  sx={{ mt: 2 }}
                  onClose={() => setTestResult(null)}
                >
                  {testResult === 'error'
                    ? 'Erro enviado. Em produção aparece no painel Sentry em instantes.'
                    : 'Aviso enviado. Em produção aparece no painel Sentry em instantes.'}
                  {import.meta.env.DEV && ' (em dev, apenas logado no console)'}
                </Alert>
              )}
            </Paper>
          </Reveal>

          <Reveal>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
                Como usar o Logger
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Substitua <code>console.*</code> por <code>logger</code> em todo o código.
                Em produção, <code>debug</code> e <code>info</code> ficam silenciosos — só erros e avisos chegam ao Sentry.
              </Typography>

              <Box
                component="pre"
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  p: 1.5,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  m: 0,
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                }}
              >
                {`import { logger } from '../lib/logger'

logger.debug('valor:', x)   // só em dev
logger.info('carregado')    // só em dev
logger.warn('atenção')      // dev + Sentry
logger.error(err, { ctx })  // dev + Sentry (captureException)`}
              </Box>
            </Paper>
          </Reveal>

        </Box>
      </Container>
    </Box>
  )
}
