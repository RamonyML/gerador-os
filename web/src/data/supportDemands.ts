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
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'

/** Chave salva em `osTemplates.demandCategory` (padrão no parser: `geral`). */
export const DEFAULT_DEMAND_CATEGORY = 'geral' as const

export type SupportDemandMeta = {
  id: string
  title: string
  description: string
  Icon: ElementType
  /** Cor de destaque do ícone (tema) */
  accent: 'primary' | 'info' | 'warning' | 'secondary' | 'error' | 'success'
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
    accent: 'primary',
  },
  {
    id: 'mudanca-endereco',
    title: 'Mudança de endereço',
    description: 'Mudança de ponto, viabilidade, equipamentos e variantes de protocolo.',
    Icon: HomeWorkOutlinedIcon,
    accent: 'info',
  },
  {
    id: 'manutencao',
    title: 'Manutenção',
    description: 'Visitas técnicas, interna/externa e ocasionado.',
    Icon: BuildOutlinedIcon,
    accent: 'warning',
  },
  {
    id: 'midia-tv',
    title: 'Conversores / TV',
    description: 'STB, Roku e mídia.',
    Icon: TvOutlinedIcon,
    accent: 'secondary',
  },
  {
    id: 'wifi-extend',
    title: 'Wi-Fi Extend',
    description: 'Mesh e extensão de cobertura.',
    Icon: WifiOutlinedIcon,
    accent: 'error',
  },
  {
    id: 'senha-rede',
    title: 'Senha / SSID Wi-Fi',
    description: 'Alteração de credenciais da rede.',
    Icon: RouterOutlinedIcon,
    accent: 'success',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'Confirmações pós-atendimento e registros de feedback.',
    Icon: ForumOutlinedIcon,
    accent: 'primary',
  },
  {
    id: 'termo-docs',
    title: 'Termos e documentos',
    description: 'Termos de responsabilidade e textos formais.',
    Icon: DescriptionOutlinedIcon,
    accent: 'warning',
  },
  {
    id: 'pesquisa-endereco',
    title: 'Pesquisa de endereço',
    description: 'Consultas de CEP e logradouro.',
    Icon: MapOutlinedIcon,
    accent: 'info',
  },
  {
    id: 'geral',
    title: 'Demais demandas',
    description: 'Modelos gerais ou ainda não classificados.',
    Icon: CategoryOutlinedIcon,
    accent: 'secondary',
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
