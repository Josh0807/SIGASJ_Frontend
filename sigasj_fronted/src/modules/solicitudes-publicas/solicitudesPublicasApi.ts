import { fetchPublicApi } from '../../services/http/publicApi'
import type { SolicitudSeguimiento } from './types'

export const normalizeTrackingCode = (code: string) => code.trim().toUpperCase()

export async function getSolicitudSeguimiento(code: string): Promise<SolicitudSeguimiento> {
  const normalizedCode = normalizeTrackingCode(code)
  return fetchPublicApi<SolicitudSeguimiento>([
    `/solicitudes/seguimiento/${encodeURIComponent(normalizedCode)}`,
  ])
}
