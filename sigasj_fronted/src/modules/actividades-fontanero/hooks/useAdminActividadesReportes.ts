import { useEffect, useRef, useState } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import {
  getReportesAdmin,
  type ReporteActividadesFilters,
  type ReporteActividadesResponse,
} from '../services/actividadesFontaneroApi'
import { EMPTY_REPORTE_ACTIVIDADES } from '../types/actividadReportes'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'

const HTTP_DETAIL_PATTERN = /^HTTP \d+:\s*([\s\S]*)$/

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof Error) || !error.message.trim()) {
    return fallback
  }
  const match = HTTP_DETAIL_PATTERN.exec(error.message)
  const detail = match?.[1]?.trim()
  if (!detail) {
    return fallback
  }
  try {
    const parsed = JSON.parse(detail) as unknown
    if (Array.isArray(parsed)) {
      return parsed.map(String).join('. ')
    }
    if (typeof parsed === 'string' && parsed.trim()) {
      return parsed.trim()
    }
  } catch {
    // detalle plano del backend
  }
  return detail.length > 200 ? fallback : detail
}

export type UseAdminActividadesReportesResult = {
  reporte: ReporteActividadesResponse
  loading: boolean
  error: string | null
  forbidden: boolean
  unauthorized: boolean
  refetch: () => void
}

/**
 * Consulta el reporte administrativo según filtros aplicados.
 * Cancela actualizaciones de respuestas obsoletas (race).
 */
export function useAdminActividadesReportes(
  filters: ReporteActividadesFilters,
): UseAdminActividadesReportesResult {
  const [reporte, setReporte] = useState<ReporteActividadesResponse>(
    EMPTY_REPORTE_ACTIVIDADES,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const requestIdRef = useRef(0)

  const fechaInicio = filters.fechaInicio
  const fechaFin = filters.fechaFin
  const fontaneroId = filters.fontaneroId
  const tipoActividadId = filters.tipoActividadId

  useEffect(() => {
    const requestId = ++requestIdRef.current
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setForbidden(false)
      setUnauthorized(false)

      try {
        const result = await getReportesAdmin({
          fechaInicio,
          fechaFin,
          fontaneroId,
          tipoActividadId,
        })
        if (cancelled || requestId !== requestIdRef.current) {
          return
        }
        setReporte(result)
      } catch (caught) {
        if (cancelled || requestId !== requestIdRef.current) {
          return
        }
        const status = getHttpErrorStatus(caught)
        if (status === 401) {
          clearAccessToken()
          setUnauthorized(true)
          setError(null)
        } else if (status === 403) {
          setForbidden(true)
          setError(null)
        } else if (status === 400) {
          setError(
            extractErrorMessage(
              caught,
              'Los filtros del reporte no son válidos.',
            ),
          )
        } else if (status !== null && status >= 500) {
          setError('No fue posible cargar el reporte. Intente nuevamente.')
        } else {
          setError(
            'No fue posible conectar con el servidor. Verifique su conexión.',
          )
        }
        setReporte(EMPTY_REPORTE_ACTIVIDADES)
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [fechaInicio, fechaFin, fontaneroId, tipoActividadId, reloadKey])

  return {
    reporte,
    loading,
    error,
    forbidden,
    unauthorized,
    refetch: () => setReloadKey((value) => value + 1),
  }
}
