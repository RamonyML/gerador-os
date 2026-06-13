import type { ReactNode } from 'react'
import { Typography } from '@mui/material'
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

const ICON_SX = { fontSize: 26 } as const

// Cores de cada grupo (legado dash-man.html)
const RED = '#ef4444'
const ORANGE = '#f97316'
const BLUE = '#3b82f6'

/** Wrapper Lucide (24x24, stroke currentColor) para reproduzir os ícones do legado. */
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

const LinkOffIcon = () => (
  <Lucide>
    <path d="M9 17H7A5 5 0 0 1 7 7" />
    <path d="M15 7h2a5 5 0 0 1 4 8" />
    <line x1="8" x2="12" y1="12" y2="12" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </Lucide>
)

const CableIcon = () => (
  <Lucide>
    <path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1" />
    <path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9" />
    <path d="M21 21v-2h-4" />
    <path d="M3 5h4V3" />
    <path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3" />
  </Lucide>
)

const UtilityPoleIcon = () => (
  <Lucide>
    <path d="M12 2v20" />
    <path d="M2 5h20" />
    <path d="M3 3v2" />
    <path d="M7 3v2" />
    <path d="M17 3v2" />
    <path d="M21 3v2" />
    <path d="m19 5-7 7-7-7" />
  </Lucide>
)

const Undo2Icon = () => (
  <Lucide>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
  </Lucide>
)

const ServerIcon = () => (
  <Lucide>
    <path d="M5 16v2" />
    <path d="M19 16v2" />
    <rect width="20" height="8" x="2" y="8" rx="2" />
    <path d="M18 12h.01" />
  </Lucide>
)

const RouterLucideIcon = () => (
  <Lucide>
    <rect width="20" height="8" x="2" y="14" rx="2" />
    <path d="M6.01 18H6" />
    <path d="M10.01 18H10" />
    <path d="M15 10v4" />
    <path d="M17.84 7.17a4 4 0 0 0-5.66 0" />
    <path d="M20.66 4.34a8 8 0 0 0-11.31 0" />
  </Lucide>
)

const PlugIcon = () => (
  <Lucide>
    <path d="M12 22v-5" />
    <path d="M9 8V2" />
    <path d="M15 8V2" />
    <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
  </Lucide>
)

const LinkIcon = () => (
  <Lucide>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Lucide>
)

const TabletSmartphoneIcon = () => (
  <Lucide>
    <rect width="10" height="14" x="3" y="8" rx="2" />
    <path d="M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4" />
    <path d="M8 18h.01" />
  </Lucide>
)

const MovePointIcon = () => (
  <Lucide>
    <path d="M14 4a2 2 0 0 1 2-2" />
    <path d="M16 10a2 2 0 0 1-2-2" />
    <path d="M20 2a2 2 0 0 1 2 2" />
    <path d="M22 8a2 2 0 0 1-2 2" />
    <path d="m3 7 3 3 3-3" />
    <path d="M6 10V5a3 3 0 0 1 3-3h1" />
    <rect x="2" y="14" width="8" height="8" rx="2" />
  </Lucide>
)

const RotateCcwIcon = () => (
  <Lucide>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Lucide>
)

