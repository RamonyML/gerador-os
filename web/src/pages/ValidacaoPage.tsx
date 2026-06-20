import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { listarMudancasEndereco, getDiaSemana } from '../lib/validacaoFirestore'
import {
  getStatusAgendamento,
  STATUS_AGENDAMENTO_COLOR,
  STATUS_VALIDACAO_COLOR,
} from '../types/validacao'
import type { MudancaEndereco, StatusAgendamento } from '../types/validacao'
import { useAuth } from '../contexts/AuthContext'
import { canCreateMudancaEndereco } from '../lib/permissions'

const ORDER: StatusAgendamento[] = ['VALIDAR HOJE', 'EM EXECUÇÃO', 'VALIDAR DEPOIS', 'EXECUTADA']

function ordenar(lista: MudancaEndereco[]): MudancaEndereco[] {
  return [...lista].sort((a, b) => {
    const sa = getStatusAgendamento(a.dataMudanca.toDate())
    const sb = getStatusAgendamento(b.dataMudanca.toDate())
    const ia = ORDER.indexOf(sa)
    const ib = ORDER.indexOf(sb)
    if (ia !== ib) return ia - ib
    return a.dataMudanca.toMillis() - b.dataMudanca.toMillis()
  })
}

export function ValidacaoPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [mudancas, setMudancas] = useState<MudancaEndereco[]>([])
  const [loading, setLoading] = useState(true)
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

  const grupos: Record<StatusAgendamento, MudancaEndereco[]> = {
    'VALIDAR HOJE': [],
    'EM EXECUÇÃO': [],
    'VALIDAR DEPOIS': [],
    EXECUTADA: [],
  }
  for (const m of mudancas) {
    const s = getStatusAgendamento(m.dataMudanca.toDate())
    grupos[s].push(m)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Validação — Mudança de Endereço
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Atualizar">
            <IconButton onClick={carregar} disabled={loading}>
              <RefreshIcon />
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
      </Stack>

      {loading && (
        <Typography color="text.secondary">Carregando...</Typography>
      )}

      {!loading && mudancas.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">
            Nenhuma mudança de endereço cadastrada.
          </Typography>
        </Paper>
      )}

      {ORDER.map((grupo) => {
        const lista = grupos[grupo]
        if (lista.length === 0) return null
        return (
          <Box key={grupo} sx={{ mb: 4 }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                letterSpacing: 1.5,
                mb: 1,
                display: 'block',
                color:
                  grupo === 'VALIDAR HOJE'
                    ? 'warning.main'
                    : grupo === 'EM EXECUÇÃO'
                    ? 'info.main'
                    : grupo === 'EXECUTADA'
                    ? 'success.main'
                    : 'text.secondary',
              }}
            >
              {grupo} ({lista.length})
            </Typography>
            <Stack spacing={1.5}>
              {lista.map((m) => {
                const statusAg = getStatusAgendamento(m.dataMudanca.toDate())
                const dataStr = m.dataMudanca
                  .toDate()
                  .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                const diaSem = getDiaSemana(m.dataMudanca)

                return (
                  <Paper
                    key={m.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderLeft: 4,
                      borderColor:
                        m.status === 'VALIDADO'
                          ? 'success.main'
                          : m.status === 'RETORNAR'
                          ? 'error.main'
                          : statusAg === 'VALIDAR HOJE'
                          ? 'warning.main'
                          : statusAg === 'EM EXECUÇÃO'
                          ? 'info.main'
                          : 'divider',
                    }}
                    onClick={() => navigate(`/validacao/${m.id}`)}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{m.nomeCliente}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dataStr} ({diaSem}) às {m.horaMudanca} · {m.tipoMudanca}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {m.novoEndereco}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0, alignItems: 'center' }}>
                        <Chip
                          label={m.status}
                          color={STATUS_VALIDACAO_COLOR[m.status]}
                          size="small"
                        />
                        <Chip
                          label={statusAg}
                          color={STATUS_AGENDAMENTO_COLOR[statusAg] as any}
                          size="small"
                          variant="outlined"
                        />
                        <Tooltip title="Abrir">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/validacao/${m.id}`)
                            }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
            <Divider sx={{ mt: 3 }} />
          </Box>
        )
      })}
    </Box>
  )
}
