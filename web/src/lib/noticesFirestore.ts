import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  type Unsubscribe,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import type { Notice, NoticeDraft, NoticePriority, NoticeStatus, NoticeTarget } from '../types/notices'
import type { Sector, UserProfile } from '../types/profile'

const NOTICES_COLLECTION = 'notices'

function parseStatus(v: unknown): NoticeStatus {
  return v === 'draft' ? 'draft' : 'published'
}

function parsePriority(v: unknown): NoticePriority {
  if (v === 'critical' || v === 'important') return v
  return 'normal'
}

function parseTarget(data: unknown): NoticeTarget | null {
  if (!data || typeof data !== 'object') return null
  const target = data as Record<string, unknown>
  const scope = target.scope
  if (scope === 'all') return { scope: 'all' }
  if (scope === 'sector') {
    const sector = target.sector
    if (typeof sector === 'string') return { scope: 'sector', sector: sector as Sector }
  }
  return null
}

function parseDateOrNull(v: unknown): Date | null {
  if (v == null) return null
  if (v instanceof Timestamp) return v.toDate()
  return null
}

function parseNotice(id: string, data: Record<string, unknown>): Notice | null {
  const message = data.message
  const authorUid = data.authorUid
  const authorName = data.authorName
  const createdAt = data.createdAt
  const active = data.active
  const target = parseTarget(data.target)
  const status = parseStatus(data.status)
  const pinned = data.pinned === true
  const priority = parsePriority(data.priority)
  const startsAt = parseDateOrNull(data.startsAt)
  const endsAt = parseDateOrNull(data.endsAt)
  const stats = data.stats && typeof data.stats === 'object' ? (data.stats as Record<string, unknown>) : null
  const readCount = stats && typeof stats.readCount === 'number' ? stats.readCount : undefined
  const title = typeof data.title === 'string' && data.title.trim().length > 0 ? data.title.trim() : undefined

  if (typeof message !== 'string' || message.trim().length === 0) return null
  if (typeof authorUid !== 'string' || authorUid.length === 0) return null
  if (typeof authorName !== 'string' || authorName.trim().length === 0) return null
  if (!(createdAt instanceof Timestamp)) return null
  if (typeof active !== 'boolean') return null
  if (!target) return null

  return {
    id,
    title,
    message,
    authorUid,
    authorName,
    createdAt: createdAt.toDate(),
    target,
    active,
    status,
    pinned,
    priority,
    startsAt,
    endsAt,
    stats: readCount != null ? { readCount } : undefined,
  }
}

function isWithinSchedule(n: Notice, now: Date): boolean {
  if (n.status !== 'published') return false
  if (n.startsAt && n.startsAt.getTime() > now.getTime()) return false
  if (n.endsAt && n.endsAt.getTime() < now.getTime()) return false
  return true
}

