/** Firestore não aceita `undefined` em documentos — remove chaves com undefined. */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === null) return value
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T
  }
  if (typeof value === 'object' && value !== null) {
    const o = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined) continue
      out[k] = stripUndefinedDeep(v)
    }
    return out as T
  }
  return value
}
