import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
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
