import type { GalleryPhoto } from './GallerySectionProps'
import { galleryMocks } from './galleryMocks'

export type PublicGalleryQueryStatus = 'loading' | 'success' | 'error'

type UsePublicGalleryResult = {
  status: PublicGalleryQueryStatus
  photos: GalleryPhoto[]
  total: number
  retry: () => void
}

/**
 * Entrega fotografías de ejemplo para la sección pública.
 */
export function usePublicGallery(enabled: boolean): UsePublicGalleryResult {
  const photos = enabled ? galleryMocks : []

  return {
    status: 'success',
    photos,
    total: photos.length,
    retry: () => {},
  }
}
