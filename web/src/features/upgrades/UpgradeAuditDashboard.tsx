import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import type { Upgrade } from '../../types/upgrades'
import { MonthNavigator } from './MonthNavigator'

export function UpgradeAuditDashboard() {
  const [upgrades, setUpgrades] = useState<Upgrade[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const start = startOfMonth(selectedMonth)
      const end = endOfMonth(selectedMonth)
      const q = query(
        collection(db, 'upgrades'),
        where('criadoEm', '>=', Timestamp.fromDate(start)),
        where('criadoEm', '<=', Timestamp.fromDate(end)),
      )
      const snap = await getDocs(q)
      const rows = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Upgrade, 'id'>),
      })) as Upgrade[]
      setUpgrades(rows)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    void load()
  }, [load])

  const foraHorarioCount = upgrades.filter((u) => {
    if (!u.criadoEm) return false
    const h = u.criadoEm.toDate().getHours()
    return h < 8 || h >= 22
  }).length

  const editadosCount = upgrades.filter((u) => {
    if (!u.criadoEm || !u.ultimaAtualizacao) return false
    return u.criadoEm.toMillis() !== u.ultimaAtualizacao.toMillis()
  }).length

  const tempoMedioHoras = () => {
    const tempos = upgrades
      .filter((u) => u.data && u.criadoEm)
      .map((u) =>
        Math.abs(u.criadoEm!.toMillis() - u.data!.toMillis()) /
        (1000 * 60 * 60),
      )
    if (tempos.length === 0) return 0
    return tempos.reduce((a, b) => a + b, 0) / tempos.length
  }

  const porDiaRegistro = () => {
    const map: Record<string, number> = {}
    upgrades.forEach((u) => {
      if (!u.criadoEm) return
      const k = format(u.criadoEm.toDate(), 'dd/MM', { locale: ptBR })
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map)
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort(
        (a, b) =>
          Number.parseInt(a.data.split('/')[0]!, 10) -
          Number.parseInt(b.data.split('/')[0]!, 10),
      )
  }

  const porHora = () => {
    const map: Record<number, number> = {}
    upgrades.forEach((u) => {
      if (!u.criadoEm) return
      const h = u.criadoEm.toDate().getHours()
      map[h] = (map[h] || 0) + 1
    })
    return Array.from({ length: 24 }, (_, i) => ({
      hora: `${String(i).padStart(2, '0')}h`,
      quantidade: map[i] ?? 0,
    }))
  }

  const detalheForaHorario = () =>
    upgrades
      .filter((u) => {
        if (!u.criadoEm) return false
        const h = u.criadoEm.toDate().getHours()
        return h < 8 || h >= 22
      })
      .map((u) => ({
        cliente: u.cliente,
        operador: u.createdBy ?? u.operadorNome ?? '—',
        dataRegistro: u.criadoEm
          ? format(u.criadoEm.toDate(), 'dd/MM/yyyy HH:mm', { locale: ptBR })
          : '—',
        dataUpgrade: u.data
          ? format(u.data.toDate(), 'dd/MM/yyyy', { locale: ptBR })
          : '—',
        horaRegistro: u.criadoEm ? u.criadoEm.toDate().getHours() : 0,
      }))
      .sort((a, b) => b.horaRegistro - a.horaRegistro)

  const media = tempoMedioHoras()

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Carregando auditoria…</Typography>
      </Box>
    )
  }

  const fhRows = detalheForaHorario()

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <MonthNavigator
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">
            {upgrades.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total de registros
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="warning.main">
            {foraHorarioCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fora do horário (8h–22h)
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="info.main">
            {editadosCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Registros editados
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="success.main">
            {media.toFixed(1)}h
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tempo médio até registro
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Registros por dia (data de criação)
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={porDiaRegistro()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#8884d8" name="Registros" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Registros por hora do dia
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={porHora()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" interval={2} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#00C49F" name="Registros" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Fora do horário de trabalho
        </Typography>
        {fhRows.length > 0 ? (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Operador</TableCell>
                  <TableCell>Registro</TableCell>
                  <TableCell>Upgrade</TableCell>
                  <TableCell>Hora</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fhRows.map((r, i) => (
                  <TableRow
                    key={i}
                    sx={{
                      bgcolor:
                        r.horaRegistro >= 22 || r.horaRegistro < 6
                          ? 'warning.light'
                          : 'error.light',
                    }}
                  >
                    <TableCell>{r.cliente}</TableCell>
                    <TableCell>{r.operador}</TableCell>
                    <TableCell>{r.dataRegistro}</TableCell>
                    <TableCell>{r.dataUpgrade}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={`${r.horaRegistro}h`}
                        color={
                          r.horaRegistro >= 22 || r.horaRegistro < 6
                            ? 'warning'
                            : 'error'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            Nenhum registro fora do horário 8h–22h.
          </Typography>
        )}
      </Paper>

      {foraHorarioCount > 0 ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {foraHorarioCount} registro(s) fora do horário. Verifique se são
          legítimos.
        </Alert>
      ) : null}

      {media > 24 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Tempo médio entre data do upgrade e registro:{' '}
          <strong>{media.toFixed(1)} h</strong>.
        </Alert>
      ) : null}
    </Box>
  )
}
