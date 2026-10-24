import { fetchWithAuth } from '../../services/http/httpClient'
import type { CreateMaterialPayload, Material, MaterialesQuery, MaterialesResponse, UpdateMaterialPayload } from './types'

const MATERIALES_PATH = '/inventario/materiales'

export const getMateriales = (query: MaterialesQuery = {}) =>
  fetchWithAuth<MaterialesResponse>(MATERIALES_PATH, { params: query })

const PRINT_PAGE_SIZE = 100
const PRINT_PAGE_CAP = 50

export async function getMaterialesParaImpresion(
  query: Omit<MaterialesQuery, 'page' | 'limit'> = {},
): Promise<{ data: Material[]; total: number; truncated: boolean }> {
  const first = await getMateriales({ ...query, page: 1, limit: PRINT_PAGE_SIZE })
  const { total, totalPages } = first
  const remainingPages = Math.min(totalPages, PRINT_PAGE_CAP) - 1

  if (remainingPages <= 0) {
    return { data: first.data, total, truncated: first.data.length < total }
  }

  const rest = await Promise.all(
    Array.from({ length: remainingPages }, (_, i) =>
      getMateriales({ ...query, page: i + 2, limit: PRINT_PAGE_SIZE }),
    ),
  )

  const data = [first, ...rest].flatMap((r) => r.data)
  return { data, total, truncated: data.length < total }
}

export const getMaterial = (id: number) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}`)

export const updateMaterial = (id: number, payload: UpdateMaterialPayload) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

export const createMaterial = (payload: CreateMaterialPayload) =>
  fetchWithAuth<Material>(MATERIALES_PATH, { method: 'POST', body: JSON.stringify(payload) })

export const updateMaterialEstado = (id: number, activo: boolean) =>
  fetchWithAuth<Material>(`${MATERIALES_PATH}/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ activo }) })
