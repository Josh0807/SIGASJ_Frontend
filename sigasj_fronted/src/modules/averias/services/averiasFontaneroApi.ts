import { fetchWithAuth } from '../../../services/http/httpClient'
import { parseAveriaAdminId } from '../admin/parseAveriaAdminId'
import type {
  AveriaFontaneroDetail,
  AveriasFontaneroListado,
  CreateObservacionAveriaResponse,
  ResolverAveriaResponse,
} from '../fontanero/types'

/** Ruta relativa al prefijo `api/v1`. URL final: GET /api/v1/fontanero/averias/:id */
export const FONTANERO_AVERIAS_ENDPOINT = '/fontanero/averias'

export async function getFontaneroAverias(
  signal?: AbortSignal,
): Promise<AveriasFontaneroListado> {
  return fetchWithAuth<AveriasFontaneroListado>(FONTANERO_AVERIAS_ENDPOINT, {
    signal,
  })
}

export async function getFontaneroAveria(
  id: number,
  signal?: AbortSignal,
): Promise<AveriaFontaneroDetail> {
  const parsedId = parseAveriaAdminId(id)
  if (parsedId == null) {
    throw new Error('HTTP 400: El identificador de la avería debe ser un número entero positivo')
  }

  return fetchWithAuth<AveriaFontaneroDetail>(
    `${FONTANERO_AVERIAS_ENDPOINT}/${parsedId}`,
    { signal },
  )
}

export async function createFontaneroObservacion(
  id: number,
  observacion: string,
  signal?: AbortSignal,
): Promise<CreateObservacionAveriaResponse> {
  const parsedId = parseAveriaAdminId(id)
  if (parsedId == null) {
    throw new Error(
      'HTTP 400: El identificador de la avería debe ser un número entero positivo',
    )
  }

  return fetchWithAuth<CreateObservacionAveriaResponse>(
    `${FONTANERO_AVERIAS_ENDPOINT}/${parsedId}/observaciones`,
    {
      method: 'POST',
      body: JSON.stringify({ observacion }),
      signal,
    },
  )
}

export async function patchFontaneroAveriaPrioridad(
  id: number,
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA',
  signal?: AbortSignal,
): Promise<AveriaFontaneroDetail> {
  const parsedId = parseAveriaAdminId(id)
  if (parsedId == null) {
    throw new Error(
      'HTTP 400: El identificador de la avería debe ser un número entero positivo',
    )
  }

  return fetchWithAuth<AveriaFontaneroDetail>(
    `${FONTANERO_AVERIAS_ENDPOINT}/${parsedId}/prioridad`,
    {
      method: 'PATCH',
      body: JSON.stringify({ prioridad }),
      signal,
    },
  )
}

export async function patchFontaneroAveriaClasificacion(
  id: number,
  clasificacion: 'TUBO_MADRE' | 'TUBO_MEDIDOR',
  signal?: AbortSignal,
): Promise<AveriaFontaneroDetail> {
  const parsedId = parseAveriaAdminId(id)
  if (parsedId == null) {
    throw new Error(
      'HTTP 400: El identificador de la avería debe ser un número entero positivo',
    )
  }

  return fetchWithAuth<AveriaFontaneroDetail>(
    `${FONTANERO_AVERIAS_ENDPOINT}/${parsedId}/clasificacion`,
    {
      method: 'PATCH',
      body: JSON.stringify({ clasificacion }),
      signal,
    },
  )
}

export async function iniciarFontaneroAtencion(
  id: number,
  signal?: AbortSignal,
): Promise<AveriaFontaneroDetail> {
  const parsedId = parseAveriaAdminId(id)
  if (parsedId == null) {
    throw new Error(
      'HTTP 400: El identificador de la avería debe ser un número entero positivo',
    )
  }

  return fetchWithAuth<AveriaFontaneroDetail>(
    `${FONTANERO_AVERIAS_ENDPOINT}/${parsedId}/iniciar-atencion`,
    {
      method: 'PATCH',
      body: JSON.stringify({}),
      signal,
    },
  )
}

export async function resolverFontaneroAveria(
  id: number,
  observacionFinal: string,
  signal?: AbortSignal,
): Promise<ResolverAveriaResponse> {
  const parsedId = parseAveriaAdminId(id)
  if (parsedId == null) {
    throw new Error(
      'HTTP 400: El identificador de la avería debe ser un número entero positivo',
    )
  }

  return fetchWithAuth<ResolverAveriaResponse>(
    `${FONTANERO_AVERIAS_ENDPOINT}/${parsedId}/resolver`,
    {
      method: 'PATCH',
      body: JSON.stringify({ observacionFinal }),
      signal,
    },
  )
}
