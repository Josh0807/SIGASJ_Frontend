import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  HistorialColaboradorFiltros,
  HistorialColaboradorRespuesta,
} from './types'

export const HISTORIAL_PAGE_SIZE = 10

export const historialColaboradorEndpoint = (colaboradorId: number) =>
  `/rrhh/colaboradores/${colaboradorId}/historial`

export const toHistorialParams = (filtros: HistorialColaboradorFiltros) => ({
  tipo: filtros.tipo || undefined,
  fechaDesde: filtros.fechaDesde.trim() || undefined,
  fechaHasta: filtros.fechaHasta.trim() || undefined,
  page: filtros.page,
  limit: HISTORIAL_PAGE_SIZE,
})

export const getHistorialColaborador = (
  colaboradorId: number,
  filtros: HistorialColaboradorFiltros,
  signal?: AbortSignal,
) =>
  fetchWithAuth<HistorialColaboradorRespuesta>(
    historialColaboradorEndpoint(colaboradorId),
    {
      params: toHistorialParams(filtros),
      signal,
    },
  )
