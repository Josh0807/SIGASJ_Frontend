import { fetchWithAuth } from '../../../services/http/httpClient'

export type ActividadFontaneroListado = {
  data: unknown[]
  total: number
}

const CORRECCIONES_PATHS = [
  '/fontanero/actividades/correcciones',
  '/v1/fontanero/actividades/correcciones',
]

/**
 * Consulta correcciones pendientes del Fontanero autenticado.
 * La identidad sale del JWT; no se envía fontaneroId desde el cliente.
 */
export async function getCorreccionesPendientes(): Promise<ActividadFontaneroListado> {
  let lastError: unknown

  for (const path of CORRECCIONES_PATHS) {
    try {
      const result = await fetchWithAuth<ActividadFontaneroListado>(path)
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        total: typeof result?.total === 'number' ? result.total : 0,
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No se pudieron consultar las correcciones pendientes')
}
