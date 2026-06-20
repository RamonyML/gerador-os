import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ReplayIcon from '@mui/icons-material/Replay'
import { listarMudancasEndereco, validarMudanca, marcarRetornar } from '../lib/validacaoFirestore'
import {
  getStatusAgendamento,
  STATUS_AGENDAMENTO_COLOR,
  STATUS_VALIDACAO_COLOR,
  getChecklistProgress,
} from '../types/validacao'
import type { MudancaEndereco, StatusAgendamento } from '../types/validacao'
import { useAuth } from '../contexts/AuthContext'
import { canCreateMudancaEndereco } from '../lib/permissions'
import { HeroIllustration } from '../components/HeroIllustration'
import { ILLUSTRATIONS } from '../data/illustrations'
import { Reveal } from '../components/Reveal'

const ORDER: StatusAgendamento[] = ['VALIDAR HOJE', 'EM EXECUÇÃO', 'VALIDAR DEPOIS', 'EXECUTADA']

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  'VALIDAR HOJE': 'Validar hoje',
  'EM EXECUÇÃO': 'Em execução',
  'VALIDAR DEPOIS': 'Validar depois',
  EXECUTADA: 'Executada',
}

const BORDER_COLOR: Record<StatusAgendamento, string> = {
  'VALIDAR HOJE': 'warning.main',
  'EM EXECUÇÃO': 'info.main',
  'VALIDAR DEPOIS': 'divider',
  EXECUTADA: 'success.main',
}

function extractRua(novoEndereco: string): string {
  const line = novoEndereco.split('\n')[0] ?? novoEndereco
  return line.replace(/^ENDERE[^\s:]*\s*NOVO\s*:\s*/i, '').trim()
}

function ordenar(lista: MudancaEndereco[]): MudancaEndereco[] {
  return [...lista].sort((a, b) => {
    const ia = ORDER.indexOf(getStatusAgendamento(a.dataMudanca.toDate()))
    const ib = ORDER.indexOf(getStatusAgendamento(b.dataMudanca.toDate()))
    if (ia !== ib) return ia - ib
    return a.dataMudanca.toMillis() - b.dataMudanca.toMillis()
  })
}

