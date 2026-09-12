import { useCallback, useEffect, useState } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import {
  isAbortError,
  parseAveriaAdminError,
} from '../admin/averiaAdminError'
import {
  AVERIAS_ADMIN_LOAD_ERROR,
  DEFAULT_AVERIAS_LIMIT,
  DEFAULT_AVERIAS_PAGE,
  EMPTY_AVERIAS_LISTADO,
  type AveriasAdminListado,
  type AveriasAdminQuery,
} from '../admin/types'
import { getAdminAverias } from '../services/averiasAdminApi'

export type UseAdminAveriasResult = {
  listado: AveriasAdminListado
  loading: boolean
  error: string | null
  unauthorized: boolean
  forbidden: boolean
  refetch: () => void
}

export function useAdminAverias(
  query: AveriasAdminQuery,
  options: { enabled?: boolean } = {},
): UseAdminAveriasResult {
  const enabled = options.enabled ?? true
  const [listado, setListado] = useState<AveriasAdminListado>(EMPTY_AVERIAS_LISTADO)
  const [fetchLoading, setFetchLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const page = query.page ?? DEFAULT_AVERIAS_PAGE
  const limit = query.limit ?? DEFAULT_AVERIAS_LIMIT
  const search = query.search
  const estado = query.estado
  const prioridad = query.prioridad
  const tipo = query.tipo
  const fontaneroId = query.fontaneroId
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
        const result = await getAdminAverias(
          {
            page,
            limit,
            search,
            estado,
            prioridad,
            tipo,
            fontaneroId,
            fechaDesde,
            fechaHasta,
          },
          controller.signal,
        )

        if (!cancelled) {
          setListado(result)
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
          setError(AVERIAS_ADMIN_LOAD_ERROR)
        }

        setListado({
          ...EMPTY_AVERIAS_LISTADO,
          page,
          limit,
        })
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
  }, [
    enabled,
    page,
    limit,
    search,
    estado,
    prioridad,
    tipo,
    fontaneroId,
    fechaDesde,
    fechaHasta,
    reloadTrigger,
  ])

  return {
    listado,
    loading: enabled && fetchLoading,
    error: enabled ? error : null,
    unauthorized: enabled && unauthorized,
    forbidden: enabled && forbidden,
    refetch,
  }
}
