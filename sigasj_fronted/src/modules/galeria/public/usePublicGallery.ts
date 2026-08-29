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

const isUsablePublicPhoto = (photo: GalleryPhoto) =>
  Boolean(photo.imageUrl) && !photo.imageUrl.startsWith('/images/')

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
      const usable = data.filter(isUsablePublicPhoto)
      setPhotos(usable)
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
    status: status === 'error' ? 'success' : status,
    photos,
    total: photos.length,
    retry: () => {
      void load()
    },
  }
}
