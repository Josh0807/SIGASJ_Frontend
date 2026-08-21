import { fetchWithAuth } from '../../../services/http/httpClient'
import type { GalleryPhoto } from '../public/GallerySectionProps'
import type { AdminGalleryPhoto, GalleryFormValues } from '../admin/types'

const PUBLIC_GALLERY_PATH = '/v1/public/galeria'
const ADMIN_GALLERY_PATH = '/v1/admin/galeria'

export type AdminGalleryListFilters = {
  titulo?: string
  activo?: boolean
}

function buildGalleryFormData(
  values: GalleryFormValues,
  file: File | null,
): FormData {
  const formData = new FormData()

  if (file) {
    formData.append('imagen', file)
  }

  if (values.titulo.trim()) {
    formData.append('titulo', values.titulo.trim())
  }

  if (values.descripcion.trim()) {
    formData.append('descripcion', values.descripcion.trim())
  }

  formData.append('textoAlternativo', values.textoAlternativo.trim())
  formData.append('ordenVisualizacion', String(values.ordenVisualizacion))
  formData.append('activo', String(values.activo))

  return formData
}

export async function fetchPublicGallery(): Promise<GalleryPhoto[]> {
  return fetchWithAuth<GalleryPhoto[]>(PUBLIC_GALLERY_PATH)
}

export async function fetchAdminGallery(
  filters: AdminGalleryListFilters = {},
): Promise<AdminGalleryPhoto[]> {
  return fetchWithAuth<AdminGalleryPhoto[]>(ADMIN_GALLERY_PATH, {
    params: {
      titulo: filters.titulo?.trim() || undefined,
      activo: filters.activo,
    },
  })
}

export async function createGalleryPhoto(
  values: GalleryFormValues,
  file: File,
): Promise<AdminGalleryPhoto> {
  return fetchWithAuth<AdminGalleryPhoto>(ADMIN_GALLERY_PATH, {
    method: 'POST',
    body: buildGalleryFormData(values, file),
  })
}

export async function updateGalleryPhoto(
  id: number,
  values: GalleryFormValues,
  file: File | null,
): Promise<AdminGalleryPhoto> {
  return fetchWithAuth<AdminGalleryPhoto>(`${ADMIN_GALLERY_PATH}/${id}`, {
    method: 'PATCH',
    body: buildGalleryFormData(values, file),
  })
}

export async function setGalleryPhotoActivo(
  id: number,
  activo: boolean,
): Promise<AdminGalleryPhoto> {
  return fetchWithAuth<AdminGalleryPhoto>(`${ADMIN_GALLERY_PATH}/${id}/activo`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  })
}

export async function deleteGalleryPhoto(id: number): Promise<void> {
  await fetchWithAuth<void>(`${ADMIN_GALLERY_PATH}/${id}`, {
    method: 'DELETE',
  })
}

export async function updateGalleryPhotoOrder(
  id: number,
  ordenVisualizacion: number,
  photo: AdminGalleryPhoto,
): Promise<AdminGalleryPhoto> {
  return updateGalleryPhoto(
    id,
    {
      titulo: photo.titulo ?? '',
      descripcion: photo.descripcion ?? '',
      textoAlternativo: photo.textoAlternativo,
      ordenVisualizacion,
      activo: photo.activo,
    },
    null,
  )
}
