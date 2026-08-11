import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys'
import { getPublicGallery } from '../services/getPublicGallery'
import type { GalleryPhoto } from '../types'

export type PublicGalleryQueryStatus = 'loading' | 'success' | 'error'

type UsePublicGalleryResult = {
  status: PublicGalleryQueryStatus
  photos: GalleryPhoto[]
  total: number
  retry: () => void
}

function toStatus(
  enabled: boolean,
  isPending: boolean,
  isError: boolean,
): PublicGalleryQueryStatus {
  if (!enabled) {
    return 'success'
  }

  if (isError) {
    return 'error'
  }

  if (isPending) {
    return 'loading'
  }

  return 'success'
}

/**
 * Consulta la galería pública. Los errores no se propagan: quedan en status "error".
 */
export function usePublicGallery(enabled: boolean): UsePublicGalleryResult {
  const query = useQuery({
    queryKey: queryKeys.galeria.public,
    queryFn: ({ signal }) => getPublicGallery({ signal }),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  })

  return {
    status: toStatus(enabled, query.isPending, query.isError),
    photos: query.data?.photos ?? [],
    total: query.data?.total ?? 0,
    retry: () => {
      void query.refetch()
    },
  }
}
