import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  Asociado,
  AsociadosFiltros,
  AsociadosListado,
  ActualizarAsociadoPayload,
  RegistrarAsociadoPayload,
  HistorialAsociadosFiltros,
} from './types'

const ASOCIADOS_ENDPOINT = '/asociados'
export const ASOCIADOS_PAGE_SIZE = 10
export const ASOCIADOS_HISTORIAL_PAGE_SIZE = 10

export const toAsociadosParams = (filtros: AsociadosFiltros) => ({
  search: filtros.search.trim() || undefined,
  activo:
    filtros.estado === 'activos' ? true : filtros.estado === 'inactivos' ? false : undefined,
  page: filtros.page,
  limit: ASOCIADOS_PAGE_SIZE,
})

export const getAsociados = (filtros: AsociadosFiltros, signal?: AbortSignal) =>
  fetchWithAuth<AsociadosListado>(ASOCIADOS_ENDPOINT, {
    params: toAsociadosParams(filtros),
    signal,
  })

export const toHistorialAsociadosParams = (filtros: HistorialAsociadosFiltros) => ({
  search: filtros.search.trim() || undefined,
  estado: filtros.estado === 'todos' ? undefined : filtros.estado,
  fechaRegistroDesde: filtros.fechaRegistroDesde || undefined,
  fechaRegistroHasta: filtros.fechaRegistroHasta || undefined,
  fechaInactivacionDesde: filtros.fechaInactivacionDesde || undefined,
  fechaInactivacionHasta: filtros.fechaInactivacionHasta || undefined,
  orden: filtros.orden,
  page: filtros.page,
  limit: ASOCIADOS_HISTORIAL_PAGE_SIZE,
})

export const getHistorialAsociados = (filtros: HistorialAsociadosFiltros, signal?: AbortSignal) =>
  fetchWithAuth<AsociadosListado>(`${ASOCIADOS_ENDPOINT}/historial`, {
    params: toHistorialAsociadosParams(filtros),
    signal,
  })

export const getAsociado = (id: number, signal?: AbortSignal) =>
  fetchWithAuth<Asociado>(`${ASOCIADOS_ENDPOINT}/${id}`, { signal })

export const registrarAsociado = (payload: RegistrarAsociadoPayload) =>
  fetchWithAuth<Asociado>(ASOCIADOS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const actualizarAsociado = (id: number, payload: ActualizarAsociadoPayload) =>
  fetchWithAuth<Asociado>(`${ASOCIADOS_ENDPOINT}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

/** PBI 5.4: inactiva (con motivo obligatorio) o reactiva un asociado. */
export const cambiarEstadoAsociado = (id: number, activo: boolean, motivo?: string) =>
  fetchWithAuth<Asociado>(`${ASOCIADOS_ENDPOINT}/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify(activo ? { activo } : { activo, motivo }),
  })
