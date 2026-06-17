import type { ReactNode } from 'react'
import { Typography } from '@mui/material'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

const BLUE = '#3b82f6'

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

const TvIcon = () => (
  <Lucide>
    <path d="m17 2-5 5-5-5" />
    <rect width="20" height="15" x="2" y="7" rx="2" />
  </Lucide>
)

const FactoryIcon = () => (
  <Lucide>
    <path d="M12 16h.01" />
    <path d="M16 16h.01" />
    <path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
    <path d="M8 16h.01" />
  </Lucide>
)

const SECTIONS: HubSection[] = [
  {
    title: 'Roku TV Express',
    accent: BLUE,
    items: [
      {
        label: 'Roku TV — Padrão',
        to: '/gerar-os?demanda=midia-tv-cadastro&slug=midia-roku-padrao',
        description: 'Cliente solicita por telefone ou WhatsApp a compra do Roku TV.',
        icon: <TvIcon />,
        badgeLabel: 'Remoto',
      },
      {
        label: 'Roku TV — Presencial',
        to: '/gerar-os?demanda=midia-tv-cadastro&slug=midia-roku-presencial',
        description: 'Cliente comparece à loja para comprar o Roku TV.',
        icon: <FactoryIcon />,
        badgeLabel: 'Loja',
      },
    ],
  },
]

export function CadastroMidiaTvHubPage() {
  return (
    <HubCatalog
      overline="Demandas · Cadastro"
      title="Conversores / TV"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Selecione o tipo de venda do Roku TV para gerar a O.S correspondente.
        </Typography>
      }
      illustration="tv"
      illustrationAlt="Conversores de mídia e TV"
      toolbarLabel="Tipos de venda"
      backTo="/cadastro"
      backLabel="Hub de cadastro"
      sections={SECTIONS}
    />
  )
}
