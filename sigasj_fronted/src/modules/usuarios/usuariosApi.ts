import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
  UsuarioAdmin,
  UsuariosListResponse,
} from './types'

const PATH = '/usuarios'

export const getUsuariosAdmin = () =>
  fetchWithAuth<UsuariosListResponse>(PATH)

export const createUsuarioAdmin = (payload: CreateUsuarioPayload) =>
  fetchWithAuth<UsuarioAdmin>(PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateUsuarioAdmin = (id: number, payload: UpdateUsuarioPayload) =>
  fetchWithAuth<UsuarioAdmin>(`${PATH}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
