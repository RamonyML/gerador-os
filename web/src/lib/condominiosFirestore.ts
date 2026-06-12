import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  isCondominioCategoria,
  type Condominio,
  type CondominioDraft,
} from '../types/condominio'

const COLLECTION = 'condominios'

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function dateOrNull(v: unknown): Date | null {
  return v instanceof Timestamp ? v.toDate() : null
}

function parseCondominio(
  id: string,
  data: Record<string, unknown>,
): Condominio | null {
  if (!isCondominioCategoria(data.categoria)) return null
  const nome = str(data.nome)
  if (!nome) return null
  return {
    id,
    categoria: data.categoria,
    nome,
    rua: str(data.rua),
    numero: str(data.numero),
    cep: str(data.cep),
    bairro: str(data.bairro),
    obs: str(data.obs),
    sindico: str(data.sindico),
    vistoriador: str(data.vistoriador),
    dataTentativa: str(data.dataTentativa),
    novaVistoria: str(data.novaVistoria),
    tecnicoResponsavel: str(data.tecnicoResponsavel),
    createdAt: dateOrNull(data.createdAt),
    updatedAt: dateOrNull(data.updatedAt),
  }
}

/** Normaliza um rascunho garantindo strings em todos os campos de texto. */
function normalizeDraft(draft: CondominioDraft): CondominioDraft {
  return {
    categoria: draft.categoria,
    nome: draft.nome.trim(),
    rua: str(draft.rua).trim(),
    numero: str(draft.numero).trim(),
    cep: str(draft.cep).trim(),
    bairro: str(draft.bairro).trim(),
    obs: str(draft.obs).trim(),
    sindico: str(draft.sindico).trim(),
    vistoriador: str(draft.vistoriador).trim(),
    dataTentativa: str(draft.dataTentativa).trim(),
    novaVistoria: str(draft.novaVistoria).trim(),
    tecnicoResponsavel: str(draft.tecnicoResponsavel).trim(),
  }
}

export function subscribeCondominios(
  db: Firestore,
  onNext: (list: Condominio[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy('nome', 'asc'))
  return onSnapshot(
    q,
    (snap) => {
      const list: Condominio[] = []
      for (const d of snap.docs) {
        const parsed = parseCondominio(d.id, d.data() as Record<string, unknown>)
        if (parsed) list.push(parsed)
      }
      onNext(list)
    },
    (err) => onError(err),
  )
}

export async function createCondominio(
  db: Firestore,
  draft: CondominioDraft,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...normalizeDraft(draft),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCondominio(
  db: Firestore,
  id: string,
  draft: CondominioDraft,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...normalizeDraft(draft),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCondominio(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

/** Conta quantos documentos já existem (para evitar importação duplicada). */
export async function countCondominios(db: Firestore): Promise<number> {
  const snap = await getDocs(collection(db, COLLECTION))
  return snap.size
}

/**
 * Importa muitos registros de uma vez (lotes de até 450 escritas). Usado pela
 * carga inicial a partir da planilha. Retorna a quantidade gravada.
 */
export async function importCondominios(
  db: Firestore,
  drafts: CondominioDraft[],
): Promise<number> {
  const CHUNK = 450
  let written = 0
  for (let i = 0; i < drafts.length; i += CHUNK) {
    const slice = drafts.slice(i, i + CHUNK)
    const batch = writeBatch(db)
    for (const draft of slice) {
      const ref = doc(collection(db, COLLECTION))
      batch.set(ref, {
        ...normalizeDraft(draft),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
    await batch.commit()
    written += slice.length
  }
  return written
}
