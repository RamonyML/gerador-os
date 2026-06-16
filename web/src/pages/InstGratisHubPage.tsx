import type { ReactNode } from 'react'
import { Typography } from '@mui/material'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

const GREEN = '#2e7d32'
const TEAL = '#0d9488'

function Lucide({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const HomeIcon = () => (
  <Lucide>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Lucide>
)

const BuildingIcon = () => (
  <Lucide>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </Lucide>
)

const SECTIONS: HubSection[] = [
  {
    title: 'Pessoa Física (Residencial)',
    accent: GREEN,
    items: [
      {
        label: 'Residencial — PF',
        to: '/gerar-os?demanda=instalacao-gratis&slug=inst-gratis-residencial',
        description:
          'Titular solicita e acompanha, titular autoriza terceiro, ou terceiro solicita. Todas as variantes em um só formulário.',
        icon: <HomeIcon />,
        badgeLabel: '4 variantes',
      },
    ],
  },
  {
    title: 'Pessoa Jurídica (Empresarial)',
    accent: TEAL,
    items: [
      {
        label: 'Empresarial — PJ',
        to: '/gerar-os?demanda=instalacao-gratis&slug=inst-gratis-empresarial',
        description:
          'Proprietário da empresa assina o contrato e autoriza um representante a acompanhar a instalação.',
        icon: <BuildingIcon />,
        badgeLabel: 'PJ',
      },
    ],
  },
]

export function InstGratisHubPage() {
  return (
    <HubCatalog
      overline="Demandas · Cadastro"
      title="Instalação grátis"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Novos contratos sem taxa de instalação/ativação. Equipamentos em regime de comodato.
        </Typography>
      }
      illustration="instGratis"
      illustrationAlt="Instalação grátis"
      toolbarLabel="Tipos de instalação"
      backTo="/cadastro"
      backLabel="Hub de cadastro"
      sections={SECTIONS}
    />
  )
}
