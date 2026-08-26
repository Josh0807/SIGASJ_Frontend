import { fetchWithAuth } from '../../../services/http/httpClient'
import { appendFormValue, fetchPublicApi } from '../../../services/http/publicApi'
import type { AdminGalleryPhoto, GalleryFormValues } from '../admin/types'
import type { GalleryPhoto } from '../public/GallerySectionProps'

export type BackendGaleriaFoto = {
  id: number
  titulo?: string | null
  descripcion?: string | null
  url?: string
  imagenUrl?: string
  textoAlternativo?: string
  ordenVisualizacion?: number
  activa?: boolean
  activo?: boolean
}

const PUBLIC_PATHS = ['/v1/public/galeria', '/public/galeria']
const ADMIN_PATHS = ['/v1/admin/galeria', '/admin/galeria']

export const mapAdminGalleryPhoto = (
  item: BackendGaleriaFoto,
): AdminGalleryPhoto => ({
  id: item.id,
  titulo: item.titulo ?? null,
  descripcion: item.descripcion ?? null,
  imagenUrl: item.imagenUrl || item.url || '',
  textoAlternativo: item.textoAlternativo || item.titulo || 'Fotografía institucional',
  ordenVisualizacion: item.ordenVisualizacion ?? 0,
  activo: item.activa ?? item.activo ?? true,
})

export const mapPublicGalleryPhoto = (item: BackendGaleriaFoto): GalleryPhoto => ({
  id: String(item.id),
  title: item.titulo ?? undefined,
  description: item.descripcion ?? undefined,
  imageUrl: item.imagenUrl || item.url || '',
  altText: item.textoAlternativo || item.titulo || 'Fotografía de la ASADA San Juan',
})

const toFormData = (values: GalleryFormValues, file: File | null) => {
  const form = new FormData()
  appendFormValue(form, 'titulo', values.titulo)
  appendFormValue(form, 'descripcion', values.descripcion)
  appendFormValue(form, 'textoAlternativo', values.textoAlternativo)
  appendFormValue(form, 'ordenVisualizacion', values.ordenVisualizacion)
  appendFormValue(form, 'activa', values.activo)
  if (file) {
    form.append('imagen', file)
  }
  return form
}

export async function getPublicGaleria(): Promise<GalleryPhoto[]> {
  const data = await fetchPublicApi<BackendGaleriaFoto[]>(PUBLIC_PATHS)
  return (Array.isArray(data) ? data : [])
    .map(mapPublicGalleryPhoto)
    .filter((photo) => photo.imageUrl.length > 0)
}

export async function getAdminGaleria(): Promise<AdminGalleryPhoto[]> {
  const data = await fetchPublicApi<BackendGaleriaFoto[]>(ADMIN_PATHS)
  return (Array.isArray(data) ? data : []).map(mapAdminGalleryPhoto)
}

export async function createGaleriaPhoto(
  values: GalleryFormValues,
  file: File | null,
): Promise<AdminGalleryPhoto> {
  const created = await fetchWithAuth<BackendGaleriaFoto>(ADMIN_PATHS[0], {
    method: 'POST',
    body: toFormData(values, file),
  })
  return mapAdminGalleryPhoto(created)
}

export async function updateGaleriaPhoto(
  id: number,
  values: GalleryFormValues,
  file: File | null,
): Promise<AdminGalleryPhoto> {
  const updated = await fetchWithAuth<BackendGaleriaFoto>(`${ADMIN_PATHS[0]}/${id}`, {
    method: 'PATCH',
    body: toFormData(values, file),
  })
  return mapAdminGalleryPhoto(updated)
}

export async function deleteGaleriaPhoto(id: number): Promise<void> {
  await fetchWithAuth(`${ADMIN_PATHS[0]}/${id}`, { method: 'DELETE' })
}
