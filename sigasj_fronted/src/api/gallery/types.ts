import { getApiBaseUrl } from '../config'
import type { GalleryPhoto } from '../../LandingPage/Props/GallerySectionProps'

export type PublicGaleriaFotoDto = Record<string, unknown>

export type PublicGalleryResponse =
  | PublicGaleriaFotoDto[]
  | {
      data?: PublicGaleriaFotoDto[]
      total?: number
    }

const asTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

const asId = (value: unknown): string | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return asTrimmedString(value)
}

export function extractPublicGalleryPayload(
  payload: PublicGalleryResponse,
): PublicGaleriaFotoDto[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  return []
}

export function resolveGalleryImageUrl(imagenUrl: string): string {
  if (/^https?:\/\//i.test(imagenUrl) || imagenUrl.startsWith('data:')) {
    return imagenUrl
  }

  try {
    const base = getApiBaseUrl()
    return imagenUrl.startsWith('/') ? `${base}${imagenUrl}` : `${base}/${imagenUrl}`
  } catch {
    return imagenUrl
  }
}

export function mapPublicGalleryPhoto(
  item: PublicGaleriaFotoDto,
): GalleryPhoto | null {
  const id = asId(item.id ?? item.idFotografiaGaleria)
  const imagenUrl = asTrimmedString(item.imagenUrl)
  const altText = asTrimmedString(item.textoAlternativo)

  if (!id || !imagenUrl || !altText) {
    return null
  }

  const title = asTrimmedString(item.titulo)
  const description = asTrimmedString(item.descripcion)

  return {
    id,
    imageUrl: resolveGalleryImageUrl(imagenUrl),
    altText,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  }
}
