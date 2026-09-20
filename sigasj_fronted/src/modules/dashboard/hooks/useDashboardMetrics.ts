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

const EMPTY_METRICS: DashboardSummaryData = {
  abonadosActivos: null,
  lecturasPendientes: null,
  averiasReportadas: null,
  solicitudesEnTramite: null,
}

const hasSummaryValues = (summary: DashboardSummaryData): boolean =>
  summary.abonadosActivos !== undefined ||
  summary.lecturasPendientes !== undefined ||
  summary.averiasReportadas !== undefined ||
  summary.solicitudesEnTramite !== undefined

/**
 * Consume métricas reales por módulo. Si un endpoint falla, ese indicador
 * queda en N/D y no bloquea el resto del dashboard.
 */
export function useDashboardMetrics(
  initialMetrics?: DashboardSummaryData,
): UseDashboardMetricsResult {
  const [metrics, setMetrics] = useState<DashboardSummaryData>(
    initialMetrics ?? EMPTY_METRICS,
  )
  const [isLoading, setIsLoading] = useState<boolean>(!initialMetrics)
  const [isError, setIsError] = useState<boolean>(false)

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)

    try {
      const summary = await getDashboardSummary()

      if (hasSummaryValues(summary)) {
        setMetrics({
          ...EMPTY_METRICS,
          ...summary,
        })
        return
      }

      const results = await Promise.allSettled([
        getAbonadosSummaryMetric(),
        getLecturasSummaryMetric(),
        getAveriasSummaryMetric(),
        getSolicitudesSummaryMetric(),
      ])

      const fetchedMetrics: DashboardSummaryData = { ...EMPTY_METRICS }
      let failed = 0

      results.forEach((result) => {
        if (result.status !== 'fulfilled') {
          failed += 1
          return
        }
        fetchedMetrics[result.value.key] = result.value.value
        if (result.value.value === null && result.value.key !== 'lecturasPendientes') {
          failed += 1
        }
      })

      setMetrics(fetchedMetrics)
      if (failed === 3) {
        setIsError(true)
      }
    } catch {
      setMetrics(EMPTY_METRICS)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    isLoading,
    isError,
    refetch: fetchMetrics,
  }
}
