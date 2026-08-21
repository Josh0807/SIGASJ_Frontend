import { useEffect, useState } from 'react'
import { fetchPublicGallery } from '../services/galleryService'
import type { GalleryPhoto } from './GallerySectionProps'

export type PublicGalleryQueryStatus = 'loading' | 'success' | 'error'

type UsePublicGalleryResult = {
  status: PublicGalleryQueryStatus
  photos: GalleryPhoto[]
  total: number
  retry: () => void
}

/**
 * Carga la galería pública desde GET /api/v1/public/galeria.
 */
export function usePublicGallery(enabled: boolean): UsePublicGalleryResult {
  const [status, setStatus] = useState<PublicGalleryQueryStatus>(
    enabled ? 'loading' : 'success',
  )
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setPhotos([])
      setStatus('success')
      return
    }

    let cancelled = false
    setStatus('loading')

    fetchPublicGallery()
      .then((items) => {
        if (!cancelled) {
          setPhotos(items)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPhotos([])
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, retryKey])

  return {
    status,
    photos,
    total: photos.length,
    retry: () => setRetryKey((current) => current + 1),
  }
}
