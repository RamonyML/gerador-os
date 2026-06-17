import { Box, Chip, Container, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useColorMode } from '../contexts/ColorModeContext'
import { HeroIllustration } from '../components/HeroIllustration'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'
import { ILLUSTRATIONS } from '../data/illustrations'
import HomeRepairServiceOutlinedIcon from '@mui/icons-material/HomeRepairServiceOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined'

const BLUE = '#1565c0'
const TEAL = '#00695c'
const PURPLE = '#6a1b9a'

export function EncerramentosInstHubPage() {
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
                  Instalação › Encerramentos
                </Typography>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
                >
                  Encerramentos de O.S
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
                  Selecione o tipo de instalação para preencher o formulário de encerramento e gerar
                  o texto final da O.S.
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
                <HeroIllustration src={ILLUSTRATIONS.operations} alt="Encerramentos" />
              </Box>
            </Box>
          </Reveal>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Tipos de encerramento
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              }}
            >
              <NavCard
                to="/gerar-os?slug=ence-padrao-casa&demanda=encerramentos-instalacao"
                accent={BLUE}
                icon={<HomeRepairServiceOutlinedIcon sx={{ fontSize: 26 }} />}
                title="Padrão Casa"
                description="Encerramento residencial: ONU, Roteador ou ONT, testes, cobertura e pagamento."
                badge={
                  <Chip
                    size="small"
                    label="Residencial"
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
              <NavCard
                to="/gerar-os?slug=ence-padrao-casa-extend&demanda=encerramentos-instalacao"
                accent={PURPLE}
                icon={<RouterOutlinedIcon sx={{ fontSize: 26 }} />}
                title="Wi-Fi Extend"
                description="Encerramento com pontos de extensão Wi-Fi: ponto primário e até 3 pontos adicionais."
                badge={
                  <Chip
                    size="small"
                    label="Multi-ponto"
                    sx={{
                      height: 24,
                      fontWeight: 600,
                      bgcolor: alpha(PURPLE, mode === 'dark' ? 0.2 : 0.1),
                      color: PURPLE,
                      border: 'none',
                    }}
                  />
                }
              />
              <NavCard
                to="/gerar-os?slug=ence-padrao-empresa&demanda=encerramentos-instalacao"
                accent={TEAL}
                icon={<BusinessOutlinedIcon sx={{ fontSize: 26 }} />}
                title="Padrão Empresa"
                description="Encerramento empresarial: mesma estrutura do residencial com cabeçalho de empresa."
                badge={
                  <Chip
                    size="small"
                    label="Empresarial"
                    sx={{
                      height: 24,
                      fontWeight: 600,
                      bgcolor: alpha(TEAL, mode === 'dark' ? 0.2 : 0.1),
                      color: TEAL,
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