const SECTIONS: HubSection[] = [
  {
    title: 'Luz Vermelha',
    accent: RED,
    items: [
      {
        label: 'Não ocasionado',
        to: '/gerar-os?demanda=manutencao&slug=manut-luz-vermelha',
        description: 'Visita técnica para luz vermelha ou PON piscando.',
        icon: <LinkOffIcon />,
        badgeLabel: 'Pessoa física',
      },
      {
        label: 'Não ocasionado — PJ',
        to: '/gerar-os?demanda=manutencao&slug=manut-luz-vermelha-pj',
        description: 'Pessoa jurídica, com solicitante e cargo no registro.',
        icon: <WbIncandescentOutlinedIcon sx={ICON_SX} />,
        badgeLabel: 'Pessoa jurídica',
      },
      {
        label: 'Ocasionado conector',
        to: '/gerar-os?demanda=manutencao&slug=manut-ocas-conector',
        description: 'Dano interno em fibra/conector causado pelo cliente.',
        icon: <LinkOffIcon />,
        badgeLabel: 'Titular e terceiros',
      },
      {
        label: 'Ocasionado fibra',
        to: '/gerar-os?demanda=manutencao&slug=manut-ocas-fibra',
        description: 'Dano na fibra externa causado pelo cliente.',
        icon: <CableIcon />,
        badgeLabel: 'Titular e terceiros',
      },
      {
        label: 'Rompimento externo',
        to: '/gerar-os?demanda=manutencao&slug=manut-fibra-externa',
        description: 'Rompimento de cabo externo na rede de fibra.',
        icon: <UtilityPoleIcon />,
        badgeLabel: 'Titular, PJ e terceiros',
      },
      {
        label: 'Retorno dentro dos 7 dias',
        to: '/gerar-os?demanda=manutencao&slug=manut-luz-vermelha-isento',
        description: 'Visita isenta — instalação dentro de 7 dias.',
        icon: <Undo2Icon />,
        accent: BLUE,
        badgeLabel: 'Isento · 7 dias',
      },
    ],
  },
  {
    title: 'Equipamento Danificado',
    accent: ORANGE,
    items: [
      {
        label: 'ONU queimada',
        to: '/gerar-os?demanda=manutencao&slug=manut-onu-queimada',
        description: 'ONU sem sinal (DYINGGASP). Cobrada se ocasionado.',
        icon: <ServerIcon />,
        badgeLabel: 'Dano ocasionado',
      },
      {
        label: 'ONT queimada',
        to: '/gerar-os?demanda=manutencao&slug=manut-ont-queimada',
        description: 'ONT sem sinal (DYINGGASP). Cobrada se ocasionado.',
        icon: <RouterLucideIcon />,
        badgeLabel: 'Dano ocasionado',
      },
      {
        label: 'Roteador queimado',
        to: '/gerar-os?demanda=manutencao&slug=manut-roteador-queimado',
        description: 'Substituição de roteador. Cobrada ou isento.',
        icon: <RouterLucideIcon />,
        badgeLabel: 'Cobrada ou isento',
      },
      {
        label: 'Fonte queimada',
        to: '/gerar-os?demanda=manutencao&slug=manut-fonte-queimada',
        description: 'Troca de fonte. Com visita ou retirada na loja.',
        icon: <PlugIcon />,
        badgeLabel: 'Visita ou loja',
      },
    ],
  },
  {
    title: 'Outras Solicitações',
    accent: BLUE,
    items: [
      {
        label: 'Sinal alto',
        to: '/gerar-os?demanda=manutencao&slug=manut-sinal-alto',
        description: 'Sinal fora do padrão com desconexões repetidas.',
        icon: <LinkIcon />,
        badgeLabel: 'Titular, PJ e terceiros',
      },
      {
        label: 'Visita de Testes',
        to: '/gerar-os?demanda=manutencao&slug=manut-visita-testes',
        description: 'Lentidão e/ou instabilidades na conexão.',
        icon: <TabletSmartphoneIcon />,
        badgeLabel: 'PF, PJ, isento e dispensou',
      },
      {
        label: 'Mudança de ponto interno',
        to: '/gerar-os?demanda=manutencao&slug=manut-mud-ponto-int',
        description: 'Retirar e reinstalar equipamentos em outro ambiente.',
        icon: <MovePointIcon />,
        badgeLabel: 'Titular, PJ e terceiros',
      },
      {
        label: 'Remanejamento de fibra',
        to: '/gerar-os?demanda=manutencao&slug=manut-realoc-fibra',
        description: 'Realocar o drop/fibra a pedido do cliente.',
        icon: <CableIcon />,
        badgeLabel: 'Titular, PJ e terceiros',
      },
      {
        label: 'Roteador / ONT resetado',
        to: '/gerar-os?demanda=manutencao&slug=manut-roteador-reset',
        description: 'Reconfiguração. Visita técnica paga ou na loja.',
        icon: <RotateCcwIcon />,
        badgeLabel: 'Visita ou loja',
      },
    ],
  },
]

export function ManutencaoHubPage() {
  return (
    <HubCatalog
      overline="Demandas · Suporte"
      title="Manutenção"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Selecione o tipo de manutenção para gerar a O.S correspondente.
        </Typography>
      }
      illustration="fiber"
      illustrationAlt="Manutenção de fibra óptica"
      toolbarLabel="Tipos de manutenção"
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={SECTIONS}
    />
  )
}
