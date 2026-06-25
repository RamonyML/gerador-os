// Versão temporária — Card 0 abre o atendimento; cards de comentário são copy-only.
// Versão sequencial completa (com WSMKAtendimentoComentario) preservada em MkProtocolCards.sequential.tsx
import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
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
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded'
import CommentRoundedIcon from '@mui/icons-material/CommentRounded'
import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from '../lib/firebase'

type CardState = 'idle' | 'loading' | 'ok' | 'error'

type ConexaoOption = { codigo: number; contrato: number; username: string; tecnologia: string; bloqueada: string }

type MkCriarProtocoloResult = {
  protocolo?: string
  atendimentoId?: number
  sessionToken?: string
}

type MkBuscarConexaoResult = {
  clienteNome?: string
  clienteCodigo?: number
  conexoes?: ConexaoOption[]
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
        {state === 'ok' && !isFirst && (
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
        ) : state === 'ok' ? null : (
          <>
            <Button
              size="small"
              variant={onSend ? 'outlined' : 'text'}
              color="primary"
              disableElevation
              startIcon={
                state === 'loading'
                  ? <CircularProgress size={12} color="inherit" />
                  : <CommentRoundedIcon sx={{ fontSize: 14 }} />
              }
              onClick={onSend}
              disabled={!enabled || state === 'loading' || !onSend}
              sx={{ fontSize: 12, py: 0.35, px: 1.25, lineHeight: 1.4 }}
            >
              {state === 'loading' ? 'Inserindo…' : 'Inserir no MK'}
            </Button>
            {state === 'error' && (
              <Typography variant="caption" color="error" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                {error}
              </Typography>
            )}
            {enabled && state === 'idle' && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                ou copie e insira manualmente
              </Typography>
            )}
          </>
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

  // ---- conexão ----
  const [buscaState, setBuscaState] = useState<CardState>('idle')
  const [buscaError, setBuscaError] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [conexoes, setConexoes] = useState<ConexaoOption[]>([])
  const [conexaoSelecionada, setConexaoSelecionada] = useState<number | ''>('')
  const [contratoSelecionado, setContratoSelecionado] = useState<number | null>(null)

  // ---- protocolo ----
  const [atendimentoId, setAtendimentoId] = useState<number | null>(null)
  const [protocolo, setProtocolo] = useState('')
  const [card0State, setCard0State] = useState<CardState>('idle')
  const [card0Error, setCard0Error] = useState('')

  // ---- comentários ----
  const [commentStates, setCommentStates] = useState<Record<number, CardState>>({})
  const [commentErrors, setCommentErrors] = useState<Record<number, string>>({})

  // Resetar quando CPF muda
  useEffect(() => {
    setBuscaState('idle')
    setBuscaError('')
    setClienteNome('')
    setConexoes([])
    setConexaoSelecionada('')
    setContratoSelecionado(null)
    setAtendimentoId(null)
    setProtocolo('')
    setCard0State('idle')
    setCard0Error('')
    setCommentStates({})
    setCommentErrors({})
  }, [cpf])

  const resetAll = useCallback(() => {
    setBuscaState('idle')
    setBuscaError('')
    setClienteNome('')
    setConexoes([])
    setConexaoSelecionada('')
    setContratoSelecionado(null)
    setAtendimentoId(null)
    setProtocolo('')
    setCard0State('idle')
    setCard0Error('')
    setCommentStates({})
    setCommentErrors({})
  }, [])

  const handleBuscarConexao = useCallback(async () => {
    setBuscaState('loading')
    setBuscaError('')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      const res = await fn({ action: 'buscar_conexao', cpf: cpf.replace(/\D/g, '') })
      const data = res.data as MkBuscarConexaoResult
      setClienteNome(data.clienteNome ?? '')
      const lista = data.conexoes ?? []
      setConexoes(lista)
      if (lista.length === 1) {
        setConexaoSelecionada(lista[0].codigo)
        setContratoSelecionado(lista[0].contrato)
      }
      setBuscaState('ok')
    } catch (e) {
      setBuscaError(e instanceof Error ? e.message : String(e))
      setBuscaState('error')
    }
  }, [cpf])

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
        conexaoAssociada: conexaoSelecionada || undefined,
        contratoId: contratoSelecionado || undefined,
      })
      const data = res.data as MkCriarProtocoloResult
      setAtendimentoId(data.atendimentoId ?? null)
      setProtocolo(data.protocolo ?? '')
      setCard0State('ok')
    } catch (e) {
      setCard0Error(e instanceof Error ? e.message : String(e))
      setCard0State('error')
    }
  }, [slug, cpf, processoId, classificacaoId, cards, conexaoSelecionada, contratoSelecionado])

  const handleSendComment = useCallback(async (index: number, text: string) => {
    if (!atendimentoId) return
    setCommentStates(prev => ({ ...prev, [index]: 'loading' }))
    setCommentErrors(prev => ({ ...prev, [index]: '' }))
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      await fn({
        action: 'inserir_comentario',
        atendimentoId,
        comentario: text,
        tipo: index === 1 ? 1 : 2,  // 1º comentário privado, demais públicos
      })
      setCommentStates(prev => ({ ...prev, [index]: 'ok' }))
    } catch (e) {
      setCommentErrors(prev => ({ ...prev, [index]: e instanceof Error ? e.message : String(e) }))
      setCommentStates(prev => ({ ...prev, [index]: 'error' }))
    }
  }, [atendimentoId])

  const card0Done = card0State === 'ok'
  const anyStarted = card0State !== 'idle'
  const conexaoOk = buscaState === 'ok' && (conexoes.length === 0 || conexaoSelecionada !== '')

  return (
    <Stack spacing={1.5}>

      {/* Painel de busca de cliente + conexão */}
      {!card0Done && (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: buscaState === 'ok' ? 'success.main' : buscaState === 'error' ? 'error.main' : 'divider',
            overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}
        >
          <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>

            {buscaState !== 'ok' ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={buscaState === 'loading'
                    ? <CircularProgress size={12} color="inherit" />
                    : <PersonSearchRoundedIcon sx={{ fontSize: 15 }} />
                  }
                  onClick={() => void handleBuscarConexao()}
                  disabled={disabled || buscaState === 'loading'}
                  sx={{ fontSize: 12, py: 0.4, px: 1.25 }}
                >
                  {buscaState === 'loading' ? 'Buscando…' : 'Buscar cliente'}
                </Button>
                {buscaState === 'error' && (
                  <Typography variant="caption" color="error" sx={{ flex: 1, wordBreak: 'break-word' }}>
                    {buscaError}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block' }}>
                    {clienteNome}
                  </Typography>

                  {conexoes.length > 1 && (
                    <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        Conexão:
                      </Typography>
                      <Select
                        size="small"
                        value={conexaoSelecionada}
                        onChange={(e) => {
                          const cod = Number(e.target.value)
                          setConexaoSelecionada(cod)
                          setContratoSelecionado(conexoes.find(c => c.codigo === cod)?.contrato ?? null)
                        }}
                        displayEmpty
                        sx={{ fontSize: 12, minWidth: 200, height: 28 }}
                      >
                        <MenuItem value="" disabled>
                          <em>Selecione a conexão</em>
                        </MenuItem>
                        {conexoes.map((c) => (
                          <MenuItem key={c.codigo} value={c.codigo}>
                            {c.username} — {c.tecnologia}
                            {c.bloqueada === 'Sim' ? ' ⚠ bloqueada' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  )}

                  {conexoes.length === 1 && (
                    <Typography variant="caption" color="text.secondary">
                      Conexão: {conexoes[0].username} — {conexoes[0].tecnologia}
                      {conexoes[0].bloqueada === 'Sim' ? ' ⚠ bloqueada' : ''}
                    </Typography>
                  )}

                  {conexoes.length === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Nenhuma conexão encontrada — prosseguindo sem vincular
                    </Typography>
                  )}
                </Box>

                <Button
                  size="small"
                  color="inherit"
                  startIcon={<RefreshRoundedIcon sx={{ fontSize: 13 }} />}
                  onClick={resetAll}
                  sx={{ fontSize: 11, py: 0.25 }}
                >
                  Trocar
                </Button>
              </>
            )}
          </Box>
        </Paper>
      )}

      {anyStarted && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color={card0Done ? 'success.main' : 'text.secondary'} sx={{ fontWeight: card0Done ? 600 : 400 }}>
            {card0Done
              ? `Atendimento #${atendimentoId} registrado — insira os comentários abaixo no MK.`
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
        const enabled = !disabled && conexaoOk && (isFirst || card0Done)
        const cardState = isFirst ? card0State : (commentStates[i] ?? 'idle')
        const cardError = isFirst ? card0Error : (commentErrors[i] ?? '')
        const onSend = isFirst
          ? () => void handleSendFirst()
          : card0Done ? () => void handleSendComment(i, text) : undefined

        return (
          <CardItem
            key={i}
            index={i}
            total={total}
            text={text}
            state={cardState}
            error={cardError}
            enabled={enabled}
            protocolo={protocolo}
            atendimentoId={atendimentoId ?? undefined}
            onSend={onSend}
          />
        )
      })}
    </Stack>
  )
}
