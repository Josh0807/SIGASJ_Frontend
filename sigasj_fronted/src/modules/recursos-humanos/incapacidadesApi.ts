import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  Incapacidad,
  IncapacidadPayload,
  IncapacidadesFiltros,
  IncapacidadesListado,
} from './types'

export const INCAPACIDADES_ENDPOINT = '/rrhh/incapacidades'
export const INCAPACIDADES_PAGE_SIZE = 10

export const toIncapacidadesParams = (filtros: IncapacidadesFiltros) => ({
  colaboradorId: filtros.colaboradorId.trim() || undefined,
  fechaInicio: filtros.fechaInicio.trim() || undefined,
  fechaFin: filtros.fechaFin.trim() || undefined,
  page: filtros.page,
  limit: INCAPACIDADES_PAGE_SIZE,
})

export const getIncapacidades = (
  filtros: IncapacidadesFiltros,
  signal?: AbortSignal,
) =>
  fetchWithAuth<IncapacidadesListado>(INCAPACIDADES_ENDPOINT, {
    params: toIncapacidadesParams(filtros),
    signal,
  })

export const getIncapacidad = (id: number, signal?: AbortSignal) =>
  fetchWithAuth<Incapacidad>(`${INCAPACIDADES_ENDPOINT}/${id}`, { signal })

export const registrarIncapacidad = (payload: IncapacidadPayload) =>
  fetchWithAuth<Incapacidad>(INCAPACIDADES_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const actualizarIncapacidad = (id: number, payload: IncapacidadPayload) =>
  fetchWithAuth<Incapacidad>(`${INCAPACIDADES_ENDPOINT}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
