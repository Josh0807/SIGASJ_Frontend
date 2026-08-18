import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAccessToken } from '../../auth/utils/authStorage'
import * as dashboardService from '../services/dashboardService'
import { useDashboardMetrics, type UseDashboardMetricsResult } from './useDashboardMetrics'

function renderMetricsHook() {
  const result: { current: UseDashboardMetricsResult } = {
    current: undefined as unknown as UseDashboardMetricsResult,
  }

  const TestComponent = () => {
    result.current = useDashboardMetrics()
    return null
  }

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => {
    root.render(<TestComponent />)
  })

  return {
    result,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('useDashboardMetrics', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('retorna métricas por defecto de manera inicial', async () => {
    const { result, cleanup } = renderMetricsHook()

    expect(result.current.metrics.abonadosActivos).toBe('1,248')
    expect(result.current.metrics.lecturasPendientes).toBe('34')
    expect(result.current.metrics.averiasReportadas).toBe('3')
    expect(result.current.metrics.solicitudesEnTramite).toBe('8')

    await cleanup()
  })

  it('actualiza métricas cuando el servicio de resumen responde exitosamente', async () => {
    setAccessToken('token-demo')
    vi.spyOn(dashboardService, 'getDashboardSummary').mockResolvedValue({
      abonadosActivos: 2000,
      lecturasPendientes: 50,
      averiasReportadas: 1,
      solicitudesEnTramite: 12,
    })

    const { result, cleanup } = renderMetricsHook()

    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.metrics.abonadosActivos).toBe(2000)
    expect(result.current.metrics.lecturasPendientes).toBe(50)
    expect(result.current.metrics.averiasReportadas).toBe(1)
    expect(result.current.metrics.solicitudesEnTramite).toBe(12)
    expect(result.current.isLoading).toBe(false)

    await cleanup()
  })

  it('es resiliente: si un módulo individual falla, los demás indicadores no se bloquean', async () => {
    vi.spyOn(dashboardService, 'getDashboardSummary').mockResolvedValue({})
    vi.spyOn(dashboardService, 'getAbonadosSummaryMetric').mockResolvedValue({
      key: 'abonadosActivos',
      value: 1500,
    })
    // Falla intencional en averías
    vi.spyOn(dashboardService, 'getAveriasSummaryMetric').mockResolvedValue({
      key: 'averiasReportadas',
      value: null,
    })
    vi.spyOn(dashboardService, 'getLecturasSummaryMetric').mockResolvedValue({
      key: 'lecturasPendientes',
      value: 10,
    })
    vi.spyOn(dashboardService, 'getSolicitudesSummaryMetric').mockResolvedValue({
      key: 'solicitudesEnTramite',
      value: 4,
    })

    const { result, cleanup } = renderMetricsHook()

    await act(async () => {
      await result.current.refetch()
    })

    // Abonados y lecturas se actualizaron correctamente
    expect(result.current.metrics.abonadosActivos).toBe(1500)
    expect(result.current.metrics.lecturasPendientes).toBe(10)
    // El dashboard no se rompió ni bloqueó por el fallo en averías
    expect(result.current.isLoading).toBe(false)

    await cleanup()
  })
})
