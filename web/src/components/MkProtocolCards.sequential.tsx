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
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from '../lib/firebase'

type CardState = 'idle' | 'loading' | 'ok' | 'error'

type MkCriarProtocoloResult = {
  protocolo?: string
  atendimentoId?: number
  sessionToken?: string
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
  onSend: () => void
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
      {/* cabeçalho do card */}
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
        {state === 'ok' && !isFirst && (
          <CheckCircleRoundedIcon sx={{ color: 'success.main', fontSize: 16 }} />
        )}
      </Box>

      <Divider />

      {/* corpo: texto do bloco */}
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

      {/* rodapé: ações */}
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
            <IconButton size="small" onClick={() => void handleCopy()} disabled={!text}>
              <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </span>
        </Tooltip>

        {state === 'ok' ? (
          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
            {isFirst
              ? `Atendimento #${atendimentoId ?? '?'} registrado`
              : 'Comentário inserido com sucesso'}
          </Typography>
        ) : (
          <Button
            size="small"
            variant={isFirst ? 'contained' : 'outlined'}
            color="primary"
            disableElevation
            startIcon={
              state === 'loading' ? (
                <CircularProgress size={12} color="inherit" />
              ) : isFirst ? (
                <SendRoundedIcon sx={{ fontSize: 14 }} />
              ) : (
                <CommentOutlinedIcon sx={{ fontSize: 14 }} />
              )
            }
            onClick={onSend}
            disabled={!enabled || state === 'loading'}
            sx={{ fontSize: 12, py: 0.35, px: 1.25, lineHeight: 1.4 }}
          >
            {state === 'loading'
              ? 'Enviando…'
              : isFirst
                ? 'Abrir atendimento no MK'
                : 'Inserir comentário'}
          </Button>
        )}

        {state === 'error' && (
          <Typography variant="caption" color="error" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
            {error}
          </Typography>
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
  const [mkSessionToken, setMkSessionToken] = useState('')
  const [states, setStates] = useState<CardState[]>(() => cards.map(() => 'idle'))
  const [errors, setErrors] = useState<string[]>(() => cards.map(() => ''))

  const resetAll = useCallback(() => {
    setAtendimentoId(null)
    setProtocolo('')
    setMkSessionToken('')
    setStates(cards.map(() => 'idle'))
    setErrors(cards.map(() => ''))
  }, [cards.length])  // eslint-disable-line react-hooks/exhaustive-deps

  const setCardState = (i: number, s: CardState) =>
    setStates((prev) => { const n = [...prev]; n[i] = s; return n })

  const setCardError = (i: number, msg: string) =>
    setErrors((prev) => { const n = [...prev]; n[i] = msg; return n })

  const handleSendFirst = useCallback(async () => {
    setCardState(0, 'loading')
    setCardError(0, '')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      const res = await fn({
        action: 'criar_protocolo',
        slug,
        cpf: cpf.replace(/\D/g, ''),
        processoId,
        classificacaoId,
        info: cards[0],
        // sem comentarios — cada card envia o seu próprio
      })
      const data = res.data as MkCriarProtocoloResult
      setAtendimentoId(data.atendimentoId ?? null)
      setProtocolo(data.protocolo ?? '')
      setMkSessionToken(data.sessionToken ?? '')
      setCardState(0, 'ok')
    } catch (e) {
      setCardError(0, e instanceof Error ? e.message : String(e))
      setCardState(0, 'error')
    }
  }, [slug, cpf, processoId, classificacaoId, cards])

  const handleSendComment = useCallback(async (index: number) => {
    if (!atendimentoId || !mkSessionToken) return
    setCardState(index, 'loading')
    setCardError(index, '')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      await fn({
        action: 'inserir_comentario',
        atendimentoId,
        comentario: cards[index],
        sessionToken: mkSessionToken,
      })
      setCardState(index, 'ok')
    } catch (e) {
      setCardError(index, e instanceof Error ? e.message : String(e))
      setCardState(index, 'error')
    }
  }, [atendimentoId, mkSessionToken, cards])

  const allDone = states.every((s) => s === 'ok')
  const anyStarted = states.some((s) => s !== 'idle')

  return (
    <Stack spacing={1.5} sx={{ flex: 1, overflow: 'auto', minHeight: { xs: 220, md: 280 }, pr: 0.5 }}>
      {/* linha de controle no topo */}
      {anyStarted && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {allDone ? (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
              Todos os registros enviados ao MK ✓
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Envie cada card na ordem — o próximo é desbloqueado após o anterior.
            </Typography>
          )}
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
        const prevOk = i === 0 || states[i - 1] === 'ok'
        const enabled = !disabled && (isFirst ? true : prevOk && states[0] === 'ok')

        return (
          <CardItem
            key={i}
            index={i}
            total={total}
            text={text}
            state={states[i]}
            error={errors[i]}
            enabled={enabled}
            protocolo={protocolo}
            atendimentoId={atendimentoId ?? undefined}
            onSend={isFirst ? () => void handleSendFirst() : () => void handleSendComment(i)}
          />
        )
      })}
    </Stack>
  )
}
