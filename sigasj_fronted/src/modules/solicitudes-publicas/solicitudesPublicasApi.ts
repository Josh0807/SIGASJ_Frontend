import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  ConsultarSeguimientoPayload,
  SeguimientoSolicitudPublico,
} from './seguimientoPublicoTypes'
import { normalizarCodigoSeguimiento } from './seguimientoPublicoValidation'

/** @deprecated Preferir normalizarCodigoSeguimiento (mismo comportamiento). */
export const normalizeTrackingCode = (code: string) =>
  normalizarCodigoSeguimiento(code)

/**
 * POST /solicitudes/seguimiento (4.14.1).
 * Payload exacto: { codigo, identificacion }. Sin campos auxiliares.
 */
export async function consultarSeguimientoPublico(
  payload: ConsultarSeguimientoPayload,
): Promise<SeguimientoSolicitudPublico> {
  return fetchWithAuth<SeguimientoSolicitudPublico>('/solicitudes/seguimiento', {
    method: 'POST',
    body: JSON.stringify({
      codigo: payload.codigo,
      identificacion: payload.identificacion,
    }),
  })
}

/**
 * @deprecated El seguimiento por código solo fue retirado en Backend.
 * Usar consultarSeguimientoPublico con código + identificación.
 */
export async function getSolicitudSeguimiento(
  code: string,
): Promise<SeguimientoSolicitudPublico> {
  void code
  throw new Error(
    'HTTP 404: No fue posible localizar una solicitud con los datos proporcionados.',
  )
}
