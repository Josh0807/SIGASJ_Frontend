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

const DEFAULT_METRIC_KEYS = [
  'abonadosActivos',
  'lecturasPendientes',
  'averiasReportadas',
  'solicitudesEnTramite',
] as const satisfies readonly (keyof DashboardSummaryData)[]

const loadMetric = (key: keyof DashboardSummaryData) => {
  if (key === 'abonadosActivos') {
    return getAbonadosSummaryMetric()
  }
  if (key === 'lecturasPendientes') {
    return getLecturasSummaryMetric()
  }
  if (key === 'averiasReportadas') {
    return getAveriasSummaryMetric()
  }
  return getSolicitudesSummaryMetric()
}

const hasSummaryValues = (summary: DashboardSummaryData): boolean =>
  summary.abonadosActivos !== undefined ||
  summary.lecturasPendientes !== undefined ||
  summary.averiasReportadas !== undefined ||
  summary.solicitudesEnTramite !== undefined

/**
 * Consume métricas reales por módulo. Si un endpoint falla, ese indicador
 * queda en N/D y no bloquea el resto del dashboard.
 * `requestedKeys` vacío no consulta el servidor: el rol no ve esos indicadores.
 */
export function useDashboardMetrics(
  initialMetrics?: DashboardSummaryData,
  requestedKeys?: readonly (keyof DashboardSummaryData)[],
): UseDashboardMetricsResult {
  const keySignature = (requestedKeys ?? DEFAULT_METRIC_KEYS).join('|')
  const [metrics, setMetrics] = useState<DashboardSummaryData>(
    initialMetrics ?? EMPTY_METRICS,
  )
  const [isLoading, setIsLoading] = useState<boolean>(
    keySignature.length > 0 && !initialMetrics,
  )
  const [isError, setIsError] = useState<boolean>(false)

  const fetchMetrics = useCallback(async () => {
    const keys = keySignature
      ? (keySignature.split('|') as (keyof DashboardSummaryData)[])
      : []

    if (keys.length === 0) {
      setMetrics(EMPTY_METRICS)
      setIsError(false)
      setIsLoading(false)
      return
    }

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

      const results = await Promise.allSettled(keys.map((key) => loadMetric(key)))

      const fetchedMetrics: DashboardSummaryData = { ...EMPTY_METRICS }
      let failed = 0
      let accountable = 0

      results.forEach((result) => {
        if (result.status !== 'fulfilled') {
          failed += 1
          accountable += 1
          return
        }
        fetchedMetrics[result.value.key] = result.value.value
        if (result.value.key === 'lecturasPendientes') {
          return
        }
        accountable += 1
        if (result.value.value === null) {
          failed += 1
        }
      })

      setMetrics(fetchedMetrics)
      if (accountable > 0 && failed === accountable) {
        setIsError(true)
      }
    } catch {
      setMetrics(EMPTY_METRICS)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [keySignature])

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
