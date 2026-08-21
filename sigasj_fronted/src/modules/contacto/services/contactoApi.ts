import { fetchWithAuth } from '../../../services/http/httpClient'
import { fetchPublicApi } from '../../../services/http/publicApi'

export type ContactoUbicacion = {
  telefono: string
  email: string
  direccion: string
  horarioAtencion: string
  referenciaUbicacion: string
  mapaUrl: string
  latitud: number
  longitud: number
  zoomMapa: number
}

export const DEFAULT_CONTACTO_UBICACION: ContactoUbicacion = {
  telefono: '8560-7584',
  email: 'asadasanjuan24@gmail.com',
  direccion: 'Costado norte de la Plaza de Deportes, San Juan, Santa Cruz.',
  horarioAtencion: 'Lunes a Sábado: 7:00 a.m. a 11:30 a.m.',
  referenciaUbicacion: '',
  mapaUrl: 'https://maps.app.goo.gl/2HtJjfvjTuLqVaFEA',
  latitud: 10.2188017,
  longitud: -85.5565018,
  zoomMapa: 19,
}

const PUBLIC_PATHS = ['/v1/public/contacto', '/public/contacto']
const ADMIN_PATHS = ['/v1/admin/contacto', '/admin/contacto']

const asNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const mapContactoUbicacion = (
  data: Partial<ContactoUbicacion> | null | undefined,
): ContactoUbicacion => ({
  telefono: data?.telefono?.trim() || DEFAULT_CONTACTO_UBICACION.telefono,
  email: data?.email?.trim() || DEFAULT_CONTACTO_UBICACION.email,
  direccion: data?.direccion?.trim() || DEFAULT_CONTACTO_UBICACION.direccion,
  horarioAtencion:
    data?.horarioAtencion?.trim() || DEFAULT_CONTACTO_UBICACION.horarioAtencion,
  referenciaUbicacion:
    data?.referenciaUbicacion?.trim() ||
    DEFAULT_CONTACTO_UBICACION.referenciaUbicacion,
  mapaUrl: data?.mapaUrl?.trim() || DEFAULT_CONTACTO_UBICACION.mapaUrl,
  latitud: asNumber(data?.latitud, DEFAULT_CONTACTO_UBICACION.latitud),
  longitud: asNumber(data?.longitud, DEFAULT_CONTACTO_UBICACION.longitud),
  zoomMapa: asNumber(data?.zoomMapa, DEFAULT_CONTACTO_UBICACION.zoomMapa),
})

export async function getPublicContacto(): Promise<ContactoUbicacion> {
  const data = await fetchPublicApi<Partial<ContactoUbicacion>>(PUBLIC_PATHS)
  return mapContactoUbicacion(data)
}

export async function getAdminContacto(): Promise<ContactoUbicacion> {
  try {
    const data = await fetchWithAuth<Partial<ContactoUbicacion>>(ADMIN_PATHS[0])
    return mapContactoUbicacion(data)
  } catch {
    const data = await fetchPublicApi<Partial<ContactoUbicacion>>(PUBLIC_PATHS)
    return mapContactoUbicacion(data)
  }
}

export async function updateAdminContacto(
  payload: ContactoUbicacion,
): Promise<ContactoUbicacion> {
  const data = await fetchWithAuth<Partial<ContactoUbicacion>>(ADMIN_PATHS[0], {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return mapContactoUbicacion(data)
}
