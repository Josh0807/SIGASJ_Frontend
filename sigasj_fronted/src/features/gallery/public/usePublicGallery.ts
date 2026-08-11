import { useEffect, useState } from 'react'
import { getPublicGallery } from '../api/getPublicGallery'
import type { GalleryPhoto } from './GallerySectionProps'

export type PublicGalleryQueryStatus = 'loading' | 'success' | 'error'

type UsePublicGalleryResult = {
  status: PublicGalleryQueryStatus
  photos: GalleryPhoto[]
  total: number
  retry: () => void
}

/**
 * Consulta la galería pública. Los errores no se propagan: quedan en status "error".
 */
export function usePublicGallery(enabled: boolean): UsePublicGalleryResult {
  const [status, setStatus] = useState<PublicGalleryQueryStatus>(
    enabled ? 'loading' : 'success',
  )
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [total, setTotal] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const controller = new AbortController()
    let cancelled = false

    setStatus('loading')

    getPublicGallery({ signal: controller.signal })
      .then((result) => {
        if (cancelled) {
          return
        }

        setPhotos(result.photos)
        setTotal(result.total)
        setStatus('success')
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setPhotos([])
        setTotal(0)
        setStatus('error')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [enabled, retryCount])

  return {
    status,
    photos,
    total,
    retry: () => setRetryCount((count) => count + 1),
  }
}
