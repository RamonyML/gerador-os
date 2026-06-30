import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Timestamp,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { logger } from '../lib/logger'
import { useAuth } from '../contexts/AuthContext'
import {
  calcularComissaoAtivos,
  calcularComissaoReceptivos,
} from '../lib/comissoesRules'
import { gerarRelatorioComissoesPdf } from '../lib/comissoesPdf'
import { Reveal } from '../components/Reveal'
import { TipoUpgrade, type Upgrade } from '../types/upgrades'

type ComissaoOperador = {
  operadorId: string
  operadorNome: string
  upgradesAtivos: number
  upgradesReceptivos: number
  valorComissaoAtivos: number
  valorComissaoReceptivos: number
  valorTotalComissao: number
}

type ViewMode = 'todos' | 'ativos' | 'receptivos'

export function UpgradesCommissionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [comissoes, setComissoes] = useState<ComissaoOperador[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('todos')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const start = startOfMonth(selectedMonth)
      const end = endOfMonth(selectedMonth)
      const q = query(
        collection(db, 'upgrades'),
        where('data', '>=', Timestamp.fromDate(start)),
        where('data', '<=', Timestamp.fromDate(end)),
      )
      const snap = await getDocs(q)

      const upgradesData: Upgrade[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          ...data,
          data: data.data as Timestamp,
          criadoEm: data.criadoEm as Timestamp,
          ultimaAtualizacao: data.ultimaAtualizacao as Timestamp,
        } as Upgrade
      })

      const map = new Map<string, ComissaoOperador>()

      upgradesData.forEach((u) => {
        const id = u.operadorId
        const nome = u.operadorNome
        if (!map.has(id)) {
          map.set(id, {
            operadorId: id,
            operadorNome: nome,
            upgradesAtivos: 0,
            upgradesReceptivos: 0,
            valorComissaoAtivos: 0,
            valorComissaoReceptivos: 0,
            valorTotalComissao: 0,
          })
        }
        const row = map.get(id)!
        if (u.tipoUpgrade === TipoUpgrade.ATIVO) row.upgradesAtivos++
        else if (u.tipoUpgrade === TipoUpgrade.RECEPTIVO) row.upgradesReceptivos++
      })

      map.forEach((row) => {
        row.valorComissaoAtivos = calcularComissaoAtivos(row.upgradesAtivos)
        row.valorComissaoReceptivos = calcularComissaoReceptivos(
          row.upgradesReceptivos,
        )
        row.valorTotalComissao =
          row.valorComissaoAtivos + row.valorComissaoReceptivos
      })

      const list = [...map.values()].sort(
        (a, b) => b.valorTotalComissao - a.valorTotalComissao,
      )
      setComissoes(list)
    } catch (e) {
      logger.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    void load()
  }, [load])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  const filtradas = useMemo(() => {
    switch (viewMode) {
      case 'ativos':
        return comissoes.filter((c) => c.upgradesAtivos > 0)
      case 'receptivos':
        return comissoes.filter((c) => c.upgradesReceptivos > 0)
      default:
        return comissoes
    }
  }, [comissoes, viewMode])

  const totais = useMemo(() => {
    const total = filtradas.reduce((s, c) => s + c.valorTotalComissao, 0)
    const media =
      filtradas.length > 0 ? total / filtradas.length : 0
    return { total, media }
  }, [filtradas])

  const exportarPdf = async () => {
    try {
      setExporting(true)
      const mesAno = format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })
      await gerarRelatorioComissoesPdf({
        comissoes: filtradas,
        mesAno,
        totalComissoes: totais.total,
        totalOperadores: filtradas.length,
        mediaComissoes: totais.media,
        emailOperador: user?.email ?? undefined,
      })
    } catch (e) {
      logger.error(e)
      alert('Falha ao gerar PDF.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 320,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Reveal>
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          mb: 3,
          justifyContent: 'space-between',
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/upgrades')}
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          startIcon={
            exporting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
          onClick={() => void exportarPdf()}
          disabled={exporting || filtradas.length === 0}
        >
          {exporting ? 'Gerando…' : 'Exportar PDF'}
        </Button>
      </Box>

      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Comissões (Suporte) —{' '}
        {format(selectedMonth, "MMMM yyyy", { locale: ptBR })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Valores referentes a upgrades e Roku TV registrados pelo fluxo de{' '}
        <strong>suporte</strong>. O setor <strong>comercial</strong> será
        comissionado por vendas em uma área separada, ainda não disponível aqui.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <FormControl fullWidth>
          <InputLabel>Mês</InputLabel>
          <Select
            label="Mês"
            value={format(selectedMonth, 'yyyy-MM')}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-').map(Number)
              setSelectedMonth(new Date(y!, m! - 1, 1))
            }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date()
              d.setMonth(d.getMonth() - i)
              return (
                <MenuItem
                  key={i}
                  value={format(d, 'yyyy-MM')}
                >
                  {format(d, 'MMMM yyyy', { locale: ptBR })}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Visualização</InputLabel>
          <Select
            label="Visualização"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
          >
            <MenuItem value="todos">Todos os upgrades</MenuItem>
            <MenuItem value="ativos">Apenas ativos</MenuItem>
            <MenuItem value="receptivos">Apenas receptivos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              Operadores
            </Typography>
            <Typography variant="h5">{filtradas.length}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              Total em comissões
            </Typography>
            <Typography variant="h5">{formatCurrency(totais.total)}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              Média por operador
            </Typography>
            <Typography variant="h5">
              {formatCurrency(totais.media)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'common.white', fontWeight: 700 }}>
                Pos.
              </TableCell>
              <TableCell sx={{ color: 'common.white', fontWeight: 700 }}>
                Operador
              </TableCell>
              <TableCell align="center" sx={{ color: 'common.white', fontWeight: 700 }}>
                Ativos
              </TableCell>
              <TableCell align="center" sx={{ color: 'common.white', fontWeight: 700 }}>
                Receptivos
              </TableCell>
              <TableCell align="right" sx={{ color: 'common.white', fontWeight: 700 }}>
                Com. ativos
              </TableCell>
              <TableCell align="right" sx={{ color: 'common.white', fontWeight: 700 }}>
                Com. receptivos
              </TableCell>
              <TableCell align="right" sx={{ color: 'common.white', fontWeight: 700 }}>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Alert severity="info">
                    Nenhum upgrade no período selecionado.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((c, index) => (
                <TableRow key={c.operadorId} hover>
                  <TableCell>
                    <Chip
                      label={`${index + 1}º`}
                      color={index < 3 ? 'primary' : 'default'}
                      variant={index < 3 ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {c.operadorNome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.operadorId}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{c.upgradesAtivos}</TableCell>
                  <TableCell align="center">{c.upgradesReceptivos}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(c.valorComissaoAtivos)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(c.valorComissaoReceptivos)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="success.main" sx={{ fontWeight: 700 }}>
                      {formatCurrency(c.valorTotalComissao)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Regras de comissão
        </Typography>
        <Typography variant="body2">
          Ativos: valor variável por faixa (R$ 11 a R$ 28 por upgrade). Receptivos:
          R$ 9,00 cada.
        </Typography>
      </Alert>
    </Box>
    </Reveal>
  )
}
