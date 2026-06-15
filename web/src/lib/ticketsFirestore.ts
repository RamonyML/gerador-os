import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import type { Sector, UserProfile } from '../types/profile'
import {
  isTicketArchiveTag,
  isTicketCategory,
  isTicketPriority,
  isTicketStatus,
  type Ticket,
  type TicketArchiveTag,
  type TicketAttachment,
  type TicketComment,
  type TicketDraft,
  type TicketResolution,
  type TicketStatus,
} from '../types/ticket'
import { uploadTicketImages } from './ticketAttachments'

const TICKETS_COLLECTION = 'tickets'

export type TicketActor = {
  uid: string
  name: string
  email: string | null
  photoURL: string | null
  sector: Sector | null
  isAgent: boolean
}

export function ticketActorFromProfile(
  uid: string,
  email: string | null,
  profile: UserProfile | null,
  isAgent: boolean,
  photoURL: string | null = null,
): TicketActor {
  const name =
    profile?.displayName?.trim() ||
    email?.split('@')[0] ||
    'Usuário'
  return {
    uid,
    name,
    email,
    photoURL,
    sector: profile?.sector ?? null,
    isAgent,
  }
}

function parseDateOrNull(v: unknown): Date | null {
  if (v instanceof Timestamp) return v.toDate()
  return null
}

function parseAttachments(data: unknown): TicketAttachment[] {
  if (!Array.isArray(data)) return []
  const out: TicketAttachment[] = []
  for (const item of data) {
    if (!item || typeof item !== 'object') continue
    const a = item as Record<string, unknown>
    if (typeof a.url !== 'string' || typeof a.path !== 'string') continue
    out.push({
      path: a.path,
      url: a.url,
      name: typeof a.name === 'string' ? a.name : 'imagem',
      contentType: typeof a.contentType === 'string' ? a.contentType : '',
      size: typeof a.size === 'number' ? a.size : 0,
    })
  }
  return out
}

function parseResolution(data: unknown): TicketResolution | null {
  if (!data || typeof data !== 'object') return null
  const r = data as Record<string, unknown>
  if (typeof r.text !== 'string' || r.text.trim().length === 0) return null
  const at = parseDateOrNull(r.at)
  return {
    text: r.text,
    byUid: typeof r.byUid === 'string' ? r.byUid : '',
    byName: typeof r.byName === 'string' ? r.byName : '',
    at: at ?? new Date(0),
  }
}

function parseTicket(id: string, data: Record<string, unknown>): Ticket | null {
  const title = data.title
  const description = data.description
  const category = data.category
  const priority = data.priority
  const status = data.status
  const authorUid = data.authorUid
  const authorName = data.authorName
  const createdAt = data.createdAt

  if (typeof title !== 'string' || title.trim().length === 0) return null
  if (typeof description !== 'string') return null
  if (!isTicketCategory(category)) return null
  if (!isTicketPriority(priority)) return null
  if (!isTicketStatus(status)) return null
  if (typeof authorUid !== 'string' || authorUid.length === 0) return null
  if (typeof authorName !== 'string') return null
  if (!(createdAt instanceof Timestamp)) return null

  return {
    id,
    title,
    description,
    category,
    priority,
    status,
    authorUid,
    authorName,
    authorEmail: typeof data.authorEmail === 'string' ? data.authorEmail : null,
    authorPhotoURL:
      typeof data.authorPhotoURL === 'string' ? data.authorPhotoURL : null,
    authorSector:
      typeof data.authorSector === 'string'
        ? (data.authorSector as Sector)
        : null,
    assigneeUid: typeof data.assigneeUid === 'string' ? data.assigneeUid : null,
    assigneeName:
      typeof data.assigneeName === 'string' ? data.assigneeName : null,
    createdAt: createdAt.toDate(),
    updatedAt: parseDateOrNull(data.updatedAt),
    resolvedAt: parseDateOrNull(data.resolvedAt),
    resolution: parseResolution(data.resolution),
    commentsCount:
      typeof data.commentsCount === 'number' ? data.commentsCount : 0,
    attachments: parseAttachments(data.attachments),
    lastReplyAt: parseDateOrNull(data.lastReplyAt),
    lastReplyRole:
      data.lastReplyRole === 'ti'
        ? 'ti'
        : data.lastReplyRole === 'solicitante'
          ? 'solicitante'
          : null,
    lastReplyByUid:
      typeof data.lastReplyByUid === 'string' ? data.lastReplyByUid : null,
    archivedAt: parseDateOrNull(data.archivedAt),
    archiveTag: isTicketArchiveTag(data.archiveTag) ? data.archiveTag : null,
    archivedByUid:
      typeof data.archivedByUid === 'string' ? data.archivedByUid : null,
    archivedByName:
      typeof data.archivedByName === 'string' ? data.archivedByName : null,
  }
}

