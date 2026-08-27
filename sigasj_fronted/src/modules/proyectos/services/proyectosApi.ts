import { fetchWithAuth } from '../../../services/http/httpClient'
import {
  isEstadoProyecto,
  type EstadoProyecto,
} from '../types/estadoProyecto'
import {
  type AdminProyecto,
  type AdminProyectoDetalle,
  type ProyectoFormValues,
  type ProyectosAdminListado,
  type QueryProyectosAdmin,
} from '../admin/types'

const ADMIN_PATHS = ['/v1/admin/proyectos', '/admin/proyectos']

export type CreateProyectoPayload = {
  nombre: string
  descripcion?: string
  encargadoRealizacion: string
  duracion: string
  estado: EstadoProyecto
}

export const toCreateProyectoPayload = (
  values: ProyectoFormValues,
): CreateProyectoPayload => {
  if (!isEstadoProyecto(values.estado)) {
    throw new Error('Seleccione un estado válido.')
  }

  const descripcion = values.descripcion.trim()

  return {
    nombre: values.nombre.trim(),
    ...(descripcion ? { descripcion } : {}),
    encargadoRealizacion: values.encargadoRealizacion.trim(),
    duracion: values.duracion.trim(),
    estado: values.estado,
  }
}

export const toActivoQueryParam = (
  value: string | boolean | undefined,
): boolean | undefined => {
  if (value === true || value === 'true') {
    return true
  }

  if (value === false || value === 'false') {
    return false
  }

  return undefined
}

export const toProyectosAdminParams = (
  query: QueryProyectosAdmin = {},
): Record<string, string | number | boolean | undefined> => {
  const nombre = query.nombre?.trim()

  return {
    nombre: nombre ? nombre : undefined,
    estado: query.estado && isEstadoProyecto(query.estado) ? query.estado : undefined,
    activo: toActivoQueryParam(query.activo),
    page: query.page,
    limit: query.limit,
  }
}

const isNotFoundError = (error: Error) => error.message.includes('HTTP 404')

export async function getAdminProyectos(
  query: QueryProyectosAdmin = {},
): Promise<ProyectosAdminListado> {
  const params = toProyectosAdminParams(query)
  let lastError: Error | null = null

  for (const path of ADMIN_PATHS) {
    try {
      return await fetchWithAuth<ProyectosAdminListado>(path, { params })
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!isNotFoundError(lastError)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('No fue posible consultar los proyectos.')
}

export async function createAdminProyecto(
  values: ProyectoFormValues,
): Promise<AdminProyecto> {
  const payload = toCreateProyectoPayload(values)
  let lastError: Error | null = null

  for (const path of ADMIN_PATHS) {
    try {
      return await fetchWithAuth<AdminProyecto>(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!isNotFoundError(lastError)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('No fue posible registrar el proyecto.')
}

export type UpdateProyectoPayload = {
  nombre: string
  descripcion?: string
  encargadoRealizacion: string
  duracion: string
}

/** UpdateProyectoDto no acepta `estado`. El cambio de estado es integración pendiente. */
export const toUpdateProyectoPayload = (
  values: ProyectoFormValues,
): UpdateProyectoPayload => {
  const descripcion = values.descripcion.trim()

  return {
    nombre: values.nombre.trim(),
    ...(descripcion ? { descripcion } : {}),
    encargadoRealizacion: values.encargadoRealizacion.trim(),
    duracion: values.duracion.trim(),
  }
}

export async function getAdminProyecto(
  id: number,
): Promise<AdminProyectoDetalle> {
  let lastError: Error | null = null

  for (const path of ADMIN_PATHS) {
    try {
      const detalle = await fetchWithAuth<AdminProyectoDetalle>(`${path}/${id}`)
      return {
        ...detalle,
        imagenes: Array.isArray(detalle.imagenes) ? detalle.imagenes : [],
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!isNotFoundError(lastError)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('No fue posible consultar el proyecto.')
}

export async function updateAdminProyecto(
  id: number,
  values: ProyectoFormValues,
): Promise<AdminProyectoDetalle> {
  const payload = toUpdateProyectoPayload(values)
  let lastError: Error | null = null

  for (const path of ADMIN_PATHS) {
    try {
      return await fetchWithAuth<AdminProyectoDetalle>(`${path}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!isNotFoundError(lastError)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('No fue posible actualizar el proyecto.')
}
