import type { Timestamp } from 'firebase/firestore'

export const MeioContato = {
  PRESENCIAL: 'presencial',
  LIGACAO: 'ligacao',
  WHATSAPP: 'whatsapp',
} as const

export type MeioContato = (typeof MeioContato)[keyof typeof MeioContato]

export const TipoAssinatura = {
  DIGITAL: 'digital',
  FISICA: 'fisica',
} as const

export type TipoAssinatura =
  (typeof TipoAssinatura)[keyof typeof TipoAssinatura]

export const TipoUpgrade = {
  ATIVO: 'ativo',
  RECEPTIVO: 'receptivo',
} as const

export type TipoUpgrade = (typeof TipoUpgrade)[keyof typeof TipoUpgrade]

export interface Upgrade {
  id: string
  data: Timestamp
  cliente: string
  meioContato: MeioContato
  numeroContato: string
  assinatura?: TipoAssinatura
  tipoUpgrade: TipoUpgrade
  observacao?: string
  operadorId: string
  operadorNome: string
  criadoEm: Timestamp
  createdBy?: string
  ultimaAtualizacao: Timestamp
  updatedBy?: string
  duplicado?: boolean
  isRoku?: boolean
}
