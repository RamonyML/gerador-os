import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Timestamp,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { MonthNavigator } from './MonthNavigator'
import type { Upgrade } from '../../types/upgrades'
import { labelAssinatura, labelMeioContato, labelTipoUpgrade } from '../../lib/upgradesFormat'
import { calcularComissaoAtivos, calcularComissaoReceptivos } from '../../lib/comissoesRules'
import { TipoUpgrade } from '../../types/upgrades'

function currencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function MyUpgradesDashboard() {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const { user, profile } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [upgrades, setUpgrades] = useState<Upgrade[]>([])
  const [showValues, setShowValues] = useState(false)

  const displayName =
    profile?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Operador'

  const load = useCallback(async () => {
    if (!user?.email) {
      setUpgrades([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const start = startOfMonth(selectedMonth)
      const end = endOfMonth(selectedMonth)
      const q = query(
        collection(db, 'upgrades'),
        where('operadorId', '==', user.email),
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
      console.error(e)
      setUpgrades([])
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, user?.email])

  useEffect(() => {
    void load()
  }, [load])

  const aggregates = useMemo(() => {
    const meio: Record<string, number> = {}
    const tipo: Record<string, number> = {}
    const assinatura: Record<string, number> = {}
    let roku = 0

    for (const u of upgrades) {
      if (u.meioContato) meio[u.meioContato] = (meio[u.meioContato] || 0) + 1
      if (u.tipoUpgrade) tipo[u.tipoUpgrade] = (tipo[u.tipoUpgrade] || 0) + 1
      if (u.assinatura) assinatura[u.assinatura] = (assinatura[u.assinatura] || 0) + 1
      if (u.isRoku) roku++
    }

    const ativos = tipo[TipoUpgrade.ATIVO] || 0
    const receptivos = tipo[TipoUpgrade.RECEPTIVO] || 0
    const comAtivos = calcularComissaoAtivos(ativos)
    const comReceptivos = calcularComissaoReceptivos(receptivos)
    const comTotal = comAtivos + comReceptivos

    return {
      total: upgrades.length,
      meio,
      tipo,
      assinatura,
      roku,
      ativos,
      receptivos,
      comAtivos,
      comReceptivos,
      comTotal,
    }
  }, [upgrades])

  const cardSx = {
    p: 2.25,
    borderRadius: 2.5,
    border: 1,
    borderColor: 'divider',
    bgcolor: 'background.paper',
  } as const

  const money = (value: number) => (showValues ? currencyBRL(value) : 'R$ ••••')

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="text.secondary">Carregando seu resumo…</Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Resumo do mês — {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </Typography>
        </Box>
        <MonthNavigator selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        <Paper variant="outlined" sx={cardSx}>
          <Typography variant="caption" color="text.secondary">
            Total de registros
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
            {aggregates.total}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={cardSx}>
          <Typography variant="caption" color="text.secondary">
            Ativos
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
            {aggregates.ativos}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Comissão ativos: <strong>{money(aggregates.comAtivos)}</strong>
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={cardSx}>
          <Typography variant="caption" color="text.secondary">
            Receptivos
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'info.main' }}>
            {aggregates.receptivos}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Comissão receptivos: <strong>{money(aggregates.comReceptivos)}</strong>
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Comissão estimada (mês)
            </Typography>
            <Tooltip title={showValues ? 'Ocultar valores' : 'Exibir valores'}>
              <IconButton
                size="small"
                onClick={() => setShowValues((v) => !v)}
                aria-label={showValues ? 'Ocultar valores' : 'Exibir valores'}
              >
                {showValues ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              mt: 0.5,
              color: 'success.main',
            }}
          >
            {money(aggregates.comTotal)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Roku TV: <strong>{aggregates.roku}</strong>
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Paper variant="outlined" sx={{ ...cardSx, p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Por meio de contato
          </Typography>
          {Object.keys(aggregates.meio).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Sem registros no período.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(aggregates.meio)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <Box
                    key={k}
                    sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {labelMeioContato(k as any)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {v}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ ...cardSx, p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Por tipo e assinatura
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Tipo
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.keys(aggregates.tipo).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                ) : (
                  Object.entries(aggregates.tipo)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {labelTipoUpgrade(k as any)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {v}
                        </Typography>
                      </Box>
                    ))
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Assinatura (não inclui Roku)
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.keys(aggregates.assinatura).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                ) : (
                  Object.entries(aggregates.assinatura)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {labelAssinatura(k as any)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {v}
                        </Typography>
                      </Box>
                    ))
                )}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              border: 1,
              borderColor: alpha(primary, 0.18),
              bgcolor: alpha(primary, theme.palette.mode === 'dark' ? 0.08 : 0.05),
            }}
          >
            <Typography variant="caption" color="text.secondary">
              A comissão exibida é uma estimativa com base nas regras atuais do suporte.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

