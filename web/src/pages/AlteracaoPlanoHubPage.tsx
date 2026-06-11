import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

type FluxoItem = { label: string; to: string; primary?: boolean }

const PADRAO: FluxoItem[] = [
  {
    label: 'Remoto (titular / terceiro / PJ)',
    to: '/gerar-os?demanda=alteracao-plano&slug=altplan-remoto',
    primary: true,
  },
  {
    label: 'Presencial (titular / terceiro)',
    to: '/gerar-os?demanda=alteracao-plano&slug=altplan-presencial',
    primary: true,
  },
  {
    label: 'Sem troca: isento',
    to: '/gerar-os?demanda=alteracao-plano&slug=altplan-sem-troca-visita-isenta',
    primary: true,
  },
  {
    label: 'Sem troca: pago',
    to: '/gerar-os?demanda=alteracao-plano&slug=altplan-sem-troca-visita-paga',
    primary: true,
  },
  {
    label: 'Com troca: isento',
    to: '/gerar-os?demanda=alteracao-plano&slug=altplan-troca-visita-isenta',
    primary: true,
  },
  {
    label: 'Com troca: pago',
    to: '/gerar-os?demanda=alteracao-plano&slug=altplan-troca-visita-paga',
    primary: true,
  },
]

const OFERTADO: FluxoItem[] = [
  { label: 'Remoto', to: '/suporte/demanda/alteracao-plano' },
  { label: 'Sem troca: isento', to: '/suporte/demanda/alteracao-plano' },
  { label: 'Sem troca: pago', to: '/suporte/demanda/alteracao-plano' },
  { label: 'Com troca: isento', to: '/suporte/demanda/alteracao-plano' },
  { label: 'Com troca: pago', to: '/suporte/demanda/alteracao-plano' },
]

function FluxoColumn({
  title,
  accent,
  items,
}: {
  title: string
  accent: 'primary' | 'success'
  items: FluxoItem[]
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 2,
            color: `${accent}.main`,
          }}
        >
          {title}
        </Typography>
        <Stack spacing={1}>
          {items.map((item) => (
            <Button
              key={item.label}
              component={RouterLink}
              to={item.to}
              variant={item.primary ? 'contained' : 'outlined'}
              color={item.primary ? 'primary' : 'inherit'}
              fullWidth
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

export function AlteracaoPlanoHubPage() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/suporte')}
        sx={{ mb: 2 }}
      >
        Todas as demandas
      </Button>

      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Alteração de plano
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Escolha o tipo de alteração (espelho do hub legado). Os fluxos{' '}
        <strong>Remoto</strong> e <strong>Presencial</strong> abrem o gerador já
        no formulário (variações de titular, terceiro e PJ no próprio modelo); os
        demais levam à lista de modelos até migrarmos cada HTML.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <FluxoColumn title="Padrão" accent="primary" items={PADRAO} />
        <FluxoColumn title="Ofertado" accent="success" items={OFERTADO} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Link component={RouterLink} to="/suporte/demanda/alteracao-plano" underline="hover">
          Ver todos os modelos desta categoria
        </Link>
      </Box>
    </Container>
  )
}
