import { fetchWithAuth } from '../../../services/http/httpClient'
import { appendFormValue, fetchPublicApi } from '../../../services/http/publicApi'
import type { Announcement } from '../types/AnnouncementsSectionProps'

export type AdminComunicado = {
  id: string
  titulo: string
  descripcion: string
  contenido: string | null
  tipo: string
  prioridad: string
  estado: 'Activo' | 'Inactivo'
  esPublico: boolean
  fechaPublicacion: string
  fechaExpiracion: string | null
  imagenUrl: string | null
}

export type ComunicadoPayload = {
  titulo: string
  descripcion: string
  contenido: string
  tipo: string
  prioridad: string
  estado: 'Activo' | 'Inactivo'
  esPublico: boolean
  fechaPublicacion: string
  fechaExpiracion: string
}

const PUBLIC_PATHS = ['/v1/public/comunicados', '/public/comunicados']
const ADMIN_PATHS = ['/v1/admin/comunicados', '/admin/comunicados']

const toFormData = (payload: ComunicadoPayload, file: File | null) => {
  const form = new FormData()
  appendFormValue(form, 'titulo', payload.titulo)
  appendFormValue(form, 'descripcion', payload.descripcion)
  appendFormValue(form, 'contenido', payload.contenido)
  appendFormValue(form, 'tipo', payload.tipo)
  appendFormValue(form, 'prioridad', payload.prioridad)
  appendFormValue(form, 'estado', payload.estado)
  appendFormValue(form, 'esPublico', payload.esPublico)
  appendFormValue(form, 'fechaPublicacion', payload.fechaPublicacion)
  appendFormValue(form, 'fechaExpiracion', payload.fechaExpiracion)
  if (file) {
    form.append('imagen', file)
  }
  return form
}

export const mapPublicAnnouncement = (item: AdminComunicado): Announcement => ({
  id: String(item.id),
  title: item.titulo,
  summary: item.descripcion,
  content: item.contenido ?? undefined,
  publishedAt: item.fechaPublicacion,
  type: item.tipo,
  urgent: item.prioridad === 'Alta',
  imageUrl: item.imagenUrl ?? undefined,
})

export async function getPublicComunicados(): Promise<Announcement[]> {
  const data = await fetchPublicApi<AdminComunicado[]>(PUBLIC_PATHS)
  return (Array.isArray(data) ? data : [])
    .filter(
      (item) =>
        item.estado !== 'Inactivo' && item.esPublico !== false && Boolean(item.titulo),
    )
    .sort((left, right) => {
      const rightTime = Date.parse(right.fechaPublicacion) || 0
      const leftTime = Date.parse(left.fechaPublicacion) || 0
      return rightTime - leftTime
    })
    .map(mapPublicAnnouncement)
}

export async function getAdminComunicados(): Promise<AdminComunicado[]> {
  const data = await fetchWithAuth<AdminComunicado[]>(ADMIN_PATHS[0])
  return Array.isArray(data) ? data : []
}

export async function createComunicado(
  payload: ComunicadoPayload,
  file: File | null,
): Promise<AdminComunicado> {
  return fetchWithAuth<AdminComunicado>(ADMIN_PATHS[0], {
    method: 'POST',
    body: file ? toFormData(payload, file) : JSON.stringify(payload),
  })
}

export async function updateComunicado(
  id: string,
  payload: ComunicadoPayload,
  file: File | null,
): Promise<AdminComunicado> {
  return fetchWithAuth<AdminComunicado>(`${ADMIN_PATHS[0]}/${id}`, {
    method: 'PATCH',
    body: file ? toFormData(payload, file) : JSON.stringify(payload),
  })
}

export async function deleteComunicado(id: string): Promise<void> {
  await fetchWithAuth(`${ADMIN_PATHS[0]}/${id}`, { method: 'DELETE' })
}

export async function setComunicadoEstado(
  id: string,
  estado: 'Activo' | 'Inactivo',
): Promise<AdminComunicado> {
  return fetchWithAuth<AdminComunicado>(`${ADMIN_PATHS[0]}/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
}
