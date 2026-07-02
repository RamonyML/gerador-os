import {
  Firestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import type { CatalogoCategoria, CatalogoItem, CatalogoItemDraft } from '../types/catalogo'

function itensCol(db: Firestore, categoria: CatalogoCategoria) {
  return collection(db, 'catalogo', categoria, 'itens')
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}

export function subscribeCatalogo(
  db: Firestore,
  categoria: CatalogoCategoria,
  onData: (items: CatalogoItem[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const q = query(itensCol(db, categoria), orderBy('ordem', 'asc'))
  return onSnapshot(
    q,
    (snap) => {
      const items: CatalogoItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CatalogoItem, 'id'>),
      }))
      onData(items)
    },
    (err) => onError(err as Error),
  )
}

export async function createCatalogoItem(
  db: Firestore,
  categoria: CatalogoCategoria,
  draft: CatalogoItemDraft,
): Promise<string> {
  const ref = await addDoc(itensCol(db, categoria), {
    ...stripUndefined(draft),
    criadoEm: serverTimestamp(),
  })
  return ref.id
}

export async function updateCatalogoItem(
  db: Firestore,
  categoria: CatalogoCategoria,
  id: string,
  changes: Partial<CatalogoItemDraft>,
): Promise<void> {
  await updateDoc(doc(itensCol(db, categoria), id), changes)
}

export async function deleteCatalogoItem(
  db: Firestore,
  categoria: CatalogoCategoria,
  id: string,
): Promise<void> {
  await deleteDoc(doc(itensCol(db, categoria), id))
}

/**
 * Importa os itens padrão para uma categoria. Só insere se a categoria estiver vazia.
 * Retorna o número de itens inseridos (0 se já havia itens).
 */
export async function importarPadraoCatalogo(
  db: Firestore,
  categoria: CatalogoCategoria,
  drafts: CatalogoItemDraft[],
): Promise<number> {
  const snap = await getDocs(itensCol(db, categoria))
  if (!snap.empty) return 0
  await Promise.all(
    drafts.map((draft) =>
      addDoc(itensCol(db, categoria), { ...stripUndefined(draft), criadoEm: serverTimestamp() }),
    ),
  )
  return drafts.length
}

export async function reorderCatalogoItem(
  db: Firestore,
  categoria: CatalogoCategoria,
  id: string,
  novaOrdem: number,
): Promise<void> {
  await updateDoc(doc(itensCol(db, categoria), id), { ordem: novaOrdem })
}
