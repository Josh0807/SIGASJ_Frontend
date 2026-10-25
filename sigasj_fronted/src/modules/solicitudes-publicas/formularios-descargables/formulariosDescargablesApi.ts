import { fetchWithAuth } from '../../../services/http/httpClient'
import { appendFormValue } from '../../../services/http/publicApi'
import type {
  CreateFormularioDescargableInput,
  FormularioDescargableAdmin,
  UpdateFormularioDescargableInput,
} from './types'

const ADMIN_PATH = '/admin/formularios-descargables'

export async function listFormulariosDescargablesAdmin(): Promise<
  FormularioDescargableAdmin[]
> {
  const response = await fetchWithAuth<FormularioDescargableAdmin[]>(ADMIN_PATH)
  return Array.isArray(response) ? response : []
}

export async function createFormularioDescargable(
  input: CreateFormularioDescargableInput,
): Promise<FormularioDescargableAdmin> {
  const body = new FormData()
  appendFormValue(body, 'nombre', input.nombre.trim())
  appendFormValue(body, 'descripcion', input.descripcion.trim())
  // Siempre enviar activo para coincidir con lo mostrado en UI (default BE = false).
  appendFormValue(body, 'activo', input.activo)
  body.append('archivo', input.archivo)
  return fetchWithAuth<FormularioDescargableAdmin>(ADMIN_PATH, {
    method: 'POST',
    body,
  })
}

export async function updateFormularioDescargable(
  id: number,
  input: UpdateFormularioDescargableInput,
): Promise<FormularioDescargableAdmin> {
  const payload: UpdateFormularioDescargableInput = {}
  if (input.nombre !== undefined) payload.nombre = input.nombre.trim()
  if (input.descripcion !== undefined) {
    payload.descripcion =
      input.descripcion === null ? null : input.descripcion.trim() || null
  }
  if (input.fechaPublicacion !== undefined) {
    payload.fechaPublicacion = input.fechaPublicacion
  }
  return fetchWithAuth<FormularioDescargableAdmin>(`${ADMIN_PATH}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function replaceFormularioDescargableArchivo(
  id: number,
  archivo: File,
): Promise<FormularioDescargableAdmin> {
  const body = new FormData()
  body.append('archivo', archivo)
  return fetchWithAuth<FormularioDescargableAdmin>(
    `${ADMIN_PATH}/${id}/archivo`,
    { method: 'PATCH', body },
  )
}

export async function setFormularioDescargableEstado(
  id: number,
  activo: boolean,
): Promise<FormularioDescargableAdmin> {
  return fetchWithAuth<FormularioDescargableAdmin>(
    `${ADMIN_PATH}/${id}/estado`,
    {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    },
  )
}

export const toFormulariosDescargablesAdminError = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('HTTP 401')) {
    return 'Tu sesión expiró. Inicia sesión nuevamente.'
  }
  if (message.includes('HTTP 403')) {
    return 'No tienes permisos para administrar formularios descargables.'
  }
  if (message.includes('HTTP 404')) {
    return 'El formulario ya no está disponible. Actualice el listado.'
  }
  if (message.includes('HTTP 400')) {
    const detail = message.replace(/^HTTP 400:\s*/i, '').trim()
    return detail || 'Los datos enviados no son válidos. Revise el formulario.'
  }
  if (message.includes('HTTP 5')) {
    return 'Ocurrió un error en el servidor. Intente nuevamente.'
  }
  return 'No fue posible completar la operación. Intenta nuevamente.'
}
