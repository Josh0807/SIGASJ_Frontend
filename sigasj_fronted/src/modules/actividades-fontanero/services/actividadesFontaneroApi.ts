import { fetchWithAuth } from '../../../services/http/httpClient'
import type { ActividadRegistroFormValues } from '../types/actividadRegistroForm'
import type { TipoActividadFontaneroCatalogo } from '../types/tipoActividadFontanero'
import {
  type ActividadFontaneroRegistrada,
  type RegistrarActividadRequest,
  toRegistrarActividadPayloadFromTipo,
} from '../types/actividadFontaneroApi'

export type ActividadFontaneroListado = {
  data: unknown[]
  total: number
}

const CORRECCIONES_PATHS = [
  '/fontanero/actividades/correcciones',
  '/v1/fontanero/actividades/correcciones',
] as const

const REGISTRAR_PATHS = [
  '/fontanero/actividades',
  '/v1/fontanero/actividades',
] as const

export type { ActividadFontaneroRegistrada, RegistrarActividadRequest }
export { toRegistrarActividadPayloadFromTipo }

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

/**
 * Registra una actividad del Fontanero autenticado.
 * La identidad del fontanero proviene del JWT; no se envía desde el cliente.
 */
export async function registrarActividad(
  tipo: TipoActividadFontaneroCatalogo,
  values: ActividadRegistroFormValues,
): Promise<ActividadFontaneroRegistrada> {
  const body = toRegistrarActividadPayloadFromTipo(tipo, values)
  let lastError: unknown

  for (const path of REGISTRAR_PATHS) {
    try {
      return await fetchWithAuth<ActividadFontaneroRegistrada>(path, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No se pudo registrar la actividad')
}
