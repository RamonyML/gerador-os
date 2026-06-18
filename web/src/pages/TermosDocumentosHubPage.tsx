import { Typography } from '@mui/material'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

const ICON_SX = { fontSize: 26 } as const
const AMBER = '#d97706'

const SECTIONS: HubSection[] = [
  {
    title: 'Padrão',
    accent: AMBER,
    items: [
      {
        label: 'Termo de responsabilidade — Padrão',
        to: '/gerar-os?demanda=termo-docs&slug=termo-resp-padrao',
        description:
          'Formalização de acesso administrativo ao roteador emprestado em comodato.',
        icon: <VerifiedUserOutlinedIcon sx={ICON_SX} />,
        badgeLabel: 'Termo + Protocolo',
      },
    ],
  },
]

export function TermosDocumentosHubPage() {
  return (
    <HubCatalog
      overline="Demandas · Suporte"
      title="Termo de responsabilidade"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Termo de responsabilidade de acesso ao roteador emprestado em comodato pela MZ NET.
        </Typography>
      }
      illustration="responsabilidade"
      illustrationAlt="Termo de responsabilidade de comodato"
      toolbarLabel="Modelos disponíveis"
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={SECTIONS}
    />
  )
}
