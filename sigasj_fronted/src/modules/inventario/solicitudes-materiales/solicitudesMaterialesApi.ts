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
