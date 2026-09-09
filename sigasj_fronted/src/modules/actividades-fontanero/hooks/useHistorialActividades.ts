import { useEffect, useState } from 'react'
import { getHistorialActividades } from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import {
  historialFiltersKey,
  normalizeHistorialFilters,
  type HistorialActividadesFilters,
} from '../types/actividadHistorial'
import { deriveHistorialPagination } from '../utils/historialActividadesList'
import {
  extractHttpErrorMessage,
  getHttpErrorStatus,
} from '../utils/httpErrorStatus'

export type HistorialActividadesState = {
  actividades: ActividadFontaneroRegistrada[]
  total: number
  page: number
  totalPages: number
  limit: number
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  isUnauthorized: boolean
  isForbidden: boolean
  errorMessage: string | null
  refetch: () => void
}

export function useHistorialActividades(
  filters: HistorialActividadesFilters,
): HistorialActividadesState {
  const [actividades, setActividades] = useState<ActividadFontaneroRegistrada[]>(
    [],
  )
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [isForbidden, setIsForbidden] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const filtersKey = historialFiltersKey(filters)

  useEffect(() => {
    let cancelled = false

    const applyResolved = (resolved: ReturnType<typeof deriveHistorialPagination>) => {
      setActividades(resolved.actividades)
      setTotal(resolved.total)
      setPage(resolved.page)
      setTotalPages(resolved.totalPages)
      setLimit(resolved.limit)
    }

    const load = async () => {
      setIsLoading(true)
      setIsError(false)
      setIsUnauthorized(false)
      setIsForbidden(false)
      setErrorMessage(null)

      const normalized = normalizeHistorialFilters(filters)

      try {
        let result = await getHistorialActividades(normalized)
        if (cancelled) {
          return
        }

        let resolved = deriveHistorialPagination(result, normalized)

        if (
          resolved.total > 0 &&
          resolved.actividades.length === 0 &&
          normalized.page > 1
        ) {
          const retried = await getHistorialActividades({
            ...normalized,
            page: 1,
          })
          if (cancelled) {
            return
          }
          result = retried
          resolved = deriveHistorialPagination(retried, {
            ...normalized,
            page: 1,
          })
        }

        applyResolved(resolved)
      } catch (error) {
        if (cancelled) {
          return
        }
        const status = getHttpErrorStatus(error)
        setActividades([])
        setTotal(0)
        setPage(1)
        setTotalPages(1)
        setIsUnauthorized(status === 401)
        setIsForbidden(status === 403)

        if (status === 400) {
          setErrorMessage(
            extractHttpErrorMessage(
              error,
              'Los filtros del historial no son válidos.',
            ),
          )
          setIsError(true)
        } else {
          setErrorMessage(null)
          setIsError(status !== 401 && status !== 403)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [filtersKey, reloadKey])

  return {
    actividades,
    total,
    page,
    totalPages,
    limit,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && total === 0,
    isUnauthorized,
    isForbidden,
    errorMessage,
    refetch: () => setReloadKey((value) => value + 1),
  }
}
