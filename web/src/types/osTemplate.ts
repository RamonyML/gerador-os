import type { Sector } from './profile'

/** Tipo de controle no formulário do operador */
export type FieldControl = 'text' | 'textarea' | 'select' | 'radio' | 'date'

export interface FieldOption {
  value: string
  label: string
}

/** Colunas 1–12 por breakpoint (grid 12 colunas, estilo Bootstrap / index-mud-end.html). */
export interface FieldLayout {
  xs?: number
  sm?: number
  md?: number
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
  /** Largura no formulário; se omitido, o gerador usa heurística por tipo de campo. */
  layout?: FieldLayout
  /** Agrupa campos em seções (ex.: “IDENTIFICAÇÃO DO CLIENTE”). */
  section?: string
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
  /**
   * Agrupa o modelo no hub Suporte (ex.: mudanca-endereco).
   * Documentos antigos sem o campo são tratados como `geral` no parser.
   */
  demandCategory: string
}

/** Resolve tipo de campo (documentos antigos só tinham multiline). */
export function getFieldControl(f: OsTemplateField): FieldControl {
  if (f.control === 'text' || f.control === 'textarea') return f.control
  if (f.control === 'select' || f.control === 'radio') return f.control
  if (f.control === 'date') return 'date'
  return f.multiline === true ? 'textarea' : 'text'
}

/** Tamanhos no Grid (12 colunas) para o gerador: layout explícito ou padrão por tipo. */
export function resolveFieldGridSize(f: OsTemplateField): {
  xs: number
  sm: number
  md: number
} {
  const L = f.layout
  if (L && (L.xs != null || L.sm != null || L.md != null)) {
    const xs = L.xs ?? 12
    const sm = L.sm ?? xs
    const md = L.md ?? sm
    return { xs, sm, md }
  }
  const kind = getFieldControl(f)
  if (kind === 'textarea' || kind === 'radio') {
    return { xs: 12, sm: 12, md: 12 }
  }
  if (kind === 'date') {
    return { xs: 12, sm: 12, md: 6 }
  }
  return { xs: 12, sm: 12, md: 6 }
}

function parseLayout(raw: unknown): FieldLayout | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const o = raw as Record<string, unknown>
  const xs = typeof o.xs === 'number' ? o.xs : undefined
  const sm = typeof o.sm === 'number' ? o.sm : undefined
  const md = typeof o.md === 'number' ? o.md : undefined
  if (xs === undefined && sm === undefined && md === undefined) return undefined
  const out: FieldLayout = {}
  if (xs !== undefined) out.xs = xs
  if (sm !== undefined) out.sm = sm
  if (md !== undefined) out.md = md
  return out
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
  if (
    c === 'text' ||
    c === 'textarea' ||
    c === 'select' ||
    c === 'radio' ||
    c === 'date'
  ) {
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

  const layout = parseLayout(o.layout)
  const sectionRaw = o.section
  const section =
    typeof sectionRaw === 'string' && sectionRaw.trim()
      ? sectionRaw.trim()
      : undefined

  return {
    id,
    label,
    placeholder: typeof o.placeholder === 'string' ? o.placeholder : undefined,
    multiline: o.multiline === true,
    control,
    options:
      control === 'select' || control === 'radio' ? options : undefined,
    ...(layout ? { layout } : {}),
    ...(section ? { section } : {}),
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

  const demandRaw = data.demandCategory
  const demandCategory =
    typeof demandRaw === 'string' && demandRaw.trim()
      ? demandRaw.trim()
      : 'geral'

  return {
    id: docId,
    sector,
    slug,
    title,
    version,
    active,
    outputTemplate,
    fields,
    demandCategory,
  }
}
