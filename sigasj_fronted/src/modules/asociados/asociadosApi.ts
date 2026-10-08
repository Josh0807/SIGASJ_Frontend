import { fetchWithAuth } from '../../services/http/httpClient'
import type { Asociado, RegistrarAsociadoPayload } from './types'

const ASOCIADOS_ENDPOINT = '/asociados'

export const getAsociados = () => fetchWithAuth<Asociado[]>(ASOCIADOS_ENDPOINT)

export const registrarAsociado = (payload: RegistrarAsociadoPayload) =>
  fetchWithAuth<Asociado>(ASOCIADOS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
