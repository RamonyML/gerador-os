import { useState, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from '../lib/firebase'

type MkState = 'idle' | 'loading' | 'ok' | 'error'

type MkResult = {
  protocolo?: string
  atendimentoId?: number
}

type Props = {
  slug: string
  cpf: string
  processoId: number
  classificacaoId: number
  info: string
  comentarios?: string[]
  disabled?: boolean
}

export function MkProtocolButton({
  slug,
  cpf,
  processoId,
  classificacaoId,
  info,
  comentarios,
  disabled,
}: Props) {
  const [state, setState] = useState<MkState>('idle')
  const [protocolo, setProtocolo] = useState('')
  const [atendimentoId, setAtendimentoId] = useState<number | undefined>()
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleRegister = useCallback(async () => {
    setState('loading')
    setProtocolo('')
    setError('')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      const res = await fn({
        action: 'criar_protocolo',
        slug,
        cpf: cpf.replace(/\D/g, ''),
        processoId,
        classificacaoId,
        info,
        comentarios,
      })
      const data = res.data as MkResult
      setProtocolo(data.protocolo ?? '')
      setAtendimentoId(data.atendimentoId)
      setState('ok')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setState('error')
    }
  }, [slug, cpf, processoId, classificacaoId, info])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(protocolo)
      setCopied(true)
    } catch { /* ignore */ }
  }, [protocolo])

  if (state === 'ok') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        <CheckCircleRoundedIcon sx={{ color: 'success.main', fontSize: 17 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
          MK: {protocolo || `#${atendimentoId}`}
        </Typography>
        <Tooltip title="Copiar protocolo">
          <IconButton size="small" onClick={() => void handleCopy()}>
            <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Button
          size="small"
          color="inherit"
          sx={{ fontSize: 12, py: 0.25, minWidth: 0 }}
          onClick={() => { setState('idle'); setProtocolo('') }}
        >
          Novo
        </Button>
        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={() => setCopied(false)}
          message="Protocolo copiado"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    )
  }

  return (
    <Box>
      <Button
        size="small"
        variant="outlined"
        color="primary"
        startIcon={
          state === 'loading'
            ? <CircularProgress size={13} color="inherit" />
            : <SendRoundedIcon />
        }
        onClick={() => void handleRegister()}
        disabled={disabled || state === 'loading'}
      >
        {state === 'loading' ? 'Registrando…' : 'Registrar no MK'}
      </Button>
      {state === 'error' && (
        <Alert
          severity="error"
          sx={{ mt: 1, py: 0.5, px: 1.5, borderRadius: 1.5, fontSize: 12 }}
          onClose={() => setState('idle')}
        >
          {error}
        </Alert>
      )}
    </Box>
  )
}
