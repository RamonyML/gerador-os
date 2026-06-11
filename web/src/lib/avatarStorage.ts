import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

/** Limite de tamanho do arquivo original escolhido: 10 MB. */
export const MAX_AVATAR_BYTES = 10 * 1024 * 1024

/** Lado (px) da imagem final quadrada gravada no Storage. */
export const AVATAR_OUTPUT_SIZE = 512

/** Formatos de imagem aceitos para a foto de perfil. */
export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp'

export type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

/** Valida o arquivo escolhido. Retorna mensagem de erro ou `null`. */
export function validateAvatarFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Selecione um arquivo de imagem (PNG, JPG ou WEBP).'
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return 'A imagem excede o limite de 10MB.'
  }
  return null
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'))
    img.src = src
  })
}

/**
 * Recorta a área selecionada (em pixels da imagem original) e devolve um Blob
 * JPEG quadrado de `AVATAR_OUTPUT_SIZE`px.
 */
export async function getCroppedAvatarBlob(
  imageSrc: string,
  area: CropArea,
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_OUTPUT_SIZE
  canvas.height = AVATAR_OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Falha ao processar a imagem.')

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Falha ao gerar a imagem recortada.'))
      },
      'image/jpeg',
      0.9,
    )
  })
}

/** Envia a foto recortada para o Storage e devolve a URL de download. */
export async function uploadAvatar(uid: string, blob: Blob): Promise<string> {
  const path = `users/${uid}/avatar/${Date.now()}.jpg`
  const r = storageRef(storage, path)
  await uploadBytes(r, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(r)
}
