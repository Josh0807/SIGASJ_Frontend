import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
  MovimientoInventario,
  MovimientosListResponse,
  MovimientosQuery,
} from './types'

const MOVIMIENTOS_ADMIN_PATH = '/admin/inventario/movimientos'

export const getMovimientosAdmin = (query: MovimientosQuery = {}) =>
  fetchWithAuth<MovimientosListResponse>(MOVIMIENTOS_ADMIN_PATH, {
    params: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.tipo ? { tipo: query.tipo } : {}),
      ...(query.idMaterial ? { idMaterial: query.idMaterial } : {}),
      ...(query.idUsuario ? { idUsuario: query.idUsuario } : {}),
      ...(query.fechaDesde ? { fechaDesde: query.fechaDesde } : {}),
      ...(query.fechaHasta ? { fechaHasta: query.fechaHasta } : {}),
    },
  })

export const getMovimientoAdmin = (id: number) =>
  fetchWithAuth<MovimientoInventario>(`${MOVIMIENTOS_ADMIN_PATH}/${id}`)
