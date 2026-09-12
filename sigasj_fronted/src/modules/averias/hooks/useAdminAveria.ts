import { useCallback, useEffect, useState } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import {
  isAbortError,
  parseAveriaAdminError,
} from '../admin/averiaAdminError'
import { parseAveriaAdminId } from '../admin/parseAveriaAdminId'
import {
  AVERIAS_ADMIN_DETAIL_ERROR,
  type AveriaDetail,
} from '../admin/types'
import { getAdminAveria } from '../services/averiasAdminApi'

export type UseAdminAveriaResult = {
  averia: AveriaDetail | null
  loading: boolean
  error: string | null
  notFound: boolean
  unauthorized: boolean
  forbidden: boolean
  refetch: () => void
}

export function useAdminAveria(
  id: string | number | null | undefined,
  options: { enabled?: boolean } = {},
): UseAdminAveriaResult {
  const enabled = options.enabled ?? true
  const parsedId = parseAveriaAdminId(id)
  const canFetch = enabled && parsedId !== null
  const [averia, setAveria] = useState<AveriaDetail | null>(null)
  const [fetchLoading, setFetchLoading] = useState(canFetch)
  const [error, setError] = useState<string | null>(null)
  const [fetchNotFound, setFetchNotFound] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const refetch = useCallback(() => {
    setReloadTrigger((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!canFetch || parsedId === null) {
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const load = async () => {
      setAveria(null)
      setFetchLoading(true)
      setError(null)
      setFetchNotFound(false)
      setUnauthorized(false)
      setForbidden(false)

      try {
        const result = await getAdminAveria(parsedId, controller.signal)
        if (!cancelled) {
          setAveria(result)
        }
      } catch (caught) {
        if (cancelled || isAbortError(caught)) {
          return
        }

        const parsed = parseAveriaAdminError(caught)
        setAveria(null)

        if (parsed.kind === 'unauthorized') {
          clearAccessToken()
          setUnauthorized(true)
        } else if (parsed.kind === 'forbidden') {
          setForbidden(true)
        } else if (parsed.kind === 'not-found') {
          setFetchNotFound(true)
        } else {
          setError(AVERIAS_ADMIN_DETAIL_ERROR)
        }
      } finally {
        if (!cancelled) {
          setFetchLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [canFetch, parsedId, reloadTrigger])

  return {
    averia: canFetch ? averia : null,
    loading: canFetch && fetchLoading,
    error: canFetch ? error : null,
    notFound: enabled && (parsedId === null || fetchNotFound),
    unauthorized: canFetch && unauthorized,
    forbidden: canFetch && forbidden,
    refetch,
  }
}