function sortTickets(list: Ticket[]): Ticket[] {
  return [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Cria um chamado interno. Sempre nasce com status `aberto` e sem responsável.
 * Quando há imagens, elas são enviadas ao Storage antes de gravar o documento.
 */
export async function createTicket(
  db: Firestore,
  actor: TicketActor,
  draft: TicketDraft,
  files: File[] = [],
): Promise<string> {
  const ref = doc(collection(db, TICKETS_COLLECTION))
  const attachments = files.length
    ? await uploadTicketImages(ref.id, files, 'root')
    : []
  await setDoc(ref, {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    priority: draft.priority,
    status: 'aberto' satisfies TicketStatus,
    authorUid: actor.uid,
    authorName: actor.name,
    authorEmail: actor.email,
    authorPhotoURL: actor.photoURL ?? null,
    authorSector: actor.sector,
    assigneeUid: null,
    assigneeName: null,
    resolution: null,
    resolvedAt: null,
    commentsCount: 0,
    attachments,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Chamados abertos pelo próprio usuário (visão do solicitante). */
export function subscribeMyTickets(
  db: Firestore,
  uid: string,
  onNext: (tickets: Ticket[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const q = query(
    collection(db, TICKETS_COLLECTION),
    where('authorUid', '==', uid),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const list: Ticket[] = []
      for (const d of snap.docs) {
        const parsed = parseTicket(d.id, d.data() as Record<string, unknown>)
        if (parsed) list.push(parsed)
      }
      onNext(list)
    },
    (err) => onError(err),
  )
}

/** Todos os chamados (visão de gestão T.I). Filtro de status é opcional. */
export function subscribeAllTickets(
  db: Firestore,
  opts: { status?: TicketStatus | null },
  onNext: (tickets: Ticket[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const base = collection(db, TICKETS_COLLECTION)
  const q = opts.status
    ? query(
        base,
        where('status', '==', opts.status),
        orderBy('createdAt', 'desc'),
      )
    : query(base, orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snap) => {
      const list: Ticket[] = []
      for (const d of snap.docs) {
        const parsed = parseTicket(d.id, d.data() as Record<string, unknown>)
        if (parsed) list.push(parsed)
      }
      onNext(sortTickets(list))
    },
    (err) => onError(err),
  )
}

export function subscribeTicket(
  db: Firestore,
  ticketId: string,
  onNext: (ticket: Ticket | null) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, TICKETS_COLLECTION, ticketId),
    (snap) => {
      if (!snap.exists()) {
        onNext(null)
        return
      }
      onNext(parseTicket(snap.id, snap.data() as Record<string, unknown>))
    },
    (err) => onError(err),
  )
}

/** Resgatar/assumir um chamado: agente do T.I vira responsável e passa a atender. */
export async function claimTicket(
  db: Firestore,
  ticketId: string,
  agent: TicketActor,
): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    assigneeUid: agent.uid,
    assigneeName: agent.name,
    status: 'em_atendimento' satisfies TicketStatus,
    updatedAt: serverTimestamp(),
  })
}

/** Liberar o chamado (remove o responsável e volta para a fila). */
export async function releaseTicket(
  db: Firestore,
  ticketId: string,
): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    assigneeUid: null,
    assigneeName: null,
    status: 'aberto' satisfies TicketStatus,
    updatedAt: serverTimestamp(),
  })
}

/** Alterar o status (T.I). Não usar para encerrar — use `resolveTicket`. */
export async function updateTicketStatus(
  db: Firestore,
  ticketId: string,
  status: Exclude<TicketStatus, 'resolvido'>,
): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

/** Encerrar com parecer resolutivo (obrigatório). Somente T.I. */
export async function resolveTicket(
  db: Firestore,
  ticketId: string,
  agent: TicketActor,
  parecer: string,
): Promise<void> {
  const text = parecer.trim()
  if (!text) throw new Error('Informe o parecer resolutivo para encerrar.')
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    status: 'resolvido' satisfies TicketStatus,
    resolution: {
      text,
      byUid: agent.uid,
      byName: agent.name,
      at: serverTimestamp(),
    },
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastReplyAt: serverTimestamp(),
    lastReplyRole: 'ti',
    lastReplyByUid: agent.uid,
  })
}

