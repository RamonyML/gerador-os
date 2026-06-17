import { Box, Chip, Container, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useColorMode } from '../contexts/ColorModeContext'
import { HeroIllustration } from '../components/HeroIllustration'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'
import { ILLUSTRATIONS } from '../data/illustrations'
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import TvOutlinedIcon from '@mui/icons-material/TvOutlined'

const GREEN = '#2e7d32'
const AMBER = '#d97706'
const BLUE = '#3b82f6'

export function CadastroHomePage() {
  const { mode } = useColorMode()

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
                  Hub de cadastro
                </Typography>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
                >
                  Demandas de instalação
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
                  Registre novos contratos residenciais e empresariais. Selecione o tipo de
                  instalação para acessar os fluxos de O.S com todas as variantes.
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
                <HeroIllustration src={ILLUSTRATIONS.cadastro} alt="Cadastro" />
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
                to="/cadastro/instalacao-gratis"
                accent={GREEN}
                icon={<CardGiftcardOutlinedIcon sx={{ fontSize: 26 }} />}
                title="Instalação grátis"
                description="Residencial e empresarial sem taxa de instalação/ativação. Inclui variantes com terceiro acompanhante."
                badge={
                  <Chip
                    size="small"
                    label="4 var. PF + PJ"
                    sx={{
                      height: 24,
                      fontWeight: 600,
                      bgcolor: alpha(GREEN, mode === 'dark' ? 0.2 : 0.1),
                      color: GREEN,
                      border: 'none',
                    }}
                  />
                }
              />
              <NavCard
                to="/cadastro/instalacao-taxa"
                accent={AMBER}
                icon={<PaymentOutlinedIcon sx={{ fontSize: 26 }} />}
                title="Instalação com taxa"
                description="Residencial e empresarial com taxa de instalação/ativação já paga. Forma de pagamento registrada na O.S."
                badge={
                  <Chip
                    size="small"
                    label="4 var. PF + PJ"
                    sx={{
                      height: 24,
                      fontWeight: 600,
                      bgcolor: alpha(AMBER, mode === 'dark' ? 0.2 : 0.1),
                      color: AMBER,
                      border: 'none',
                    }}
                  />
                }
              />
              <NavCard
                to="/cadastro/midia-tv"
                accent={BLUE}
                icon={<TvOutlinedIcon sx={{ fontSize: 26 }} />}
                title="Roku TV"
                description="Venda do conversor Roku TV Express. Atendimento remoto ou presencial na loja."
                badge={
                  <Chip
                    size="small"
                    label="2 variantes"
                    sx={{
                      height: 24,
                      fontWeight: 600,
                      bgcolor: alpha(BLUE, mode === 'dark' ? 0.2 : 0.1),
                      color: BLUE,
                      border: 'none',
                    }}
                  />
                }
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
