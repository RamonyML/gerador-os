import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  canViewUpgradeAnalytics,
  canViewUpgradeCommissions,
} from '../lib/permissions'
import { HeroIllustration } from '../components/HeroIllustration'
import { ILLUSTRATIONS } from '../data/illustrations'
import { Reveal } from '../components/Reveal'
import { UpgradeAnalyticsDashboard } from '../features/upgrades/UpgradeAnalyticsDashboard'
import { UpgradeAuditDashboard } from '../features/upgrades/UpgradeAuditDashboard'
import { UpgradeForm } from '../features/upgrades/UpgradeForm'
import { UpgradeTable } from '../features/upgrades/UpgradeTable'
import { MyUpgradesDashboard } from '../features/upgrades/MyUpgradesDashboard'

export function UpgradesHubPage() {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [formOpen, setFormOpen] = useState(false)

  const showAnalytics =
    profile != null && profile.active !== false && canViewUpgradeAnalytics(profile)
  const showCommissions =
    profile != null && profile.active !== false && canViewUpgradeCommissions(profile)

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setTab(v)
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Reveal>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          mb: 3,
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(135deg, ${alpha(primary, 0.14)} 0%, ${alpha(primary, 0.04)} 46%, transparent 100%)`
              : `linear-gradient(135deg, ${alpha(primary, 0.24)} 0%, ${alpha('#000', 0.12)} 50%, transparent 100%)`,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 520px' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Registro de upgrades
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Cadastro de upgrades e Roku TV (Suporte), exportação e indicadores. Comissões
            deste módulo são do suporte; comercial terá comissão por vendas no futuro.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {showCommissions ? (
              <Button
                variant="outlined"
                startIcon={<PaidOutlinedIcon />}
                onClick={() => navigate('/upgrades/comissoes')}
              >
                Comissões
              </Button>
            ) : null}
            <Button variant="contained" onClick={() => setFormOpen(true)}>
              Novo upgrade
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: 360, md: 420 },
            flexShrink: 0,
            ml: { md: 2 },
            opacity: { xs: 0.95, md: 1 },
            filter:
              theme.palette.mode === 'light'
                ? undefined
                : `drop-shadow(0 10px 30px ${alpha('#000', 0.35)})`,
          }}
        >
          <HeroIllustration src={ILLUSTRATIONS.technology} alt="Tecnologia" />
        </Box>
      </Box>
      </Reveal>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Resumo" />
          <Tab label="Lista" />
          {showAnalytics ? <Tab label="Dashboard" /> : null}
          {showAnalytics ? <Tab label="Auditoria" /> : null}
        </Tabs>
      </Box>

      {tab === 0 ? <MyUpgradesDashboard /> : null}
      {tab === 1 ? <UpgradeTable /> : null}
      {showAnalytics && tab === 2 ? <UpgradeAnalyticsDashboard /> : null}
      {showAnalytics && tab === 3 ? <UpgradeAuditDashboard /> : null}

      {!showAnalytics && tab > 1 ? (
        <Typography color="text.secondary">
          Indisponível para o seu perfil.
        </Typography>
      ) : null}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Novo registro</DialogTitle>
        <DialogContent>
          <UpgradeForm
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
}
