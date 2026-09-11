import { fetchWithAuth } from '../../../services/http/httpClient'
import type { EntradaResponse, RegistrarEntradaPayload } from './types'

export const registrarEntrada = (payload: RegistrarEntradaPayload) =>
  fetchWithAuth<EntradaResponse>('/inventario/entradas', { method: 'POST', body: JSON.stringify(payload) })
