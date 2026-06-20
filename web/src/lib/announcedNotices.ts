const KEY = 'gerador-os:announced-notices'
const MAX_IDS = 300

export function getAnnouncedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function markAsAnnounced(ids: string[]): void {
  if (ids.length === 0) return
  try {
    const existing = getAnnouncedIds()
    for (const id of ids) existing.add(id)
    const arr = [...existing].slice(-MAX_IDS)
    localStorage.setItem(KEY, JSON.stringify(arr))
  } catch {
    // storage indisponível
  }
}
