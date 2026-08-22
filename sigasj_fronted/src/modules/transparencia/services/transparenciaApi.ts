import { fetchWithAuth } from '../../../services/http/httpClient'
import { appendFormValue, fetchPublicApi } from '../../../services/http/publicApi'
import type {
  AdminTransparenciaPublication,
  TransparenciaFormValues,
} from '../admin/types'
import type { TransparencyFileType } from '../types/types'
import type { TransparencyPublication } from '../public/TransparencySectionProps'

export type BackendTransparenciaDocumento = {
  id: number
  nombre: string
  descripcionBreve?: string | null
  archivoUrl?: string
  tipoArchivo?: string
  ordenVisualizacion?: number
  activa?: boolean
  activo?: boolean
}

const PUBLIC_PATHS = ['/v1/public/transparencia', '/public/transparencia']
const ADMIN_PATHS = ['/v1/admin/transparencia', '/admin/transparencia']

const toFileType = (value?: string): TransparencyFileType => {
  if (value === 'pdf' || value === 'png' || value === 'jpeg' || value === 'jpg') {
    return value
  }
  return 'pdf'
}

export const mapAdminTransparencia = (
  item: BackendTransparenciaDocumento,
): AdminTransparenciaPublication => ({
  id: item.id,
  nombre: item.nombre,
  descripcionBreve: item.descripcionBreve ?? '',
  archivoUrl: item.archivoUrl || '',
  tipoArchivo: toFileType(item.tipoArchivo),
  ordenVisualizacion: item.ordenVisualizacion ?? 0,
  activo: item.activa ?? item.activo ?? true,
})

export const mapPublicTransparencia = (
  item: BackendTransparenciaDocumento,
): TransparencyPublication => ({
  id: String(item.id),
  name: item.nombre,
  description: item.descripcionBreve ?? '',
  fileUrl: item.archivoUrl || '',
  fileType: toFileType(item.tipoArchivo),
})

const toFormData = (values: TransparenciaFormValues, file: File | null) => {
  const form = new FormData()
  appendFormValue(form, 'nombre', values.nombre)
  appendFormValue(form, 'descripcionBreve', values.descripcionBreve)
  appendFormValue(form, 'ordenVisualizacion', values.ordenVisualizacion)
  appendFormValue(form, 'activa', values.activo)
  if (file) {
    form.append('archivo', file)
  }
  return form
}

export async function getPublicTransparencia(): Promise<TransparencyPublication[]> {
  const data = await fetchPublicApi<BackendTransparenciaDocumento[]>(PUBLIC_PATHS)
  return (Array.isArray(data) ? data : [])
    .map(mapPublicTransparencia)
    .filter((item) => item.fileUrl.length > 0)
}

export async function getAdminTransparencia(): Promise<
  AdminTransparenciaPublication[]
> {
  const data = await fetchWithAuth<BackendTransparenciaDocumento[]>(ADMIN_PATHS[0])
  return (Array.isArray(data) ? data : []).map(mapAdminTransparencia)
}

export async function createTransparencia(
  values: TransparenciaFormValues,
  file: File | null,
): Promise<AdminTransparenciaPublication> {
  const created = await fetchWithAuth<BackendTransparenciaDocumento>(
    ADMIN_PATHS[0],
    {
      method: 'POST',
      body: toFormData(values, file),
    },
  )
  return mapAdminTransparencia(created)
}

export async function updateTransparencia(
  id: number,
  values: TransparenciaFormValues,
  file: File | null,
): Promise<AdminTransparenciaPublication> {
  const updated = await fetchWithAuth<BackendTransparenciaDocumento>(
    `${ADMIN_PATHS[0]}/${id}`,
    {
      method: 'PATCH',
      body: file
        ? toFormData(values, file)
        : JSON.stringify({
            nombre: values.nombre,
            descripcionBreve: values.descripcionBreve,
            ordenVisualizacion: values.ordenVisualizacion,
            activa: values.activo,
          }),
    },
  )
  return mapAdminTransparencia(updated)
}

export async function deleteTransparencia(id: number): Promise<void> {
  await fetchWithAuth(`${ADMIN_PATHS[0]}/${id}`, { method: 'DELETE' })
}

export async function setTransparenciaActiva(
  id: number,
  activa: boolean,
): Promise<AdminTransparenciaPublication> {
  const updated = await fetchWithAuth<BackendTransparenciaDocumento>(
    `${ADMIN_PATHS[0]}/${id}/estado`,
    {
      method: 'PATCH',
      body: JSON.stringify({ activa }),
    },
  )
  return mapAdminTransparencia(updated)
}
