/** Formata parte local do e-mail como nome legível (sem domínio). */
export function prettyLocalPartFromEmail(emailLower: string): string {
  const local = emailLower.split('@')[0] ?? emailLower
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildEmailToDisplayNameMap(
  rows: { email: string; displayName: string | null }[],
): Map<string, string> {
  const m = new Map<string, string>()
  for (const r of rows) {
    const em = r.email.trim().toLowerCase()
    const name =
      r.displayName?.trim() || prettyLocalPartFromEmail(em)
    m.set(em, name)
  }
  return m
}

/** Nome para exibir na escala — sem mostrar e-mail completo. */
export function displayNameForSchedule(email: string, map: Map<string, string>): string {
  const key = email.trim().toLowerCase()
  return map.get(key) ?? prettyLocalPartFromEmail(key)
}
