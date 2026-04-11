import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Typography,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { useOsTemplates } from '../hooks/useOsTemplates'
import {
  SUPPORT_DEMANDS,
  templatesMatchingDemand,
} from '../data/supportDemands'

export function SupportHomePage() {
  const { profile } = useAuth()
  const state = useOsTemplates(profile)
  const navigate = useNavigate()

  const templates = state.status === 'ready' ? state.templates : []

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of SUPPORT_DEMANDS) {
      m.set(d.id, templatesMatchingDemand(templates, d.id).length)
    }
    return m
  }, [templates])

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Suporte
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        Escolha o tipo de demanda para ver os modelos de O.S disponíveis. Os números
        indicam quantos fluxos ativos existem no Firestore para cada categoria.
      </Typography>

      {state.status === 'loading' ? (
        <Typography color="text.secondary">Carregando modelos…</Typography>
      ) : null}

      {state.status === 'error' ? (
        <Typography color="error">{state.message}</Typography>
      ) : null}

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
        {SUPPORT_DEMANDS.map((d) => {
          const n = counts.get(d.id) ?? 0
          const Icon = d.Icon
          return (
            <Card
              key={d.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 2,
                },
              }}
            >
              <CardActionArea onClick={() => navigate(`/suporte/demanda/${d.id}`)}>
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                      bgcolor: `${d.accent}.main`,
                      color: (theme) =>
                        theme.palette.getContrastText(
                          theme.palette[d.accent].main,
                        ),
                    }}
                  >
                    <Icon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {d.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {d.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ mt: 1, display: 'block', fontWeight: 600 }}
                  >
                    {n} modelo{n === 1 ? '' : 's'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>
    </Container>
  )
}
