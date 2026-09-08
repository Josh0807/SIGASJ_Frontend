import { fetchWithAuth, type FetchOptions } from '../../../services/http/httpClient'
import type { ActividadRegistroFormValues } from '../types/actividadRegistroForm'
import { isTipoActividadFontaneroCodigo, type TipoActividadFontaneroCatalogo } from '../types/tipoActividadFontanero'
import {
  type ActividadFontaneroRegistrada,
  type RegistrarActividadRequest,
  toRegistrarActividadPayloadFromTipo,
} from '../types/actividadFontaneroApi'
import { toCorregirActividadPayload } from '../utils/actividadCorreccionMapper'
import { normalizeActividadFontanero } from '../utils/normalizeActividadFontanero'
import { shouldRetryAlternatePath, sortTiposActividad } from '../utils/httpErrorStatus'

export type ActividadFontaneroListado = {
  data: ActividadFontaneroRegistrada[]
  total: number
}

export type TipoActividadFontanero = TipoActividadFontaneroCatalogo

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
] as const

const actividadDetallePath = (id: number) =>
  `/fontanero/actividades/${id}` as const

const corregirActividadPath = (id: number) =>
  `/fontanero/actividades/${id}/corregir` as const

// Una sola solicitud por registro. httpClient ya resuelve el prefijo /api/v1.
const REGISTRAR_PATHS = ['/fontanero/actividades'] as const

const TIPOS_PATHS = [
  '/fontanero/actividades/tipos',
  '/v1/fontanero/actividades/tipos',
] as const

export type { ActividadFontaneroRegistrada, RegistrarActividadRequest }
export { toRegistrarActividadPayloadFromTipo }

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

  return sortTiposActividad(data.filter((tipo): tipo is TipoActividadFontanero =>
    Number.isInteger(tipo.id) && tipo.id > 0 && isTipoActividadFontaneroCodigo(tipo.codigo),
  ))
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
    const data = Array.isArray(result?.data)
      ? result.data
          .map(normalizeActividadFontanero)
          .filter((item): item is ActividadFontaneroRegistrada => item !== null)
      : []

    return {
      data,
      total: typeof result?.total === 'number' ? result.total : data.length,
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudieron consultar las correcciones pendientes')
  }
}

/**
 * Detalle de una actividad propia del Fontanero autenticado.
 */
export async function getActividadDetalle(
  id: number,
): Promise<ActividadFontaneroRegistrada> {
  try {
    const result = await fetchWithAuth<unknown>(actividadDetallePath(id))
    const actividad = normalizeActividadFontanero(result)
    if (!actividad) {
      throw new Error('HTTP 404: Actividad no encontrada')
    }
    return actividad
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo consultar la actividad')
  }
}

/**
 * Corrige y reenvía una actividad propia en estado REQUIERE_CORRECCION.
 */
export async function corregirActividad(
  actividadId: number,
  tipo: TipoActividadFontaneroCatalogo,
  values: ActividadRegistroFormValues,
): Promise<ActividadFontaneroRegistrada> {
  const body = toCorregirActividadPayload(values, tipo.codigo)

  try {
    const result = await fetchWithAuth<unknown>(corregirActividadPath(actividadId), {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    const actividad = normalizeActividadFontanero(result)
    if (!actividad) {
      throw new Error('No se pudo procesar la respuesta del servidor')
    }
    return actividad
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo reenviar la actividad corregida')
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

/**
 * Registra una actividad del Fontanero autenticado.
 * La identidad del fontanero proviene del JWT; no se envía desde el cliente.
 */
export async function registrarActividad(
  tipo: TipoActividadFontaneroCatalogo,
  values: ActividadRegistroFormValues,
): Promise<ActividadFontaneroRegistrada> {
  const body = toRegistrarActividadPayloadFromTipo(tipo, values)
  const requestBody = tipo.codigo === 'INCAPACIDAD_VACACIONES'
    ? (() => {
        const formData = new FormData()
        Object.entries(body).forEach(([key, value]) => {
          if (value !== undefined && value !== null) formData.append(key, String(value))
        })
        values.documentos.forEach((documento) => formData.append('documentos', documento))
        return formData
      })()
    : JSON.stringify(body)

  try {
    return await fetchWithPathFallback<ActividadFontaneroRegistrada>(
      REGISTRAR_PATHS,
      {
        method: 'POST',
        body: requestBody,
      },
    )
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo registrar la actividad')
  }
}
