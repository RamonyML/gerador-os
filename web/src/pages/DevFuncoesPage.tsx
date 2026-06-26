import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded'
import StorageRoundedIcon from '@mui/icons-material/StorageRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import { httpsCallable } from 'firebase/functions'
import { AppPageChrome } from '../components/AppPageChrome'
import { getFirebaseFunctions } from '../lib/firebase'

const REGION = 'southamerica-east1'
const PROJECT_ID = 'gerador-de-os-3ba02'
const CONSOLE_BASE = `https://console.firebase.google.com/project/${PROJECT_ID}/functions`

type PingState = 'idle' | 'loading' | 'ok' | 'error'

type FunctionMeta = {
  id: string
  name: string
  description: string
  trigger: 'callable' | 'firestore' | 'auth'
  icon: React.ReactNode
  pingAction?: string
  tags?: string[]
}

const FUNCTIONS: FunctionMeta[] = [
  {
    id: 'mkSuporte',
    name: 'mkSuporte',
    description: 'Integração com MK Solutions: autenticação, busca de cliente/conexão, abertura de protocolo e O.S.',
    trigger: 'callable',
    icon: <FlashOnRoundedIcon />,
    pingAction: 'testar_auth',
    tags: ['MK', 'protocolo', 'O.S.'],
  },
  {
    id: 'manageUsersList',
    name: 'manageUsersList',
    description: 'Lista todos os usuários do Firebase Auth com seus metadados de perfil (setor, cargo, permissões).',
    trigger: 'callable',
    icon: <PeopleRoundedIcon />,
    tags: ['usuários', 'admin'],
  },
  {
    id: 'manageUsersCreate',
    name: 'manageUsersCreate',
    description: 'Cria novo usuário no Firebase Auth e salva o perfil no Firestore.',
    trigger: 'callable',
    icon: <PeopleRoundedIcon />,
    tags: ['usuários', 'admin'],
  },
  {
    id: 'manageUsersUpdate',
    name: 'manageUsersUpdate',
    description: 'Atualiza dados de um usuário existente (e-mail, nome, setor, permissões).',
    trigger: 'callable',
    icon: <PeopleRoundedIcon />,
    tags: ['usuários', 'admin'],
  },
  {
    id: 'sectorRoster',
    name: 'sectorRoster',
    description: 'Retorna a lista de membros do setor do usuário autenticado. Usado pelo chat para exibir contatos.',
    trigger: 'callable',
    icon: <StorageRoundedIcon />,
    tags: ['chat', 'setor'],
  },
  {
    id: 'noticeReadOnCreate',
    name: 'noticeReadOnCreate',
    description: 'Dispara automaticamente quando um aviso é criado no Firestore e registra leituras pendentes para cada usuário.',
    trigger: 'firestore',
    icon: <NotificationsRoundedIcon />,
    tags: ['avisos', 'trigger'],
  },
]

function fmt(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}

type CardState = { state: PingState; durationMs: number | null; error: string }
const INIT_CARD: CardState = { state: 'idle', durationMs: null, error: '' }

