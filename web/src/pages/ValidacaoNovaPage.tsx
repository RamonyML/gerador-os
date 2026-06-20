import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { criarMudancaEndereco } from '../lib/validacaoFirestore'
import type {
  TipoMudanca,
  FormaPagamento,
  ValorMudanca,
} from '../types/validacao'

const TIPOS: TipoMudanca[] = ['MUD END', 'MUD END + ALT PLAN']
const FORMAS: FormaPagamento[] = ['PIX', 'CARTÃO', 'DINHEIRO', 'ISENTO']
const VALORES: ValorMudanca[] = ['R$100,00', 'R$70,00', 'ISENTO']

export function ValidacaoNovaPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [tipoMudanca, setTipoMudanca] = useState<TipoMudanca>('MUD END')
  const [dataMudanca, setDataMudanca] = useState('')
  const [horaMudanca, setHoraMudanca] = useState('')
  const [novoEndereco, setNovoEndereco] = useState('')
  const [equipamento, setEquipamento] = useState('')
  const [titularAcompanha, setTitularAcompanha] = useState(true)
  const [nomeAcomp, setNomeAcomp] = useState('')
  const [grauAcomp, setGrauAcomp] = useState('')
  const [telefoneAcomp, setTelefoneAcomp] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX')
  const [valorMudanca, setValorMudanca] = useState<ValorMudanca>('R$100,00')
  const [mensalidadeVincenda, setMensalidadeVincenda] = useState(false)
  const [atendente, setAtendente] = useState(profile?.displayName ?? '')
  const [textoComprovante, setTextoComprovante] = useState('')
  const [planoEscolhido, setPlanoEscolhido] = useState('')
  const [trocaRoteador, setTrocaRoteador] = useState(false)
  const [equipamentoPlano, setEquipamentoPlano] = useState('')

  async function handleSalvar() {
    if (!nomeCliente || !telefoneCliente || !dataMudanca || !horaMudanca || !novoEndereco || !equipamento || !atendente) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    if (!titularAcompanha && (!nomeAcomp || !grauAcomp || !telefoneAcomp)) {
      setError('Preencha os dados do acompanhante.')
      return
    }
    if (tipoMudanca === 'MUD END + ALT PLAN' && !planoEscolhido) {
      setError('Informe o plano escolhido para alteração.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const [yyyy, mm, dd] = dataMudanca.split('-').map(Number)
      const dataTs = Timestamp.fromDate(new Date(yyyy!, mm! - 1, dd!))

      await criarMudancaEndereco({
        nomeCliente: nomeCliente.toUpperCase(),
        telefoneCliente,
        tipoMudanca,
        dataMudanca: dataTs,
        horaMudanca,
        novoEndereco: novoEndereco.toUpperCase(),
        equipamento: equipamento.toUpperCase(),
        titularAcompanha,
        acompanhante: titularAcompanha
          ? undefined
          : { nome: nomeAcomp.toUpperCase(), grauParentesco: grauAcomp, telefone: telefoneAcomp },
        formaPagamento,
        valorMudanca,
        mensalidadeVincenda,
        atendente: atendente.toUpperCase(),
        textoComprovante: textoComprovante || undefined,
        alteracaoPlano:
          tipoMudanca === 'MUD END + ALT PLAN'
            ? { planoEscolhido, trocaRoteador, equipamento: equipamentoPlano || undefined }
            : undefined,
        criadoPorUid: user!.uid,
        criadoPorNome: profile?.displayName ?? user!.email ?? '',
      })

      navigate('/validacao')
    } catch (e) {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 720, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/validacao')}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Nova Mudança de Endereço
      </Typography>

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Dados do Cliente
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Nome do cliente *"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
            />
            <TextField
              label="Telefone do cliente *"
              value={telefoneCliente}
              onChange={(e) => setTelefoneCliente(e.target.value)}
              fullWidth
              placeholder="(34) 99999-9999"
            />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Tipo e Agendamento
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Mudança *</InputLabel>
              <Select
                value={tipoMudanca}
                label="Tipo de Mudança *"
                onChange={(e) => setTipoMudanca(e.target.value as TipoMudanca)}
              >
                {TIPOS.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Data da mudança *"
                type="date"
                value={dataMudanca}
                onChange={(e) => setDataMudanca(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Horário *"
                type="time"
                value={horaMudanca}
                onChange={(e) => setHoraMudanca(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <TextField
              label="Novo endereço *"
              value={novoEndereco}
              onChange={(e) => setNovoEndereco(e.target.value)}
              fullWidth
              multiline
              rows={2}
              slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
              placeholder="RUA EXEMPLO, 123 — BAIRRO — CEP"
            />
            <TextField
              label="Equipamento *"
              value={equipamento}
              onChange={(e) => setEquipamento(e.target.value)}
              fullWidth
              placeholder="ONT TP-LINK 530 // CONECTOR VERDE"
              slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
            />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Acompanhante
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={titularAcompanha}
                onChange={(e) => setTitularAcompanha(e.target.checked)}
              />
            }
            label="Titular acompanha a visita"
          />
          {!titularAcompanha && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Nome do acompanhante *"
                value={nomeAcomp}
                onChange={(e) => setNomeAcomp(e.target.value)}
                fullWidth
                slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
              />
              <TextField
                label="Grau de parentesco *"
                value={grauAcomp}
                onChange={(e) => setGrauAcomp(e.target.value)}
                fullWidth
                placeholder="Esposo(a), filho(a), etc."
              />
              <TextField
                label="Telefone do acompanhante *"
                value={telefoneAcomp}
                onChange={(e) => setTelefoneAcomp(e.target.value)}
                fullWidth
              />
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Financeiro
          </Typography>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Forma de Pagamento *</InputLabel>
                <Select
                  value={formaPagamento}
                  label="Forma de Pagamento *"
                  onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                >
                  {FORMAS.map((f) => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Valor da Mudança *</InputLabel>
                <Select
                  value={valorMudanca}
                  label="Valor da Mudança *"
                  onChange={(e) => setValorMudanca(e.target.value as ValorMudanca)}
                >
                  {VALORES.map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={mensalidadeVincenda}
                  onChange={(e) => setMensalidadeVincenda(e.target.checked)}
                />
              }
              label="Mensalidade vincenda"
            />
          </Stack>
        </Paper>

        {tipoMudanca === 'MUD END + ALT PLAN' && (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Alteração de Plano
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Plano escolhido *"
                value={planoEscolhido}
                onChange={(e) => setPlanoEscolhido(e.target.value)}
                fullWidth
                placeholder="Ex: 1 GIGA — R$99,90"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={trocaRoteador}
                    onChange={(e) => setTrocaRoteador(e.target.checked)}
                  />
                }
                label="Troca de roteador/equipamento necessária"
              />
              {trocaRoteador && (
                <TextField
                  label="Equipamento novo"
                  value={equipamentoPlano}
                  onChange={(e) => setEquipamentoPlano(e.target.value)}
                  fullWidth
                />
              )}
            </Stack>
          </Paper>
        )}

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Complemento
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Atendente *"
              value={atendente}
              onChange={(e) => setAtendente(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
            />
            <TextField
              label="Texto comprovante de endereço"
              value={textoComprovante}
              onChange={(e) => setTextoComprovante(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Cole aqui o texto do comprovante de endereço (opcional)"
            />
          </Stack>
        </Paper>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSalvar}
          disabled={saving}
          sx={{ alignSelf: 'flex-end' }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </Stack>
    </Box>
  )
}
