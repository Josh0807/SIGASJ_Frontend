import { getPublicGalleryPath } from '../../../shared/api/config'
import { fetchJson } from '../../../shared/api/http'
import {
  extractPublicGalleryPayload,
  mapPublicGalleryPhoto,
  type PublicGalleryResponse,
} from './types'
import type { GalleryPhoto } from '../types'
import { ApiError } from '../../../shared/api/ApiError'

type GetPublicGalleryOptions = {
  signal?: AbortSignal
}

export type PublicGalleryResult = {
  photos: GalleryPhoto[]
  total: number
}

/**
 * Consulta las fotografías públicas de la galería.
 */
export async function getPublicGallery(
  options: GetPublicGalleryOptions = {},
): Promise<PublicGalleryResult> {
  const payload = await fetchJson<PublicGalleryResponse>(getPublicGalleryPath(), {
    signal: options.signal,
  })

  if (payload === null || typeof payload !== 'object') {
    throw new ApiError(
      'La respuesta del servidor no contiene una galería válida.',
      'PARSE',
    )
  }

  const rawItems = extractPublicGalleryPayload(payload)
  const photos = rawItems.flatMap((item) => {
    try {
      const mapped = mapPublicGalleryPhoto(item)
      return mapped ? [mapped] : []
    } catch {
      return []
    }
  })

  const total =
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    typeof payload.total === 'number' &&
    Number.isFinite(payload.total)
      ? payload.total
      : photos.length

  return { photos, total }
}
