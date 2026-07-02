import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AppPageChrome } from '../components/AppPageChrome'
import { AppLoader } from '../components/AppLoader'
import { useAuth } from '../contexts/AuthContext'
import { subscribeMyBugReports } from '../lib/bugReportFirestore'
import { BugStatusChip } from '../features/bugs/BugStatusChip'
import { BugModuleChip } from '../features/bugs/BugModuleChip'
import { NewBugReportDialog } from '../features/bugs/NewBugReportDialog'
import { BugReportDetailDialog } from '../features/bugs/BugReportDetailDialog'
import type { BugReport } from '../types/bugReport'

export function BugReportsPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const [reports, setReports] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    return subscribeMyBugReports(
      user.uid,
      (r) => { setReports(r); setLoading(false) },
      () => { setError(true); setLoading(false) },
    )
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <AppPageChrome
        overline="Sistema"
        title="Reportar Problema"
        subtitle={
          <Typography variant="body1" color="text.secondary">
            Encontrou uma falha ou comportamento inesperado? Relate aqui com detalhes e prints.
            O desenvolvimento acompanha todos os relatos e responde diretamente por aqui.
          </Typography>
        }
        headerRight={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setNewOpen(true)}
            sx={{ alignSelf: { sm: 'flex-end' }, flexShrink: 0 }}
          >
            Novo relato
          </Button>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar seus relatos. Recarregue a página.
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <AppLoader size={9} />
          </Box>
        ) : reports.length === 0 ? (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              borderRadius: 3,
              borderStyle: 'dashed',
            }}
          >
            <BugReportOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
              Nenhum relato enviado ainda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Encontrou algo errado? Clique em <strong>Novo relato</strong> e descreva o problema.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => setNewOpen(true)}
              sx={{ mt: 1 }}
            >
              Novo relato
            </Button>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {reports.map((r) => (
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
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, alignItems: { sm: 'center' } }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.75, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        #{r.reportNum} — {r.title}
                      </Typography>
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
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flexShrink: 0 }}
                  >
                    {format(r.createdAt, "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                  </Typography>
                </Box>

                {r.devNote && (
                  <Box
                    sx={{
                      mt: 1.25,
                      pt: 1.25,
                      borderTop: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      gap: 0.75,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Chip
                      label="Dev"
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
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {r.devNote}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </AppPageChrome>

      <NewBugReportDialog open={newOpen} onClose={() => setNewOpen(false)} />
      <BugReportDetailDialog
        reportId={selectedId}
        isDev={false}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}
