import { fetchWithAuth } from '../../../services/http/httpClient'
import { fetchPublicApi } from '../../../services/http/publicApi'
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
const PUBLIC_PROYECTOS_PATHS = ['/v1/public/proyectos', '/public/proyectos']

export type PublicProyecto = {
  id: number
  nombre: string
  imagenPrincipal?: string | null
  duracion?: string | null
  estado: EstadoProyecto
}

export type PublicProyectoImagen = {
  id: number
  imagenUrl: string
  textoAlternativo?: string | null
  ordenVisualizacion?: number
}

export type PublicProyectoDetalle = {
  id: number
  nombre: string
  descripcion?: string | null
  encargadoRealizacion?: string | null
  duracion?: string | null
  estado: EstadoProyecto
  imagenPrincipal?: string | null
  activo: boolean
  imagenes?: PublicProyectoImagen[]
}

export async function getPublicProyectos(): Promise<PublicProyecto[]> {
  const data = await fetchPublicApi<PublicProyecto[]>(PUBLIC_PROYECTOS_PATHS)
  return Array.isArray(data) ? data : []
}

export async function getPublicProyectoDetalle(
  id: number | string,
): Promise<PublicProyectoDetalle> {
  const paths = [`/v1/public/proyectos/${id}`, `/public/proyectos/${id}`]
  return await fetchPublicApi<PublicProyectoDetalle>(paths)
}


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

export const toProyectoFormData = (
  values: ProyectoFormValues,
  imagenFile?: File | null,
  removeImagen?: boolean,
  options?: { includeEstado?: boolean },
): FormData => {
  const form = new FormData()
  form.append('nombre', values.nombre.trim())
  if (values.descripcion.trim()) {
    form.append('descripcion', values.descripcion.trim())
  }
  form.append('encargadoRealizacion', values.encargadoRealizacion.trim())
  form.append('duracion', values.duracion.trim())
  if (options?.includeEstado && values.estado) {
    form.append('estado', values.estado)
  }
  if (imagenFile) {
    form.append('imagenPrincipal', imagenFile)
  } else if (removeImagen) {
    form.append('removeImagenPrincipal', 'true')
  }
  return form
}

