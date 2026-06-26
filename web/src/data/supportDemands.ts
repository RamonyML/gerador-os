import type { ElementType } from 'react'
import type { OsTemplate } from '../types/osTemplate'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import TvOutlinedIcon from '@mui/icons-material/TvOutlined'
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'

/** Chave de agrupamento no hub Suporte (`demandCategory` em cada fluxo). */
export const DEFAULT_DEMAND_CATEGORY = 'geral' as const

export type SupportDemandMeta = {
  id: string
  title: string
  description: string
  Icon: ElementType
}

/**
 * Ordem inspirada no dashboard legado — cards do hub Suporte.
 * Modelos sem categoria explícita entram como `geral` no parser.
 */
export const SUPPORT_DEMANDS: SupportDemandMeta[] = [
  {
    id: 'alteracao-plano',
    title: 'Alteração de plano',
    description: 'Troca de plano, upgrade/downgrade e propostas.',
    Icon: SwapHorizOutlinedIcon,
  },
  {
    id: 'mudanca-endereco',
    title: 'Mudança de endereço',
    description: 'Mudança de ponto, viabilidade, equipamentos e variantes de protocolo.',
    Icon: HomeWorkOutlinedIcon,
  },
  {
    id: 'manutencao',
    title: 'Manutenção',
    description: 'Visitas técnicas, interna/externa e ocasionado.',
    Icon: BuildOutlinedIcon,
  },
  {
    id: 'midia-tv',
    title: 'Conversores / TV',
    description: 'STB, Roku e mídia.',
    Icon: TvOutlinedIcon,
  },
  {
    id: 'wifi-extend',
    title: 'Wi-Fi Extend',
    description: 'Mesh e extensão de cobertura.',
    Icon: WifiOutlinedIcon,
  },
  {
    id: 'senha-rede',
    title: 'Senha / SSID Wi-Fi',
    description: 'Alteração de credenciais da rede.',
    Icon: RouterOutlinedIcon,
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'Confirmações pós-atendimento e registros de feedback.',
    Icon: ForumOutlinedIcon,
  },
  {
    id: 'termo-docs',
    title: 'Termo de responsabilidade',
    description: 'Acesso ao roteador emprestado em comodato.',
    Icon: DescriptionOutlinedIcon,
  },
  {
    id: 'geral',
    title: 'Tutoriais',
    description: 'Guias passo a passo para configuração de equipamentos.',
    Icon: SchoolOutlinedIcon,
  },
]

export function isKnownDemandCategory(id: string): boolean {
  return SUPPORT_DEMANDS.some((d) => d.id === id)
}

export function templatesMatchingDemand(
  templates: OsTemplate[],
  demandId: string,
): OsTemplate[] {
  return templates.filter((t) => t.demandCategory === demandId)
}