/** Reabrir um chamado resolvido (T.I), limpando o parecer anterior. */
export async function reopenTicket(
  db: Firestore,
  ticketId: string,
): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    status: 'em_atendimento' satisfies TicketStatus,
    resolution: null,
    resolvedAt: null,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Arquivar um chamado (T.I), com a etiqueta de desfecho escolhida
 * (`resolvido`, `nao_solucionado` ou `teste`). Sai das filas ativas e passa a
 * aparecer apenas na aba "Arquivados".
 */
export async function archiveTicket(
  db: Firestore,
  ticketId: string,
  agent: TicketActor,
  tag: TicketArchiveTag,
): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    archiveTag: tag,
    archivedAt: serverTimestamp(),
    archivedByUid: agent.uid,
    archivedByName: agent.name,
    updatedAt: serverTimestamp(),
  })
}

/** Desarquivar um chamado (T.I), retornando-o às filas ativas. */
export async function unarchiveTicket(
  db: Firestore,
  ticketId: string,
): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    archiveTag: null,
    archivedAt: null,
    archivedByUid: null,
    archivedByName: null,
    updatedAt: serverTimestamp(),
  })
}

/** Excluir definitivamente um chamado. Restrito ao Dev (ver firestore.rules). */
export async function deleteTicket(
  db: Firestore,
  ticketId: string,
): Promise<void> {
  await deleteDoc(doc(db, TICKETS_COLLECTION, ticketId))
}

function parseComment(
  id: string,
  data: Record<string, unknown>,
): TicketComment | null {
  const text = data.text
  const authorUid = data.authorUid
  const authorName = data.authorName
  const createdAt = data.createdAt
  const attachments = parseAttachments(data.attachments)
  const hasText = typeof text === 'string' && text.trim().length > 0
  if (!hasText && attachments.length === 0) return null
  if (typeof authorUid !== 'string' || authorUid.length === 0) return null
  if (typeof authorName !== 'string') return null
  return {
    id,
    text: typeof text === 'string' ? text : '',
    authorUid,
    authorName,
    authorPhotoURL:
      typeof data.authorPhotoURL === 'string' ? data.authorPhotoURL : null,
    authorRole: data.authorRole === 'ti' ? 'ti' : 'solicitante',
    createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(0),
    attachments,
  }
}

export function subscribeComments(
  db: Firestore,
  ticketId: string,
  onNext: (comments: TicketComment[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const q = query(
    collection(db, TICKETS_COLLECTION, ticketId, 'comments'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const list: TicketComment[] = []
      for (const d of snap.docs) {
        const parsed = parseComment(d.id, d.data() as Record<string, unknown>)
        if (parsed) list.push(parsed)
      }
      onNext(list)
    },
    (err) => onError(err),
  )
}

/**
 * Adiciona uma atualização (followup) na linha do tempo. Tanto o solicitante
 * quanto o T.I podem comentar. Mantém um contador best-effort no chamado.
 */
export async function addComment(
  db: Firestore,
  ticketId: string,
  actor: TicketActor,
  text: string,
  files: File[] = [],
): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed && files.length === 0) {
    throw new Error('Escreva uma atualização ou anexe uma imagem.')
  }
  const attachments = files.length
    ? await uploadTicketImages(ticketId, files, 'comments')
    : []
  await addDoc(collection(db, TICKETS_COLLECTION, ticketId, 'comments'), {
    text: trimmed,
    authorUid: actor.uid,
    authorName: actor.name,
    authorPhotoURL: actor.photoURL ?? null,
    authorRole: actor.isAgent ? 'ti' : 'solicitante',
    attachments,
    createdAt: serverTimestamp(),
  })
  try {
    await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
      commentsCount: increment(1),
      updatedAt: serverTimestamp(),
      lastReplyAt: serverTimestamp(),
      lastReplyRole: actor.isAgent ? 'ti' : 'solicitante',
      lastReplyByUid: actor.uid,
    })
  } catch {
    // contador é best-effort; ignora falha (ex.: solicitante sem update no doc)
  }
}

export async function getTicketOnce(
  db: Firestore,
  ticketId: string,
): Promise<Ticket | null> {
  const snap = await getDoc(doc(db, TICKETS_COLLECTION, ticketId))
  if (!snap.exists()) return null
  return parseTicket(snap.id, snap.data() as Record<string, unknown>)
}
