import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { BugReport, BugReportDraft, BugModule, BugStatus } from '../types/bugReport'
import type { TicketAttachment } from '../types/ticket'

const COLLECTION = 'bugReports'
const COUNTER_DOC = doc(db, 'counters', 'bugReports')

function fromFirestore(id: string, data: Record<string, unknown>): BugReport {
  return {
    id,
    reportNum: typeof data.reportNum === 'number' ? data.reportNum : null,
    title: typeof data.title === 'string' ? data.title : '',
    description: typeof data.description === 'string' ? data.description : '',
    module: (data.module as BugModule) ?? 'outros',
    status: (data.status as BugStatus) ?? 'aberto',
    authorUid: typeof data.authorUid === 'string' ? data.authorUid : '',
    authorName: typeof data.authorName === 'string' ? data.authorName : '',
    authorEmail: typeof data.authorEmail === 'string' ? data.authorEmail : null,
    authorSector: typeof data.authorSector === 'string' ? data.authorSector : null,
    devNote: typeof data.devNote === 'string' ? data.devNote : null,
    attachments: Array.isArray(data.attachments) ? (data.attachments as TicketAttachment[]) : [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    resolvedAt: data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate() : null,
  }
}

export interface BugReportActor {
  uid: string
  name: string
  email: string | null
  sector: string | null
}

/**
 * Cria um novo relato de bug com contador atômico.
 */
export async function createBugReport(
  actor: BugReportActor,
  draft: BugReportDraft,
): Promise<string> {
  const reportRef = doc(collection(db, COLLECTION))
  await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(COUNTER_DOC)
    const next = counterSnap.exists()
      ? (counterSnap.data().lastNumber as number) + 1
      : 1
    tx.set(COUNTER_DOC, { lastNumber: next }, { merge: true })
    tx.set(reportRef, {
      reportNum: next,
      title: draft.title.trim(),
      description: draft.description.trim(),
      module: draft.module,
      status: 'aberto',
      authorUid: actor.uid,
      authorName: actor.name,
      authorEmail: actor.email,
      authorSector: actor.sector,
      devNote: null,
      attachments: draft.attachments,
      createdAt: serverTimestamp(),
      updatedAt: null,
      resolvedAt: null,
    })
  })
  return reportRef.id
}

/**
 * Assina os relatos do próprio usuário (para a página /bugs).
 */
export function subscribeMyBugReports(
  uid: string,
  callback: (reports: BugReport[]) => void,
  onError?: () => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('authorUid', '==', uid),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>)))
    },
    () => onError?.(),
  )
}

/**
 * Assina todos os relatos (para /dev/bugs).
 */
export function subscribeAllBugReports(
  callback: (reports: BugReport[]) => void,
  onError?: () => void,
): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>)))
    },
    () => onError?.(),
  )
}

/**
 * Assina um único relato (para o dialog de detalhe).
 */
export function subscribeBugReport(
  reportId: string,
  callback: (report: BugReport | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, COLLECTION, reportId), (snap) => {
    callback(snap.exists() ? fromFirestore(snap.id, snap.data() as Record<string, unknown>) : null)
  })
}

/**
 * Atualiza status e/ou devNote (somente dev).
 */
export async function updateBugReport(
  reportId: string,
  patch: { status?: BugStatus; devNote?: string },
): Promise<void> {
  const update: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (patch.status !== undefined) {
    update.status = patch.status
    if (patch.status === 'resolvido') update.resolvedAt = serverTimestamp()
  }
  if (patch.devNote !== undefined) update.devNote = patch.devNote
  await updateDoc(doc(db, COLLECTION, reportId), update)
}

/**
 * Exclui permanentemente um relato (somente dev).
 */
export async function deleteBugReport(reportId: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, COLLECTION, reportId))
}
