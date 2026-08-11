import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys'
import { getPublicTransparencia } from '../../../shared/api/transparencia/getPublicTransparencia'
import type { TransparencyPublication } from '../../landing/props/TransparencySectionProps'

export type PublicTransparenciaQueryStatus = 'loading' | 'success' | 'error'

type UsePublicTransparenciaResult = {
  status: PublicTransparenciaQueryStatus
  publications: TransparencyPublication[]
  total: number
  retry: () => void
}

function toStatus(
  enabled: boolean,
  isPending: boolean,
  isError: boolean,
): PublicTransparenciaQueryStatus {
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
 * Consulta transparencia pública. Los errores no se propagan: quedan en status "error".
 */
export function usePublicTransparencia(
  enabled: boolean,
): UsePublicTransparenciaResult {
  const query = useQuery({
    queryKey: queryKeys.transparencia.public,
    queryFn: ({ signal }) => getPublicTransparencia({ signal }),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  })

  return {
    status: toStatus(enabled, query.isPending, query.isError),
    publications: query.data?.publications ?? [],
    total: query.data?.total ?? 0,
    retry: () => {
      void query.refetch()
    },
  }
}
