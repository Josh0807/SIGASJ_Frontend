import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
  CreatePublicAveriaPayload,
  PublicAveriaConfirmation,
  RegistroPublicoAveriaResponse,
} from '../types/publicAveriaApi'

/** Ruta relativa al prefijo `api/v1` del cliente HTTP. URL final: POST /api/v1/public/averias */
export const PUBLIC_AVERIAS_ENDPOINT = '/public/averias'

export function readPublicAveriaConfirmation(
  response: RegistroPublicoAveriaResponse,
): PublicAveriaConfirmation {
  const codigoSeguimiento = response?.data?.codigoSeguimiento?.trim()
  if (!codigoSeguimiento) {
    throw new Error('HTTP 500: Respuesta incompleta del servidor')
  }

  return {
    message:
      typeof response.message === 'string' && response.message.trim()
        ? response.message.trim()
        : 'Avería registrada correctamente.',
    codigoSeguimiento,
    fechaReporte:
      typeof response.data.fechaReporte === 'string' ? response.data.fechaReporte : '',
    estado: typeof response.data.estado === 'string' ? response.data.estado : '',
  }
}

export async function createPublicAveria(
  payload: CreatePublicAveriaPayload,
): Promise<PublicAveriaConfirmation> {
  const response = await fetchWithAuth<RegistroPublicoAveriaResponse>(PUBLIC_AVERIAS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return readPublicAveriaConfirmation(response)
}
