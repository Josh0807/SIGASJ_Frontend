import { useCallback, useEffect, useState } from 'react'
import type { GalleryPhoto } from './GallerySectionProps'
import { getPublicGaleria } from '../services/galeriaApi'

export type PublicGalleryQueryStatus = 'loading' | 'success' | 'error'

type UsePublicGalleryResult = {
  status: PublicGalleryQueryStatus
  photos: GalleryPhoto[]
  total: number
  retry: () => void
}

export function usePublicGallery(enabled: boolean): UsePublicGalleryResult {
  const [status, setStatus] = useState<PublicGalleryQueryStatus>(
    enabled ? 'loading' : 'success',
  )
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])

  const load = useCallback(async () => {
    if (!enabled) {
      setStatus('success')
      setPhotos([])
      return
    }

    setStatus('loading')

    try {
      const data = await getPublicGaleria()
      setPhotos(data)
      setStatus('success')
    } catch {
      setPhotos([])
      setStatus('error')
    }
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load])

  return {
    status,
    photos,
    total: photos.length,
    retry: () => {
      void load()
    },
  }
}
