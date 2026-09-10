import { fetchWithAuth } from '../../services/http/httpClient'
import type { CreateMaterialPayload, Material, MaterialesQuery, MaterialesResponse, UpdateMaterialPayload } from './types'

const MATERIALES_PATH = '/inventario/materiales'

export const getMateriales = (query: MaterialesQuery = {}) =>
  fetchWithAuth<MaterialesResponse>(MATERIALES_PATH, { params: query })

export const getMaterial = (id: number) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}`)

export const updateMaterial = (id: number, payload: UpdateMaterialPayload) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const createMaterial = (payload: CreateMaterialPayload) =>
  fetchWithAuth<Material>(MATERIALES_PATH, { method: 'POST', body: JSON.stringify(payload) })

export const updateMaterialEstado = (id: number, activo: boolean) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ activo }) })
