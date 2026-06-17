import type { SvgIconComponent } from '@mui/icons-material'
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined'

export type InstalacaoDemand = {
  id: string
  title: string
  description: string
  Icon: SvgIconComponent
}

export const INSTALACAO_DEMANDS: InstalacaoDemand[] = [
  {
    id: 'encerramentos-instalacao',
    title: 'Encerramentos de O.S',
    description: 'Formulários de encerramento de ordens de serviço de instalação.',
    Icon: ChecklistRtlOutlinedIcon,
  },
]

export function isKnownInstalacaoDemandCategory(id: string): boolean {
  return INSTALACAO_DEMANDS.some((d) => d.id === id)
}
