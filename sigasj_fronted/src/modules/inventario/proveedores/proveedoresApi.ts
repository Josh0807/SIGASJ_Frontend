import { fetchWithAuth } from '../../../services/http/httpClient'
import type { Proveedor, ProveedorPayload, ProveedoresQuery, ProveedoresResponse, UpdateProveedorPayload } from './types'

const PATH = '/inventario/proveedores'

export const getProveedores = (query: ProveedoresQuery = {}) => fetchWithAuth<ProveedoresResponse>(PATH, { params: query })
export const getProveedor = (id: number) => fetchWithAuth<Proveedor>(`${PATH}/${id}`)
export const createProveedor = (payload: ProveedorPayload) => fetchWithAuth<Proveedor>(PATH, { method: 'POST', body: JSON.stringify(payload) })
export const updateProveedor = (id: number, payload: UpdateProveedorPayload) => fetchWithAuth<Proveedor>(`${PATH}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
export const updateProveedorEstado = (id: number, activo: boolean) => fetchWithAuth<Proveedor>(`${PATH}/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ activo }) })
