import { useCallback, useEffect, useState } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { isAbortError, parseAveriaAdminError } from '../admin/averiaAdminError'
import { parseAveriaAdminId } from '../admin/parseAveriaAdminId'
import {
  AVERIAS_EVENTOS_LOAD_ERROR,
  type AveriaEventoHistorial,
} from '../admin/types'
import { getAdminAveriaEventosHistorial } from '../services/averiasAdminApi'

export type UseAdminAveriaEventosHistorialResult = {
  eventos: AveriaEventoHistorial[]
  loading: boolean
  error: string | null
  unauthorized: boolean
  forbidden: boolean
  refetch: () => void
}

export function useAdminAveriaEventosHistorial(
  id: number | null | undefined,
): UseAdminAveriaEventosHistorialResult {
  const parsedId = parseAveriaAdminId(id)
  const [eventos, setEventos] = useState<AveriaEventoHistorial[]>([])
  const [fetchLoading, setFetchLoading] = useState(parsedId != null)
  const [error, setError] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const refetch = useCallback(() => {
    setReloadTrigger((current) => current + 1)
  }, [])

  useEffect(() => {
    if (parsedId == null) {
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const load = async () => {
      setFetchLoading(true)
      setError(null)
      setUnauthorized(false)
      setForbidden(false)

      try {
        const result = await getAdminAveriaEventosHistorial(
          parsedId,
          controller.signal,
        )
        if (!cancelled) {
          setEventos(Array.isArray(result.data) ? result.data : [])
        }
      } catch (caught) {
        if (cancelled || isAbortError(caught)) {
          return
        }
        setEventos([])
        const parsed = parseAveriaAdminError(caught)
        if (parsed.kind === 'unauthorized') {
          clearAccessToken()
          setUnauthorized(true)
        } else if (parsed.kind === 'forbidden') {
          setForbidden(true)
        } else {
          setError(AVERIAS_EVENTOS_LOAD_ERROR)
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
  }, [parsedId, reloadTrigger])

  return {
    eventos: parsedId == null ? [] : eventos,
    loading: parsedId != null && fetchLoading,
    error: parsedId == null ? null : error,
    unauthorized: parsedId != null && unauthorized,
    forbidden: parsedId != null && forbidden,
    refetch,
  }
}
