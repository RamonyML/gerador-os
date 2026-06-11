import { useMemo } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useAuth } from '../contexts/AuthContext'
import { useOsTemplates } from '../hooks/useOsTemplates'
import {
  SUPPORT_DEMANDS,
  isKnownDemandCategory,
  templatesMatchingDemand,
} from '../data/supportDemands'

export function SupportDemandPage() {
  const { demandId } = useParams<{ demandId: string }>()
  const { profile } = useAuth()
  const state = useOsTemplates(profile)
  const navigate = useNavigate()

  const meta = useMemo(
    () => SUPPORT_DEMANDS.find((d) => d.id === demandId),
    [demandId],
  )

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

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/suporte"
          underline="hover"
          color="primary"
        >
          Suporte
        </Link>
        <Typography color="text.primary">{meta?.title ?? demandId}</Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/suporte')}
        sx={{ mb: 2 }}
      >
        Todas as demandas
      </Button>

      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        {meta?.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {meta?.description}
      </Typography>

      {state.status === 'loading' ? (
        <Typography color="text.secondary">Carregando…</Typography>
      ) : null}
      {state.status === 'error' ? (
        <Alert severity="error">{state.message}</Alert>
      ) : null}

      {state.status === 'ready' && list.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nenhum fluxo nesta categoria no momento. Use o gerador geral ou peça
          inclusão de novos fluxos à equipe técnica.
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        {list.map((t) => (
          <Card key={t.id} variant="outlined">
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                py: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  v{t.version} · {t.slug}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="medium"
                endIcon={<OpenInNewIcon />}
                onClick={() =>
                  navigate(`/gerar-os?demanda=${demandId}&tpl=${encodeURIComponent(t.id)}`)
                }
              >
                Abrir gerador
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/gerar-os?demanda=${demandId}`)}
        >
          Abrir gerador só com filtro desta categoria
        </Button>
      </Box>
    </Container>
  )
}
