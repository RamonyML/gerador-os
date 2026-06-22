import type { Sector } from './profile'

/** Tipo de controle no formulário do operador */
export type FieldControl =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'date'
  /** Data + hora com seletor (valor `DD/MM/YYYY HH:mm`). */
  | 'datetime'
  /** Telefone BR com máscara (00) 00000-0000. */
  | 'phone'
  /** Sinal da fibra com máscara 00.00 (saída -00.00DBM). */
  | 'signal'

export interface FieldOption {
  value: string
  label: string
  /** Ícone opcional (chave do registro de ícones no formulário). */
  icon?: string
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
  /** Valor inicial quando o formulário é carregado. */
  defaultValue?: string
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
  /** Renderiza o campo com destaque (ex.: select-subtítulo do formulário). */
  highlight?: boolean
  /** Tom do destaque do campo (default verde). */
  tone?: 'green' | 'red'
  /** Exibe o campo somente quando outro campo tiver um dos valores informados. */
  showWhen?: {
    field: string
    equals: string | string[]
  }
  /**
   * Opções dinâmicas baseadas no dia da semana de um campo de data.
   * byWeekday: mapa de getDay() (0=Dom, 6=Sáb) para opções ou 'disabled'.
   * defaultOptions: usado quando a data não está preenchida ou o dia não está no mapa.
   */
  optionsFromWeekday?: {
    sourceField: string
    byWeekday: Partial<Record<number, FieldOption[] | 'disabled'>>
    defaultOptions: FieldOption[]
  }
}

/**
 * Orientação ao operador exibida em um painel recolhível (collapse) acima do
 * formulário. Usada por fluxos que precisam de instrução de procedimento
 * (ex.: alteração de senha/SSID). Conteúdo só de leitura — não entra no texto gerado.
 */
export interface OsOperatorGuidance {
  /** Título do painel recolhível. */
  title: string
  /** Itens/parágrafos de orientação, na ordem de leitura. */
  items: string[]
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
  /** Orientação opcional ao operador (collapse acima do formulário). */
  operatorGuidance?: OsOperatorGuidance
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
  if (f.control === 'datetime') return 'datetime'
  if (f.control === 'phone') return 'phone'
  if (f.control === 'signal') return 'signal'
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
  if (kind === 'date' || kind === 'datetime') {
    return { xs: 12, sm: 12, md: 6 }
  }
  return { xs: 12, sm: 12, md: 6 }
}
