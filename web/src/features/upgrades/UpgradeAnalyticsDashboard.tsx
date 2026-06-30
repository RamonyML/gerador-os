import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Timestamp,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { format, endOfMonth, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { db } from '../../lib/firebase'
import { logger } from '../../lib/logger'
import type { Upgrade } from '../../types/upgrades'
import { MonthNavigator } from './MonthNavigator'

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function UpgradeAnalyticsDashboard() {
  const [upgrades, setUpgrades] = useState<Upgrade[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [operadorLimit, setOperadorLimit] = useState<number | 'all'>(3)
  const [selectedOperadorDia, setSelectedOperadorDia] = useState('todos')

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
      const rows = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Upgrade, 'id'>),
      })) as Upgrade[]
      setUpgrades(rows)
    } catch (e) {
      logger.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    void load()
  }, [load])

  const porOperador = () => {
    const map: Record<string, number> = {}
    upgrades.forEach((u) => {
      const nome = u.operadorNome || 'Não informado'
      map[nome] = (map[nome] || 0) + 1
    })
    let data = Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
    if (operadorLimit !== 'all')
      data = data.slice(0, operadorLimit as number)
    return data
  }

  const porMeioContato = () => {
    const map: Record<string, number> = {}
    upgrades.forEach((u) => {
      const k = u.meioContato || ''
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map).map(([raw, value]) => ({
      name:
        raw === 'presencial'
          ? 'Presencial'
          : raw === 'ligacao'
            ? 'Ligação'
            : raw === 'whatsapp'
              ? 'WhatsApp'
              : raw || 'Não informado',
      value,
    }))
  }

  const porTipo = () => {
    const map: Record<string, number> = {}
    upgrades.forEach((u) => {
      const k = u.tipoUpgrade || ''
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map).map(([raw, value]) => ({
      name:
        raw === 'ativo'
          ? 'Ativo'
          : raw === 'receptivo'
            ? 'Receptivo'
            : raw || 'Não informado',
      value,
    }))
  }

  const porAssinatura = () => {
    const map: Record<string, number> = {}
    upgrades.forEach((u) => {
      const k = u.assinatura || ''
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map).map(([raw, value]) => ({
      name:
        raw === 'digital'
          ? 'Digital'
          : raw === 'fisica'
            ? 'Físico'
            : raw || 'Não informado',
      value,
    }))
  }

  const porDia = () => {
    const filtered =
      selectedOperadorDia === 'todos'
        ? upgrades
        : upgrades.filter((u) => u.operadorId === selectedOperadorDia)
    const map: Record<string, number> = {}
    filtered.forEach((u) => {
      if (!u.data) return
      const dia = format(u.data.toDate(), 'dd/MM', { locale: ptBR })
      map[dia] = (map[dia] || 0) + 1
    })
    return Object.entries(map)
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort((a, b) => {
        const da = Number.parseInt(a.data.split('/')[0]!, 10)
        const dbi = Number.parseInt(b.data.split('/')[0]!, 10)
        return da - dbi
      })
  }

  const listaOperadores = () => {
    const ids = new Set<string>()
    const nomes = new Map<string, string>()
    upgrades.forEach((u) => {
      if (u.operadorId && u.operadorNome) {
        ids.add(u.operadorId)
        nomes.set(u.operadorId, u.operadorNome)
      }
    })
    return [...ids].map((id) => ({ id, nome: nomes.get(id) ?? id }))
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Carregando gráficos…</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <MonthNavigator
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Top operadores</InputLabel>
          <Select
            label="Top operadores"
            value={operadorLimit}
            onChange={(e) =>
              setOperadorLimit(e.target.value as number | 'all')
            }
          >
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value="all">Todos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Upgrades por operador
          {operadorLimit !== 'all' ? ` (top ${operadorLimit})` : ''}
        </Typography>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={porOperador()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Quantidade" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Upgrades por dia
          </Typography>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Operador</InputLabel>
            <Select
              label="Operador"
              value={selectedOperadorDia}
              onChange={(e) => setSelectedOperadorDia(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              {listaOperadores().map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porDia()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantidade" fill="#00C49F" name="Quantidade" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Meio de contato
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={porMeioContato()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={88}
                label
              >
                {porMeioContato().map((_, i) => (
                  <Cell
                    key={String(i)}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Tipo de upgrade
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={porTipo()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={88}
                label
              >
                {porTipo().map((_, i) => (
                  <Cell
                    key={String(i)}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Assinatura
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={porAssinatura()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={88}
                label
              >
                {porAssinatura().map((_, i) => (
                  <Cell
                    key={String(i)}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  )
}
