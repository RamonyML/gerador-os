import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
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
  validarMudanca,
  marcarRetornar,
  gerarTextoContatoFeito,
  gerarTextoSemContato,
  getDiaSemana,
} from '../lib/validacaoFirestore'
import {
  CHECKLIST_LABELS,
  STATUS_VALIDACAO_COLOR,
  getStatusAgendamento,
  STATUS_AGENDAMENTO_COLOR,
} from '../types/validacao'
import type { MudancaEndereco, ChecklistValidacao } from '../types/validacao'
import { useAuth } from '../contexts/AuthContext'
import { canAccessValidacao } from '../lib/permissions'

const CHECKLIST_KEYS = Object.keys(CHECKLIST_LABELS) as (keyof ChecklistValidacao)[]

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

  const podePermanencia = profile != null && canAccessValidacao(profile)

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
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleValidar() {
    if (!id || !user || !profile) return
    setSaving(true)
    setFeedback('')
    try {
      await validarMudanca(id, profile.displayName ?? user.email ?? '', user.uid, observacoes, checklist)
      setFeedback('✓ Validado com sucesso.')
      setMudanca((prev) => prev ? { ...prev, status: 'VALIDADO', validadoPor: profile.displayName ?? '' } : prev)
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
      setMudanca((prev) => prev ? { ...prev, status: 'RETORNAR' } : prev)
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

  if (loading) return <Box sx={{ p: 3 }}><Typography>Carregando...</Typography></Box>
  if (!mudanca) return <Box sx={{ p: 3 }}><Typography>Mudança não encontrada.</Typography></Box>

  const dataStr = mudanca.dataMudanca.toDate().toLocaleDateString('pt-BR')
  const diaSem = getDiaSemana(mudanca.dataMudanca)
  const statusAg = getStatusAgendamento(mudanca.dataMudanca.toDate())

  const checklistFiltered = CHECKLIST_KEYS.filter((k) => {
    if (k === 'conferirPlanoRoteador') return mudanca.tipoMudanca === 'MUD END + ALT PLAN'
    return true
  })

  const totalCheck = checklistFiltered.length
  const marcados = checklistFiltered.filter((k) => checklist[k]).length

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/validacao')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
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

      <Stack spacing={3}>
        {/* Dados básicos */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Dados da Mudança
          </Typography>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
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
              <CampoInfo label="Texto Comprovante de Endereço" value={mudanca.textoComprovante} />
            )}
          </Stack>
        </Paper>

        {/* Checklist */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Checklist de Conferência
            </Typography>
            <Typography variant="caption" color={marcados === totalCheck ? 'success.main' : 'text.secondary'}>
              {marcados}/{totalCheck} itens
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            {checklistFiltered.map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={!!checklist[key]}
                    onChange={() => toggleItem(key)}
                    disabled={!podePermanencia || mudanca.status === 'VALIDADO'}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color={checklist[key] ? 'text.primary' : 'text.secondary'}>
                    {CHECKLIST_LABELS[key]}
                  </Typography>
                }
                sx={{ alignItems: 'flex-start', '.MuiFormControlLabel-label': { pt: 0.5 } }}
              />
            ))}
          </Stack>
        </Paper>

        {/* Textos de protocolo */}
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

        {/* Observações + ações */}
        {podePermanencia && (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Observações e Parecer
            </Typography>
            <TextField
              label="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={mudanca.status === 'VALIDADO'}
              placeholder="Adicione observações ou pendências aqui..."
            />
            {feedback && (
              <Alert
                severity={feedback.startsWith('✓') ? 'success' : feedback.startsWith('Marcado') ? 'info' : 'error'}
                sx={{ mt: 2 }}
              >
                {feedback}
              </Alert>
            )}
            {mudanca.status !== 'VALIDADO' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleValidar}
                  disabled={saving}
                  fullWidth
                >
                  {saving ? 'Salvando...' : 'Marcar como Validado'}
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
  )
}
