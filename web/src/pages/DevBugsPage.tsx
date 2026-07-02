import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AppPageChrome } from '../components/AppPageChrome'
import { AppLoader } from '../components/AppLoader'
import { subscribeAllBugReports } from '../lib/bugReportFirestore'
import { BugStatusChip } from '../features/bugs/BugStatusChip'
import { BugModuleChip } from '../features/bugs/BugModuleChip'
import { BugReportDetailDialog } from '../features/bugs/BugReportDetailDialog'
import type { BugReport, BugStatus } from '../types/bugReport'
import { BUG_STATUS_LABELS } from '../types/bugReport'

type FilterTab = 'aberto' | 'em_analise' | 'resolvido' | 'outros' | 'todos'

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function DevBugsPage() {
  const theme = useTheme()
  const [reports, setReports] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<FilterTab>('aberto')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    return subscribeAllBugReports(
      (r) => { setReports(r); setLoading(false) },
      () => { setError(true); setLoading(false) },
    )
  }, [])

  const counts = useMemo(() => ({
    aberto: reports.filter((r) => r.status === 'aberto').length,
    em_analise: reports.filter((r) => r.status === 'em_analise').length,
    resolvido: reports.filter((r) => r.status === 'resolvido').length,
    outros: reports.filter((r) => r.status === 'nao_reproduzivel' || r.status === 'duplicado').length,
    todos: reports.length,
  }), [reports])

  const filtered = useMemo(() => {
    if (tab === 'todos') return reports
    if (tab === 'outros') return reports.filter((r) => r.status === 'nao_reproduzivel' || r.status === 'duplicado')
    return reports.filter((r) => r.status === (tab as BugStatus))
  }, [reports, tab])

  return (
    <>
      <AppPageChrome
        overline="Desenvolvimento"
        title="Bugs Reportados"
        subtitle={
          <Typography variant="body1" color="text.secondary">
            Relatos enviados pela equipe. Gerencie status e responda diretamente ao usuário.
          </Typography>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar relatos. Recarregue a página.
          </Alert>
        )}

        {/* Tab filter */}
        <Box sx={{ mb: 2, overflowX: 'auto' }}>
          <ToggleButtonGroup
            value={tab}
            exclusive
            onChange={(_, v) => { if (v) setTab(v as FilterTab) }}
            size="small"
            sx={{ flexWrap: 'nowrap' }}
          >
            {(
              [
                { value: 'aberto', label: 'Abertos', count: counts.aberto, highlight: true },
                { value: 'em_analise', label: 'Em análise', count: counts.em_analise },
                { value: 'resolvido', label: 'Resolvidos', count: counts.resolvido },
                { value: 'outros', label: 'Encerrados', count: counts.outros },
                { value: 'todos', label: 'Todos', count: counts.todos },
              ] as { value: FilterTab; label: string; count: number; highlight?: boolean }[]
            ).map(({ value, label, count, highlight }) => (
              <ToggleButton key={value} value={value} sx={{ gap: 0.75, whiteSpace: 'nowrap' }}>
                {label}
                <Badge
                  badgeContent={count}
                  color={highlight && count > 0 ? 'error' : 'default'}
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      position: 'static',
                      transform: 'none',
                      fontSize: 10,
                      height: 16,
                      minWidth: 16,
                      ml: 0.25,
                    },
                  }}
                >
                  <Box />
                </Badge>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <AppLoader size={9} />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              py: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              borderRadius: 3,
              borderStyle: 'dashed',
            }}
          >
            <BugReportOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              {tab === 'todos' ? 'Nenhum relato ainda.' : `Nenhum relato com status "${BUG_STATUS_LABELS[tab as BugStatus] ?? tab}".`}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {filtered.map((r) => (
              <Paper
                key={r.id}
                elevation={0}
                variant="outlined"
                onClick={() => setSelectedId(r.id)}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderColor: r.status === 'aberto' ? alpha(theme.palette.info.main, 0.35) : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { sm: 'flex-start' } }}>
                  {/* Author avatar */}
                  <Tooltip title={`${r.authorName} · ${r.authorSector ?? ''}`}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 12,
                        fontWeight: 700,
                        bgcolor: 'primary.main',
                        flexShrink: 0,
                      }}
                    >
                      {initialsFrom(r.authorName)}
                    </Avatar>
                  </Tooltip>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.75, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        #{r.reportNum} — {r.title}
                      </Typography>
                      {r.status === 'aberto' && (
                        <FiberNewOutlinedIcon sx={{ fontSize: 16, color: 'info.main' }} />
                      )}
                      {r.attachments.length > 0 && (
                        <Chip
                          label={`${r.attachments.length} print${r.attachments.length > 1 ? 's' : ''}`}
                          size="small"
                          sx={{ height: 18, fontSize: 10, fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.75, flexWrap: 'wrap' }}>
                      <BugStatusChip status={r.status} />
                      <BugModuleChip module={r.module} />
                    </Box>

                    {r.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 0.75,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {r.description}
                      </Typography>
                    )}

                    {r.devNote && (
                      <Box
                        sx={{
                          mt: 1,
                          pt: 1,
                          borderTop: 1,
                          borderColor: 'divider',
                          display: 'flex',
                          gap: 0.75,
                          alignItems: 'flex-start',
                        }}
                      >
                        <Chip
                          label="Sua nota"
                          size="small"
                          color="primary"
                          sx={{ height: 18, fontSize: 10, fontWeight: 700, flexShrink: 0, mt: 0.1 }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {r.devNote}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Stack spacing={0.25} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {format(r.createdAt, "dd/MM/yy", { locale: ptBR })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {format(r.createdAt, "HH:mm", { locale: ptBR })}
                    </Typography>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}

        {!loading && reports.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider />
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
              {reports.length} relato{reports.length !== 1 ? 's' : ''} no total
            </Typography>
          </Box>
        )}
      </AppPageChrome>

      <BugReportDetailDialog
        reportId={selectedId}
        isDev={true}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}
