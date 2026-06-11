import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'
import type { TicketAttachment } from '../types/ticket'

/** Limite de tamanho por arquivo: 10 MB. */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

/** Quantidade máxima de imagens por envio (abertura ou atualização). */
export const MAX_ATTACHMENT_COUNT = 5

/** Formatos de imagem aceitos (prints e fotos). */
export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]

/** Valor para o atributo `accept` de inputs de arquivo. */
export const ATTACHMENT_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'

/** Mensagem amigável com os limites, para uso em textos de ajuda. */
export const ATTACHMENT_HINT =
  'Até 5 imagens (PNG, JPG, WEBP ou GIF) de até 10MB cada.'

/** Formata bytes em uma string curta (ex.: `2.3 MB`). */
export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** Valida um arquivo. Retorna mensagem de erro ou `null` se estiver ok. */
export function validateImageFile(file: File): string | null {
  const isImage =
    file.type.startsWith('image/') && ACCEPTED_IMAGE_TYPES.includes(file.type)
  if (!isImage) {
    return `"${file.name}": formato não suportado. Use PNG, JPG, WEBP ou GIF.`
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `"${file.name}" (${formatBytes(file.size)}) excede o limite de 10MB.`
  }
  return null
}

function sanitizeName(name: string): string {
  const cleaned = name.replace(/[^\w.-]+/g, '_')
  return cleaned.length > 80 ? cleaned.slice(-80) : cleaned
}

/**
 * Envia imagens para o Storage sob o caminho do chamado e devolve os metadados
 * (incluindo a URL de download) para gravar no Firestore.
 *
 * @param folder `root` para anexos do chamado; `comments` para anexos da timeline.
 */
export async function uploadTicketImages(
  ticketId: string,
  files: File[],
  folder: 'root' | 'comments' = 'root',
): Promise<TicketAttachment[]> {
  if (files.length > MAX_ATTACHMENT_COUNT) {
    throw new Error(
      `Você pode anexar no máximo ${MAX_ATTACHMENT_COUNT} imagens por vez.`,
    )
  }
  const base =
    folder === 'comments'
      ? `tickets/${ticketId}/comments`
      : `tickets/${ticketId}`
  const out: TicketAttachment[] = []
  for (const file of files) {
    const err = validateImageFile(file)
    if (err) throw new Error(err)
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const path = `${base}/${unique}-${sanitizeName(file.name)}`
    const r = storageRef(storage, path)
    await uploadBytes(r, file, { contentType: file.type })
    const url = await getDownloadURL(r)
    out.push({
      path,
      url,
      name: file.name,
      contentType: file.type,
      size: file.size,
    })
  }
  return out
}
