import { fetchWithAuth } from '../../../services/http/httpClient'
import type { ContactoPublico } from '../types/contacto.types'

const PUBLIC_CONTACTO_PATH = '/v1/public/contacto'
const ADMIN_CONTACTO_PATH = '/v1/admin/contacto'

export type UpdateContactoPayload = {
  telefono: string
  telefonosAdicionales?: string[]
  email: string
  horarioAtencion: string
  horarioVentanilla?: string
  direccion: string
  referenciaUbicacion?: string
  regionResumen: string
  mapaUrl?: string
  mapaLatitud?: number
  mapaLongitud?: number
  mapaZoom?: number
  textoUbicacionMapa?: string
  urlFacebook?: string
  descripcionContacto?: string
}

export async function fetchPublicContacto(): Promise<ContactoPublico> {
  return fetchWithAuth<ContactoPublico>(PUBLIC_CONTACTO_PATH)
}

export async function fetchAdminContacto(): Promise<ContactoPublico> {
  return fetchWithAuth<ContactoPublico>(ADMIN_CONTACTO_PATH)
}

export async function updateAdminContacto(
  payload: UpdateContactoPayload,
): Promise<ContactoPublico> {
  return fetchWithAuth<ContactoPublico>(ADMIN_CONTACTO_PATH, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
