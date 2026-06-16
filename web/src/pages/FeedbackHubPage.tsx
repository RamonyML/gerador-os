import type { ReactNode } from 'react'
import { Typography } from '@mui/material'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

// Cores dos grupos
const RED = '#ef4444'
const ORANGE = '#f97316'
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

const PhoneMissedIcon = () => (
  <Lucide>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.34a2 2 0 0 1 1.99-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
    <line x1="23" x2="17" y1="1" y2="7" />
    <line x1="17" x2="23" y1="1" y2="7" />
  </Lucide>
)

const WrenchIcon = () => (
  <Lucide>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </Lucide>
)

const AlertTriangleIcon = () => (
  <Lucide>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Lucide>
)

const SwapIcon = () => (
  <Lucide>
    <path d="M16 3h5v5" />
    <path d="M4 20 21 3" />
    <path d="M21 16v5h-5" />
    <path d="M15 15l-5 5" />
    <path d="M4 4l5 5" />
  </Lucide>
)

const HomeIcon = () => (
  <Lucide>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Lucide>
)

const TvIcon = () => (
  <Lucide>
    <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </Lucide>
)

const WifiIcon = () => (
  <Lucide>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" x2="12.01" y1="20" y2="20" />
  </Lucide>
)

const ArrowLeftRightIcon = () => (
  <Lucide>
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </Lucide>
)

const SECTIONS: HubSection[] = [
  {
    title: 'Sem Sucesso',
    accent: RED,
    items: [
      {
        label: 'Sem sucesso — 2 tentativas',
        to: '/gerar-os?demanda=feedback&slug=feedback-sem-sucesso',
        description: 'Protocolo encerrado após 2 tentativas de contato sem retorno do cliente.',
        icon: <PhoneMissedIcon />,
        badgeLabel: 'Encerramento',
      },
    ],
  },
  {
    title: 'Manutenção',
    accent: ORANGE,
    items: [
      {
        label: 'Manutenção externa',
        to: '/gerar-os?demanda=feedback&slug=feedback-man-externa',
        description: 'Reparo técnico na rede externa. Confirmação pós-visita com o cliente.',
        icon: <WrenchIcon />,
        badgeLabel: 'Com ou sem custo',
      },
      {
        label: 'Manutenção ocasionado',
        to: '/gerar-os?demanda=feedback&slug=feedback-man-ocasionado',
        description: 'Reparo por dano ocasionado. Orientação ao cliente registrada.',
        icon: <AlertTriangleIcon />,
        badgeLabel: 'Dano ocasionado',
      },
      {
        label: 'Troca de equipamento',
        to: '/gerar-os?demanda=feedback&slug=feedback-troca-equip',
        description: 'Substituição de ONU, ONT ou roteador defeituoso. Sem custos.',
        icon: <SwapIcon />,
        badgeLabel: 'Sem custo',
      },
    ],
  },
  {
    title: 'Outras Demandas',
    accent: BLUE,
    items: [
      {
        label: 'Alteração de plano',
        to: '/gerar-os?demanda=feedback&slug=feedback-altplan',
        description: 'Feedback após altplan com ou sem troca de roteador.',
        icon: <ArrowLeftRightIcon />,
        badgeLabel: 'Com ou sem troca',
      },
      {
        label: 'Mudança de ponto interno',
        to: '/gerar-os?demanda=feedback&slug=feedback-mudanca-ponto',
        description: 'Reinstalação em outro cômodo. Confirmação da mudança.',
        icon: <HomeIcon />,
        badgeLabel: 'Com custo',
      },
      {
        label: 'STB / Roku TV',
        to: '/gerar-os?demanda=feedback&slug=feedback-stb-roku',
        description: 'Instalação e configuração de conversor ou Roku TV.',
        icon: <TvIcon />,
        badgeLabel: 'Com custo',
      },
      {
        label: 'Wi-Fi Extend',
        to: '/gerar-os?demanda=feedback&slug=feedback-wifi-extend',
        description: 'Instalação de 1 a 3 roteadores Wi-Fi Extend com testes de aferição.',
        icon: <WifiIcon />,
        badgeLabel: '1 a 3 roteadores',
      },
    ],
  },
]

export function FeedbackHubPage() {
  return (
    <HubCatalog
      overline="Demandas · Suporte"
      title="Feedback"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Registre o retorno ao cliente após a visita técnica ou resolução remota.
        </Typography>
      }
      illustration="helpdesk"
      illustrationAlt="Feedback pós-atendimento"
      toolbarLabel="Tipos de feedback"
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={SECTIONS}
    />
  )
}
