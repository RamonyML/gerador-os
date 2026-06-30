import { Box, Container, Divider, Typography } from '@mui/material'
import { ILLUSTRATIONS } from '../data/illustrations'
import ApiOutlinedIcon from '@mui/icons-material/ApiOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined'
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'

const INTEGRATION_CARDS = [
  {
    to: '/dev/mk',
    accent: '#0ea5e9',
    icon: <ApiOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'MK Solutions',
    description: 'Integração REST com a API MK Solutions — testes, status, códigos de referência e funções em nuvem.',
  },
  {
    to: '/dev/logs',
    accent: '#f97316',
    icon: <RadarOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Sentry',
    description: 'Monitoramento e Log\'s — Logs, erros e alertas do sistema capturados em produção via Sentry. Inclui ferramentas de teste de captura.',
  },
  {
    to: '/dev/health',
    accent: '#10b981',
    icon: <NetworkCheckOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Health Check',
    description: 'Estado dos serviços em tempo real — Firestore, Auth, API MK Solutions e Sentry.',
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

export function DevHomePage() {
  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

          <Reveal>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: { xs: 2, md: 3 },
              }}
            >
              <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
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
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                  Ferramentas internas, diagnósticos e integrações.<br />
                  Acesso restrito ao desenvolvedor.
                </Typography>
              </Box>

              <Box
                component="img"
                src={ILLUSTRATIONS.dev}
                alt="Área Dev"
                sx={{
                  width: '100%',
                  maxWidth: 680,
                  flexShrink: 0,
                  display: { xs: 'none', md: 'block' },
                  borderRadius: 2,
                }}
              />
            </Box>
          </Reveal>

          <Reveal>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Integrações
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                }}
              >
                {INTEGRATION_CARDS.map((c) => (
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
