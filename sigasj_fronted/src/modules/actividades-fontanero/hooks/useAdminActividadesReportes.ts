import { useEffect, useRef, useState } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import {
  getReportesAdmin,
  type ReporteActividadesFilters,
  type ReporteActividadesResponse,
} from '../services/actividadesFontaneroApi'
import { EMPTY_REPORTE_ACTIVIDADES } from '../types/actividadReportes'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { interpretActividadApiError } from '../utils/interpretActividadApiError'

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
        const interpreted = interpretActividadApiError(caught)
        if (interpreted.kind === 'unauthorized') {
          clearAccessToken()
          setUnauthorized(true)
          setError(null)
        } else if (interpreted.kind === 'forbidden') {
          setForbidden(true)
          setError(null)
        } else if (interpreted.kind === 'validation') {
          setError(
            interpreted.message === ACTIVITY_FEEDBACK_MESSAGES.validationReview
              ? 'Los filtros del reporte no son válidos.'
              : interpreted.message,
          )
        } else if (interpreted.kind === 'server') {
          setError('No fue posible cargar el reporte. Intente nuevamente.')
        } else if (interpreted.kind === 'network') {
          setError(
            'No fue posible conectar con el servidor. Verifique su conexión.',
          )
        } else {
          setError(interpreted.message)
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