export async function createAdminProyecto(
  values: ProyectoFormValues,
  imagenFile?: File | null,
): Promise<AdminProyecto> {
  let lastError: Error | null = null

  if (imagenFile) {
    const formData = toProyectoFormData(values, imagenFile, undefined, {
      includeEstado: true,
    })
    for (const path of ADMIN_PATHS) {
      try {
        return await fetchWithAuth<AdminProyecto>(path, {
          method: 'POST',
          body: formData,
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (!isNotFoundError(lastError)) {
          throw lastError
        }
      }
    }
  } else {
    const payload = toCreateProyectoPayload(values)
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

export function parseAdminProyectoId(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const id = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
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
  imagenFile?: File | null,
  removeImagen?: boolean,
): Promise<AdminProyectoDetalle> {
  let lastError: Error | null = null

  if (imagenFile || removeImagen) {
    const formData = toProyectoFormData(values, imagenFile, removeImagen)
    for (const path of ADMIN_PATHS) {
      try {
        return await fetchWithAuth<AdminProyectoDetalle>(`${path}/${id}`, {
          method: 'PATCH',
          body: formData,
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (!isNotFoundError(lastError)) {
          throw lastError
        }
      }
    }
  } else {
    const payload = toUpdateProyectoPayload(values)
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
  }

  throw lastError ?? new Error('No fue posible actualizar el proyecto.')
}

export async function uploadProyectoImagenPrincipal(
  id: number,
  file: File,
): Promise<AdminProyectoDetalle> {
  const form = new FormData()
  form.append('imagenPrincipal', file)

  let lastError: Error | null = null
  for (const path of ADMIN_PATHS) {
    try {
      return await fetchWithAuth<AdminProyectoDetalle>(
        `${path}/${id}/imagen-principal`,
        {
          method: 'POST',
          body: form,
        },
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!isNotFoundError(lastError)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('No fue posible subir la imagen principal.')
}

export async function removeProyectoImagenPrincipal(
  id: number,
): Promise<AdminProyectoDetalle> {
  let lastError: Error | null = null
  for (const path of ADMIN_PATHS) {
    try {
      return await fetchWithAuth<AdminProyectoDetalle>(
        `${path}/${id}/imagen-principal`,
        {
          method: 'DELETE',
        },
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!isNotFoundError(lastError)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('No fue posible eliminar la imagen principal.')
}

export async function uploadProyectoImagenes(
  id: number,
  files: File[],
): Promise<AdminProyectoDetalle> {
  let lastResult: AdminProyectoDetalle | undefined
  let lastError: Error | null = null

  for (const file of files) {
    const form = new FormData()
    form.append('imagen', file)
    lastResult = undefined

    for (const path of ADMIN_PATHS) {
      try {
        lastResult = await fetchWithAuth<AdminProyectoDetalle>(
          `${path}/${id}/imagenes`,
          {
            method: 'POST',
            body: form,
          },
        )
        lastError = null
        break
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (!isNotFoundError(lastError)) {
          throw lastError
        }
      }
    }

    if (!lastResult) {
      throw lastError ?? new Error('No fue posible subir las fotografías.')
    }
  }

  if (!lastResult) {
    throw lastError ?? new Error('No fue posible subir las fotografías.')
  }

  return lastResult
}

export async function deleteProyectoImagen(
  proyectoId: number,
  imagenId: number,
): Promise<AdminProyectoDetalle> {
  let lastError: Error | null = null
  for (const path of ADMIN_PATHS) {
    try {
      return await fetchWithAuth<AdminProyectoDetalle>(
        `${path}/${proyectoId}/imagenes/${imagenId}`,
        {
          method: 'DELETE',
        },
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!isNotFoundError(lastError)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('No fue posible eliminar la fotografía.')
}

export async function reorderProyectoImagenes(
  proyectoId: number,
  ordenes: { id: number; orden: number }[],
): Promise<AdminProyectoDetalle> {
  let lastError: Error | null = null
  for (const path of ADMIN_PATHS) {
    try {
      return await fetchWithAuth<AdminProyectoDetalle>(
        `${path}/${proyectoId}/imagenes/orden`,
        {
          method: 'PATCH',
          body: JSON.stringify({ items: ordenes }),
        },
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!isNotFoundError(lastError)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('No fue posible actualizar el orden de las fotografías.')
}

export async function updateProyectoVisibilidad(
  id: number,
  activo: boolean,
): Promise<AdminProyecto> {
  let lastError: Error | null = null

  // Intentar endpoint específico /visibilidad y fallback general
  for (const basePath of ADMIN_PATHS) {
    const paths = [`${basePath}/${id}/visibilidad`, `${basePath}/${id}`]
    for (const path of paths) {
      try {
        return await fetchWithAuth<AdminProyecto>(path, {
          method: 'PATCH',
          body: JSON.stringify({ activo }),
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (!isNotFoundError(lastError)) {
          throw lastError
        }
      }
    }
  }

  throw lastError ?? new Error('No fue posible actualizar la visibilidad del proyecto.')
}

export async function updateProyectoEstado(
  id: number,
  estado: EstadoProyecto,
): Promise<AdminProyecto> {
  let lastError: Error | null = null

  for (const basePath of ADMIN_PATHS) {
    const paths = [`${basePath}/${id}/estado`, `${basePath}/${id}`]
    for (const path of paths) {
      try {
        return await fetchWithAuth<AdminProyecto>(path, {
          method: 'PATCH',
          body: JSON.stringify({ estado }),
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (!isNotFoundError(lastError)) {
          throw lastError
        }
      }
    }
  }

  throw lastError ?? new Error('No fue posible actualizar el estado del proyecto.')
}


