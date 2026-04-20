import {
  MeioContato,
  TipoAssinatura,
  TipoUpgrade,
} from '../types/upgrades'

export function labelMeioContato(meio: MeioContato | undefined): string {
  switch (meio) {
    case MeioContato.PRESENCIAL:
      return 'Presencial'
    case MeioContato.LIGACAO:
      return 'Ligação'
    case MeioContato.WHATSAPP:
      return 'WhatsApp'
    default:
      return ''
  }
}

export function labelAssinatura(a: TipoAssinatura | undefined): string {
  switch (a) {
    case TipoAssinatura.DIGITAL:
      return 'Digital'
    case TipoAssinatura.FISICA:
      return 'Físico'
    default:
      return ''
  }
}

export function labelTipoUpgrade(t: TipoUpgrade | undefined): string {
  switch (t) {
    case TipoUpgrade.ATIVO:
      return 'Ativo'
    case TipoUpgrade.RECEPTIVO:
      return 'Receptivo'
    default:
      return ''
  }
}

/** Normaliza para comparação / duplicidade (legado usava nome em maiúsculas). */
export function normalizeClienteNome(name: string): string {
  return name.trim().toUpperCase()
}
