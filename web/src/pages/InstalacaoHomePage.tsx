import { Box, Container, Typography } from '@mui/material'
import { HeroIllustration } from '../components/HeroIllustration'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'
import { ILLUSTRATIONS } from '../data/illustrations'
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined'

const BLUE = '#1565c0'

export function InstalacaoHomePage() {
  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Reveal>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'flex-start', sm: 'flex-start' },
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ minWidth: 0, flex: '1 1 520px' }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
                >
                  Hub de instalação
                </Typography>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
                >
                  Setor de instalação
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
                  Ferramentas do setor de instalação. Acesse os formulários de encerramento de O.S
                  para registrar padrão casa, empresa e Wi-Fi Extend.
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { xs: 360, md: 420 },
                  flexShrink: 0,
                  ml: { md: 2 },
                }}
              >
                <HeroIllustration src={ILLUSTRATIONS.fiber} alt="Instalação" />
              </Box>
            </Box>
          </Reveal>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Categorias
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              }}
            >
              <NavCard
                to="/instalacao/encerramentos"
                accent={BLUE}
                icon={<ChecklistRtlOutlinedIcon sx={{ fontSize: 26 }} />}
                title="Encerramentos de O.S"
                description="Formulários de encerramento para ordens de serviço de instalação: Padrão Casa, Wi-Fi Extend e Padrão Empresa."
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
