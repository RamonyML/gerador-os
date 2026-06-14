import { Typography } from '@mui/material'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

const ICON_SX = { fontSize: 26 } as const
const AMBER = '#d97706'

const SECTIONS: HubSection[] = [
  {
    title: 'Responsabilidade',
    accent: AMBER,
    items: [
      {
        label: 'Termo de responsabilidade — Padrão',
        to: '/gerar-os?demanda=termo-docs&slug=termo-resp-padrao',
        description:
          'Formalização de acesso administrativo ao roteador em comodato do cliente.',
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
      title="Termos e documentos"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Textos formais e termos de responsabilidade para registrar aceite do cliente.
        </Typography>
      }
      illustration="contracts"
      illustrationAlt="Termos e documentos formais"
      toolbarLabel="Tipos de documento"
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={SECTIONS}
    />
  )
}
