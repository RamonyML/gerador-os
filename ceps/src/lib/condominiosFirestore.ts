import { collection, onSnapshot, orderBy, query, Timestamp, type Firestore, type Unsubscribe } from 'firebase/firestore'
import { isCondominioCategoria, isCondominioGeocodeStatus, type Condominio } from '../types/condominio'

const COLLECTION = 'condominios'

function str(v: unknown): string { return typeof v === 'string' ? v : '' }
function numOrNull(v: unknown): number | null { return typeof v === 'number' && Number.isFinite(v) ? v : null }

function parseCondominio(id: string, data: Record<string, unknown>): Condominio | null {
  if (!isCondominioCategoria(data.categoria)) return null
  const nome = str(data.nome)
  if (!nome) return null
  const lat = numOrNull(data.lat)
  const lng = numOrNull(data.lng)
  const geocodeStatus = isCondominioGeocodeStatus(data.geocodeStatus)
    ? data.geocodeStatus
    : lat != null && lng != null ? 'ok' : 'pending'
  return {
    id, categoria: data.categoria, nome,
    rua: str(data.rua), numero: str(data.numero), cep: str(data.cep),
    bairro: str(data.bairro), obs: str(data.obs),
    lat, lng, geocodeStatus,
  }
}

export function subscribeCondominios(
  db: Firestore,
  onNext: (list: Condominio[]) => void,
  onError: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy('nome', 'asc'))
  return onSnapshot(q, (snap) => {
    const list: Condominio[] = []
    for (const d of snap.docs) {
      const parsed = parseCondominio(d.id, d.data() as Record<string, unknown>)
      if (parsed) list.push(parsed)
    }
    onNext(list)
  }, onError)
}
