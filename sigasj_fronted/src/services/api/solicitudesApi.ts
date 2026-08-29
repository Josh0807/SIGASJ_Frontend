import { fetchWithAuth } from '../http/httpClient'

export type SolicitudAprobadaPendiente = {
  id: number | string
  numeroSolicitud?: string
  tipoSolicitud?: string
  abonado?: string
  fechaAprobacion?: string
  estado?: string
}

export async function getSolicitudesAprobadasPendientes(): Promise<SolicitudAprobadaPendiente[]> {
  const paths = [
    '/v1/solicitudes/aprobadas-pendientes',
    '/solicitudes/aprobadas-pendientes',
  ]
  let lastError: Error | null = null

  for (const path of paths) {
    try {
      const data = await fetchWithAuth<SolicitudAprobadaPendiente[]>(path)
      return Array.isArray(data) ? data : []
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError ?? new Error('No fue posible consultar las solicitudes aprobadas pendientes.')
}
