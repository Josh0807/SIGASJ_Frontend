import { fetchWithAuth } from '../../../services/http/httpClient'
import type { RegistrarRecepcionPayload, RegistrarRecepcionResponse } from './types'

const RECEPCIONES_ADMIN_PATH = '/admin/inventario/recepciones'

export const registrarRecepcionAdmin = (payload: RegistrarRecepcionPayload) =>
  fetchWithAuth<RegistrarRecepcionResponse>(RECEPCIONES_ADMIN_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
