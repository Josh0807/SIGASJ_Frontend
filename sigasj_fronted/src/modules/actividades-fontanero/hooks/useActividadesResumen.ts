import { useEffect, useRef, useState } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import {
  getResumenActividadesAdmin,
  getResumenActividadesFontanero,
  type ResumenActividadesFilters,
} from '../services/actividadesFontaneroApi'
import { EMPTY_RESUMEN_ACTIVIDADES } from '../types/actividadResumen'
import type { ResumenActividadesResponse } from '../types/actividadResumen'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { interpretActividadApiError } from '../utils/interpretActividadApiError'

export type ActividadesResumenScope = 'fontanero' | 'admin'

export type UseActividadesResumenResult = {
  resumen: ResumenActividadesResponse
  loading: boolean
  error: string | null
  forbidden: boolean
  unauthorized: boolean
  refetch: () => void
}

/**
 * Consulta el resumen de actividades según rol (fontanero propio / admin general).
 */
export function useActividadesResumen(
  scope: ActividadesResumenScope,
  filters: ResumenActividadesFilters = {},
): UseActividadesResumenResult {
  const [resumen, setResumen] = useState<ResumenActividadesResponse>(
    EMPTY_RESUMEN_ACTIVIDADES,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const requestIdRef = useRef(0)

  const fechaInicio = filters.fechaInicio
  const fechaFin = filters.fechaFin

  useEffect(() => {
    const requestId = ++requestIdRef.current
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setForbidden(false)
      setUnauthorized(false)

      try {
        const fetchResumen =
          scope === 'admin'
            ? getResumenActividadesAdmin
            : getResumenActividadesFontanero
        const result = await fetchResumen({ fechaInicio, fechaFin })
        if (cancelled || requestId !== requestIdRef.current) {
          return
        }
        setResumen(result)
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
          setError('El rango de fechas no es válido.')
        } else if (interpreted.kind === 'server') {
          setError('No fue posible cargar el resumen. Intente nuevamente.')
        } else if (interpreted.kind === 'network') {
          setError(
            'No fue posible conectar con el servidor. Verifique su conexión.',
          )
        } else {
          setError(interpreted.message || ACTIVITY_FEEDBACK_MESSAGES.loadGeneric)
        }
        setResumen(EMPTY_RESUMEN_ACTIVIDADES)
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
  }, [scope, fechaInicio, fechaFin, reloadKey])

  return {
    resumen,
    loading,
    error,
    forbidden,
    unauthorized,
    refetch: () => setReloadKey((value) => value + 1),
  }
}
