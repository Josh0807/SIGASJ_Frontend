import { fetchWithAuth } from '../../../services/http/httpClient'
import type { DisponibilidadMaterial, RegistrarSalidaPayload, SalidaAveria, SalidaResponse } from './types'

export const consultarDisponibilidad = (materialId: number, cantidad: number, signal?: AbortSignal) =>
  fetchWithAuth<DisponibilidadMaterial>(`/inventario/materiales/${materialId}/disponibilidad`, { params: { cantidad }, signal })

export async function registrarSalida(payload: RegistrarSalidaPayload): Promise<SalidaResponse> {
  const response = await fetchWithAuth<SalidaResponse | { data: SalidaResponse }>('/inventario/salidas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return 'data' in response ? response.data : response
}

export const getSalidasPorAveria = (idAveria: number) =>
  fetchWithAuth<SalidaAveria[]>(`/inventario/salidas/averia/${idAveria}`)
