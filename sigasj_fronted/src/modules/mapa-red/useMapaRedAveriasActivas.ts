import { useCallback, useEffect, useRef, useState } from 'react'
import { clearAccessToken } from '../auth/utils/authStorage'
import {
  isAbortError,
  parseAveriaAdminError,
} from '../averias/admin/averiaAdminError'
import type { AveriaListItem } from '../averias/admin/types'
import { getAdminAverias } from '../averias/services/averiasAdminApi'
import {
  ESTADOS_AVERIA_ACTIVOS,
  toAveriaMapaItem,
  type AveriaMapaItem,
} from './mapaRedAverias'

const PAGE_LIMIT = 100
/** Sondeo periódico (no se presenta como “tiempo real”). */
const POLL_MS = 60_000

export type UseMapaRedAveriasActivasResult = {
  averias: AveriaMapaItem[]
  loading: boolean
  error: string | null
  unauthorized: boolean
  forbidden: boolean
  lastUpdatedAt: number | null
  refetch: () => void
}

async function fetchActivasPorEstado(
  estado: string,
  signal: AbortSignal,
): Promise<AveriaListItem[]> {
  const primera = await getAdminAverias(
    { page: 1, limit: PAGE_LIMIT, estado },
    signal,
  )
  const acumulado = [...primera.data]
  const tope = Math.min(primera.totalPages, 3)
  for (let page = 2; page <= tope; page += 1) {
    const siguiente = await getAdminAverias(
      { page, limit: PAGE_LIMIT, estado },
      signal,
    )
    acumulado.push(...siguiente.data)
  }
  return acumulado
}

export function useMapaRedAveriasActivas(
  options: { enabled?: boolean; pollMs?: number | false } = {},
): UseMapaRedAveriasActivasResult {
  const enabled = options.enabled ?? true
  const pollMs = options.pollMs === false ? 0 : (options.pollMs ?? POLL_MS)

  const [averias, setAverias] = useState<AveriaMapaItem[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const requestId = useRef(0)

  const refetch = useCallback(() => {
    setReloadTrigger((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const currentRequest = ++requestId.current

    const load = async () => {
      setLoading(true)
      setError(null)
      setUnauthorized(false)
      setForbidden(false)

      try {
        const pages = await Promise.all(
          ESTADOS_AVERIA_ACTIVOS.map((estado) =>
            fetchActivasPorEstado(estado, controller.signal),
          ),
        )
        if (controller.signal.aborted || currentRequest !== requestId.current) {
          return
        }

        const byId = new Map<number, AveriaListItem>()
        for (const item of pages.flat()) {
          byId.set(item.id, item)
        }

        const mapped = [...byId.values()]
          .map(toAveriaMapaItem)
          .sort(
            (a, b) =>
              new Date(b.fechaReporte).getTime() -
              new Date(a.fechaReporte).getTime(),
          )

        setAverias(mapped)
        setLastUpdatedAt(Date.now())
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) return
        if (currentRequest !== requestId.current) return

        const parsed = parseAveriaAdminError(err)
        if (parsed.unauthorized) {
          clearAccessToken()
          setUnauthorized(true)
        }
        if (parsed.forbidden) setForbidden(true)
        setError(parsed.message || 'No se pudieron cargar las averías activas.')
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [enabled, reloadTrigger])

  useEffect(() => {
    if (!enabled || !pollMs) return

    const id = window.setInterval(() => {
      setReloadTrigger((n) => n + 1)
    }, pollMs)

    const onFocus = () => setReloadTrigger((n) => n + 1)
    window.addEventListener('focus', onFocus)

    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [enabled, pollMs])

  return {
    averias,
    loading,
    error,
    unauthorized,
    forbidden,
    lastUpdatedAt,
    refetch,
  }
}
