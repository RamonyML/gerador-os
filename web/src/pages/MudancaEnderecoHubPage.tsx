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

type FluxoItem = {
  label: string
  to: string
  primary?: boolean
  danger?: boolean
}

const PADRAO: FluxoItem[] = [
  {
    label: 'Mud End padrão',
    to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-padrao',
    primary: true,
  },
  {
    label: 'Mud End buscando equipamentos',
    to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-buscar-equipamentos',
    primary: true,
  },
  {
    label: 'Mud End com fibra MZnet',
    to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-com-fibra',
    primary: true,
  },
  {
    label: 'Mud End sem viabilidade',
    to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-inviabilidade',
    danger: true,
  },
]

const RENOVANDO: FluxoItem[] = [
  {
    label: 'Mud End + Alt Plano pago',
    to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-altplan-pago',
    primary: true,
  },
  {
    label: 'Mud End + Alt Plano isento (proposta)',
    to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-altplan-proposta',
    primary: true,
  },
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
              variant={item.primary || item.danger ? 'contained' : 'outlined'}
              color={item.danger ? 'error' : item.primary ? 'primary' : 'inherit'}
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

export function MudancaEnderecoHubPage() {
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
        Mudança de endereço
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Selecione o tipo de mudança (espelho do hub legado). O fluxo{' '}
        <strong>Mud End padrão</strong> abre o gerador já com o modelo{' '}
        <code>mud-end-padrao</code>; os demais levam à lista de modelos até
        migrarmos cada HTML.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <FluxoColumn title="Padrão" accent="primary" items={PADRAO} />
        <FluxoColumn
          title="Renovando Fidelidade"
          accent="success"
          items={RENOVANDO}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Link
          component={RouterLink}
          to="/suporte/demanda/mudanca-endereco"
          underline="hover"
        >
          Ver todos os modelos desta categoria
        </Link>
      </Box>
    </Container>
  )
}
