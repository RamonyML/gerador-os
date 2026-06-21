import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { httpsCallable } from 'firebase/functions'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
import { AppPageChrome } from '../components/AppPageChrome'
import { getFirebaseFunctions } from '../lib/firebase'

const isFnEmulator = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true'

type TestState = 'idle' | 'loading' | 'ok' | 'error'

type TestCardProps = {
  title: string
  description: string
  onRun: () => Promise<unknown>
  children?: React.ReactNode
}

function TestCard({ title, description, onRun, children }: TestCardProps) {
  const theme = useTheme()
  const [state, setState] = useState<TestState>('idle')
  const [result, setResult] = useState<unknown>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const run = async () => {
    setState('loading')
    setResult(null)
    setErrorMsg('')
    try {
      const data = await onRun()
      setResult(data)
      setState('ok')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e))
      setState('error')
    }
  }

  const borderColor =
    state === 'ok' ? theme.palette.success.main
    : state === 'error' ? theme.palette.error.main
    : 'divider'

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">{description}</Typography>
          </Box>
          {state === 'ok' && <CheckCircleOutlineRoundedIcon sx={{ color: 'success.main' }} />}
          {state === 'error' && <ErrorOutlineRoundedIcon sx={{ color: 'error.main' }} />}
        </Box>

        {children && <Box sx={{ mt: 1.5 }}>{children}</Box>}

        <Box sx={{ mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => void run()}
            disabled={state === 'loading'}
            startIcon={state === 'loading' ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {state === 'loading' ? 'Executando…' : 'Executar'}
          </Button>
          {state !== 'idle' && (
            <Button size="small" color="inherit" sx={{ ml: 1 }} onClick={() => { setState('idle'); setResult(null); setErrorMsg('') }}>
              Limpar
            </Button>
          )}
        </Box>
      </Box>

      {(result !== null || state === 'error') && (
        <>
          <Divider />
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: state === 'error'
                ? alpha(theme.palette.error.main, 0.05)
                : alpha(theme.palette.success.main, 0.04),
            }}
          >
            {state === 'error' ? (
              <Alert severity="error" sx={{ fontSize: 12 }}>{errorMsg}</Alert>
            ) : (
              <Box
                component="pre"
                sx={{
                  m: 0,
                  fontSize: 11.5,
                  fontFamily: 'monospace',
                  color: 'text.primary',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: 320,
                  overflowY: 'auto',
                }}
              >
                {JSON.stringify(result, null, 2)}
              </Box>
            )}
          </Box>
        </>
      )}
    </Paper>
  )
}

