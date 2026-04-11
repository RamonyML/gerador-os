import type { Sector } from './profile'

export interface OsTemplateField {
  id: string
  label: string
  placeholder?: string
  multiline?: boolean
}

export interface OsTemplate {
  id: string
  sector: Sector
  slug: string
  title: string
  version: number
  active: boolean
  /** Texto com placeholders `{{campo}}` ou `{{operador.nome}}` */
  outputTemplate: string
  fields: OsTemplateField[]
}

function parseField(raw: unknown): OsTemplateField | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = typeof o.id === 'string' ? o.id : ''
  const label = typeof o.label === 'string' ? o.label : ''
  if (!id || !label) return null
  return {
    id,
    label,
    placeholder: typeof o.placeholder === 'string' ? o.placeholder : undefined,
    multiline: o.multiline === true,
  }
}

export function parseOsTemplate(
  docId: string,
  data: Record<string, unknown>,
): OsTemplate | null {
  const sector = data.sector as OsTemplate['sector'] | undefined
  const slug = typeof data.slug === 'string' ? data.slug : ''
  const title = typeof data.title === 'string' ? data.title : ''
  const outputTemplate =
    typeof data.outputTemplate === 'string' ? data.outputTemplate : ''
  const version = typeof data.version === 'number' ? data.version : 1
  const active = data.active !== false

  if (!sector || !slug || !title || !outputTemplate) return null

  const rawFields = data.fields
  const fields: OsTemplateField[] = []
  if (Array.isArray(rawFields)) {
    for (const item of rawFields) {
      const f = parseField(item)
      if (f) fields.push(f)
    }
  }

  return {
    id: docId,
    sector,
    slug,
    title,
    version,
    active,
    outputTemplate,
    fields,
  }
}
