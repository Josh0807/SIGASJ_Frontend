import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  BalanceVacaciones,
  MovimientosVacacionesFiltros,
  MovimientosVacacionesListado,
  MovimientoVacaciones,
  MovimientoVacacionesPayload,
} from './types'

export const VACACIONES_ENDPOINT = '/rrhh/vacaciones'
export const MOVIMIENTOS_VACACIONES_ENDPOINT = `${VACACIONES_ENDPOINT}/movimientos`
export const MOVIMIENTOS_VACACIONES_PAGE_SIZE = 10

export const balanceVacacionesEndpoint = (colaboradorId: number) =>
  `${VACACIONES_ENDPOINT}/colaboradores/${colaboradorId}/balance`

export const toMovimientosVacacionesParams = (filtros: MovimientosVacacionesFiltros) => ({
  colaboradorId: filtros.colaboradorId.trim() || undefined,
  tipo: filtros.tipo || undefined,
  fechaInicio: filtros.fechaInicio.trim() || undefined,
  fechaFin: filtros.fechaFin.trim() || undefined,
  page: filtros.page,
  limit: MOVIMIENTOS_VACACIONES_PAGE_SIZE,
})

/** Balance calculado por el servidor; el frontend no suma ni resta días. */
export const getBalanceVacaciones = (colaboradorId: number, signal?: AbortSignal) =>
  fetchWithAuth<BalanceVacaciones>(balanceVacacionesEndpoint(colaboradorId), { signal })

export const getBalanceVacacionesPropio = (signal?: AbortSignal) =>
  fetchWithAuth<BalanceVacaciones>(`${VACACIONES_ENDPOINT}/mias/balance`, { signal })

export const getMovimientosVacaciones = (
  filtros: MovimientosVacacionesFiltros,
  signal?: AbortSignal,
) =>
  fetchWithAuth<MovimientosVacacionesListado>(MOVIMIENTOS_VACACIONES_ENDPOINT, {
    params: toMovimientosVacacionesParams(filtros),
    signal,
  })

export const registrarMovimientoVacaciones = (payload: MovimientoVacacionesPayload) =>
  fetchWithAuth<MovimientoVacaciones>(MOVIMIENTOS_VACACIONES_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
