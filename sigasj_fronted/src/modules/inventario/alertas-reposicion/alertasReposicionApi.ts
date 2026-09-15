import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
  AlertaReposicion,
  AlertasReposicionListResponse,
  AlertasReposicionQuery,
  EstadoAlertaReposicion,
} from './types'

const ALERTAS_ADMIN_PATH = '/admin/inventario/alertas-reposicion'

export const getAlertasReposicionAdmin = (query: AlertasReposicionQuery = {}) =>
  fetchWithAuth<AlertasReposicionListResponse>(ALERTAS_ADMIN_PATH, {
    params: {
      ...(query.estado ? { estado: query.estado } : {}),
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
  })

export const patchAlertaReposicionEstado = (
  id: number,
  estado: EstadoAlertaReposicion,
) =>
  fetchWithAuth<AlertaReposicion>(`${ALERTAS_ADMIN_PATH}/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
