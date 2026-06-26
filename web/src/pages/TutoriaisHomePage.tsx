import { Box, Button, Container, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import { useNavigate } from 'react-router-dom'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'
import { HeroIllustration } from '../components/HeroIllustration'
import { ILLUSTRATIONS } from '../data/illustrations'
import { useColorMode } from '../contexts/ColorModeContext'

export function TutoriaisHomePage() {
  const { isDark } = useColorMode()
  const navigate = useNavigate()
  const accent = '#0ea5e9'

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Reveal>
            <Box>
              <Button
                size="small"
                startIcon={<ArrowBackOutlinedIcon />}
                onClick={() => navigate('/suporte')}
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                Hub de suporte
              </Button>

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
                    Suporte
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
                  >
                    Tutoriais
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
                    Guias passo a passo para situações de suporte técnico de campo.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    maxWidth: { xs: 360, md: 420 },
                    flexShrink: 0,
                    ml: { md: 2 },
                    opacity: { xs: 0.95, md: 1 },
                    filter:
                      isDark
                        ? `drop-shadow(0 10px 30px ${alpha('#000', 0.35)})`
                        : undefined,
                  }}
                >
                  <HeroIllustration src={ILLUSTRATIONS.tutoriais} alt="Tutoriais" />
                </Box>
              </Box>
            </Box>
          </Reveal>

          <Reveal>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0 }}>
              Tutoriais disponíveis
            </Typography>
          </Reveal>

          <Reveal>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
              }}
            >
              <NavCard
                to="/suporte/tutoriais/roteador-resetado"
                accent={accent}
                icon={<RouterOutlinedIcon sx={{ fontSize: 26 }} />}
                title="Roteador Resetado"
                description="Reconfiguração passo a passo após reset de fábrica: AX2, Greatek V1/V2, ZTE H199-A."
              />
            </Box>
          </Reveal>
        </Box>
      </Container>
    </Box>
  )
}
