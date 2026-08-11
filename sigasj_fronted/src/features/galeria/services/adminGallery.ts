import { getAdminGalleryPath } from '../../../shared/api/config'
import {
  requestFormData,
  requestJson,
  requestVoid,
} from '../../../shared/api/http'
import type { AdminGalleryFilters, AdminGalleryPhoto } from '../types'
import { resolveGalleryImageUrl } from './publicGallery.mappers'

type RawAdminGalleryPhoto = Record<string, unknown>

function mapAdminGalleryPhoto(raw: RawAdminGalleryPhoto): AdminGalleryPhoto | null {
  const id = raw.idFotografiaGaleria ?? raw.id
  const imagenUrl = raw.imagenUrl
  const textoAlternativo = raw.textoAlternativo

  if (typeof id !== 'number' || typeof imagenUrl !== 'string' || typeof textoAlternativo !== 'string') {
    return null
  }

  return {
    id,
    titulo: typeof raw.titulo === 'string' ? raw.titulo : null,
    descripcion: typeof raw.descripcion === 'string' ? raw.descripcion : null,
    imagenUrl: resolveGalleryImageUrl(imagenUrl),
    textoAlternativo,
    ordenVisualizacion:
      typeof raw.ordenVisualizacion === 'number' ? raw.ordenVisualizacion : 0,
    activo: raw.activo === true,
  }
}

function buildQuery(filters: AdminGalleryFilters = {}): string {
  const params = new URLSearchParams()

  if (filters.titulo?.trim()) {
    params.set('titulo', filters.titulo.trim())
  }

  if (filters.activo !== undefined) {
    params.set('activo', String(filters.activo))
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listAdminGalleryPhotos(
  token: string,
  filters: AdminGalleryFilters = {},
  options: { signal?: AbortSignal } = {},
): Promise<AdminGalleryPhoto[]> {
  const payload = await requestJson<RawAdminGalleryPhoto[]>(
    `${getAdminGalleryPath()}${buildQuery(filters)}`,
    { token, signal: options.signal },
  )

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.flatMap((item) => {
    const mapped = mapAdminGalleryPhoto(item)
    return mapped ? [mapped] : []
  })
}

export async function createAdminGalleryPhoto(
  token: string,
  formData: FormData,
): Promise<AdminGalleryPhoto> {
  const payload = await requestFormData<RawAdminGalleryPhoto>(
    getAdminGalleryPath(),
    formData,
    { method: 'POST', token },
  )

  const mapped = mapAdminGalleryPhoto(payload)
  if (!mapped) {
    throw new Error('Respuesta inválida al registrar la fotografía.')
  }

  return mapped
}

export async function updateAdminGalleryPhoto(
  token: string,
  id: number,
  body: Record<string, unknown>,
): Promise<AdminGalleryPhoto> {
  const payload = await requestJson<RawAdminGalleryPhoto>(
    `${getAdminGalleryPath()}/${id}`,
    { method: 'PUT', token, body },
  )

  const mapped = mapAdminGalleryPhoto(payload)
  if (!mapped) {
    throw new Error('Respuesta inválida al actualizar la fotografía.')
  }

  return mapped
}

export async function updateAdminGalleryEstado(
  token: string,
  id: number,
  activo: boolean,
): Promise<AdminGalleryPhoto> {
  const payload = await requestJson<RawAdminGalleryPhoto>(
    `${getAdminGalleryPath()}/${id}/estado`,
    { method: 'PATCH', token, body: { activo } },
  )

  const mapped = mapAdminGalleryPhoto(payload)
  if (!mapped) {
    throw new Error('Respuesta inválida al cambiar el estado.')
  }

  return mapped
}

export async function replaceAdminGalleryImage(
  token: string,
  id: number,
  formData: FormData,
): Promise<AdminGalleryPhoto> {
  const payload = await requestFormData<RawAdminGalleryPhoto>(
    `${getAdminGalleryPath()}/${id}/imagen`,
    formData,
    { method: 'PATCH', token },
  )

  const mapped = mapAdminGalleryPhoto(payload)
  if (!mapped) {
    throw new Error('Respuesta inválida al reemplazar la imagen.')
  }

  return mapped
}

export async function reorderAdminGalleryPhotos(
  token: string,
  fotografias: Array<{ idFotografiaGaleria: number; ordenVisualizacion: number }>,
): Promise<AdminGalleryPhoto[]> {
  const payload = await requestJson<RawAdminGalleryPhoto[]>(
    `${getAdminGalleryPath()}/orden`,
    {
      method: 'PATCH',
      token,
      body: { fotografias },
    },
  )

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.flatMap((item) => {
    const mapped = mapAdminGalleryPhoto(item)
    return mapped ? [mapped] : []
  })
}

export async function deleteAdminGalleryPhoto(
  token: string,
  id: number,
): Promise<void> {
  await requestVoid(`${getAdminGalleryPath()}/${id}`, {
    method: 'DELETE',
    token,
  })
}
