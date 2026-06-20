import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReplayIcon from '@mui/icons-material/Replay'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  getMudancaEndereco,
  salvarChecklist,
  salvarObservacoes,
  validarMudanca,
  marcarRetornar,
  gerarTextoContatoFeito,
  gerarTextoSemContato,
  getDiaSemana,
} from '../lib/validacaoFirestore'
import {
  CHECKLIST_KEYS,
  CHECKLIST_LABELS,
  STATUS_VALIDACAO_COLOR,
  getStatusAgendamento,
  STATUS_AGENDAMENTO_COLOR,
  getChecklistProgress,
} from '../types/validacao'
import type { MudancaEndereco, ChecklistValidacao } from '../types/validacao'
import { useAuth } from '../contexts/AuthContext'
import { canAccessValidacao } from '../lib/permissions'

function copiar(texto: string) {
  navigator.clipboard.writeText(texto).catch(() => undefined)
}

function CampoInfo({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

type SaveState = 'idle' | 'saving' | 'saved'

export function ValidacaoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [mudanca, setMudanca] = useState<MudancaEndereco | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [checklist, setChecklist] = useState<Partial<ChecklistValidacao>>({})
  const [observacoes, setObservacoes] = useState('')
  const [copiadoA, setCopiadoA] = useState(false)
  const [copiadoB, setCopiadoB] = useState(false)
  const [checkSaveState, setCheckSaveState] = useState<SaveState>('idle')
  const [obsSaveState, setObsSaveState] = useState<SaveState>('idle')

  const podePermanencia = profile != null && canAccessValidacao(profile)
  const isReadOnly = !podePermanencia || mudanca?.status === 'VALIDADO'

  useEffect(() => {
    if (!id) return
    getMudancaEndereco(id).then((m) => {
      setMudanca(m)
      if (m?.checklist) setChecklist(m.checklist)
      if (m?.observacoes) setObservacoes(m.observacoes)
      setLoading(false)
    })
  }, [id])

  function toggleItem(key: keyof ChecklistValidacao) {
    if (isReadOnly) return
    const next = { ...checklist, [key]: !checklist[key] }
    setChecklist(next)
    if (!id) return
    setCheckSaveState('saving')
    salvarChecklist(id, next)
      .then(() => {
        setCheckSaveState('saved')
        setTimeout(() => setCheckSaveState('idle'), 2000)
      })
      .catch(() => setCheckSaveState('idle'))
  }

  async function handleObservacoesBlur() {
    if (!id || isReadOnly || observacoes === mudanca?.observacoes) return
    setObsSaveState('saving')
    try {
      await salvarObservacoes(id, observacoes)
      setMudanca((prev) => (prev ? { ...prev, observacoes } : prev))
      setObsSaveState('saved')
      setTimeout(() => setObsSaveState('idle'), 2000)
    } catch {
      setObsSaveState('idle')
    }
  }

  async function handleValidar() {
    if (!id || !user || !profile) return
    setSaving(true)
    setFeedback('')
    try {
      await validarMudanca(id, profile.displayName ?? user.email ?? '', user.uid, observacoes, checklist)
      setFeedback('✓ Validado com sucesso.')
      setMudanca((prev) =>
        prev ? { ...prev, status: 'VALIDADO', validadoPor: profile.displayName ?? '' } : prev
      )
    } catch {
      setFeedback('Erro ao validar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRetornar() {
    if (!id) return
    setSaving(true)
    setFeedback('')
    try {
      await marcarRetornar(id, observacoes, checklist)
      setFeedback('Marcado para retornar.')
      setMudanca((prev) => (prev ? { ...prev, status: 'RETORNAR' } : prev))
    } catch {
      setFeedback('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function handleCopiarContato() {
    if (!mudanca) return
    const texto = gerarTextoContatoFeito({
      atendente: mudanca.atendente,
      nomeCliente: mudanca.nomeCliente,
      telefoneCliente: mudanca.telefoneCliente,
      novoEndereco: mudanca.novoEndereco,
      valorMudanca: mudanca.valorMudanca,
      diaSemana: getDiaSemana(mudanca.dataMudanca),
      dataMudanca: mudanca.dataMudanca,
      horaMudanca: mudanca.horaMudanca,
      titularAcompanha: mudanca.titularAcompanha,
      acompanhante: mudanca.acompanhante
        ? { nome: mudanca.acompanhante.nome, telefone: mudanca.acompanhante.telefone }
        : undefined,
    })
    copiar(texto)
    setCopiadoA(true)
    setTimeout(() => setCopiadoA(false), 2000)
  }

  function handleCopiarSemContato() {
    if (!mudanca) return
    const texto = gerarTextoSemContato({
      atendente: mudanca.atendente,
      nomeCliente: mudanca.nomeCliente,
      telefoneCliente: mudanca.telefoneCliente,
    })
    copiar(texto)
    setCopiadoB(true)
    setTimeout(() => setCopiadoB(false), 2000)
  }

  if (loading)
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    )
  if (!mudanca)
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Mudança não encontrada.</Typography>
      </Box>
    )

  const dataStr = mudanca.dataMudanca.toDate().toLocaleDateString('pt-BR')
  const diaSem = getDiaSemana(mudanca.dataMudanca)
  const statusAg = getStatusAgendamento(mudanca.dataMudanca.toDate())

  const checklistFiltered = CHECKLIST_KEYS.filter((k) => {
    if (k === 'conferirPlanoRoteador') return mudanca.tipoMudanca === 'MUD END + ALT PLAN'
    return true
  })

  const { marcados, total, pct } = getChecklistProgress(mudanca.tipoMudanca, checklist)

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/validacao')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {/* Cabeçalho */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {mudanca.nomeCliente}
        </Typography>
        <Chip label={mudanca.status} color={STATUS_VALIDACAO_COLOR[mudanca.status]} size="small" />
        <Chip
          label={statusAg}
          color={STATUS_AGENDAMENTO_COLOR[statusAg] as any}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {dataStr} ({diaSem}) às {mudanca.horaMudanca} · {mudanca.tipoMudanca}
        {mudanca.validadoPor ? ` · Validado por ${mudanca.validadoPor}` : ''}
      </Typography>

      {/* Layout 2 colunas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 420px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Coluna esquerda: dados + textos */}
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Dados da Mudança
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ flexWrap: 'wrap' }}>
                <CampoInfo label="Telefone" value={mudanca.telefoneCliente} />
                <CampoInfo label="Atendente" value={mudanca.atendente} />
                <CampoInfo label="Forma de Pagamento" value={mudanca.formaPagamento} />
                <CampoInfo label="Valor" value={mudanca.valorMudanca} />
              </Stack>
              <CampoInfo label="Novo Endereço" value={mudanca.novoEndereco} />
              <CampoInfo label="Equipamento" value={mudanca.equipamento} />
              {!mudanca.titularAcompanha && mudanca.acompanhante && (
                <CampoInfo
                  label="Acompanhante"
                  value={`${mudanca.acompanhante.nome} (${mudanca.acompanhante.grauParentesco}) — ${mudanca.acompanhante.telefone}`}
                />
              )}
              {mudanca.mensalidadeVincenda && (
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                  ⚠ Mensalidade vincenda
                </Typography>
              )}
              {mudanca.alteracaoPlano && (
                <>
                  <Divider />
                  <CampoInfo label="Plano Escolhido" value={mudanca.alteracaoPlano.planoEscolhido} />
                  {mudanca.alteracaoPlano.trocaRoteador && (
                    <Typography variant="body2" color="info.main" sx={{ fontWeight: 500 }}>
                      Troca de roteador necessária
                      {mudanca.alteracaoPlano.equipamento
                        ? ` — ${mudanca.alteracaoPlano.equipamento}`
                        : ''}
                    </Typography>
                  )}
                </>
              )}
              {mudanca.textoComprovante && (
                <CampoInfo
                  label="Texto Comprovante de Endereço"
                  value={mudanca.textoComprovante}
                />
              )}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Textos de Protocolo
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopiarContato}
                color={copiadoA ? 'success' : 'primary'}
                fullWidth
              >
                {copiadoA ? 'Copiado!' : 'Contato feito'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopiarSemContato}
                color={copiadoB ? 'success' : 'primary'}
                fullWidth
              >
                {copiadoB ? 'Copiado!' : 'Sem contato'}
              </Button>
            </Stack>
          </Paper>
        </Stack>

        {/* Coluna direita: checklist + ações */}
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Checklist de Conferência
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {checkSaveState === 'saving' && (
                  <Typography variant="caption" color="text.disabled">
                    salvando…
                  </Typography>
                )}
                {checkSaveState === 'saved' && (
                  <Typography variant="caption" color="success.main">
                    ✓ salvo
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  color={pct === 100 ? 'success.main' : 'text.secondary'}
                >
                  {marcados}/{total}
                </Typography>
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={pct}
              color={pct === 100 ? 'success' : 'primary'}
              sx={{ borderRadius: 1, mb: 2, height: 6 }}
            />

            <Stack spacing={0.5}>
              {checklistFiltered.map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={!!checklist[key]}
                      onChange={() => toggleItem(key)}
                      disabled={isReadOnly}
                      size="small"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      color={checklist[key] ? 'text.primary' : 'text.secondary'}
                    >
                      {CHECKLIST_LABELS[key]}
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', '.MuiFormControlLabel-label': { pt: 0.5 } }}
                />
              ))}
            </Stack>
          </Paper>

          {podePermanencia && (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Observações e Parecer
                </Typography>
                {obsSaveState === 'saving' && (
                  <Typography variant="caption" color="text.disabled">
                    salvando…
                  </Typography>
                )}
                {obsSaveState === 'saved' && (
                  <Typography variant="caption" color="success.main">
                    ✓ salvo
                  </Typography>
                )}
              </Stack>
              <TextField
                label="Observações"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                onBlur={handleObservacoesBlur}
                fullWidth
                multiline
                rows={3}
                disabled={mudanca.status === 'VALIDADO'}
                placeholder="Adicione observações ou pendências aqui..."
              />
              {feedback && (
                <Alert
                  severity={
                    feedback.startsWith('✓')
                      ? 'success'
                      : feedback.startsWith('Marcado')
                        ? 'info'
                        : 'error'
                  }
                  sx={{ mt: 2 }}
                >
                  {feedback}
                </Alert>
              )}
              {mudanca.status !== 'VALIDADO' && (
                <Stack direction="column" spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleValidar}
                    disabled={saving || pct < 100}
                    fullWidth
                  >
                    {saving
                      ? 'Salvando...'
                      : pct < 100
                        ? `Validar (${marcados}/${total} ✓)`
                        : 'Marcar como Validado'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<ReplayIcon />}
                    onClick={handleRetornar}
                    disabled={saving}
                    fullWidth
                  >
                    Retornar ao Atendente
                  </Button>
                </Stack>
              )}
            </Paper>
          )}
        </Stack>
      </Box>
    </Container>
  )
}
