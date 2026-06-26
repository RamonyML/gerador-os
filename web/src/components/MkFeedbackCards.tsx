import { useCallback, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import TagRoundedIcon from '@mui/icons-material/TagRounded'
import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from '../lib/firebase'

type InsertStatus = 'idle' | 'loading' | 'done' | 'error'

type Props = {
  text: string
  disabled: boolean
}

export function MkFeedbackCards({ text, disabled }: Props) {
  const theme = useTheme()

  const [atendimentoIdInput, setAtendimentoIdInput] = useState('')
  const [insertStatus, setInsertStatus] = useState<InsertStatus>('idle')
  const [insertError, setInsertError] = useState('')
  const [snackOpen, setSnackOpen] = useState(false)

  const atendimentoId = parseInt(atendimentoIdInput.trim(), 10)
  const atendimentoIdValido = !isNaN(atendimentoId) && atendimentoId > 0

  const handleInserir = useCallback(async () => {
    if (!atendimentoIdValido || !text.trim()) return
    setInsertStatus('loading')
    setInsertError('')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      await fn({
        action: 'inserir_comentario',
        atendimentoId,
        comentario: text.trim(),
        tipo: 1,
      })
      setInsertStatus('done')
    } catch (e) {
      setInsertError(e instanceof Error ? e.message : String(e))
      setInsertStatus('idle')
    }
  }, [atendimentoId, atendimentoIdValido, text])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setSnackOpen(true)
    } catch { /* ignore */ }
  }, [text])

  const done = insertStatus === 'done'

  return (
    <Stack spacing={1.5}>

      {/* Card: comentário de feedback */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: done
            ? theme.palette.success.main
            : insertStatus === 'error'
              ? theme.palette.error.main
              : theme.palette.primary.light,
          transition: 'border-color 0.2s',
          overflow: 'hidden',
        }}
      >
        {/* cabeçalho */}
        <Box
          sx={{
            px: 2,
            pt: 1.25,
            pb: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: done
              ? alpha(theme.palette.success.main, 0.06)
              : alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase' }}
          >
            Comentário de feedback
          </Typography>

          {done && (
            <Chip
              size="small"
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 12, '&&': { ml: '6px' } }} />}
              label="Inserido no MK"
              color="success"
              variant="outlined"
              sx={{ fontSize: 11, height: 22 }}
            />
          )}
        </Box>

        <Divider />

        {/* texto */}
        <Box sx={{ px: 2, py: 1.25 }}>
          <Box
            component="pre"
            sx={{
              m: 0,
              fontSize: 12.5,
              fontFamily: theme.typography.fontFamily,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.55,
              color: 'text.primary',
            }}
          >
            {text || '—'}
          </Box>
        </Box>

        <Divider />

        {/* rodapé */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: alpha(theme.palette.background.default, 0.4),
            flexWrap: 'wrap',
          }}
        >
          <Tooltip title="Copiar texto">
            <span>
              <IconButton size="small" onClick={() => void handleCopy()} disabled={!text}>
                <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </span>
          </Tooltip>

          {!done ? (
            <>
              <TextField
                size="small"
                placeholder="Cód. atendimento MK"
                value={atendimentoIdInput}
                onChange={(e) => setAtendimentoIdInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleInserir() }}
                disabled={insertStatus === 'loading'}
                sx={{ width: 180 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <TagRoundedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: 13 },
                  },
                }}
              />
              <Button
                size="small"
                variant="contained"
                color="primary"
                disableElevation
                startIcon={
                  insertStatus === 'loading'
                    ? <CircularProgress size={12} color="inherit" />
                    : <SendRoundedIcon sx={{ fontSize: 14 }} />
                }
                onClick={() => void handleInserir()}
                disabled={!atendimentoIdValido || disabled || insertStatus === 'loading'}
                sx={{ fontSize: 12, py: 0.35, px: 1.25, lineHeight: 1.4 }}
              >
                {insertStatus === 'loading' ? 'Inserindo…' : 'Inserir no MK'}
              </Button>
              {insertStatus === 'error' && (
                <Typography variant="caption" color="error" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                  {insertError}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
              Comentário inserido no atendimento #{atendimentoId}
            </Typography>
          )}
        </Box>
      </Paper>

      <Alert severity="info" icon={false} sx={{ py: 0.5, px: 1.5, borderRadius: 1.5, fontSize: 12 }}>
        Abra o atendimento no MK ERP, copie o <strong>Código do Atendimento</strong> (não o número do protocolo) e cole acima.
      </Alert>

      <Snackbar
        open={snackOpen}
        autoHideDuration={1800}
        onClose={() => setSnackOpen(false)}
        message="Texto copiado"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  )
}
