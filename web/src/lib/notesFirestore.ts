import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Notebook, NoteSection, NotePage } from '../types/notes'

function parseDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  return new Date()
}

const notebooksCol = (uid: string) =>
  collection(db, 'users', uid, 'notebooks')

const sectionsCol = (uid: string, notebookId: string) =>
  collection(db, 'users', uid, 'notebooks', notebookId, 'sections')

const pagesCol = (uid: string, notebookId: string, sectionId: string) =>
  collection(db, 'users', uid, 'notebooks', notebookId, 'sections', sectionId, 'pages')

// ─── Notebooks ───────────────────────────────────────────────────────────────

export function subscribeNotebooks(
  uid: string,
  onNext: (notebooks: Notebook[]) => void
): Unsubscribe {
  const q = query(notebooksCol(uid), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    const result: Notebook[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        title: typeof data.title === 'string' ? data.title : 'Sem título',
        color: typeof data.color === 'string' ? data.color : '#1976d2',
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      }
    })
    onNext(result)
  })
}

export async function createNotebook(uid: string, title: string, color: string): Promise<string> {
  const ref = await addDoc(notebooksCol(uid), {
    title: title.trim() || 'Novo caderno',
    color,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateNotebook(
  uid: string,
  notebookId: string,
  patch: Partial<{ title: string; color: string }>
): Promise<void> {
  await setDoc(
    doc(notebooksCol(uid), notebookId),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

export async function deleteNotebook(uid: string, notebookId: string): Promise<void> {
  const sectSnap = await getDocs(sectionsCol(uid, notebookId))
  for (const sDoc of sectSnap.docs) {
    const pgSnap = await getDocs(pagesCol(uid, notebookId, sDoc.id))
    for (const pDoc of pgSnap.docs) await deleteDoc(pDoc.ref)
    await deleteDoc(sDoc.ref)
  }
  await deleteDoc(doc(notebooksCol(uid), notebookId))
}

// ─── Sections ────────────────────────────────────────────────────────────────

export function subscribeSections(
  uid: string,
  notebookId: string,
  onNext: (sections: NoteSection[]) => void
): Unsubscribe {
  const q = query(sectionsCol(uid, notebookId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    const result: NoteSection[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        notebookId,
        title: typeof data.title === 'string' ? data.title : 'Sem título',
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      }
    })
    onNext(result)
  })
}

export async function createSection(
  uid: string,
  notebookId: string,
  title: string
): Promise<string> {
  const ref = await addDoc(sectionsCol(uid, notebookId), {
    title: title.trim() || 'Nova seção',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateSection(
  uid: string,
  notebookId: string,
  sectionId: string,
  patch: Partial<{ title: string }>
): Promise<void> {
  await setDoc(
    doc(sectionsCol(uid, notebookId), sectionId),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

export async function deleteSection(
  uid: string,
  notebookId: string,
  sectionId: string
): Promise<void> {
  const pgSnap = await getDocs(pagesCol(uid, notebookId, sectionId))
  for (const pDoc of pgSnap.docs) await deleteDoc(pDoc.ref)
  await deleteDoc(doc(sectionsCol(uid, notebookId), sectionId))
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export function subscribePages(
  uid: string,
  notebookId: string,
  sectionId: string,
  onNext: (pages: NotePage[]) => void
): Unsubscribe {
  const q = query(pagesCol(uid, notebookId, sectionId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    const result: NotePage[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        notebookId,
        sectionId,
        title: typeof data.title === 'string' ? data.title : 'Sem título',
        content: typeof data.content === 'string' ? data.content : '',
        pinned: data.pinned === true,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      }
    })
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    onNext(result)
  })
}

export async function createPage(
  uid: string,
  notebookId: string,
  sectionId: string,
  title: string
): Promise<string> {
  const ref = await addDoc(pagesCol(uid, notebookId, sectionId), {
    title: title.trim() || 'Nova página',
    content: '',
    pinned: false,
    tags: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePage(
  uid: string,
  notebookId: string,
  sectionId: string,
  pageId: string,
  patch: Partial<{ title: string; content: string; pinned: boolean; tags: string[] }>
): Promise<void> {
  await setDoc(
    doc(pagesCol(uid, notebookId, sectionId), pageId),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

export async function deletePage(
  uid: string,
  notebookId: string,
  sectionId: string,
  pageId: string
): Promise<void> {
  await deleteDoc(doc(pagesCol(uid, notebookId, sectionId), pageId))
}
