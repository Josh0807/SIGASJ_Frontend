import { fetchWithAuth } from '../../../services/http/httpClient'
import { parseAveriaAdminId } from '../admin/parseAveriaAdminId'
import { toBackendPrioridad } from '../admin/averiasAdminListSearch'
import { isEstadoAveria } from '../admin/estadoAveria'
import type {
  AveriaDetail,
  AveriaFontanerosResponse,
  AveriasAdminListado,
  AveriasAdminQuery,
} from '../admin/types'

/** Ruta relativa al prefijo `api/v1`. URL final: GET /api/v1/admin/averias */
export const ADMIN_AVERIAS_ENDPOINT = '/admin/averias'

export const toAveriasAdminParams = (
  query: AveriasAdminQuery = {},
): Record<string, string | number | undefined> => {
  const search = query.search?.trim()
  const estado = query.estado?.trim()
  const tipo = query.tipo?.trim()
  const fechaDesde = query.fechaDesde?.trim()
  const fechaHasta = query.fechaHasta?.trim()

  return {
    page: query.page,
    limit: query.limit,
    search: search ? search : undefined,
    estado: estado && isEstadoAveria(estado) ? estado : undefined,
    prioridad: toBackendPrioridad(query.prioridad ?? ''),
    tipo: tipo ? tipo : undefined,
    fontaneroId: query.fontaneroId,
    fechaDesde: fechaDesde ? fechaDesde : undefined,
    fechaHasta: fechaHasta ? fechaHasta : undefined,
  }
}

export async function getAdminAverias(
  query: AveriasAdminQuery = {},
  signal?: AbortSignal,
): Promise<AveriasAdminListado> {
  return fetchWithAuth<AveriasAdminListado>(ADMIN_AVERIAS_ENDPOINT, {
    params: toAveriasAdminParams(query),
    signal,
  })
}

export async function getAdminAveria(
  id: number,
  signal?: AbortSignal,
): Promise<AveriaDetail> {
  return fetchWithAuth<AveriaDetail>(`${ADMIN_AVERIAS_ENDPOINT}/${id}`, {
    signal,
  })
}

export async function patchAdminAveriaEstado(
  id: number,
  estado: string,
  signal?: AbortSignal,
): Promise<AveriaDetail> {
  return fetchWithAuth<AveriaDetail>(`${ADMIN_AVERIAS_ENDPOINT}/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
    signal,
  })
}

export async function patchAdminAveriaPrioridad(
  id: number,
  prioridad: string,
  signal?: AbortSignal,
): Promise<AveriaDetail> {
  return fetchWithAuth<AveriaDetail>(
    `${ADMIN_AVERIAS_ENDPOINT}/${id}/prioridad`,
    {
      method: 'PATCH',
      body: JSON.stringify({ prioridad }),
      signal,
    },
  )
}

export async function getAdminAveriaFontaneros(
  signal?: AbortSignal,
): Promise<AveriaFontanerosResponse> {
  return fetchWithAuth<AveriaFontanerosResponse>(
    `${ADMIN_AVERIAS_ENDPOINT}/fontaneros`,
    { signal },
  )
}

/** @deprecated Usar getAdminAveriaFontaneros */
export const getAdminAveriasFontanerosAsignables = getAdminAveriaFontaneros

export async function patchAdminAveriaAsignacion(
  id: number,
  fontaneroId: number,
  signal?: AbortSignal,
): Promise<AveriaDetail> {
  return fetchWithAuth<AveriaDetail>(
    `${ADMIN_AVERIAS_ENDPOINT}/${id}/asignacion`,
    {
      method: 'PATCH',
      body: JSON.stringify({ fontaneroId }),
      signal,
    },
  )
}

export async function patchAdminAveriaClasificacion(
  id: number,
  clasificacion: string,
  signal?: AbortSignal,
): Promise<AveriaDetail> {
  return fetchWithAuth<AveriaDetail>(
    `${ADMIN_AVERIAS_ENDPOINT}/${id}/clasificacion`,
    {
      method: 'PATCH',
      body: JSON.stringify({ clasificacion }),
      signal,
    },
  )
}

export function resolveAdminAveriaRequestId(
  value: string | number | null | undefined,
): number | null {
  return parseAveriaAdminId(value)
}
