import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys'
import { getPublicAnnouncements } from '../services/getPublicAnnouncements'
import type { Announcement } from '../types'

export type PublicAnnouncementsQueryStatus = 'loading' | 'success' | 'error'

type UsePublicAnnouncementsResult = {
  status: PublicAnnouncementsQueryStatus
  announcements: Announcement[]
  /** true solo si el Back-end indica explícitamente que hay más registros. */
  hasMore: boolean
  retry: () => void
}

function toStatus(
  enabled: boolean,
  isPending: boolean,
  isError: boolean,
): PublicAnnouncementsQueryStatus {
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
 * Consulta comunicados públicos. Los errores no se propagan: quedan en status "error".
 */
export function usePublicAnnouncements(
  enabled: boolean,
): UsePublicAnnouncementsResult {
  const query = useQuery({
    queryKey: queryKeys.comunicados.public,
    queryFn: ({ signal }) => getPublicAnnouncements({ signal }),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  })

  return {
    status: toStatus(enabled, query.isPending, query.isError),
    announcements: query.data?.announcements ?? [],
    hasMore: query.data?.pagination.hasMore ?? false,
    retry: () => {
      void query.refetch()
    },
  }
}
