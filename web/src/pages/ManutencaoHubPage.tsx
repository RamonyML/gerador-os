import { Link as RouterLink } from 'react-router-dom'
import { Chip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

const ICON_SX = { fontSize: 26 } as const

export function ManutencaoHubPage() {
  const theme = useTheme()

  const sections: HubSection[] = [
    {
      title: 'Luz vermelha / PON piscando',
      items: [
        {
          label: 'Luz Vermelha / PON',
          to: '/gerar-os?demanda=manutencao&slug=manut-luz-vermelha',
          description:
            'Visita técnica para luz vermelha / PON piscando. Inclui titular e as variações de terceiro.',
          icon: <WbIncandescentOutlinedIcon sx={ICON_SX} />,
          badge: (
            <Chip
              size="small"
              label="Solicitação padrão"
              sx={{
                height: 24,
                bgcolor: alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.2 : 0.12,
                ),
                color: 'primary.main',
              }}
            />
          ),
        },
      ],
    },
  ]

  return (
    <HubCatalog
      overline="Demandas · Suporte"
      title="Manutenção"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Selecione o tipo de manutenção para gerar a O.S. Cada fluxo abre o gerador já com o
          modelo correspondente e suas variações de titular e terceiro.
        </Typography>
      }
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={sections}
      footer={
        <Chip
          component={RouterLink}
          to="/suporte/demanda/manutencao"
          clickable
          variant="outlined"
          label="Ver todos os modelos desta categoria"
          sx={{ alignSelf: 'flex-start' }}
        />
      }
    />
  )
}
