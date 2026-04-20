import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { useOsTemplates } from '../hooks/useOsTemplates'
import { accentHexForSupportDemandSlot } from '../data/supportCardSwatches'
import {
  SUPPORT_DEMANDS,
  templatesMatchingDemand,
} from '../data/supportDemands'
import { SupportHubHeroIllustration } from '../components/SupportHubHeroIllustration'

export function SupportHomePage() {
  const theme = useTheme()
  const { mode } = useColorMode()
  const { profile } = useAuth()
  const state = useOsTemplates(profile)
  const navigate = useNavigate()
  const primary = theme.palette.primary.main

  const templates = state.status === 'ready' ? state.templates : []

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of SUPPORT_DEMANDS) {
      m.set(d.id, templatesMatchingDemand(templates, d.id).length)
    }
    return m
  }, [templates])

  const heroGradient =
    mode === 'light'
      ? `linear-gradient(135deg, ${alpha(primary, 0.12)} 0%, ${alpha(primary, 0.03)} 45%, transparent 100%)`
      : `linear-gradient(135deg, ${alpha(primary, 0.2)} 0%, ${alpha('#000', 0.12)} 48%, transparent 100%)`

  const totalModelos =
    state.status === 'ready'
      ? templates.length
      : null

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        background: heroGradient,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                Hub de suporte
              </Typography>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
              >
                Demandas por categoria
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
                Escolha o tipo de demanda para acessar os modelos de O.S. alinhados à sua operação. Os
                números indicam quantos fluxos ativos existem no Firestore em cada categoria.
              </Typography>
              {totalModelos !== null ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {totalModelos} modelo{totalModelos === 1 ? '' : 's'} no projeto
                </Typography>
              ) : null}
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
              <SupportHubHeroIllustration accent={primary} />
            </Box>
          </Box>

          {state.status === 'loading' ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2,
                px: 2,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CircularProgress size={22} thickness={5} />
              <Typography variant="body2" color="text.secondary">
                Carregando modelos do Firestore…
              </Typography>
            </Box>
          ) : null}

          {state.status === 'error' ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {state.message}
            </Alert>
          ) : null}

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Categorias
            </Typography>
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
              {SUPPORT_DEMANDS.map((d, slotIndex) => {
                const n = counts.get(d.id) ?? 0
                const Icon = d.Icon
                const accentMain = accentHexForSupportDemandSlot(slotIndex)
                const iconBg = alpha(accentMain, mode === 'dark' ? 0.22 : 0.14)

                const go = () =>
                  navigate(
                    d.id === 'alteracao-plano'
                      ? '/suporte/alteracao-plano'
                      : `/suporte/demanda/${d.id}`,
                  )

                return (
                  <Paper
                    key={d.id}
                    elevation={0}
                    onClick={() => go()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        go()
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: 1,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      bgcolor: 'background.paper',
                      transition:
                        'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
                      '&:hover': {
                        borderColor: alpha(accentMain, 0.55),
                        boxShadow:
                          mode === 'light'
                            ? `0 12px 32px ${alpha(accentMain, 0.14)}`
                            : '0 12px 32px rgba(0,0,0,0.35)',
                        transform: 'translateY(-2px)',
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${accentMain}`,
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          bgcolor: iconBg,
                          color: accentMain,
                        }}
                      >
                        <Icon sx={{ fontSize: 26 }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {d.title}
                          </Typography>
                          <ArrowForwardRoundedIcon
                            sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0, mt: 0.25 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          {d.description}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${n} modelo${n === 1 ? '' : 's'}`}
                          sx={{
                            mt: 1.5,
                            height: 24,
                            fontWeight: 600,
                            bgcolor: alpha(accentMain, mode === 'dark' ? 0.2 : 0.1),
                            color: accentMain,
                            border: 'none',
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                )
              })}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
