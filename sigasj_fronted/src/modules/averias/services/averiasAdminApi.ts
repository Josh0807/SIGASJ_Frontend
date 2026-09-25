import { fetchWithAuth } from '../../../services/http/httpClient'
import { parseAveriaAdminId } from '../admin/parseAveriaAdminId'
import { toBackendPrioridad } from '../admin/averiasAdminListSearch'
import { isEstadoAveria } from '../admin/estadoAveria'
import { isTipoAveria } from '../admin/tipoAveria'
import type {
  AveriaDetail,
  AveriaFontanerosResponse,
  AveriasAdminListado,
  AveriasAdminQuery,
  AveriasHistorialListado,
  AveriasHistorialQuery,
  AveriasReporteResumen,
  AveriaEventosHistorial,
} from '../admin/types'

/** Ruta relativa al prefijo `api/v1`. URL final: GET /api/v1/admin/averias */
export const ADMIN_AVERIAS_ENDPOINT = '/admin/averias'

/** URL final: GET /api/v1/admin/averias/historial */
export const ADMIN_AVERIAS_HISTORIAL_ENDPOINT = `${ADMIN_AVERIAS_ENDPOINT}/historial`

/** URL final: GET /api/v1/admin/averias/reportes/resumen */
export const ADMIN_AVERIAS_REPORTE_RESUMEN_ENDPOINT = `${ADMIN_AVERIAS_ENDPOINT}/reportes/resumen`

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

export const toAveriasHistorialParams = (
  query: AveriasHistorialQuery = {},
): Record<string, string | number | undefined> => {
  const estado = query.estado?.trim()
  const tipo = query.tipo?.trim()
  const sector = query.sector?.trim()
  const codigoSeguimiento = query.codigoSeguimiento?.trim()
  const fechaDesde = query.fechaDesde?.trim()
  const fechaHasta = query.fechaHasta?.trim()

  return {
    page: query.page,
    limit: query.limit,
    estado: estado && isEstadoAveria(estado) ? estado : undefined,
    prioridad: toBackendPrioridad(query.prioridad ?? ''),
    tipo: tipo && isTipoAveria(tipo) ? tipo : undefined,
    fontaneroId:
      query.fontaneroId != null && query.fontaneroId > 0
        ? query.fontaneroId
        : undefined,
    sector: sector ? sector : undefined,
    fechaDesde: fechaDesde ? fechaDesde : undefined,
    fechaHasta: fechaHasta ? fechaHasta : undefined,
    codigoSeguimiento: codigoSeguimiento ? codigoSeguimiento : undefined,
  }
}

export type AveriasReporteResumenQuery = {
  fechaDesde?: string
  fechaHasta?: string
}

export const toReporteResumenParams = (
  query: AveriasReporteResumenQuery = {},
): Record<string, string | undefined> => {
  const fechaDesde = query.fechaDesde?.trim()
  const fechaHasta = query.fechaHasta?.trim()
  return {
    fechaDesde: fechaDesde ? fechaDesde : undefined,
    fechaHasta: fechaHasta ? fechaHasta : undefined,
  }
}

export async function getAdminAveriasReporteResumen(
  query: AveriasReporteResumenQuery = {},
  signal?: AbortSignal,
): Promise<AveriasReporteResumen> {
  return fetchWithAuth<AveriasReporteResumen>(ADMIN_AVERIAS_REPORTE_RESUMEN_ENDPOINT, {
    params: toReporteResumenParams(query),
    signal,
  })
}

export async function getAdminAveriasHistorial(
  query: AveriasHistorialQuery = {},
  signal?: AbortSignal,
): Promise<AveriasHistorialListado> {
  return fetchWithAuth<AveriasHistorialListado>(ADMIN_AVERIAS_HISTORIAL_ENDPOINT, {
    params: toAveriasHistorialParams(query),
    signal,
  })
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

/** URL final: GET /api/v1/admin/averias/:id/historial */
export async function getAdminAveriaEventosHistorial(
  id: number,
  signal?: AbortSignal,
): Promise<AveriaEventosHistorial> {
  const averiaId = parseAveriaAdminId(id)
  if (averiaId == null) {
    throw new Error('El identificador de la avería debe ser un número entero positivo')
  }
  return fetchWithAuth<AveriaEventosHistorial>(
    `${ADMIN_AVERIAS_ENDPOINT}/${averiaId}/historial`,
    { signal },
  )
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
