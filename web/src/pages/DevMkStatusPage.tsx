import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import WifiRoundedIcon from '@mui/icons-material/WifiRounded'
import { httpsCallable } from 'firebase/functions'
import { AppPageChrome } from '../components/AppPageChrome'
import { getFirebaseFunctions } from '../lib/firebase'

type CheckState = 'idle' | 'loading' | 'ok' | 'error'

type CheckResult = {
  state: CheckState
  checkedAt: Date | null
  durationMs: number | null
  detail: unknown
  error: string
}

const INIT: CheckResult = {
  state: 'idle',
  checkedAt: null,
  durationMs: null,
  detail: null,
  error: '',
}

function fmt(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function DevMkStatusPage() {
  const theme = useTheme()
  const [result, setResult] = useState<CheckResult>(INIT)
  const [showDetail, setShowDetail] = useState(false)
  const calledOnMount = useRef(false)

  const check = async () => {
    setResult((p) => ({ ...p, state: 'loading', error: '' }))
    const start = Date.now()
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      const res = await fn({ action: 'testar_auth' })
      setResult({
        state: 'ok',
        checkedAt: new Date(),
        durationMs: Date.now() - start,
        detail: res.data,
        error: '',
      })
    } catch (e) {
      setResult({
        state: 'error',
        checkedAt: new Date(),
        durationMs: Date.now() - start,
        detail: null,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  useEffect(() => {
    if (calledOnMount.current) return
    calledOnMount.current = true
    void check()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { state, checkedAt, durationMs, detail, error } = result
  const isLoading = state === 'loading'
  const isOk = state === 'ok'
  const isError = state === 'error'

  const borderColor = isOk
    ? theme.palette.success.main
    : isError
      ? theme.palette.error.main
      : theme.palette.divider

  return (
    <AppPageChrome
      overline="Ambiente de desenvolvimento"
      title="Status MK"
      subtitle={
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
          <Chip label="DEV ONLY" color="warning" size="small" sx={{ fontWeight: 700 }} />
          <Chip label="southamerica-east1" size="small" variant="outlined" />
        </Box>
      }
      illustration="technology"
      illustrationAlt="Status MK"
    >
      {/* Status card principal */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor,
          borderWidth: isOk || isError ? 2 : 1,
          transition: 'border-color 0.3s',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: isOk
              ? alpha(theme.palette.success.main, 0.06)
              : isError
                ? alpha(theme.palette.error.main, 0.06)
                : 'background.paper',
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            {isLoading ? (
              <CircularProgress size={36} thickness={4} />
            ) : isOk ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 36, color: 'success.main' }} />
            ) : isError ? (
              <ErrorRoundedIcon sx={{ fontSize: 36, color: 'error.main' }} />
            ) : (
              <WifiRoundedIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {isLoading
                ? 'Verificando conexão MK…'
                : isOk
                  ? 'MK Solutions — Conectado'
                  : isError
                    ? 'MK Solutions — Falha de autenticação'
                    : 'MK Solutions — aguardando verificação'}
            </Typography>

            {(checkedAt || isLoading) && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                {isLoading
                  ? 'Autenticando no servidor MK…'
                  : `Verificado às ${fmtTime(checkedAt!)}${durationMs !== null ? ` · ${fmt(durationMs)}` : ''}`}
              </Typography>
            )}
          </Box>

          <Chip
            size="small"
            label={isLoading ? 'Verificando' : isOk ? 'OK' : isError ? 'ERRO' : 'NÃO TESTADO'}
            color={isOk ? 'success' : isError ? 'error' : 'default'}
            variant={isOk || isError ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />
        </Box>

        {/* Erro */}
        {isError && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 2, bgcolor: alpha(theme.palette.error.main, 0.04) }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <strong>Detalhes do erro:</strong> {error}
              </Alert>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                Provável causa: token MK expirado ou revogado. Acesse o painel MK Solutions → Configurações → Webservice e gere um novo token. Depois atualize via{' '}
                <Box component="code" sx={{ fontSize: 12, fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}>
                  firebase functions:secrets:set MK_TOKEN
                </Box>
              </Typography>
            </Box>
          </>
        )}

        {/* Detalhes da resposta (OK) */}
        {isOk && detail !== null && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 1.25 }}>
              <Button
                size="small"
                color="inherit"
                onClick={() => setShowDetail((v) => !v)}
                sx={{ fontSize: 12 }}
              >
                {showDetail ? 'Ocultar' : 'Ver'} resposta completa da API
              </Button>
              {showDetail && (
                <Box
                  component="pre"
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover',
                    fontSize: 11.5,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: 240,
                    overflowY: 'auto',
                    m: 0,
                  }}
                >
                  {JSON.stringify(detail, null, 2)}
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Rodapé */}
        <Divider />
        <Box sx={{ px: 2.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant={state === 'idle' ? 'contained' : 'outlined'}
            startIcon={isLoading
              ? <CircularProgress size={13} color="inherit" />
              : <RefreshRoundedIcon sx={{ fontSize: 15 }} />
            }
            onClick={() => void check()}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando…' : state === 'idle' ? 'Verificar agora' : 'Verificar novamente'}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Testa a autenticação via <code>WSAutenticacao.rule</code>
          </Typography>
        </Box>
      </Paper>

      {/* Info adicional */}
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Quando o token expira
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          O MK Solutions gera tokens com validade configurável. Ao expirar, todas as chamadas retornam{' '}
          <Box component="code" sx={{ fontSize: 12, fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}>
            "Token não localizado." (ERRO 002)
          </Box>
          {' '}— idêntico a um token inválido.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
          Para renovar: painel MK → Configurações → Webservice → gerar novo token → rodar{' '}
          <Box component="code" sx={{ fontSize: 12, fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}>
            firebase functions:secrets:set MK_TOKEN
          </Box>
          . Nenhum deploy necessário — a função lê o novo valor na próxima invocação.
        </Typography>
      </Paper>
    </AppPageChrome>
  )
}
