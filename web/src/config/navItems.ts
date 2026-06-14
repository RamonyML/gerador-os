import type { SvgIconComponent } from '@mui/icons-material'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export type NavItem = {
  label: string
  to: string
  icon: SvgIconComponent
  /** Marca o item como ativo quando o pathname casa. */
  isActive: (pathname: string) => boolean
}

type NavFlags = {
  showSupport: boolean
  showUsers: boolean
  showCondominios: boolean
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
  showUsers,
  showCondominios,
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
    {
      label: 'Mapa de cobertura',
      to: '/cobertura',
      icon: MapOutlinedIcon,
      isActive: startsWith('/cobertura'),
    },
    {
      label: 'Escala',
      to: '/escala',
      icon: CalendarMonthOutlinedIcon,
      isActive: startsWith('/escala'),
    },
    {
      label: 'Upgrades',
      to: '/upgrades',
      icon: TrendingUpOutlinedIcon,
      isActive: startsWith('/upgrades'),
    },
    {
      label: 'Chamados',
      to: '/chamados',
      icon: SupportAgentOutlinedIcon,
      isActive: startsWith('/chamados'),
    },
    {
      label: 'Agenda',
      to: '/agenda',
      icon: EventNoteOutlinedIcon,
      isActive: startsWith('/agenda'),
    },
    showCondominios
      ? {
          label: 'Condomínios',
          to: '/condominios',
          icon: ApartmentOutlinedIcon,
          isActive: startsWith('/condominios'),
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
