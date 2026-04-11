/**
 * Substitui `{{chave}}` e `{{aninhada.chave}}` no texto.
 * `context` pode ser aninhado (ex.: `{ operador: { nome: 'Ana' } }`).
 */
export function renderTemplate(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawPath: string) => {
    const path = String(rawPath).trim()
    const value = resolvePath(path, context)
    if (value === null || value === undefined) return ''
    return String(value)
  })
}

function resolvePath(path: string, root: Record<string, unknown>): unknown {
  const parts = path.split('.').map((p) => p.trim())
  let cur: unknown = root
  for (const p of parts) {
    if (cur === null || cur === undefined) return ''
    if (typeof cur !== 'object') return ''
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}
