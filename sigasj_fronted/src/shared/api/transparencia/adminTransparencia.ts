import { getAdminTransparenciaPath } from '../config'
import { requestFormData, requestJson, requestVoid } from '../http'
import { resolveTransparenciaFileUrl } from './types'
import type {
  AdminTransparenciaFilters,
  AdminTransparenciaPublication,
} from '../../../features/transparencia/types'
import type { TransparencyFileType } from '../../../features/landing/props/TransparencySectionProps'

type RawAdminTransparenciaPublication = Record<string, unknown>

const asFileType = (value: unknown): TransparencyFileType | null => {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (
    normalized === 'pdf' ||
    normalized === 'jpg' ||
    normalized === 'jpeg' ||
    normalized === 'png'
  ) {
    return normalized
  }

  return null
}

function mapAdminTransparenciaPublication(
  raw: RawAdminTransparenciaPublication,
): AdminTransparenciaPublication | null {
  const id = raw.idPublicacionTransparencia ?? raw.id
  const nombre = raw.nombre
  const descripcionBreve = raw.descripcionBreve
  const archivoUrl = raw.archivoUrl
  const tipoArchivo = asFileType(raw.tipoArchivo ?? raw.tipo)

  if (
    typeof id !== 'number' ||
    typeof nombre !== 'string' ||
    typeof descripcionBreve !== 'string' ||
    typeof archivoUrl !== 'string' ||
    !tipoArchivo
  ) {
    return null
  }

  return {
    id,
    nombre,
    descripcionBreve,
    archivoUrl: resolveTransparenciaFileUrl(archivoUrl),
    tipoArchivo,
    ordenVisualizacion:
      typeof raw.ordenVisualizacion === 'number' ? raw.ordenVisualizacion : 0,
    activo: raw.activo === true,
  }
}

function buildQuery(filters: AdminTransparenciaFilters = {}): string {
  const params = new URLSearchParams()

  if (filters.nombre?.trim()) {
    params.set('nombre', filters.nombre.trim())
  }

  if (filters.activo !== undefined) {
    params.set('activo', String(filters.activo))
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listAdminTransparenciaPublications(
  token: string,
  filters: AdminTransparenciaFilters = {},
  options: { signal?: AbortSignal } = {},
): Promise<AdminTransparenciaPublication[]> {
  const payload = await requestJson<RawAdminTransparenciaPublication[]>(
    `${getAdminTransparenciaPath()}${buildQuery(filters)}`,
    { token, signal: options.signal },
  )

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.flatMap((item) => {
    const mapped = mapAdminTransparenciaPublication(item)
    return mapped ? [mapped] : []
  })
}

export async function createAdminTransparenciaPublication(
  token: string,
  formData: FormData,
): Promise<AdminTransparenciaPublication> {
  const payload = await requestFormData<RawAdminTransparenciaPublication>(
    getAdminTransparenciaPath(),
    formData,
    { method: 'POST', token },
  )

  const mapped = mapAdminTransparenciaPublication(payload)
  if (!mapped) {
    throw new Error('Respuesta inválida al registrar la publicación.')
  }

  return mapped
}

export async function updateAdminTransparenciaPublication(
  token: string,
  id: number,
  body: Record<string, unknown>,
): Promise<AdminTransparenciaPublication> {
  const payload = await requestJson<RawAdminTransparenciaPublication>(
    `${getAdminTransparenciaPath()}/${id}`,
    { method: 'PUT', token, body },
  )

  const mapped = mapAdminTransparenciaPublication(payload)
  if (!mapped) {
    throw new Error('Respuesta inválida al actualizar la publicación.')
  }

  return mapped
}

export async function updateAdminTransparenciaEstado(
  token: string,
  id: number,
  activo: boolean,
): Promise<AdminTransparenciaPublication> {
  const payload = await requestJson<RawAdminTransparenciaPublication>(
    `${getAdminTransparenciaPath()}/${id}/estado`,
    { method: 'PATCH', token, body: { activo } },
  )

  const mapped = mapAdminTransparenciaPublication(payload)
  if (!mapped) {
    throw new Error('Respuesta inválida al cambiar el estado.')
  }

  return mapped
}

export async function replaceAdminTransparenciaFile(
  token: string,
  id: number,
  formData: FormData,
): Promise<AdminTransparenciaPublication> {
  const payload = await requestFormData<RawAdminTransparenciaPublication>(
    `${getAdminTransparenciaPath()}/${id}/archivo`,
    formData,
    { method: 'PATCH', token },
  )

  const mapped = mapAdminTransparenciaPublication(payload)
  if (!mapped) {
    throw new Error('Respuesta inválida al reemplazar el archivo.')
  }

  return mapped
}

export async function reorderAdminTransparenciaPublications(
  token: string,
  publicaciones: Array<{
    idPublicacionTransparencia: number
    ordenVisualizacion: number
  }>,
): Promise<AdminTransparenciaPublication[]> {
  const payload = await requestJson<RawAdminTransparenciaPublication[]>(
    `${getAdminTransparenciaPath()}/orden`,
    {
      method: 'PATCH',
      token,
      body: { publicaciones },
    },
  )

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.flatMap((item) => {
    const mapped = mapAdminTransparenciaPublication(item)
    return mapped ? [mapped] : []
  })
}

export async function deleteAdminTransparenciaPublication(
  token: string,
  id: number,
): Promise<void> {
  await requestVoid(`${getAdminTransparenciaPath()}/${id}`, {
    method: 'DELETE',
    token,
  })
}
