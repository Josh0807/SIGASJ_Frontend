import { fetchWithAuth } from '../../../services/http/httpClient'

export type DashboardSummaryData = {
  abonadosActivos?: number | string | null
  lecturasPendientes?: number | string | null
  averiasReportadas?: number | string | null
  solicitudesEnTramite?: number | string | null
}

export type ModuleSummaryMetric = {
  key: keyof DashboardSummaryData
  value: number | string | null
}

/**
 * Servicio desacoplado para consultar datos de resumen operacional del Dashboard.
 */
export async function getDashboardSummary(): Promise<DashboardSummaryData> {
  try {
    return await fetchWithAuth<DashboardSummaryData>('/dashboard/summary')
  } catch {
    // Si el endpoint general de resumen no está disponible, retornar objeto vacío
    return {}
  }
}

/**
 * Consulta el resumen individual de un módulo específico (Abonados).
 */
export async function getAbonadosSummaryMetric(): Promise<ModuleSummaryMetric> {
  try {
    const data = await fetchWithAuth<{ totalActivos?: number | string }>('/abonados/resumen')
    return { key: 'abonadosActivos', value: data.totalActivos ?? null }
  } catch {
    return { key: 'abonadosActivos', value: null }
  }
}

/**
 * Consulta el resumen individual de un módulo específico (Lecturas).
 */
export async function getLecturasSummaryMetric(): Promise<ModuleSummaryMetric> {
  try {
    const data = await fetchWithAuth<{ pendientes?: number | string }>('/lecturas/resumen')
    return { key: 'lecturasPendientes', value: data.pendientes ?? null }
  } catch {
    return { key: 'lecturasPendientes', value: null }
  }
}

/**
 * Consulta el resumen individual de un módulo específico (Averías).
 */
export async function getAveriasSummaryMetric(): Promise<ModuleSummaryMetric> {
  try {
    const data = await fetchWithAuth<{ reportadas?: number | string }>('/averias/resumen')
    return { key: 'averiasReportadas', value: data.reportadas ?? null }
  } catch {
    return { key: 'averiasReportadas', value: null }
  }
}

/**
 * Consulta el resumen individual de un módulo específico (Solicitudes).
 */
export async function getSolicitudesSummaryMetric(): Promise<ModuleSummaryMetric> {
  try {
    const data = await fetchWithAuth<{ enTramite?: number | string }>('/solicitudes/resumen')
    return { key: 'solicitudesEnTramite', value: data.enTramite ?? null }
  } catch {
    return { key: 'solicitudesEnTramite', value: null }
  }
}
