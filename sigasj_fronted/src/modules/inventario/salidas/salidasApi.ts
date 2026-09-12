import { fetchWithAuth } from '../../../services/http/httpClient'
import type { DisponibilidadMaterial, RegistrarSalidaPayload, SalidaAveria, SalidaResponse } from './types'

export const consultarDisponibilidad = (materialId: number, cantidad: number, signal?: AbortSignal) =>
  fetchWithAuth<DisponibilidadMaterial>(`/inventario/materiales/${materialId}/disponibilidad`, { params: { cantidad }, signal })

export const registrarSalida = (payload: RegistrarSalidaPayload) =>
  fetchWithAuth<SalidaResponse>('/inventario/salidas', { method: 'POST', body: JSON.stringify(payload) })

export const getSalidasPorAveria = (idAveria: number) =>
  fetchWithAuth<SalidaAveria[]>(`/inventario/salidas/averia/${idAveria}`)
