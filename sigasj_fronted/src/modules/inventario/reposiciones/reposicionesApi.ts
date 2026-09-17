import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
  EstadoReposicion,
  RegistrarCompraReposicionPayload,
  ReposicionMaterial,
  ReposicionesListResponse,
  ReposicionesQuery,
} from './types'

const REPOSICIONES_ADMIN_PATH = '/admin/inventario/reposiciones'

export const getReposicionesAdmin = (query: ReposicionesQuery = {}) =>
  fetchWithAuth<ReposicionesListResponse>(REPOSICIONES_ADMIN_PATH, {
    params: {
      ...(query.estado ? { estado: query.estado } : {}),
      ...(query.origen ? { origen: query.origen } : {}),
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
  })

export const getReposicionAdmin = (id: number) =>
  fetchWithAuth<ReposicionMaterial>(`${REPOSICIONES_ADMIN_PATH}/${id}`)

export const registrarCompraReposicionAdmin = (
  id: number,
  payload: RegistrarCompraReposicionPayload,
) =>
  fetchWithAuth<ReposicionMaterial>(`${REPOSICIONES_ADMIN_PATH}/${id}/compra`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const patchReposicionEstadoAdmin = (id: number, estado: EstadoReposicion) =>
  fetchWithAuth<ReposicionMaterial>(`${REPOSICIONES_ADMIN_PATH}/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
