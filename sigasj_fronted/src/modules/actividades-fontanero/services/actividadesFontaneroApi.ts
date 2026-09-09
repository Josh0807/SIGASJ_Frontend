import { fetchWithAuth, type FetchOptions } from '../../../services/http/httpClient'
import type { ActividadRegistroFormValues } from '../types/actividadRegistroForm'
import { isTipoActividadFontaneroCodigo, type TipoActividadFontaneroCatalogo } from '../types/tipoActividadFontanero'
import {
  type ActividadFontaneroRegistrada,
  type RegistrarActividadRequest,
  toRegistrarActividadPayloadFromTipo,
} from '../types/actividadFontaneroApi'
import type { HistorialActividadesFilters } from '../types/actividadHistorial'
import type {
  ResumenActividadesFilters,
  ResumenActividadesResponse,
} from '../types/actividadResumen'
import type {
  ReporteActividadesFilters,
  ReporteActividadesResponse,
} from '../types/actividadReportes'
import { toCorregirActividadPayload } from '../utils/actividadCorreccionMapper'
import { normalizeActividadFontanero } from '../utils/normalizeActividadFontanero'
import { shouldRetryAlternatePath, sortTiposActividad } from '../utils/httpErrorStatus'

export type ActividadFontaneroListado = {
  data: ActividadFontaneroRegistrada[]
  total: number
  page?: number
  limit?: number
  totalPages?: number
}

