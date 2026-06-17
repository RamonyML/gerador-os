import { OS_TEMPLATE_PRESETS } from './osTemplatePresets'
import { isKnownCadastroDemandCategory } from './cadastroDemands'
import { isKnownInstalacaoDemandCategory } from './instalacaoDemands'
import type { OsTemplate } from '../types/osTemplate'
import type { Sector, UserProfile } from '../types/profile'

/** Versão embutida no bundle — incrementar ao alterar campos/texto de um fluxo. */
const DEFAULT_TEMPLATE_VERSION = 1

function sectorFromDemand(demandCategory: string): Sector {
  if (isKnownCadastroDemandCategory(demandCategory)) return 'cadastro'
  if (isKnownInstalacaoDemandCategory(demandCategory)) return 'instalacao'
  return 'suporte'
}

function buildAllTemplates(): OsTemplate[] {
  return OS_TEMPLATE_PRESETS.map((preset) => {
    const d = preset.getDefaults()
    return {
      id: preset.id,
      sector: sectorFromDemand(d.demandCategory),
      slug: d.slug,
      title: d.title,
      version: DEFAULT_TEMPLATE_VERSION,
      active: true,
      outputTemplate: d.outputTemplate,
      fields: d.fields.map((f) => ({
        ...f,
        options: f.options ? f.options.map((o) => ({ ...o })) : undefined,
      })),
      demandCategory: d.demandCategory,
      operatorGuidance: d.operatorGuidance,
    }
  })
}

/** Catálogo completo de modelos empacotados no app (fonte única). */
export const OS_TEMPLATES: OsTemplate[] = buildAllTemplates()

/**
 * Modelos antigos em Firestore (`osTemplates`) não são mais lidos pelo app.
 * Se existirem documentos só no banco, porte-os para `osTemplatePresets.ts`.
 */

export function getOsTemplatesForProfile(
  profile: UserProfile | null,
): OsTemplate[] {
  if (!profile) return []
  const list = profile.isDev
    ? OS_TEMPLATES
    : OS_TEMPLATES.filter((t) => t.sector === profile.sector)
  return [...list].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
}
