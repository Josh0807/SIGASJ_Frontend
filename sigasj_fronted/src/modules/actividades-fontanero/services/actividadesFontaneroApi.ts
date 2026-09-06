import { fetchWithAuth, type FetchOptions } from '../../../services/http/httpClient'
import { shouldRetryAlternatePath, sortTiposActividad } from '../utils/httpErrorStatus'

export type ActividadFontaneroListado = {
  data: unknown[]
  total: number
}

export type TipoActividadFontanero = {
  id: number
  codigo: string
  nombre: string
  orden: number
}

export type TiposActividadFontaneroListado = {
  data: TipoActividadFontanero[]
  total: number
}

export type RegistrarActividadFontaneroPayload = {
  titulo: string
  descripcion?: string
  ubicacion?: string
}

const CORRECCIONES_PATHS = [
  '/fontanero/actividades/correcciones',
  '/v1/fontanero/actividades/correcciones',
]

const TIPOS_PATHS = [
  '/fontanero/actividades/tipos',
  '/v1/fontanero/actividades/tipos',
]

const REGISTRAR_PATHS = [
  '/fontanero/actividades',
  '/v1/fontanero/actividades',
]

async function fetchWithPathFallback<T>(
  paths: readonly string[],
  options?: FetchOptions,
): Promise<T> {
  let lastError: unknown

  for (const path of paths) {
    try {
      return await fetchWithAuth<T>(path, options)
    } catch (error) {
      lastError = error
      if (!shouldRetryAlternatePath(error)) {
        throw error
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No se pudo completar la solicitud')
}

const normalizeTipos = (
  data: TipoActividadFontanero[] | undefined,
): TipoActividadFontanero[] => {
  if (!Array.isArray(data)) {
    return []
  }

  return sortTiposActividad(data)
}

/**
 * Consulta correcciones pendientes del Fontanero autenticado.
 * La identidad sale del JWT; no se envía fontaneroId desde el cliente.
 */
export async function getCorreccionesPendientes(): Promise<ActividadFontaneroListado> {
  try {
    const result = await fetchWithPathFallback<ActividadFontaneroListado>(
      CORRECCIONES_PATHS,
    )
    return {
      data: Array.isArray(result?.data) ? result.data : [],
      total: typeof result?.total === 'number' ? result.total : 0,
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudieron consultar las correcciones pendientes')
  }
}

/**
 * Catálogo de tipos de actividad disponibles para el Fontanero autenticado.
 */
export async function getTiposActividadFontanero(): Promise<TiposActividadFontaneroListado> {
  try {
    const result = await fetchWithPathFallback<TiposActividadFontaneroListado>(
      TIPOS_PATHS,
    )
    const data = normalizeTipos(result?.data)
    return {
      data,
      total: typeof result?.total === 'number' ? result.total : data.length,
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudieron consultar los tipos de actividad')
  }
}

/**
 * Registra una actividad del Fontanero. El título debe ser el nombre del tipo elegido.
 */
export async function registrarActividadFontanero(
  payload: RegistrarActividadFontaneroPayload,
): Promise<unknown> {
  try {
    return await fetchWithPathFallback(REGISTRAR_PATHS, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo registrar la actividad')
  }
}
