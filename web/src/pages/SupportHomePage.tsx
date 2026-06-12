import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { useOsTemplates } from '../hooks/useOsTemplates'
import { accentHexForSupportDemandSlot } from '../data/supportCardSwatches'
import {
  SUPPORT_DEMANDS,
  templatesMatchingDemand,
} from '../data/supportDemands'
import { HeroIllustration } from '../components/HeroIllustration'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'
import { ILLUSTRATIONS } from '../data/illustrations'

export function SupportHomePage() {
  const theme = useTheme()
  const { mode } = useColorMode()
  const { profile } = useAuth()
  const state = useOsTemplates(profile)
  const primary = theme.palette.primary.main
  const [categoriesEntered, setCategoriesEntered] = useState(false)

  useEffect(() => {
    if (state.status === 'loading') {
      setCategoriesEntered(false)
      return
    }
    const id = requestAnimationFrame(() => setCategoriesEntered(true))
    return () => cancelAnimationFrame(id)
  }, [state.status])

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
                Escolha o tipo de demanda para acessar os fluxos de O.S. alinhados à sua operação. Os
                números indicam quantos fluxos existem em cada categoria.
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
              <HeroIllustration src={ILLUSTRATIONS.support} alt="Suporte" />
            </Box>
          </Box>
          </Reveal>

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
                Carregando fluxos…
              </Typography>
            </Box>
          ) : null}

          {state.status === 'error' ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {state.message}
            </Alert>
          ) : null}

          {state.status !== 'loading' ? (
          <Box
            sx={{
              opacity: categoriesEntered ? 1 : 0,
              transform: categoriesEntered ? 'translateY(0)' : 'translateY(-14px)',
              transition:
                'opacity 0.58s cubic-bezier(0.22, 1, 0.36, 1), transform 0.58s cubic-bezier(0.22, 1, 0.36, 1)',
              '@media (prefers-reduced-motion: reduce)': {
                opacity: 1,
                transform: 'none',
                transition: 'none',
              },
            }}
          >
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

                const hubRoute: Record<string, string> = {
                  'alteracao-plano': '/suporte/alteracao-plano',
                  'mudanca-endereco': '/suporte/mudanca-endereco',
                  manutencao: '/suporte/manutencao',
                }
                const to = hubRoute[d.id] ?? `/suporte/demanda/${d.id}`

                return (
                  <NavCard
                    key={d.id}
                    to={to}
                    accent={accentMain}
                    icon={<Icon sx={{ fontSize: 26 }} />}
                    title={d.title}
                    description={d.description}
                    badge={
                      <Chip
                        size="small"
                        label={`${n} modelo${n === 1 ? '' : 's'}`}
                        sx={{
                          height: 24,
                          fontWeight: 600,
                          bgcolor: alpha(accentMain, mode === 'dark' ? 0.2 : 0.1),
                          color: accentMain,
                          border: 'none',
                        }}
                      />
                    }
                  />
                )
              })}
            </Box>
          </Box>
          ) : null}
        </Box>
      </Container>
    </Box>
  )
}
