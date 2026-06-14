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

const KeyRoundIcon = () => (
  <Lucide>
    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
  </Lucide>
)

const SECTIONS: HubSection[] = [
  {
    title: 'Rede Wi-Fi',
    accent: TEAL,
    items: [
      {
        label: 'Alteração de SSID / Senha',
        to: '/gerar-os?demanda=senha-rede&slug=senha-altera-senha',
        description:
          'Alterar o nome da rede (SSID) e/ou a senha do Wi-Fi a pedido do cliente.',
        icon: <KeyRoundIcon />,
        badgeLabel: 'Apenas protocolo',
      },
    ],
  },
]

export function SenhaRedeHubPage() {
  return (
    <HubCatalog
      overline="Demandas · Suporte"
      title="Senha / SSID Wi-Fi"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Alteração de credenciais da rede Wi-Fi do cliente.
        </Typography>
      }
      illustration="senha"
      illustrationAlt="Alteração de senha e SSID do Wi-Fi"
      toolbarLabel="Tipos de alteração"
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={SECTIONS}
    />
  )
}