function FunctionCard({ fn }: { fn: FunctionMeta }) {
  const theme = useTheme()
  const [ping, setPing] = useState<CardState>(INIT_CARD)

  const runPing = async () => {
    if (!fn.pingAction) return
    setPing({ state: 'loading', durationMs: null, error: '' })
    const start = Date.now()
    try {
      const callable = httpsCallable(getFirebaseFunctions(), fn.id)
      await callable({ action: fn.pingAction })
      setPing({ state: 'ok', durationMs: Date.now() - start, error: '' })
    } catch (e) {
      setPing({
        state: 'error',
        durationMs: Date.now() - start,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  const { state, durationMs, error } = ping
  const isLoading = state === 'loading'
  const isOk = state === 'ok'
  const isError = state === 'error'

  const statusColor = isOk
    ? theme.palette.success.main
    : isError
      ? theme.palette.error.main
      : theme.palette.text.disabled

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.25s',
        borderColor: isOk
          ? alpha(theme.palette.success.main, 0.5)
          : isError
            ? alpha(theme.palette.error.main, 0.4)
            : 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {fn.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}
            >
              {fn.name}
            </Typography>
            <Chip
              size="small"
              label={fn.trigger === 'callable' ? 'HTTPS Callable' : fn.trigger === 'firestore' ? 'Firestore Trigger' : 'Auth Trigger'}
              variant="outlined"
              sx={{ fontSize: 10, height: 18, fontWeight: 600 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {REGION}
          </Typography>
        </Box>
        <Tooltip title="Ver logs no Firebase Console" placement="top">
          <Box
            component="a"
            href={CONSOLE_BASE}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
              '&:hover': { color: 'primary.main' },
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
          >
            <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Tooltip>
      </Box>

      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {fn.description}
        </Typography>
        {fn.tags && fn.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {fn.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ fontSize: 10, height: 18, bgcolor: 'action.hover' }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Ping result */}
      {(isOk || isError) && (
        <>
          <Divider />
          <Box
            sx={{
              px: 2.5,
              py: 1,
              bgcolor: isOk
                ? alpha(theme.palette.success.main, 0.05)
                : alpha(theme.palette.error.main, 0.05),
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.75,
            }}
          >
            {isOk ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 15, color: 'success.main', mt: 0.25 }} />
            ) : (
              <ErrorRoundedIcon sx={{ fontSize: 15, color: 'error.main', mt: 0.25 }} />
            )}
            <Typography variant="caption" sx={{ color: statusColor, lineHeight: 1.5, wordBreak: 'break-word' }}>
              {isOk
                ? `Resposta em ${fmt(durationMs!)}`
                : error}
            </Typography>
          </Box>
        </>
      )}

      {/* Footer */}
      {fn.trigger === 'callable' && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 1 }}>
            {fn.pingAction ? (
              <Button
                size="small"
                variant="outlined"
                color={isError ? 'error' : isOk ? 'success' : 'inherit'}
                startIcon={
                  isLoading
                    ? <CircularProgress size={12} color="inherit" />
                    : isOk
                      ? <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                      : isError
                        ? <ErrorRoundedIcon sx={{ fontSize: 14 }} />
                        : <FlashOnRoundedIcon sx={{ fontSize: 14 }} />
                }
                disabled={isLoading}
                onClick={() => void runPing()}
                sx={{ fontSize: 11, py: 0.5 }}
              >
                {isLoading ? 'Testando…' : isOk ? 'Testar novamente' : isError ? 'Testar novamente' : 'Testar'}
              </Button>
            ) : (
              <Typography variant="caption" color="text.disabled">
                sem ação de teste rápido
              </Typography>
            )}
          </Box>
        </>
      )}
    </Paper>
  )
}

export function DevFuncoesPage() {
  return (
    <AppPageChrome
      overline="Ambiente de desenvolvimento"
      title="Cloud Functions"
      subtitle={
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
          <Chip label="DEV ONLY" color="warning" size="small" sx={{ fontWeight: 700 }} />
          <Chip label={`${FUNCTIONS.length} funções`} size="small" variant="outlined" />
          <Chip label={REGION} size="small" variant="outlined" />
        </Box>
      }
      illustration="technology"
      illustrationAlt="Cloud Functions"
    >
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
        }}
      >
        {FUNCTIONS.map((fn) => (
          <FunctionCard key={fn.id} fn={fn} />
        ))}
      </Box>

      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: 2.5, mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Firebase Console — Logs completos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Para ver histórico de invocações, erros detalhados e métricas de latência em tempo real.
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
          href={CONSOLE_BASE}
          target="_blank"
          rel="noopener noreferrer"
          component="a"
          sx={{ flexShrink: 0 }}
        >
          Abrir console
        </Button>
      </Paper>
    </AppPageChrome>
  )
}
