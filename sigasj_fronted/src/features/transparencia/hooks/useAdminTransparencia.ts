import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '../../auth/services/authStorage'
import { listAdminTransparenciaPublications } from '../../../shared/api/transparencia/adminTransparencia'
import type { AdminTransparenciaFilters } from '../types'

export function useAdminTransparencia(filters: AdminTransparenciaFilters) {
  const token = getAccessToken()

  return useQuery({
    queryKey: ['transparencia', 'admin', filters],
    queryFn: ({ signal }) =>
      listAdminTransparenciaPublications(token ?? '', filters, { signal }),
    enabled: Boolean(token),
  })
}
