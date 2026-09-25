import { useCallback, useEffect, useState } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { isAbortError, parseAveriaAdminError } from '../admin/averiaAdminError'
import { AVERIAS_REPORTE_LOAD_ERROR, type AveriasReporteResumen } from '../admin/types'
import {
  getAdminAveriasReporteResumen,
  type AveriasReporteResumenQuery,
} from '../services/averiasAdminApi'

export type UseAdminAveriasReporteResumenResult = {
  resumen: AveriasReporteResumen | null
  loading: boolean
  error: string | null
  unauthorized: boolean
  forbidden: boolean
  refetch: () => void
}

export function useAdminAveriasReporteResumen(
  query: AveriasReporteResumenQuery,
  options: { enabled?: boolean } = {},
): UseAdminAveriasReporteResumenResult {
  const enabled = options.enabled ?? true
  const [resumen, setResumen] = useState<AveriasReporteResumen | null>(null)
  const [fetchLoading, setFetchLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const fechaDesde = query.fechaDesde
  const fechaHasta = query.fechaHasta

  const refetch = useCallback(() => {
    setReloadTrigger((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
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
        const result = await getAdminAveriasReporteResumen(
          { fechaDesde, fechaHasta },
          controller.signal,
        )
        if (!cancelled) {
          setResumen(result)
        }
      } catch (caught) {
        if (cancelled || isAbortError(caught)) {
          return
        }
        const parsed = parseAveriaAdminError(caught)
        if (parsed.kind === 'unauthorized') {
          clearAccessToken()
          setUnauthorized(true)
          setError(null)
        } else if (parsed.kind === 'forbidden') {
          setForbidden(true)
          setError(null)
        } else {
          setError(AVERIAS_REPORTE_LOAD_ERROR)
          setResumen(null)
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
  }, [enabled, fechaDesde, fechaHasta, reloadTrigger])

  return {
    resumen,
    loading: enabled && fetchLoading,
    error: enabled ? error : null,
    unauthorized: enabled && unauthorized,
    forbidden: enabled && forbidden,
    refetch,
  }
}
