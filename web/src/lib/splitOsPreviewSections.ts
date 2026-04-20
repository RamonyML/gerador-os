/** Trecho para abas na pré-visualização do gerador (modelos que usam `=== Título ===`). */
export type PreviewSection = {
  id: string
  /** Rótulo curto para abas */
  label: string
  body: string
}

/** Encurta rótulos longos nas abas (mobile). */
function tabLabel(raw: string): string {
  const t = raw.replace(/\s*\([^)]*\)\s*$/u, '').trim()
  if (t.length <= 26) return t
  return `${t.slice(0, 23)}…`
}

/**
 * Ignora linhas decorativas do legado (`=====`) que também casam com o padrão
 * `=== … ===` mas não têm texto (apenas "=").
 */
function isNamedSectionHeader(title: string): boolean {
  const t = title.trim()
  if (!t) return false
  const compact = t.replace(/\s+/g, '')
  if (/^=+$/.test(compact)) return false
  return /\p{L}/u.test(t)
}

/**
 * Divide o texto renderizado por linhas `=== Seção ===`.
 * Modelos sem esse padrão viram uma única secção «Texto gerado».
 */
export function splitOsPreviewSections(fullText: string): PreviewSection[] {
  const text = fullText.trimEnd()
  if (!text) return []

  const headerRe = /^===\s*(.+?)\s*===\s*$/gm
  const matches = [...text.matchAll(headerRe)].filter((m) =>
    isNamedSectionHeader(m[1]),
  )

  if (matches.length === 0) {
    return [{ id: 'single', label: 'Texto gerado', body: text }]
  }

  if (matches.length === 1) {
    const title = matches[0][1].trim()
    const after = text.slice(matches[0].index! + matches[0][0].length).trim()
    return [{ id: 'single', label: tabLabel(title), body: after || text }]
  }

  return matches.map((m, i) => {
    const title = m[1].trim()
    const start = m.index! + m[0].length
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length
    const body = text.slice(start, end).trim()
    return {
      id: `sec-${i}`,
      label: tabLabel(title),
      body,
    }
  })
}
