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
  return (Array.isArray(data) ? data : []).map(mapPublicAnnouncement)
}

export async function getAdminComunicados(): Promise<AdminComunicado[]> {
  const data = await fetchPublicApi<AdminComunicado[]>(ADMIN_PATHS)
  return Array.isArray(data) ? data : []
}

export async function createComunicado(
  payload: ComunicadoPayload,
  file: File | null,
): Promise<AdminComunicado> {
  return fetchWithAuth<AdminComunicado>(ADMIN_PATHS[0], {
    method: 'POST',
    body: toFormData(payload, file),
  })
}

export async function updateComunicado(
  id: string,
  payload: ComunicadoPayload,
  file: File | null,
): Promise<AdminComunicado> {
  return fetchWithAuth<AdminComunicado>(`${ADMIN_PATHS[0]}/${id}`, {
    method: 'PATCH',
    body: toFormData(payload, file),
  })
}

export async function deleteComunicado(id: string): Promise<void> {
  await fetchWithAuth(`${ADMIN_PATHS[0]}/${id}`, { method: 'DELETE' })
}
