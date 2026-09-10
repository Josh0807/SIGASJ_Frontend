import { fetchWithAuth } from '../../../services/http/httpClient'
import type { Categoria, CategoriaPayload, CategoriasQuery, CategoriasResponse } from './types'

const PATH = '/inventario/categorias'
export const getCategorias = (query: CategoriasQuery = {}) => fetchWithAuth<CategoriasResponse>(PATH, { params: query })
export const getCategoria = (id: number) => fetchWithAuth<Categoria>(`${PATH}/${id}`)
export const createCategoria = (payload: CategoriaPayload) => fetchWithAuth<Categoria>(PATH, { method: 'POST', body: JSON.stringify(payload) })
export const updateCategoria = (id: number, payload: CategoriaPayload) => fetchWithAuth<Categoria>(`${PATH}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
export const updateCategoriaEstado = (id: number, activo: boolean) => fetchWithAuth<Categoria>(`${PATH}/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ activo }) })
