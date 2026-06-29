import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
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
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from '../lib/firebase'

type CardState = 'idle' | 'loading' | 'ok' | 'error'
type ActiveTab = 'protocolo' | 'os' | 'agenda' | 'extra'

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
  onProtocoloGerado?: (protocolo: string) => void
  tipoOS?: number
  grupoServico?: number
  tecnicoId?: number
  osTexto?: string
  osDescricao?: string
  osIndicacoes?: string
  agendaTexto?: string
  avisoCard?: string
  avisoObservacao?: string
  extraTab?: { label: string; content: string }
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
        transition: 'border-color 0.2s',
        overflow: 'hidden',
      }}
    >
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
  onProtocoloGerado,
  tipoOS,
  grupoServico,
  tecnicoId,
  osTexto,
  osDescricao,
  osIndicacoes,
  agendaTexto,
  avisoCard,
  avisoObservacao,
  extraTab,
}: Props) {
  const theme = useTheme()
  const cards = [segmentos.info, ...segmentos.comentarios]
  const total = cards.length
  const pendingCodes = processoId === 0 || classificacaoId === 0

  const hasOs = !!osTexto || tipoOS !== undefined
  const hasAgenda = !!agendaTexto
  const hasExtra = !!extraTab

  // ---- tabs / paginação ----
  const [activeTab, setActiveTab] = useState<ActiveTab>('protocolo')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---- conexão ----
  const [buscaState, setBuscaState] = useState<CardState>('idle')
  const [buscaError, setBuscaError] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteCodigo, setClienteCodigo] = useState<number | null>(null)
  const [conexoes, setConexoes] = useState<ConexaoOption[]>([])
  const [conexaoSelecionada, setConexaoSelecionada] = useState<number | ''>('')
  const [contratoSelecionado, setContratoSelecionado] = useState<number | null>(null)

  // ---- override de cadastro MK ----
  const [overrideVisible, setOverrideVisible] = useState(false)
  const [overrideInput, setOverrideInput] = useState('')
  const [overrideLoading, setOverrideLoading] = useState(false)
  const [overrideError, setOverrideError] = useState('')

  // ---- protocolo ----
  const [atendimentoId, setAtendimentoId] = useState<number | null>(null)
  const [protocolo, setProtocolo] = useState('')
  const [card0State, setCard0State] = useState<CardState>('idle')
  const [card0Error, setCard0Error] = useState('')

  // ---- comentários ----
  const [commentStates, setCommentStates] = useState<Record<number, CardState>>({})
  const [commentErrors, setCommentErrors] = useState<Record<number, string>>({})

  // ---- OS ----
  const [osState, setOsState] = useState<CardState>('idle')
  const [osError, setOsError] = useState('')
  const [osNumero, setOsNumero] = useState<number | null>(null)

  // ---- agenda copy snack ----
  const [agendaSnack, setAgendaSnack] = useState(false)

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [])

  const resetTabsAndPagination = useCallback(() => {
    setActiveTab('protocolo')
    setCurrentCardIndex(0)
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
  }, [])

  useEffect(() => {
    setBuscaState('idle')
    setBuscaError('')
    setClienteNome('')
    setClienteCodigo(null)
    setConexoes([])
    setConexaoSelecionada('')
    setContratoSelecionado(null)
    setAtendimentoId(null)
    setProtocolo('')
    setCard0State('idle')
    setCard0Error('')
    setCommentStates({})
    setCommentErrors({})
    setOsState('idle')
    setOsError('')
    setOsNumero(null)
    setOverrideVisible(false)
    setOverrideInput('')
    setOverrideLoading(false)
    setOverrideError('')
    resetTabsAndPagination()
  }, [cpf, resetTabsAndPagination])

  const resetAll = useCallback(() => {
    setBuscaState('idle')
    setBuscaError('')
    setClienteNome('')
    setClienteCodigo(null)
    setConexoes([])
    setConexaoSelecionada('')
    setContratoSelecionado(null)
    setAtendimentoId(null)
    setProtocolo('')
    setCard0State('idle')
    setCard0Error('')
    setCommentStates({})
    setCommentErrors({})
    setOsState('idle')
    setOsError('')
    setOsNumero(null)
    setOverrideVisible(false)
    setOverrideInput('')
    setOverrideLoading(false)
    setOverrideError('')
    resetTabsAndPagination()
  }, [resetTabsAndPagination])

  const handleBuscarConexao = useCallback(async () => {
    setBuscaState('loading')
    setBuscaError('')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      const res = await fn({ action: 'buscar_conexao', cpf: cpf.replace(/\D/g, '') })
      const data = res.data as MkBuscarConexaoResult
      setClienteNome(data.clienteNome ?? '')
      setClienteCodigo(data.clienteCodigo ?? null)
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

  const handleBuscarPorCodigo = useCallback(async () => {
    const codigo = parseInt(overrideInput.replace(/\D/g, ''), 10)
    if (!codigo) return
    setOverrideLoading(true)
    setOverrideError('')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      const res = await fn({ action: 'buscar_conexao', cpf: cpf.replace(/\D/g, ''), clienteCodigo: codigo })
      const data = res.data as MkBuscarConexaoResult
      setClienteNome(data.clienteNome ?? `Cadastro MK #${codigo}`)
      setClienteCodigo(data.clienteCodigo ?? codigo)
      const lista = data.conexoes ?? []
      setConexoes(lista)
      if (lista.length === 1) {
        setConexaoSelecionada(lista[0].codigo)
        setContratoSelecionado(lista[0].contrato)
      } else {
        setConexaoSelecionada('')
        setContratoSelecionado(null)
      }
      setOverrideVisible(false)
      setOverrideInput('')
    } catch (e) {
      setOverrideError(e instanceof Error ? e.message : String(e))
    } finally {
      setOverrideLoading(false)
    }
  }, [cpf, overrideInput])

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
        clienteCodigo: clienteCodigo || undefined,
      })
      const data = res.data as MkCriarProtocoloResult
      setAtendimentoId(data.atendimentoId ?? null)
      setProtocolo(data.protocolo ?? '')
      if (data.protocolo) onProtocoloGerado?.(data.protocolo)
      setCard0State('ok')
      if (total > 1) {
        autoAdvanceTimer.current = setTimeout(() => setCurrentCardIndex(1), 600)
      }
    } catch (e) {
      setCard0Error(e instanceof Error ? e.message : String(e))
      setCard0State('error')
    }
  }, [slug, cpf, processoId, classificacaoId, cards, conexaoSelecionada, contratoSelecionado, clienteCodigo, total])

  const handleCriarOS = useCallback(async () => {
    if (!atendimentoId || !clienteCodigo) return
    setOsState('loading')
    setOsError('')
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      const res = await fn({
        action: 'criar_os_vinculada',
        slug,
        atendimentoId,
        codigoCliente: clienteCodigo,
        descricaoProblema: osDescricao ?? osTexto ?? cards[0],
        indicacoes: osIndicacoes,
        tipoOS,
        grupoServico,
        tecnicoId,
      })
      const data = res.data as { osNumero?: number }
      setOsNumero(data.osNumero ?? null)
      setOsState('ok')
    } catch (e) {
      setOsError(e instanceof Error ? e.message : String(e))
      setOsState('error')
    }
  }, [atendimentoId, clienteCodigo, slug, osDescricao, osTexto, osIndicacoes, cards, tipoOS, grupoServico, tecnicoId])

  const handleSendComment = useCallback(async (index: number, text: string) => {
    if (!atendimentoId) return
    setCommentStates(prev => ({ ...prev, [index]: 'loading' }))
    setCommentErrors(prev => ({ ...prev, [index]: '' }))
    try {
      const fn = httpsCallable(getFirebaseFunctions(), 'mkSuporte')
      await fn({ action: 'inserir_comentario', atendimentoId, comentario: text, tipo: 1 })
      setCommentStates(prev => ({ ...prev, [index]: 'ok' }))
      if (index < total - 1) {
        autoAdvanceTimer.current = setTimeout(() => setCurrentCardIndex(index + 1), 600)
      } else if (hasOs) {
        autoAdvanceTimer.current = setTimeout(() => setActiveTab('os'), 800)
      }
    } catch (e) {
      setCommentErrors(prev => ({ ...prev, [index]: e instanceof Error ? e.message : String(e) }))
      setCommentStates(prev => ({ ...prev, [index]: 'error' }))
    }
  }, [atendimentoId, total, hasOs])

  const card0Done = card0State === 'ok'
  const anyStarted = card0State !== 'idle'
  const conexaoOk = buscaState === 'ok' && (conexoes.length === 0 || conexaoSelecionada !== '')

  const sentCount =
    (card0State === 'ok' ? 1 : 0) +
    Object.values(commentStates).filter(s => s === 'ok').length
  const progress = total > 0 ? (sentCount / total) * 100 : 0

  // Estado e onSend para o card atual
  const i = currentCardIndex
  const currentCardState: CardState = i === 0 ? card0State : (commentStates[i] ?? 'idle')
  const currentCardError = i === 0 ? card0Error : (commentErrors[i] ?? '')
  const prevDone = i === 0
    ? true
    : i === 1
      ? card0State === 'ok'
      : (commentStates[i - 1] ?? 'idle') === 'ok'
  const currentCardEnabled = i === 0
    ? !disabled && conexaoOk && !pendingCodes
    : !disabled && prevDone
  const currentCardOnSend = i === 0
    ? () => void handleSendFirst()
    : prevDone ? () => void handleSendComment(i, cards[i]) : undefined

  return (
    <Stack spacing={1.5}>
      {pendingCodes && (
        <Alert severity="warning" icon={false} sx={{ py: 0.5, px: 1.5, borderRadius: 1.5, fontSize: 12 }}>
          <strong>Integração pendente</strong> — aguardando o admin MK fornecer os códigos de processo e classificação para esta categoria.
          Os textos abaixo estão disponíveis para cópia manual.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Tabs */}
        <Tabs
          value={activeTab as string}
          onChange={(_, v) => setActiveTab(v as ActiveTab)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: 40,
            px: 1,
            '& .MuiTabs-indicator': { height: 2 },
          }}
        >
          <Tab
            value="protocolo"
            label="Protocolo"
            sx={{ minHeight: 40, fontSize: 12, fontWeight: 600, py: 0.5 }}
          />
          {hasOs && (
            <Tab
              value="os"
              label="O.S."
              sx={{ minHeight: 40, fontSize: 12, py: 0.5 }}
            />
          )}
          {hasAgenda && (
            <Tab
              value="agenda"
              label="Agenda"
              sx={{ minHeight: 40, fontSize: 12, py: 0.5 }}
            />
          )}
          {hasExtra && (
            <Tab
              value="extra"
              label={extraTab!.label}
              sx={{ minHeight: 40, fontSize: 12, py: 0.5 }}
            />
          )}
        </Tabs>

        <Box sx={{ p: 1.5 }}>

          {/* ── PROTOCOLO ── */}
          {activeTab === 'protocolo' && (
            <Stack spacing={1.5}>

              {/* Painel busca cliente */}
              {!card0Done && (
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
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
                                <MenuItem value="" disabled><em>Selecione a conexão</em></MenuItem>
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

                          {!overrideVisible ? (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => setOverrideVisible(true)}
                              sx={{ fontSize: 10, py: 0, px: 0.5, mt: 0.25, color: 'warning.main', minWidth: 0, textTransform: 'none' }}
                            >
                              Outro cadastro MK?
                            </Button>
                          ) : (
                            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                Código MK conforme Pessoas ou Empresas:
                              </Typography>
                              <TextField
                                size="small"
                                placeholder="Ex: 18195"
                                value={overrideInput}
                                onChange={(e) => setOverrideInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') void handleBuscarPorCodigo() }}
                                disabled={overrideLoading}
                                sx={{ width: 100, '& .MuiInputBase-input': { py: 0.4, px: 1, fontSize: 12 } }}
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => void handleBuscarPorCodigo()}
                                disabled={overrideLoading || !overrideInput.trim()}
                                sx={{ fontSize: 11, py: 0.3, px: 1, minWidth: 0 }}
                              >
                                {overrideLoading ? <CircularProgress size={10} /> : 'Buscar'}
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => { setOverrideVisible(false); setOverrideInput(''); setOverrideError('') }}
                                sx={{ fontSize: 10, py: 0.3, px: 0.5, color: 'text.disabled', minWidth: 0, textTransform: 'none' }}
                              >
                                Cancelar
                              </Button>
                              {overrideError && (
                                <Typography variant="caption" color="error" sx={{ width: '100%' }}>
                                  {overrideError}
                                </Typography>
                              )}
                            </Box>
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

              {!anyStarted && disabled && (
                <Alert severity="warning" icon={false} sx={{ py: 0.5, px: 1.5, borderRadius: 1.5, fontSize: 12 }}>
                  Preencha todos os campos antes de registrar no MK.
                </Alert>
              )}

              {/* Card atual com setas nos lados */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentCardIndex === 0}
                  sx={{ flexShrink: 0 }}
                >
                  <ArrowBackRoundedIcon fontSize="small" />
                </IconButton>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <CardItem
                    index={i}
                    total={total}
                    text={cards[i]}
                    state={currentCardState}
                    error={currentCardError}
                    enabled={currentCardEnabled}
                    protocolo={protocolo}
                    atendimentoId={atendimentoId ?? undefined}
                    onSend={currentCardOnSend}
                  />
                </Box>

                <IconButton
                  size="small"
                  onClick={() => setCurrentCardIndex(prev => Math.min(total - 1, prev + 1))}
                  disabled={currentCardIndex === total - 1}
                  sx={{ flexShrink: 0 }}
                >
                  <ArrowForwardRoundedIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Barra de progresso */}
              <Box sx={{ px: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ borderRadius: 4, height: 5 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {sentCount} de {total} enviados
                  </Typography>
                  {anyStarted && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<RefreshRoundedIcon sx={{ fontSize: 13 }} />}
                      onClick={resetAll}
                      sx={{ fontSize: 11, py: 0, minHeight: 0 }}
                    >
                      Reiniciar
                    </Button>
                  )}
                </Box>
              </Box>

              {avisoCard && (
                <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'warning.main', overflow: 'hidden' }}>
                  <Box sx={{ px: 2, pt: 1.25, pb: 0.75, bgcolor: alpha(theme.palette.warning.main, 0.06), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Aviso ao operador — não enviar ao MK
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ px: 2, py: 1.25 }}>
                    <Box component="pre" sx={{ m: 0, fontSize: 12.5, fontFamily: theme.typography.fontFamily, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.55, color: 'text.primary' }}>
                      {avisoCard}
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ px: 1.5, py: 0.75, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                    <Tooltip title="Copiar texto">
                      <IconButton size="small" onClick={() => void navigator.clipboard.writeText(avisoCard)}>
                        <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              )}

              {avisoObservacao && (
                <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'warning.main', overflow: 'hidden' }}>
                  <Box sx={{ px: 2, pt: 1.25, pb: 0.75, bgcolor: alpha(theme.palette.warning.main, 0.06) }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Inserir em Pessoas/Empresas e Técnico &gt; Editar &gt; Observações
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ px: 2, py: 1.25 }}>
                    <Box component="pre" sx={{ m: 0, fontSize: 12.5, fontFamily: theme.typography.fontFamily, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.55, color: 'text.primary' }}>
                      {avisoObservacao}
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 1, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                    <Tooltip title="Copiar texto">
                      <IconButton size="small" onClick={() => void navigator.clipboard.writeText(avisoObservacao)}>
                        <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      ou copie e insira manualmente nos dois locais
                    </Typography>
                  </Box>
                </Paper>
              )}

            </Stack>
          )}

          {/* ── O.S. ── */}
          {activeTab === 'os' && hasOs && (
            <Stack spacing={1.5}>
              {osTexto && (
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
                  {osTexto}
                </Box>
              )}

              {tipoOS !== undefined && !card0Done && (
                <Alert severity="info" icon={false} sx={{ py: 0.5, px: 1.5, borderRadius: 1.5, fontSize: 12 }}>
                  Abra o atendimento na aba <strong>Protocolo</strong> para habilitar a criação da O.S.
                </Alert>
              )}

              {tipoOS !== undefined && card0Done && (
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
                    borderColor: osState === 'ok' ? 'success.main' : osState === 'error' ? 'error.main' : 'primary.light',
                    transition: 'border-color 0.2s',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{
                    px: 2, pt: 1.25, pb: 0.75,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    bgcolor: osState === 'ok' ? alpha(theme.palette.success.main, 0.06) : alpha(theme.palette.background.default, 0.5),
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Criar O.S. de Manutenção
                    </Typography>
                    {osState === 'ok' && osNumero && (
                      <Chip
                        size="small"
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: 12, '&&': { ml: '6px' } }} />}
                        label={`O.S. #${osNumero}`}
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: 11, height: 22 }}
                      />
                    )}
                  </Box>
                  <Divider />
                  <Box sx={{ px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 1, bgcolor: alpha(theme.palette.background.default, 0.4), flexWrap: 'wrap' }}>
                    {osState === 'ok' ? (
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                        O.S. #{osNumero} criada com sucesso
                      </Typography>
                    ) : (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          disableElevation
                          startIcon={osState === 'loading' ? <CircularProgress size={12} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => void handleCriarOS()}
                          disabled={osState === 'loading'}
                          sx={{ fontSize: 12, py: 0.35, px: 1.25, lineHeight: 1.4 }}
                        >
                          {osState === 'loading' ? 'Criando…' : 'Criar O.S. no MK'}
                        </Button>
                        {osState === 'error' && (
                          <Typography variant="caption" color="error" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                            {osError}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                </Paper>
              )}
            </Stack>
          )}

          {/* ── EXTRA (ex: Termo para o cliente) ── */}
          {activeTab === 'extra' && hasExtra && (
            <Stack spacing={1}>
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
                {extraTab!.content}
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 13 }} />}
                onClick={() => {
                  void navigator.clipboard.writeText(extraTab!.content)
                }}
                sx={{ fontSize: 12, alignSelf: 'flex-start' }}
              >
                Copiar texto
              </Button>
            </Stack>
          )}

          {/* ── AGENDA ── */}
          {activeTab === 'agenda' && hasAgenda && (
            <Stack spacing={1}>
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
                {agendaTexto}
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 13 }} />}
                onClick={() => {
                  void navigator.clipboard.writeText(agendaTexto ?? '')
                  setAgendaSnack(true)
                }}
                sx={{ fontSize: 12, alignSelf: 'flex-start' }}
              >
                Copiar texto da agenda
              </Button>
              <Snackbar
                open={agendaSnack}
                autoHideDuration={1800}
                onClose={() => setAgendaSnack(false)}
                message="Texto da agenda copiado"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              />
            </Stack>
          )}

        </Box>
      </Paper>
    </Stack>
  )
}