export type AdminActividadesFilters = {
  fontaneroId?: string
  tipoActividadId?: number
  estado?: string
  fechaInicio?: string
  fechaFin?: string
  page?: number
  limit?: number
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

const HISTORIAL_PATHS = [
  '/fontanero/actividades/historial',
  '/v1/fontanero/actividades/historial',
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

const RESUMEN_FONTANERO_PATHS = [
  '/fontanero/actividades/resumen',
  '/v1/fontanero/actividades/resumen',
] as const

const RESUMEN_ADMIN_PATH = '/admin/actividades/resumen' as const
const REPORTES_ADMIN_PATH = '/admin/actividades/reportes' as const
const ACTIVIDADES_ADMIN_PATH = '/admin/actividades' as const

export type { ActividadFontaneroRegistrada, RegistrarActividadRequest }
export type { HistorialActividadesFilters } from '../types/actividadHistorial'
export type {
  ResumenActividadesFilters,
  ResumenActividadesResponse,
} from '../types/actividadResumen'
export type {
  ReporteActividadesFilters,
  ReporteActividadesResponse,
} from '../types/actividadReportes'
export { toRegistrarActividadPayloadFromTipo }

/** Query params para GET /fontanero/actividades/historial */
export const toHistorialActividadesParams = (
  filters: HistorialActividadesFilters = {},
): Record<string, string | number> => {
  const params: Record<string, string | number> = {}
  if (filters.fechaInicio?.trim()) {
    params.fechaInicio = filters.fechaInicio.trim()
  }
  if (filters.fechaFin?.trim()) {
    params.fechaFin = filters.fechaFin.trim()
  }
  if (filters.page !== undefined && filters.page > 0) {
    params.page = filters.page
  }
  if (filters.limit !== undefined && filters.limit > 0) {
    params.limit = filters.limit
  }
  return params
}

/** Query params para GET .../actividades/resumen */
export const toResumenActividadesParams = (
  filters: ResumenActividadesFilters = {},
): Record<string, string> => {
  const params: Record<string, string> = {}
  if (filters.fechaInicio?.trim()) {
    params.fechaInicio = filters.fechaInicio.trim()
  }
  if (filters.fechaFin?.trim()) {
    params.fechaFin = filters.fechaFin.trim()
  }
  return params
}

const normalizeResumen = (raw: unknown): ResumenActividadesResponse => {
  const body = (raw ?? {}) as Partial<ResumenActividadesResponse>
  return {
    total: typeof body.total === 'number' ? body.total : 0,
    porEstado:
      body.porEstado && typeof body.porEstado === 'object' ? body.porEstado : {},
  }
}

/** Construye query params omitiendo vacíos (undefined / null / ""). */
export const toReportesAdminParams = (
  filters: ReporteActividadesFilters = {},
): Record<string, string | number> => {
  const params: Record<string, string | number> = {}
  if (filters.fechaInicio?.trim()) {
    params.fechaInicio = filters.fechaInicio.trim()
  }
  if (filters.fechaFin?.trim()) {
    params.fechaFin = filters.fechaFin.trim()
  }
  if (filters.fontaneroId?.trim()) {
    params.fontaneroId = filters.fontaneroId.trim()
  }
  if (
    filters.tipoActividadId !== undefined &&
    filters.tipoActividadId !== null &&
    Number.isInteger(filters.tipoActividadId) &&
    filters.tipoActividadId > 0
  ) {
    params.tipoActividadId = filters.tipoActividadId
  }
  return params
}

const normalizeReporte = (raw: unknown): ReporteActividadesResponse => {
  const body = (raw ?? {}) as Partial<ReporteActividadesResponse>
  return {
    total: typeof body.total === 'number' ? body.total : 0,
    porEstado:
      body.porEstado && typeof body.porEstado === 'object' ? body.porEstado : {},
    porTipo: Array.isArray(body.porTipo) ? body.porTipo : [],
    porFontanero: Array.isArray(body.porFontanero) ? body.porFontanero : [],
    actividades: Array.isArray(body.actividades) ? body.actividades : [],
  }
}

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
 * Historial de actividades del Fontanero (APROBADA, RECHAZADA, CORREGIDA).
 * Acepta filtros de periodo y paginación cuando el Back-end los exponga.
 */
export async function getHistorialActividades(
  filters: HistorialActividadesFilters = {},
): Promise<ActividadFontaneroListado> {
  try {
    const result = await fetchWithPathFallback<ActividadFontaneroListado>(
      HISTORIAL_PATHS,
      { params: toHistorialActividadesParams(filters) },
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
      : new Error('No se pudo consultar el historial de actividades')
  }
}

/**
 * Detalle de una actividad propia del Fontanero autenticado.
 */
export async function getActividadDetalle(
  id: number,
): Promise<ActividadFontaneroRegistrada> {
  try {
    const result = await fetchWithPathFallback<unknown>([
      `/actividades-fontanero/${id}`,
      `/actividades/${id}`,
      actividadDetallePath(id),
    ])
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
 * Reporte administrativo consolidado (solo lectura).
 * GET /api/v1/admin/actividades/reportes
 */
export async function getResumenActividadesFontanero(
  filters: ResumenActividadesFilters = {},
): Promise<ResumenActividadesResponse> {
  try {
    const result = await fetchWithPathFallback<unknown>(RESUMEN_FONTANERO_PATHS, {
      params: toResumenActividadesParams(filters),
    })
    return normalizeResumen(result)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo consultar el resumen de actividades')
  }
}

export async function getResumenActividadesAdmin(
  filters: ResumenActividadesFilters = {},
): Promise<ResumenActividadesResponse> {
  try {
    const result = await fetchWithAuth<unknown>(RESUMEN_ADMIN_PATH, {
      params: toResumenActividadesParams(filters),
    })
    return normalizeResumen(result)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo consultar el resumen de actividades')
  }
}

export async function getReportesAdmin(
  filters: ReporteActividadesFilters = {},
): Promise<ReporteActividadesResponse> {
  try {
    const result = await fetchWithAuth<unknown>(REPORTES_ADMIN_PATH, {
      params: toReportesAdminParams(filters),
    })
    return normalizeReporte(result)
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo consultar el reporte de actividades')
  }
}

export async function getActividadesAdmin(
  filters: AdminActividadesFilters = {},
): Promise<ActividadFontaneroListado> {
  const params: Record<string, string | number> = {}
  if (filters.fontaneroId?.trim()) params.fontaneroId = filters.fontaneroId.trim()
  if (filters.tipoActividadId) params.tipoActividadId = filters.tipoActividadId
  if (filters.estado?.trim()) params.estado = filters.estado.trim()
  if (filters.fechaInicio?.trim()) params.fechaInicio = filters.fechaInicio.trim()
  if (filters.fechaFin?.trim()) params.fechaFin = filters.fechaFin.trim()
  if (filters.page && filters.page > 0) params.page = filters.page
  if (filters.limit && filters.limit > 0) params.limit = filters.limit

  const raw = await fetchWithAuth<unknown>(ACTIVIDADES_ADMIN_PATH, { params })
  const body = (raw ?? {}) as Record<string, unknown>
  const source = Array.isArray(raw)
    ? raw
    : Array.isArray(body.data)
      ? body.data
      : Array.isArray(body.actividades)
        ? body.actividades
        : []
  const data = source
    .map(normalizeActividadFontanero)
    .filter((item): item is ActividadFontaneroRegistrada => item !== null)
  const total = typeof body.total === 'number' ? body.total : data.length
  const limit = typeof body.limit === 'number' ? body.limit : filters.limit

  return {
    data,
    total,
    page: typeof body.page === 'number' ? body.page : filters.page,
    limit,
    totalPages:
      typeof body.totalPages === 'number'
        ? body.totalPages
        : limit
          ? Math.max(1, Math.ceil(total / limit))
          : 1,
  }
}

export async function revisarActividadAdmin(
  id: number,
  observacion?: string,
): Promise<ActividadFontaneroRegistrada> {
  const raw = await fetchWithAuth<unknown>(
    `/admin/actividades-fontanero/${id}/revisar`,
    {
      method: 'PATCH',
      body: observacion?.trim()
        ? JSON.stringify({ observacion: observacion.trim() })
        : undefined,
    },
  )
  const actividad = normalizeActividadFontanero(raw)
  if (!actividad) throw new Error('La respuesta de revisión no es válida')
  return actividad
}

export async function solicitarCorreccionAdmin(
  id: number,
  observacion: string,
): Promise<ActividadFontaneroRegistrada> {
  const raw = await fetchWithAuth<unknown>(
    `/admin/actividades/${id}/solicitar-correccion`,
    {
      method: 'PATCH',
      body: JSON.stringify({ observacion: observacion.trim() }),
    },
  )
  const actividad = normalizeActividadFontanero(raw)
  if (!actividad) {
    throw new Error('La respuesta de solicitud de corrección no es válida')
  }
  return actividad
}

export async function getActividadAdminDetalle(
  id: number,
): Promise<ActividadFontaneroRegistrada> {
  const raw = await fetchWithPathFallback<unknown>([
    `/actividades-fontanero/${id}`,
    `/actividades/${id}`,
    `/admin/actividades-fontanero/${id}`,
    `/admin/actividades/${id}`,
  ])
  const actividad = normalizeActividadFontanero(raw)
  if (!actividad) throw new Error('HTTP 404: Actividad no encontrada')
  return actividad
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
