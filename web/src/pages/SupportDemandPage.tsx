import { useMemo } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, Container, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useAuth } from '../contexts/AuthContext'
import { useOsTemplates } from '../hooks/useOsTemplates'
import {
  SUPPORT_DEMANDS,
  isKnownDemandCategory,
  templatesMatchingDemand,
} from '../data/supportDemands'
import { accentHexForSupportDemandSlot } from '../data/supportCardSwatches'
import { AppPageChrome } from '../components/AppPageChrome'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'

export function SupportDemandPage() {
  const { demandId } = useParams<{ demandId: string }>()
  const { profile } = useAuth()
  const state = useOsTemplates(profile)
  const navigate = useNavigate()

  const slotIndex = useMemo(
    () => SUPPORT_DEMANDS.findIndex((d) => d.id === demandId),
    [demandId],
  )
  const meta = slotIndex >= 0 ? SUPPORT_DEMANDS[slotIndex] : undefined
  const accent = accentHexForSupportDemandSlot(slotIndex < 0 ? 0 : slotIndex)

  const templates = state.status === 'ready' ? state.templates : []
  const list = useMemo(
    () =>
      demandId && isKnownDemandCategory(demandId)
        ? templatesMatchingDemand(templates, demandId)
        : [],
    [templates, demandId],
  )

  if (!demandId || !isKnownDemandCategory(demandId)) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="warning">Categoria não encontrada.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/suporte')}>
          Voltar ao Suporte
        </Button>
      </Container>
    )
  }

  const Icon = meta?.Icon

  return (
    <AppPageChrome
      overline="Demandas · Suporte"
      title={meta?.title ?? demandId}
      subtitle={
        meta?.description ? (
          <Typography variant="body1" color="text.secondary">
            {meta.description}
          </Typography>
        ) : undefined
      }
      accentColor={accent}
      headerRight={
        <Button
          component={RouterLink}
          to="/suporte"
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ borderColor: 'divider' }}
        >
          Todas as categorias
        </Button>
      }
    >
      {state.status === 'loading' ? (
        <Typography color="text.secondary">Carregando…</Typography>
      ) : null}
      {state.status === 'error' ? <Alert severity="error">{state.message}</Alert> : null}

      {state.status === 'ready' && list.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Nenhum fluxo nesta categoria no momento. Use o gerador geral ou peça inclusão de novos
          fluxos à equipe técnica.
        </Alert>
      ) : null}

      {list.length > 0 ? (
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
          {list.map((t, index) => (
            <Reveal key={t.id} delay={index * 60} sx={{ height: '100%' }}>
              <NavCard
                to={`/gerar-os?demanda=${demandId}&tpl=${encodeURIComponent(t.id)}`}
                accent={accent}
                icon={Icon ? <Icon sx={{ fontSize: 26 }} /> : <span />}
                title={t.title}
                description={`v${t.version} · ${t.slug}`}
              />
            </Reveal>
          ))}
        </Box>
      ) : null}

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/gerar-os?demanda=${demandId}`)}
        >
          Abrir gerador só com filtro desta categoria
        </Button>
      </Box>
    </AppPageChrome>
  )
}