export async function listRelevantNotices(
  db: Firestore,
  profile: UserProfile,
  opts?: { pageSize?: number },
): Promise<Notice[]> {
  const pageSize = opts?.pageSize ?? 30
  const noticesRef = collection(db, NOTICES_COLLECTION)

  const qAll = query(
    noticesRef,
    where('active', '==', true),
    where('target.scope', '==', 'all'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )
  const qSector = query(
    noticesRef,
    where('active', '==', true),
    where('target.scope', '==', 'sector'),
    where('target.sector', '==', profile.sector),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )

  const [allSnap, sectorSnap] = await Promise.all([getDocs(qAll), getDocs(qSector)])

  const map = new Map<string, Notice>()
  for (const snap of [...allSnap.docs, ...sectorSnap.docs]) {
    const parsed = parseNotice(snap.id, snap.data() as Record<string, unknown>)
    if (!parsed) continue
    map.set(parsed.id, parsed)
  }

  const now = new Date()
  const filtered = [...map.values()].filter((n) => isWithinSchedule(n, now))
  return filtered.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    const prio = (p: NoticePriority) => (p === 'critical' ? 2 : p === 'important' ? 1 : 0)
    const pd = prio(b.priority) - prio(a.priority)
    if (pd !== 0) return pd
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

export function subscribeRelevantNotices(
  db: Firestore,
  profile: UserProfile,
  opts: { pageSize: number },
  onNext: (notices: Notice[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const noticesRef = collection(db, NOTICES_COLLECTION)
  const pageSize = opts.pageSize

  const qAll = query(
    noticesRef,
    where('active', '==', true),
    where('target.scope', '==', 'all'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )
  const qSector = query(
    noticesRef,
    where('active', '==', true),
    where('target.scope', '==', 'sector'),
    where('target.sector', '==', profile.sector),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )

  const map = new Map<string, Notice>()
  const emit = () => {
    const now = new Date()
    const filtered = [...map.values()].filter((n) => isWithinSchedule(n, now))
    const sorted = filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      const prio = (p: NoticePriority) => (p === 'critical' ? 2 : p === 'important' ? 1 : 0)
      const pd = prio(b.priority) - prio(a.priority)
      if (pd !== 0) return pd
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
    onNext(sorted)
  }

  const unsubAll = onSnapshot(
    qAll,
    (snap) => {
      for (const c of snap.docChanges()) {
        if (c.type === 'removed') map.delete(c.doc.id)
        else {
          const parsed = parseNotice(c.doc.id, c.doc.data() as Record<string, unknown>)
          if (parsed) map.set(parsed.id, parsed)
        }
      }
      emit()
    },
    (err) => onError(err),
  )

  const unsubSector = onSnapshot(
    qSector,
    (snap) => {
      for (const c of snap.docChanges()) {
        if (c.type === 'removed') map.delete(c.doc.id)
        else {
          const parsed = parseNotice(c.doc.id, c.doc.data() as Record<string, unknown>)
          if (parsed) map.set(parsed.id, parsed)
        }
      }
      emit()
    },
    (err) => onError(err),
  )

  return () => {
    unsubAll()
    unsubSector()
  }
}

export async function listReadNoticeIdsForUser(
  db: Firestore,
  uid: string,
  noticeIds: string[],
): Promise<Set<string>> {
  if (noticeIds.length === 0) return new Set()
  const ids = noticeIds.slice(0, 30)
  const readsRef = collection(db, 'users', uid, 'noticeReads')
  const snap = await getDocs(query(readsRef, where(documentId(), 'in', ids)))
  const read = new Set<string>()
  for (const d of snap.docs) read.add(d.id)
  return read
}

export async function markNoticeAsRead(db: Firestore, uid: string, noticeId: string) {
  const readRef = doc(db, 'users', uid, 'noticeReads', noticeId)
  const batch = writeBatch(db)
  batch.set(readRef, { readAt: serverTimestamp() }, { merge: true })
  await batch.commit()
}

export async function updateNotice(
  db: Firestore,
  noticeId: string,
  patch: Partial<{
    title: string
    message: string
    target: NoticeTarget
    status: NoticeStatus
    pinned: boolean
    priority: NoticePriority
    startsAt: Date | null
    endsAt: Date | null
    active: boolean
  }>,
) {
  const ref = doc(db, NOTICES_COLLECTION, noticeId)
  const out: Record<string, unknown> = {}
  if (patch.title !== undefined) out.title = patch.title.trim() || null
  if (patch.message !== undefined) out.message = patch.message.trim()
  if (patch.target !== undefined) out.target = patch.target
  if (patch.status !== undefined) out.status = patch.status
  if (patch.pinned !== undefined) out.pinned = patch.pinned
  if (patch.priority !== undefined) out.priority = patch.priority
  if (patch.startsAt !== undefined) out.startsAt = patch.startsAt ? Timestamp.fromDate(patch.startsAt) : null
  if (patch.endsAt !== undefined) out.endsAt = patch.endsAt ? Timestamp.fromDate(patch.endsAt) : null
  if (patch.active !== undefined) out.active = patch.active
  out.updatedAt = serverTimestamp()
  await setDoc(ref, out, { merge: true })
}

export async function deleteNotice(db: Firestore, noticeId: string) {
  await deleteDoc(doc(db, NOTICES_COLLECTION, noticeId))
}

export async function createNotice(
  db: Firestore,
  author: { uid: string; name: string },
  draft: NoticeDraft,
) {
  await addDoc(collection(db, NOTICES_COLLECTION), {
    active: true,
    ...(draft.title ? { title: draft.title.trim() } : {}),
    message: draft.message.trim(),
    authorUid: author.uid,
    authorName: author.name.trim(),
    target: draft.target,
    createdAt: serverTimestamp(),
    status: draft.status,
    pinned: draft.pinned,
    priority: draft.priority,
    startsAt: draft.startsAt ? Timestamp.fromDate(draft.startsAt) : null,
    endsAt: draft.endsAt ? Timestamp.fromDate(draft.endsAt) : null,
    stats: { readCount: 0 },
  })
}

