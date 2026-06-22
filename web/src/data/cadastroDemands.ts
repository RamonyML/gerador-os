import type { SvgIconComponent } from '@mui/icons-material'
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import TvOutlinedIcon from '@mui/icons-material/TvOutlined'

export type CadastroDemand = {
  id: string
  title: string
  description: string
  Icon: SvgIconComponent
}

export const CADASTRO_DEMANDS: CadastroDemand[] = [
  {
    id: 'instalacao-gratis',
    title: 'Instalação grátis',
    description: 'Residencial e empresarial sem taxa de instalação/ativação.',
    Icon: CardGiftcardOutlinedIcon,
  },
  {
    id: 'instalacao-taxa',
    title: 'Instalação com taxa',
    description: 'Residencial e empresarial com taxa de instalação/ativação paga.',
    Icon: PaymentOutlinedIcon,
  },
  {
    id: 'midia-tv-cadastro',
    title: 'Mídia TV (Roku)',
    description: 'Compra e instalação de Roku TV / conversores.',
    Icon: TvOutlinedIcon,
  },
]

export function isKnownCadastroDemandCategory(id: string): boolean {
  return CADASTRO_DEMANDS.some((d) => d.id === id)
}
