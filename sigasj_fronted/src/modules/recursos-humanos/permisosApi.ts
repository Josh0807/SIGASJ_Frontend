import { fetchWithAuth } from '../../services/http/httpClient'
import type { PermisoColaborador, PermisoPayload, PermisosFiltros, PermisosListado } from './types'

export const PERMISOS_ENDPOINT = '/rrhh/permisos'
export const PERMISOS_PAGE_SIZE = 10

export const toPermisosParams = (filtros: PermisosFiltros) => ({
  colaboradorId: filtros.colaboradorId.trim() || undefined,
  fechaInicio: filtros.fechaInicio.trim() || undefined,
  fechaFin: filtros.fechaFin.trim() || undefined,
  page: filtros.page,
  limit: PERMISOS_PAGE_SIZE,
})

export const getPermisos = (filtros: PermisosFiltros, signal?: AbortSignal) =>
  fetchWithAuth<PermisosListado>(PERMISOS_ENDPOINT, {
    params: toPermisosParams(filtros),
    signal,
  })

export const getPermiso = (id: number, signal?: AbortSignal) =>
  fetchWithAuth<PermisoColaborador>(`${PERMISOS_ENDPOINT}/${id}`, { signal })

export const registrarPermiso = (payload: PermisoPayload) =>
  fetchWithAuth<PermisoColaborador>(PERMISOS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const actualizarPermiso = (id: number, payload: PermisoPayload) =>
  fetchWithAuth<PermisoColaborador>(`${PERMISOS_ENDPOINT}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
