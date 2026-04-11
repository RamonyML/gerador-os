import type { Sector } from './profile'

/** Tipo de controle no formulário do operador */
export type FieldControl = 'text' | 'textarea' | 'select' | 'radio'

export interface FieldOption {
  value: string
  label: string
}

export interface OsTemplateField {
  id: string
  label: string
  placeholder?: string
  /** Legado: se não houver `control`, textarea ⇐ multiline */
  multiline?: boolean
  control?: FieldControl
  /** Obrigatório para select e radio */
  options?: FieldOption[]
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

/** Resolve tipo de campo (documentos antigos só tinham multiline). */
export function getFieldControl(f: OsTemplateField): FieldControl {
  if (f.control === 'text' || f.control === 'textarea') return f.control
  if (f.control === 'select' || f.control === 'radio') return f.control
  return f.multiline === true ? 'textarea' : 'text'
}

function parseOptions(raw: unknown): FieldOption[] {
  if (!Array.isArray(raw)) return []
  const out: FieldOption[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const value = typeof o.value === 'string' ? o.value : ''
    const label = typeof o.label === 'string' ? o.label : ''
    if (value && label) out.push({ value, label })
  }
  return out
}

function parseField(raw: unknown): OsTemplateField | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = typeof o.id === 'string' ? o.id : ''
  const label = typeof o.label === 'string' ? o.label : ''
  if (!id || !label) return null

  const c = o.control
  let control: FieldControl | undefined
  if (c === 'text' || c === 'textarea' || c === 'select' || c === 'radio') {
    control = c
  }
  if (!control) {
    control = o.multiline === true ? 'textarea' : 'text'
  }

  const options = parseOptions(o.options)
  if (control === 'select' || control === 'radio') {
    if (options.length === 0) {
      control = 'text'
    }
  }

  return {
    id,
    label,
    placeholder: typeof o.placeholder === 'string' ? o.placeholder : undefined,
    multiline: o.multiline === true,
    control,
    options:
      control === 'select' || control === 'radio' ? options : undefined,
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
