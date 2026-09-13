import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
  CreateSolicitudMaterialesPayload,
  SolicitudMateriales,
  SolicitudesMaterialesListResponse,
  SolicitudesMaterialesQuery,
} from './types'

const SOLICITUDES_MATERIALES_PATH = '/fontanero/solicitudes-materiales'

export const createSolicitudMateriales = (
  payload: CreateSolicitudMaterialesPayload,
) =>
  fetchWithAuth<SolicitudMateriales>(SOLICITUDES_MATERIALES_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getMisSolicitudesMateriales = (query: SolicitudesMaterialesQuery = {}) =>
  fetchWithAuth<SolicitudesMaterialesListResponse>(SOLICITUDES_MATERIALES_PATH, { params: query })

export const getMiSolicitudMateriales = (id: number) =>
  fetchWithAuth<SolicitudMateriales>(`${SOLICITUDES_MATERIALES_PATH}/${id}`)

const SOLICITUDES_ADMIN_PATH = '/admin/solicitudes-materiales'

export const getSolicitudesMaterialesAdmin = (
  query: SolicitudesMaterialesQuery = { estado: 'PENDIENTE' },
) =>
  fetchWithAuth<SolicitudesMaterialesListResponse>(SOLICITUDES_ADMIN_PATH, {
    params: {
      estado: query.estado ?? 'PENDIENTE',
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.idAveria ? { idAveria: query.idAveria } : {}),
    },
  })
