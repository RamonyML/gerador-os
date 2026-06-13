import { Chip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import SettingsInputAntennaOutlinedIcon from '@mui/icons-material/SettingsInputAntennaOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

const ICON_SX = { fontSize: 26 } as const

export function MudancaEnderecoHubPage() {
  const theme = useTheme()
  const success = theme.palette.success.main
  const error = theme.palette.error.main

  const sections: HubSection[] = [
    {
      title: 'Padrão',
      items: [
        {
          label: 'Mud End padrão',
          to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-padrao',
          description: 'Fluxo padrão para mudança de endereço.',
          icon: <HomeWorkOutlinedIcon sx={ICON_SX} />,
          badge: (
            <Chip
              size="small"
              label="Recomendado"
              sx={{
                height: 24,
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12),
                color: 'primary.main',
              }}
            />
          ),
        },
        {
          label: 'Mud End buscando equipamentos',
          to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-buscar-equipamentos',
          description: 'Inclui retirada e entrega de equipamentos no novo endereço.',
          icon: <Inventory2OutlinedIcon sx={ICON_SX} />,
        },
        {
          label: 'Mud End com fibra MZnet',
          to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-com-fibra',
          description: 'Mudança de endereço para locais com fibra MZnet.',
          icon: <SettingsInputAntennaOutlinedIcon sx={ICON_SX} />,
        },
        {
          label: 'Mud End sem viabilidade',
          to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-inviabilidade',
          description: 'Para casos em que não há viabilidade técnica no novo endereço.',
          icon: <ReportProblemOutlinedIcon sx={ICON_SX} />,
          accent: error,
        },
      ],
    },
    {
      title: 'Renovando Fidelidade',
      accent: success,
      items: [
        {
          label: 'Mud End + Alt Plano pago',
          to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-altplan-pago',
          description: 'Mudança de endereço renovando fidelidade, com visita paga.',
          icon: <PaymentsOutlinedIcon sx={ICON_SX} />,
        },
        {
          label: 'Mud End + Alt Plano isento (proposta)',
          to: '/gerar-os?demanda=mudanca-endereco&slug=mud-end-altplan-proposta',
          description: 'Mudança com proposta de alteração de plano isenta.',
          icon: <DescriptionOutlinedIcon sx={ICON_SX} />,
        },
      ],
    },
  ]

  return (
    <HubCatalog
      overline="Demandas · Suporte"
      title="Mudança de endereço"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Selecione o tipo de mudança para gerar a O.S. Cada fluxo abre o gerador já com o modelo
          correspondente e suas variações de titular e terceiro.
        </Typography>
      }
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={sections}
    />
  )
}
