// Versão temporária — Card 0 abre o atendimento; cards de comentário são copy-only.
// Versão sequencial completa (com WSMKAtendimentoComentario) preservada em MkProtocolCards.sequential.tsx
import { useCallback, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from '../lib/firebase'

type CardState = 'idle' | 'loading' | 'ok' | 'error'

type MkCriarProtocoloResult = {
  protocolo?: string
  atendimentoId?: number
}

type Props = {
  slug: string
  cpf: string
  processoId: number
  classificacaoId: number
  segmentos: { info: string; comentarios: string[] }
  disabled: boolean
}

type CardItemProps = {
  index: number
  total: number
  text: string
  state: CardState
  error: string
  enabled: boolean
  protocolo?: string
  atendimentoId?: number
  onSend?: () => void
}

function CardItem({
  index,
  total,
  text,
  state,
  error,
  enabled,
  protocolo,
  atendimentoId,
  onSend,
}: CardItemProps) {
  const theme = useTheme()
  const [snackOpen, setSnackOpen] = useState(false)

  const isFirst = index === 0

  const borderColor =
    state === 'ok'
      ? theme.palette.success.main
      : state === 'error'
        ? theme.palette.error.main
        : !enabled && state === 'idle'
          ? theme.palette.divider
          : theme.palette.primary.light

  const label = isFirst
    ? 'Abertura do atendimento'
    : `Comentário ${index} de ${total - 1}`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setSnackOpen(true)
    } catch { /* ignore */ }
  }, [text])

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor,
        opacity: !enabled && state === 'idle' ? 0.5 : 1,
        transition: 'border-color 0.2s, opacity 0.2s',
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
          bgcolor:
            state === 'ok'
              ? alpha(theme.palette.success.main, 0.06)
              : alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase' }}
        >
          {label}
        </Typography>

        {state === 'ok' && isFirst && protocolo && (
          <Chip
            size="small"
            icon={<CheckCircleRoundedIcon sx={{ fontSize: 12, '&&': { ml: '6px' } }} />}
            label={`Protocolo: ${protocolo}`}
            color="success"
            variant="outlined"
            sx={{ fontSize: 11, height: 22 }}
          />
        )}
      </Box>

      <Divider />

      {/* corpo: texto */}
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
            color: !enabled && state === 'idle' ? 'text.disabled' : 'text.primary',
            maxHeight: 180,
            overflowY: 'auto',
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
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: alpha(theme.palette.background.default, 0.4),
          flexWrap: 'wrap',
        }}
      >
        <Tooltip title="Copiar texto">
          <span>
            <IconButton
              size="small"
              onClick={() => void handleCopy()}
              disabled={!text || (!isFirst && !enabled)}
            >
              <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </span>
        </Tooltip>

        {isFirst ? (
          state === 'ok' ? (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
              Atendimento #{atendimentoId ?? '?'} registrado
            </Typography>
          ) : (
            <>
              <Button
                size="small"
                variant="contained"
                color="primary"
                disableElevation
                startIcon={
                  state === 'loading'
                    ? <CircularProgress size={12} color="inherit" />
                    : <SendRoundedIcon sx={{ fontSize: 14 }} />
                }
                onClick={onSend}
                disabled={!enabled || state === 'loading'}
                sx={{ fontSize: 12, py: 0.35, px: 1.25, lineHeight: 1.4 }}
              >
                {state === 'loading' ? 'Enviando…' : 'Abrir atendimento no MK'}
              </Button>
              {state === 'error' && (
                <Typography variant="caption" color="error" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                  {error}
                </Typography>
              )}
            </>
          )
        ) : (
          enabled && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Copie e insira manualmente no atendimento MK
            </Typography>
          )
        )}
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={1800}
        onClose={() => setSnackOpen(false)}
        message="Texto copiado"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  )
}

export function MkProtocolCards({
  slug,
  cpf,
  processoId,
  classificacaoId,
  segmentos,
  disabled,
}: Props) {
  const cards = [segmentos.info, ...segmentos.comentarios]
  const total = cards.length

  const [atendimentoId, setAtendimentoId] = useState<number | null>(null)
  const [protocolo, setProtocolo] = useState('')
  const [card0State, setCard0State] = useState<CardState>('idle')
  const [card0Error, setCard0Error] = useState('')

  const resetAll = useCallback(() => {
    setAtendimentoId(null)
    setProtocolo('')
    setCard0State('idle')
    setCard0Error('')
  }, [])

  const handleSendFirst = useCallback(async () => {
    setCard0State('loading')
    setCard0Error('')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      const res = await fn({
        action: 'criar_protocolo',
        slug,
        cpf: cpf.replace(/\D/g, ''),
        processoId,
        classificacaoId,
        info: cards[0],
      })
      const data = res.data as MkCriarProtocoloResult
      setAtendimentoId(data.atendimentoId ?? null)
      setProtocolo(data.protocolo ?? '')
      setCard0State('ok')
    } catch (e) {
      setCard0Error(e instanceof Error ? e.message : String(e))
      setCard0State('error')
    }
  }, [slug, cpf, processoId, classificacaoId, cards])

  const card0Done = card0State === 'ok'
  const anyStarted = card0State !== 'idle'

  return (
    <Stack spacing={1.5} sx={{ flex: 1, overflow: 'auto', minHeight: { xs: 220, md: 280 }, pr: 0.5 }}>
      {anyStarted && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color={card0Done ? 'success.main' : 'text.secondary'} sx={{ fontWeight: card0Done ? 600 : 400 }}>
            {card0Done
              ? `Atendimento registrado — copie os comentários abaixo e insira no MK manualmente.`
              : 'Registrando atendimento no MK…'}
          </Typography>
          <Button
            size="small"
            color="inherit"
            startIcon={<RefreshRoundedIcon sx={{ fontSize: 14 }} />}
            onClick={resetAll}
            sx={{ fontSize: 11, py: 0.25, ml: 1 }}
          >
            Reiniciar
          </Button>
        </Box>
      )}

      {!anyStarted && disabled && (
        <Alert severity="warning" icon={false} sx={{ py: 0.5, px: 1.5, borderRadius: 1.5, fontSize: 12 }}>
          Preencha todos os campos antes de registrar no MK.
        </Alert>
      )}

      {cards.map((text, i) => {
        const isFirst = i === 0
        const enabled = !disabled && (isFirst || card0Done)

        return (
          <CardItem
            key={i}
            index={i}
            total={total}
            text={text}
            state={isFirst ? card0State : 'idle'}
            error={isFirst ? card0Error : ''}
            enabled={enabled}
            protocolo={protocolo}
            atendimentoId={atendimentoId ?? undefined}
            onSend={isFirst ? () => void handleSendFirst() : undefined}
          />
        )
      })}
    </Stack>
  )
}
