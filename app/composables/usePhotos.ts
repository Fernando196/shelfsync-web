import type { IPhoto } from '~/types/item.type'

export type PhotoSize = 'thumb' | 'medium' | 'original'

/**
 * Las URLs de fotos son relativas al host del API sin /api (ej. /uploads/..).
 * thumb = 240px · medium = 800px · original = solo para pantalla completa / descarga.
 */
export function usePhotos() {
  const config = useRuntimeConfig()

  function photoUrl(photo: IPhoto | null | undefined, size: PhotoSize = 'medium') {
    if (!photo) return null
    const path =
      size === 'thumb'
        ? (photo.thumbnailUrl ?? photo.mediumUrl ?? photo.url)
        : size === 'medium'
          ? (photo.mediumUrl ?? photo.url)
          : photo.url
    if (!path) return null
    if (/^https?:\/\//.test(path)) return path
    return `${config.public.apiBase}${path.startsWith('/') ? '' : '/'}${path}`
  }

  return { photoUrl }
}

/** Reduce la imagen a 2048px por lado a JPEG 0.85 (igual que la app móvil) antes de subirla */
export async function compressImage(file: File, maxSide = 2048, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))), 'image/jpeg', quality)
  )
}