export function MkTestesPage() {
  const functions = getFirebaseFunctions()
  const call = httpsCallable(functions, 'mkSuporte')

  const [cpfCliente, setCpfCliente] = useState('')
  const [processoId, setProcessoId] = useState('')
  const [cpfProt, setCpfProt] = useState('')
  const [processoProt, setProcessoProt] = useState('')
  const [classificacaoProt, setClassificacaoProt] = useState('')
  const [infoProt, setInfoProt] = useState('')
  const [cpfOs, setCpfOs] = useState('')
  const [descOs, setDescOs] = useState('')
  const [tipoOs, setTipoOs] = useState('')
  const [processoOs, setProcessoOs] = useState('')
  const [classificacaoOs, setClassificacaoOs] = useState('')
  const [grupoOs, setGrupoOs] = useState('')
  const [tecnicoOs, setTecnicoOs] = useState('')

  return (
    <AppPageChrome
      overline="Ambiente de desenvolvimento"
      title="Laboratório MK"
      subtitle={
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
          <Chip label="DEV ONLY" color="warning" size="small" sx={{ fontWeight: 700 }} />
          <Chip
            label={isFnEmulator ? 'Functions: emulador local :5001' : 'Functions: produção'}
            color={isFnEmulator ? 'info' : 'default'}
            size="small"
            variant="outlined"
          />
          <Chip
            label={import.meta.env.MK_MODE === 'real' ? 'MK: real' : 'MK_MODE via .env da função'}
            size="small"
            variant="outlined"
          />
        </Box>
      }
      maxWidth="lg"
      illustration="agenda"
      illustrationAlt="Laboratório MK"
    >
      <Stack spacing={2.5}>

        {/* 1. Autenticação */}
        <TestCard
          title="1. Autenticação"
          description="Valida as credenciais (token + contra-senha) no servidor MK e retorna o token de sessão."
          onRun={async () => {
            const res = await call({ action: 'testar_auth' })
            return res.data
          }}
        />

        {/* 2. Buscar cliente por CPF */}
        <TestCard
          title="2. Buscar cliente por CPF"
          description="Busca o cadastro do cliente no MK pelo CPF/CNPJ. Retorna código, nome, contratos e conexões."
          onRun={async () => {
            const res = await call({ action: 'buscar_cliente', cpf: cpfCliente })
            return res.data
          }}
        >
          <TextField
            size="small"
            label="CPF / CNPJ"
            placeholder="Somente números"
            value={cpfCliente}
            onChange={(e) => setCpfCliente(e.target.value)}
            sx={{ width: 220 }}
          />
        </TestCard>

        {/* 3. Tipos de OS */}
        <TestCard
          title="3. Listar tipos de O.S"
          description="Retorna todos os tipos de OS cadastrados no MK com seus códigos — necessários para criar uma OS."
          onRun={async () => {
            const res = await call({ action: 'listar_tipos_os' })
            return res.data
          }}
        />

        {/* 4. Grupos / Equipes */}
        <TestCard
          title="4. Listar grupos / equipes"
          description="Retorna os grupos de serviço (equipes técnicas) com seus códigos."
          onRun={async () => {
            const res = await call({ action: 'listar_grupos' })
            return res.data
          }}
        />

        {/* 5. Processos de atendimento */}
        <TestCard
          title="5. Listar processos de atendimento"
          description="Retorna os processos cadastrados — cada processo corresponde a um tipo de demanda (ex: Manutenção, Suporte)."
          onRun={async () => {
            const res = await call({ action: 'listar_processos' })
            return res.data
          }}
        />

        {/* 6. Classificações */}
        <TestCard
          title="6. Listar classificações"
          description="Retorna as classificações de atendimento. Filtre por processo para ver só as vinculadas a ele."
          onRun={async () => {
            const res = await call({
              action: 'listar_classificacoes',
              processoId: processoId ? Number(processoId) : undefined,
            })
            return res.data
          }}
        >
          <TextField
            size="small"
            label="Código do processo (opcional)"
            placeholder="Ex: 12"
            value={processoId}
            onChange={(e) => setProcessoId(e.target.value)}
            sx={{ width: 220 }}
          />
        </TestCard>

        {/* 7. Criar Protocolo — Padrão B (sem OS) */}
        <TestCard
          title="7. Criar Protocolo (Padrão B — sem OS)"
          description="auth → buscar cliente → criar atendimento. Retorna o número do protocolo MK. Para abertura, sempre use classificação 3 (NORMAL) — classificações com encerramento='Sim' (ex: 8=ONU-SEM-LUZ) são para fechar, não abrir."
          onRun={async () => {
            const res = await call({
              action: 'criar_protocolo',
              slug: 'mk-teste-protocolo',
              cpf: cpfProt,
              processoId: Number(processoProt),
              classificacaoId: Number(classificacaoProt),
              info: infoProt,
            })
            return res.data
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <TextField size="small" label="CPF do cliente" placeholder="Somente números" value={cpfProt} onChange={(e) => setCpfProt(e.target.value)} sx={{ width: 180 }} />
            <TextField size="small" label="Cód. processo" placeholder="Ex: 12" value={processoProt} onChange={(e) => setProcessoProt(e.target.value)} sx={{ width: 140 }} />
            <TextField size="small" label="Cód. classificação" placeholder="Ex: 8" value={classificacaoProt} onChange={(e) => setClassificacaoProt(e.target.value)} sx={{ width: 150 }} />
            <TextField
              size="small"
              label="Descrição (info)"
              placeholder="Ex: CLIENTE SEM CONEXÃO, ONU SEM LUZ..."
              value={infoProt}
              onChange={(e) => setInfoProt(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Box>
        </TestCard>

        <TestCard
          title="8. Criar OS — fluxo completo (bloqueado ⚠️)"
          description="Executa a sequência: auth → buscar cliente → criar atendimento → criar OS. Use os códigos obtidos nos testes anteriores."
          onRun={async () => {
            const res = await call({
              action: 'criar_os',
              slug: 'mk-teste-manual',
              cpf: cpfOs,
              descricaoProblema: descOs,
              tipoOS: Number(tipoOs),
              processoId: Number(processoOs),
              classificacaoId: Number(classificacaoOs),
              grupoServico: grupoOs ? Number(grupoOs) : undefined,
              tecnicoId: tecnicoOs ? Number(tecnicoOs) : undefined,
            })
            return res.data
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <TextField size="small" label="CPF do cliente" value={cpfOs} onChange={(e) => setCpfOs(e.target.value)} sx={{ width: 180 }} />
            <TextField size="small" label="Cód. tipo de OS" value={tipoOs} onChange={(e) => setTipoOs(e.target.value)} sx={{ width: 140 }} />
            <TextField size="small" label="Cód. processo" value={processoOs} onChange={(e) => setProcessoOs(e.target.value)} sx={{ width: 140 }} />
            <TextField size="small" label="Cód. classificação" value={classificacaoOs} onChange={(e) => setClassificacaoOs(e.target.value)} sx={{ width: 150 }} />
            <TextField size="small" label="Cód. grupo" value={grupoOs} onChange={(e) => setGrupoOs(e.target.value)} sx={{ width: 140 }} />
            <TextField size="small" label="Cód. técnico" value={tecnicoOs} onChange={(e) => setTecnicoOs(e.target.value)} sx={{ width: 140 }} />
            <TextField
              size="small"
              label="Descrição do problema"
              value={descOs}
              onChange={(e) => setDescOs(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Box>
        </TestCard>

      </Stack>
    </AppPageChrome>
  )
}

// Ícone exportado para usar na navbar/home
export { BiotechOutlinedIcon as MkTestesIcon }
