import { useCallback, useEffect, useState } from 'react'
import {
  getAbonadosSummaryMetric,
  getAveriasSummaryMetric,
  getDashboardSummary,
  getLecturasSummaryMetric,
  getSolicitudesSummaryMetric,
  type DashboardSummaryData,
} from '../services/dashboardService'

export type UseDashboardMetricsResult = {
  metrics: DashboardSummaryData
  isLoading: boolean
  isError: boolean
  refetch: () => Promise<void>
}

// Métricas por defecto cuando no hay API conectada
const DEFAULT_METRICS: DashboardSummaryData = {
  abonadosActivos: '1,248',
  lecturasPendientes: '34',
  averiasReportadas: '3',
  solicitudesEnTramite: '8',
}

/**
 * Custom hook tolerante a fallos para consumir las métricas de los módulos.
 * Garantiza que si un módulo o endpoint individual falla, no se bloquee ni rompa el dashboard completo.
 */
export function useDashboardMetrics(
  initialMetrics?: DashboardSummaryData,
): UseDashboardMetricsResult {
  const [metrics, setMetrics] = useState<DashboardSummaryData>(
    initialMetrics ?? DEFAULT_METRICS,
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)

    try {
      // 1. Intentar obtener el resumen general del dashboard
      const summary = await getDashboardSummary()

      if (
        summary.abonadosActivos !== undefined ||
        summary.lecturasPendientes !== undefined ||
        summary.averiasReportadas !== undefined ||
        summary.solicitudesEnTramite !== undefined
      ) {
        setMetrics((prev) => ({
          ...prev,
          ...summary,
        }))
        setIsLoading(false)
        return
      }

      // 2. Si el resumen global no devuelve datos, consultar métricas por módulo de manera independiente (Promise.allSettled)
      const results = await Promise.allSettled([
        getAbonadosSummaryMetric(),
        getLecturasSummaryMetric(),
        getAveriasSummaryMetric(),
        getSolicitudesSummaryMetric(),
      ])

      const fetchedMetrics: DashboardSummaryData = {}

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.value !== null) {
          fetchedMetrics[result.value.key] = result.value.value
        }
      })

      // Actualizar solo las métricas que hayan respondido exitosamente
      setMetrics((prev) => ({
        ...prev,
        ...fetchedMetrics,
      }))
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    isLoading,
    isError,
    refetch: fetchMetrics,
  }
}
