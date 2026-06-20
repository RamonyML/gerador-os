import type { SvgIconComponent } from '@mui/icons-material'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import HomeRepairServiceOutlinedIcon from '@mui/icons-material/HomeRepairServiceOutlined'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'

export type NavItem = {
  label: string
  to: string
  icon: SvgIconComponent
  /** Marca o item como ativo quando o pathname casa. */
  isActive: (pathname: string) => boolean
}

type NavFlags = {
  showSupport: boolean
  showCadastro: boolean
  showInstalacao: boolean
  showUsers: boolean
  showCondominios: boolean
  showAgenda: boolean
  showUpgrades: boolean
  showValidacao: boolean
}

const exact = (to: string) => (pathname: string) => pathname === to
const startsWith = (prefix: string) => (pathname: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

/**
 * Fonte única dos itens da navegação. Reaproveita exatamente os destinos e as
 * regras de permissão usadas anteriormente na barra superior.
 */
export function buildNavItems({
  showSupport,
  showCadastro,
  showInstalacao,
  showUsers,
  showCondominios,
  showAgenda,
  showUpgrades,
  showValidacao,
}: NavFlags): NavItem[] {
  const items: Array<NavItem | null> = [
    { label: 'Início', to: '/', icon: HomeOutlinedIcon, isActive: exact('/') },
    showSupport
      ? {
          label: 'Suporte',
          to: '/suporte',
          icon: DashboardCustomizeOutlinedIcon,
          isActive: startsWith('/suporte'),
        }
      : null,
    showCadastro
      ? {
          label: 'Cadastro',
          to: '/cadastro',
          icon: AssignmentIndOutlinedIcon,
          isActive: startsWith('/cadastro'),
        }
      : null,
    showInstalacao
      ? {
          label: 'Instalação',
          to: '/instalacao',
          icon: HomeRepairServiceOutlinedIcon,
          isActive: startsWith('/instalacao'),
        }
      : null,
    {
      label: 'Mapa de cobertura',
      to: '/cobertura',
      icon: MapOutlinedIcon,
      isActive: startsWith('/cobertura'),
    },
    showCondominios
      ? {
          label: 'Condomínios',
          to: '/condominios',
          icon: ApartmentOutlinedIcon,
          isActive: startsWith('/condominios'),
        }
      : null,
    {
      label: 'Escala Plantão',
      to: '/escala',
      icon: CalendarMonthOutlinedIcon,
      isActive: startsWith('/escala'),
    },
    showUpgrades
      ? {
          label: 'Upgrades',
          to: '/upgrades',
          icon: TrendingUpOutlinedIcon,
          isActive: startsWith('/upgrades'),
        }
      : null,
    {
      label: 'Chamados',
      to: '/chamados',
      icon: SupportAgentOutlinedIcon,
      isActive: startsWith('/chamados'),
    },
    showAgenda
      ? {
          label: 'Agenda',
          to: '/agenda',
          icon: EventNoteOutlinedIcon,
          isActive: startsWith('/agenda'),
        }
      : null,
    showValidacao
      ? {
          label: 'Validação Mud. End.',
          to: '/validacao',
          icon: FactCheckOutlinedIcon,
          isActive: startsWith('/validacao'),
        }
      : null,
    showUsers
      ? {
          label: 'Usuários',
          to: '/admin/usuarios',
          icon: PeopleOutlineOutlinedIcon,
          isActive: startsWith('/admin/usuarios'),
        }
      : null,
    {
      label: 'Histórico de O.S',
      to: '/historico',
      icon: HistoryRoundedIcon,
      isActive: startsWith('/historico'),
    },
    {
      label: 'Avisos',
      to: '/avisos',
      icon: CampaignOutlinedIcon,
      isActive: startsWith('/avisos'),
    },
    {
      label: 'Sobre',
      to: '/sobre',
      icon: InfoOutlinedIcon,
      isActive: startsWith('/sobre'),
    },
  ]

  return items.filter((i): i is NavItem => i != null)
}
