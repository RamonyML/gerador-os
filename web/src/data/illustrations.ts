/**
 * Ilustrações (estilo Storyset) das áreas principais do sistema.
 * Arquivos servidos estaticamente de `web/public/illustrations/`.
 */
export const ILLUSTRATIONS = {
  support: '/illustrations/illus-support.png',
  technology: '/illustrations/illus-technology.png',
  collaboration: '/illustrations/illus-collaboration.png',
  operations: '/illustrations/illus-operations.png',
  schedule: '/illustrations/illus-schedule.png',
  helpdesk: '/illustrations/illus-helpdesk.png',
  announcements: '/illustrations/illus-announcements.png',
  account: '/illustrations/illus-account.png',
  condominios: '/illustrations/illus-condominios.png',
  agenda: '/illustrations/illus-agenda.png',
  login: '/illustrations/illus-login.png',
  contracts: '/illustrations/illus-contracts.png',
  fiber: '/illustrations/illus-fiber.png',
  tv: '/illustrations/illus-tv.png',
  mudend: '/illustrations/illus-mudend.png',
  senha: '/illustrations/illus-senha.png',
  wifiextend: '/illustrations/illus-wifiextend.png',
  instalacao: '/illustrations/illus-instalacao.png',
  cadastro: '/illustrations/illus-cadastro.png',
  instGratis: '/illustrations/illus-inst-gratis.png',
  instTaxa: '/illustrations/illus-inst-taxa.png',
  feedback: '/illustrations/illus-feedback.png',
  historico: '/illustrations/illus-historico.png',
} as const

export type IllustrationKey = keyof typeof ILLUSTRATIONS
