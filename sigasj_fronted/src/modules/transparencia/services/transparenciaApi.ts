import { fetchWithAuth } from '../../../services/http/httpClient'
import { appendFormValue, fetchPublicApi } from '../../../services/http/publicApi'
import type { AdminTransparenciaPublication, TransparenciaFormValues } from '../admin/types'
import type { TransparencyPublication, TransparencyFileType } from '../public/TransparencySectionProps'

export type BackendTransparenciaPublication = {
  id: number | string
  nombre?: string | null
  name?: string | null
  descripcionBreve?: string | null
  descripcion?: string | null
  description?: string | null
  archivoUrl?: string | null
  fileUrl?: string | null
  url?: string | null
  tipoArchivo?: TransparencyFileType | null
  fileType?: TransparencyFileType | null
  ordenVisualizacion?: number
  activo?: boolean | null
  activa?: boolean | null
}

const PUBLIC_PATHS = ['/v1/public/transparencia', '/public/transparencia']
const ADMIN_PATHS = ['/v1/admin/transparencia', '/admin/transparencia']

export const mapPublicTransparencyPublication = (
  item: BackendTransparenciaPublication,
): TransparencyPublication => ({
  id: String(item.id),
  name: item.nombre || item.name || 'Publicación de transparencia',
  description: item.descripcionBreve || item.descripcion || item.description || '',
  fileUrl: item.archivoUrl || item.fileUrl || item.url || '',
  fileType: item.tipoArchivo || item.fileType || 'pdf',
})

export const mapAdminTransparencyPublication = (
  item: BackendTransparenciaPublication,
): AdminTransparenciaPublication => ({
  id: typeof item.id === 'number' ? item.id : Number(item.id),
  nombre: item.nombre || item.name || '',
  descripcionBreve: item.descripcionBreve || item.descripcion || item.description || '',
  archivoUrl: item.archivoUrl || item.fileUrl || item.url || '',
  tipoArchivo: item.tipoArchivo || item.fileType || 'pdf',
  ordenVisualizacion: item.ordenVisualizacion ?? 0,
  activo: item.activa ?? item.activo ?? true,
})

const toFormData = (values: TransparenciaFormValues, file: File | null) => {
  const form = new FormData()
  appendFormValue(form, 'nombre', values.nombre)
  appendFormValue(form, 'descripcionBreve', values.descripcionBreve)
  appendFormValue(form, 'ordenVisualizacion', values.ordenVisualizacion)
  appendFormValue(form, 'activa', values.activo)
  appendFormValue(form, 'activo', values.activo)
  if (file) {
    form.append('archivo', file)
  }
  return form
}

export async function getPublicTransparencia(): Promise<TransparencyPublication[]> {
  const data = await fetchPublicApi<BackendTransparenciaPublication[]>(PUBLIC_PATHS)
  return (Array.isArray(data) ? data : []).map(mapPublicTransparencyPublication)
}

export async function getAdminTransparencia(): Promise<AdminTransparenciaPublication[]> {
  const data = await fetchPublicApi<BackendTransparenciaPublication[]>(ADMIN_PATHS)
  return (Array.isArray(data) ? data : []).map(mapAdminTransparencyPublication)
}

export async function createTransparenciaPublication(
  values: TransparenciaFormValues,
  file: File | null,
): Promise<AdminTransparenciaPublication> {
  const created = await fetchWithAuth<BackendTransparenciaPublication>(ADMIN_PATHS[0], {
    method: 'POST',
    body: toFormData(values, file),
  })
  return mapAdminTransparencyPublication(created)
}

export async function updateTransparenciaPublication(
  id: number,
  values: TransparenciaFormValues,
  file: File | null,
): Promise<AdminTransparenciaPublication> {
  const updated = await fetchWithAuth<BackendTransparenciaPublication>(`${ADMIN_PATHS[0]}/${id}`, {
    method: 'PATCH',
    body: toFormData(values, file),
  })
  return mapAdminTransparencyPublication(updated)
}

export async function updateTransparenciaEstado(
  id: number,
  activa: boolean,
): Promise<AdminTransparenciaPublication> {
  const updated = await fetchWithAuth<BackendTransparenciaPublication>(
    `${ADMIN_PATHS[0]}/${id}/estado`,
    {
      method: 'PATCH',
      body: JSON.stringify({ activa, activo: activa }),
    },
  )
  return mapAdminTransparencyPublication(updated)
}

export async function deleteTransparenciaPublication(id: number): Promise<void> {
  await fetchWithAuth(`${ADMIN_PATHS[0]}/${id}`, { method: 'DELETE' })
}
