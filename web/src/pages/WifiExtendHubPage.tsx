import type { ReactNode } from 'react'
import { Typography } from '@mui/material'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

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

const WifiIcon = () => (
  <Lucide>
    <path d="M12 20h.01" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M5 12.859a10 10 0 0 1 14 0" />
    <path d="M8.5 16.429a5 5 0 0 1 7 0" />
  </Lucide>
)

const RouterIcon = () => (
  <Lucide>
    <rect width="20" height="8" x="2" y="14" rx="2" />
    <path d="M6.01 18H6" />
    <path d="M10.01 18H10" />
    <path d="M15 10v4" />
    <path d="M17.84 7.17a4 4 0 0 0-5.66 0" />
    <path d="M20.66 4.34a8 8 0 0 0-11.31 0" />
  </Lucide>
)

const PlusIcon = () => (
  <Lucide>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Lucide>
)

const SECTIONS: HubSection[] = [
  {
    title: 'Wi-Fi Extend / Mesh',
    accent: TEAL,
    items: [
      {
        label: 'Wi-Fi Extend — ZTE / Mesh',
        to: '/gerar-os?demanda=wifi-extend&slug=wifi-extend-zte',
        description:
          'Alteração de plano com Wi-Fi Extend (ZTE). PF/PJ, solicitado ou ofertado, com ou sem troca do roteador primário.',
        icon: <WifiIcon />,
        badgeLabel: 'Plano + Extend',
      },
      {
        label: 'Wi-Fi Extend — TP-Link',
        to: '/gerar-os?demanda=wifi-extend&slug=wifi-extend-tplink',
        description:
          'Alteração de plano com Wi-Fi Extend usando equipamentos TP-Link. PF/PJ, com ou sem troca do roteador primário.',
        icon: <RouterIcon />,
        badgeLabel: 'Plano + Extend',
      },
    ],
  },
  {
    title: 'Ponto adicional',
    accent: '#d97706',
    items: [
      {
        label: 'Ponto adicional — roteador',
        to: '/gerar-os?demanda=wifi-extend&slug=wifi-extend-ponto',
        description:
          'Compra de 01 roteador adicional (R$360,00) para expandir a rede. Sem renovação de fidelidade. PF/PJ, com ou sem troca.',
        icon: <PlusIcon />,
        badgeLabel: 'Só O.S e Agenda',
      },
    ],
  },
]

export function WifiExtendHubPage() {
  return (
    <HubCatalog
      overline="Demandas · Suporte"
      title="Wi-Fi Extend"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Mesh, extensão de cobertura e ponto adicional de rede Wi-Fi.
        </Typography>
      }
      illustration="wifiextend"
      illustrationAlt="Extensão de cobertura Wi-Fi / Mesh"
      toolbarLabel="Tipos de Wi-Fi Extend"
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={SECTIONS}
    />
  )
}
