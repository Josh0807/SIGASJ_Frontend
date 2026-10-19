import { fetchWithAuth } from '../../services/http/httpClient'
import type { Puesto } from './types'

export const PUESTOS_ENDPOINT = '/rrhh/puestos'

export const getPuestos = (soloActivos = true, signal?: AbortSignal) =>
  fetchWithAuth<Puesto[]>(PUESTOS_ENDPOINT, {
    params: soloActivos ? { soloActivos: 'true' } : undefined,
    signal,
  })
