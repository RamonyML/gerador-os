import { Box, Container, Divider, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useColorMode } from '../contexts/ColorModeContext'
import { ILLUSTRATIONS } from '../data/illustrations'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'

const MK_CARDS = [
  {
    to: '/dev/mk',
    accent: '#3b82f6',
    icon: <ScienceOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Testes MK',
    description: 'Dispare chamadas diretas à API MK Solutions e inspecione respostas em tempo real.',
  },
  {
    to: '/dev/mk-status',
    accent: '#0ea5e9',
    icon: <BarChartOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Status da Integração',
    description: 'Monitore o estado da comunicação com o MK e verifique o histórico de erros.',
  },
  {
    to: '/dev/mk-codigos',
    accent: '#6366f1',
    icon: <DataObjectOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Códigos e Parâmetros',
    description: 'Referência rápida dos processoId, tipoOS e demais constantes usados nos formulários.',
  },
]

const TOOL_CARDS = [
  {
    to: '/dev/bugs',
    accent: '#ef4444',
    icon: <BugReportOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Bugs Reportados',
    description: 'Gerencie os relatos de falhas enviados pela equipe. Altere status e responda diretamente ao usuário.',
  },
  {
    to: '/dev/funcoes',
    accent: '#f59e0b',
    icon: <TuneOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Funções do Sistema',
    description: 'Painel de configurações e ferramentas internas do gerador.',
  },
  {
    to: '/dev/aniversarios',
    accent: '#ec4899',
    icon: <CelebrationOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Aniversários',
    description: 'Cadastre e gerencie os aniversários da equipe exibidos no painel e nas notificações.',
  },
  {
    to: '/dev/seed-validacao',
    accent: '#10b981',
    icon: <StorageOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Seed — Validação',
    description: 'Popula o Firestore com dados de teste para o módulo de Validação de Mudança de Endereço.',
  },
]

const MONITOR_CARDS = [
  {
    to: '/dev/logs',
    accent: '#f97316',
    icon: <RadarOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Monitoramento',
    description: 'Logs, erros e alertas do sistema capturados em produção via Sentry. Inclui ferramentas de teste de captura.',
  },
]

export function DevHomePage() {
  const { isDark } = useColorMode()

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

          <Reveal>
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                border: 1,
                borderColor: 'divider',
                minHeight: { xs: 180, sm: 240, md: 280 },
              }}
            >
              <Box
                component="img"
                src={ILLUSTRATIONS.dev}
                alt=""
                aria-hidden="true"
                loading="eager"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  userSelect: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: isDark
                    ? `linear-gradient(100deg, ${alpha('#000', 0.78)} 0%, ${alpha('#000', 0.45)} 55%, ${alpha('#000', 0.1)} 100%)`
                    : `linear-gradient(100deg, ${alpha('#fff', 0.92)} 0%, ${alpha('#fff', 0.65)} 55%, ${alpha('#fff', 0)} 100%)`,
                }}
              />
              <Box sx={{ position: 'relative', p: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
                >
                  Painel de desenvolvimento
                </Typography>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
                >
                  Área Dev
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 480 }}>
                  Ferramentas internas, diagnósticos e integrações. Acesso restrito ao desenvolvedor.
                </Typography>
              </Box>
            </Paper>
          </Reveal>

          <Reveal>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Integração MK Solutions
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                }}
              >
                {MK_CARDS.map((c) => (
                  <NavCard
                    key={c.to}
                    to={c.to}
                    accent={c.accent}
                    icon={c.icon}
                    title={c.title}
                    description={c.description}
                  />
                ))}
              </Box>
            </Box>
          </Reveal>

          <Divider />

          <Reveal>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Monitoramento
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                }}
              >
                {MONITOR_CARDS.map((c) => (
                  <NavCard
                    key={c.to}
                    to={c.to}
                    accent={c.accent}
                    icon={c.icon}
                    title={c.title}
                    description={c.description}
                  />
                ))}
              </Box>
            </Box>
          </Reveal>

          <Divider />

          <Reveal>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Ferramentas e Sistema
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
                }}
              >
                {TOOL_CARDS.map((c) => (
                  <NavCard
                    key={c.to}
                    to={c.to}
                    accent={c.accent}
                    icon={c.icon}
                    title={c.title}
                    description={c.description}
                  />
                ))}
              </Box>
            </Box>
          </Reveal>

        </Box>
      </Container>
    </Box>
  )
}
