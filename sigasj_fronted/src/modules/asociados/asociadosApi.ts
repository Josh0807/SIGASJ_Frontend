import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  Asociado,
  AsociadosFiltros,
  AsociadosListado,
  RegistrarAsociadoPayload,
} from './types'

const ASOCIADOS_ENDPOINT = '/asociados'
export const ASOCIADOS_PAGE_SIZE = 10

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

export const getAsociado = (id: number, signal?: AbortSignal) =>
  fetchWithAuth<Asociado>(`${ASOCIADOS_ENDPOINT}/${id}`, { signal })

export const registrarAsociado = (payload: RegistrarAsociadoPayload) =>
  fetchWithAuth<Asociado>(ASOCIADOS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
