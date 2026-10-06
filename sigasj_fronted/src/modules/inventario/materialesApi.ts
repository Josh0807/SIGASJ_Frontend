import { fetchWithAuth } from '../../services/http/httpClient'
import type { CreateMaterialPayload, Material, MaterialesQuery, MaterialesResponse, UpdateMaterialPayload } from './types'

const MATERIALES_PATH = '/inventario/materiales'

export const getMateriales = (query: MaterialesQuery = {}) =>
  fetchWithAuth<MaterialesResponse>(MATERIALES_PATH, { params: query })

const PRINT_PAGE_SIZE = 100
const PRINT_PAGE_CAP = 50

export async function getMaterialesParaImpresion(
  query: Omit<MaterialesQuery, 'page' | 'limit'> = {},
): Promise<{ data: Material[]; total: number }> {
  const data: Material[] = []
  let page = 1
  let total = 0

  while (page <= PRINT_PAGE_CAP) {
    const result = await getMateriales({ ...query, page, limit: PRINT_PAGE_SIZE })
    total = result.total
    data.push(...result.data)
    if (result.totalPages <= page || result.data.length === 0) {
      break
    }
    page += 1
  }

  return { data, total }
}

export const getMaterial = (id: number) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}`)

export const updateMaterial = (id: number, payload: UpdateMaterialPayload) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

export const createMaterial = (payload: CreateMaterialPayload) =>
  fetchWithAuth<Material>(MATERIALES_PATH, { method: 'POST', body: JSON.stringify(payload) })

export const updateMaterialEstado = (id: number, activo: boolean) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ activo }) })