export function ValidacaoPage() {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [mudancas, setMudancas] = useState<MudancaEndereco[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())
  const podeCadastrar = profile != null && canCreateMudancaEndereco(profile)

  async function carregar() {
    setLoading(true)
    try {
      const lista = await listarMudancasEndereco()
      setMudancas(ordenar(lista))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function setLoadingId(id: string, on: boolean) {
    setActionLoading((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function handleAprovar(m: MudancaEndereco) {
    if (!user || !profile) return
    setLoadingId(m.id, true)
    try {
      await validarMudanca(
        m.id,
        profile.displayName ?? user.email ?? '',
        user.uid,
        m.observacoes ?? '',
        m.checklist ?? {}
      )
      setMudancas((prev) =>
        prev.map((x) =>
          x.id === m.id
            ? { ...x, status: 'VALIDADO', validadoPor: profile.displayName ?? '' }
            : x
        )
      )
    } finally {
      setLoadingId(m.id, false)
    }
  }

  async function handleRetornar(m: MudancaEndereco) {
    setLoadingId(m.id, true)
    try {
      await marcarRetornar(m.id, m.observacoes ?? '', m.checklist ?? {})
      setMudancas((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, status: 'RETORNAR' } : x))
      )
    } finally {
      setLoadingId(m.id, false)
    }
  }

  const contagens: Record<StatusAgendamento, number> = {
    'VALIDAR HOJE': 0, 'EM EXECUÇÃO': 0, 'VALIDAR DEPOIS': 0, EXECUTADA: 0,
  }
  for (const m of mudancas) contagens[getStatusAgendamento(m.dataMudanca.toDate())]++

  const filtroStatus: StatusAgendamento | null = tab === 0 ? null : ORDER[tab - 1] ?? null
  const lista = filtroStatus
    ? mudancas.filter((m) => getStatusAgendamento(m.dataMudanca.toDate()) === filtroStatus)
    : mudancas

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Reveal>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            mb: 3,
            p: { xs: 2.5, md: 3 },
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            background:
              theme.palette.mode === 'light'
                ? `linear-gradient(135deg, ${alpha(primary, 0.12)} 0%, ${alpha(primary, 0.04)} 46%, transparent 100%)`
                : `linear-gradient(135deg, ${alpha(primary, 0.22)} 0%, ${alpha('#000', 0.12)} 50%, transparent 100%)`,
          }}
        >
          <Box sx={{ minWidth: 0, flex: '1 1 420px' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
              Validação — Mudança de Endereço
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Conferência das mudanças agendadas: endereço, financeiro, documentação e plano.
              Acesso restrito à equipe de validação.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              {ORDER.map((s) => (
                <Chip
                  key={s}
                  label={`${STATUS_LABEL[s]}: ${contagens[s]}`}
                  color={STATUS_AGENDAMENTO_COLOR[s] as any}
                  size="small"
                  variant={s === 'VALIDAR HOJE' || s === 'EM EXECUÇÃO' ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
              <Tooltip title="Atualizar">
                <IconButton onClick={carregar} disabled={loading} size="small">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {podeCadastrar && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/validacao/nova')}
                >
                  Nova
                </Button>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: 260, md: 320 },
              flexShrink: 0,
              ml: { md: 2 },
              filter:
                theme.palette.mode === 'dark'
                  ? `drop-shadow(0 10px 30px ${alpha('#000', 0.35)})`
                  : undefined,
            }}
          >
            <HeroIllustration src={ILLUSTRATIONS.mudend} alt="Mudança de endereço" />
          </Box>
        </Box>
      </Reveal>

      <Reveal delay={80}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label={`Todos (${mudancas.length})`} />
            {ORDER.map((s) => (
              <Tab key={s} label={`${STATUS_LABEL[s]} (${contagens[s]})`} />
            ))}
          </Tabs>
        </Box>

        {loading && (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Carregando...
          </Typography>
        )}

        {!loading && lista.length === 0 && (
          <Paper
            variant="outlined"
            sx={{ p: 5, textAlign: 'center', borderRadius: 3, borderStyle: 'dashed' }}
          >
            <Typography color="text.secondary">Nenhum registro nesta categoria.</Typography>
          </Paper>
        )}

        <Stack spacing={1.5}>
          {lista.map((m) => {
            const statusAg = getStatusAgendamento(m.dataMudanca.toDate())
            const dataStr = m.dataMudanca.toDate().toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
            })
            const rua = extractRua(m.novoEndereco)
            const { marcados, total, pct } = getChecklistProgress(m.tipoMudanca, m.checklist)
            const isActing = actionLoading.has(m.id)
            const pendente = m.status !== 'VALIDADO'

            return (
              <Paper
                key={m.id}
                variant="outlined"
                onClick={() => navigate(`/validacao/${m.id}`)}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2.5,
                  cursor: 'pointer',
                  borderLeft: 4,
                  borderColor: BORDER_COLOR[statusAg],
                  transition: 'background 0.15s, box-shadow 0.15s',
                  '&:hover': { bgcolor: alpha(primary, 0.04), boxShadow: 2 },
                }}
              >
                {/* Cabeçalho */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {m.nomeCliente}
                      </Typography>
                      <Chip
                        label={m.tipoMudanca === 'MUD END + ALT PLAN' ? 'ALT. PLANO' : 'MUD END'}
                        size="small"
                        variant="outlined"
                        color={m.tipoMudanca === 'MUD END + ALT PLAN' ? 'secondary' : 'default'}
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {dataStr} · {m.horaMudanca} · {m.atendente}
                    </Typography>
                    {rua && (
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: 'block', mt: 0.25 }}
                        noWrap
                      >
                        {rua}
                      </Typography>
                    )}
                  </Box>

                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ flexShrink: 0, alignItems: 'center', mt: { xs: 0.5, sm: 0 } }}
                  >
                    <Chip label={m.status} color={STATUS_VALIDACAO_COLOR[m.status]} size="small" />
                    <Chip
                      label={STATUS_LABEL[statusAg]}
                      color={STATUS_AGENDAMENTO_COLOR[statusAg] as any}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>

                {/* Progress bar + ações inline */}
                {pendente && (
                  <Box sx={{ mt: 1.5 }} onClick={(e) => e.stopPropagation()}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}
                    >
                      <Typography
                        variant="caption"
                        color={pct === 100 ? 'success.main' : 'text.secondary'}
                      >
                        {pct === 100 ? `✓ ${marcados}/${total} conferências` : `${marcados}/${total} conferências`}
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      color={pct === 100 ? 'success' : 'primary'}
                      sx={{ borderRadius: 1, height: 5 }}
                    />

                    <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                      {pct === 100 ? (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutlinedIcon fontSize="small" />}
                            disabled={isActing}
                            onClick={() => handleAprovar(m)}
                            sx={{ minWidth: 100 }}
                          >
                            {isActing ? '...' : 'Aprovar'}
                          </Button>
                          {m.status === 'PENDENTE' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              startIcon={<ReplayIcon fontSize="small" />}
                              disabled={isActing}
                              onClick={() => handleRetornar(m)}
                            >
                              Retornar
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={() => navigate(`/validacao/${m.id}`)}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Completar checklist →
                        </Button>
                      )}
                    </Stack>
                  </Box>
                )}
              </Paper>
            )
          })}
        </Stack>
      </Reveal>
    </Container>
  )
}
