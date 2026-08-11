import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '../../auth/services/authStorage'
import { queryKeys } from '../../../shared/api/queryKeys'
import { listAdminGalleryPhotos } from '../services/adminGallery'
import type { AdminGalleryFilters } from '../types'

export function useAdminGalleryPhotos(filters: AdminGalleryFilters) {
  const token = getAccessToken()

  return useQuery({
    queryKey: queryKeys.galeria.admin(filters),
    queryFn: ({ signal }) => listAdminGalleryPhotos(token ?? '', filters, { signal }),
    enabled: Boolean(token),
  })
}
