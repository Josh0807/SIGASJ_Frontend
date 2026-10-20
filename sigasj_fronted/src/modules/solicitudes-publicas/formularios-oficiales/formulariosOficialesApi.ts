import { fetchRawWithAuth, fetchWithAuth } from '../../../services/http/httpClient'
import { FORMULARIOS_OFICIALES_SLUGS, type FormularioOficial } from './types'

const ADMIN_PATH = '/solicitudes/admin/formularios-oficiales'

export async function getFormulariosOficialesAdmin(): Promise<FormularioOficial[]> {
  const response = await fetchWithAuth<FormularioOficial[]>(ADMIN_PATH)
  if (!Array.isArray(response)) return []
  const bySlug = new Map(response.map((item) => [item.slug, item]))
  return FORMULARIOS_OFICIALES_SLUGS.flatMap((slug) => {
    const item = bySlug.get(slug)
    return item ? [item] : []
  })
}

export async function uploadFormularioOficial(
  tipoSolicitudId: number,
  file: File,
): Promise<FormularioOficial> {
  const body = new FormData()
  body.append('file', file)
  return fetchWithAuth<FormularioOficial>(`${ADMIN_PATH}/${tipoSolicitudId}`, {
    method: 'PUT',
    body,
  })
}

const readErrorMessage = async (response: Response) => {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message
      return Array.isArray(message) ? message.map(String).join('. ') : String(message || '')
    }
  } catch {
    // Una descarga fallida puede no incluir un cuerpo JSON.
  }
  return ''
}

export const getDownloadFilename = (contentDisposition: string | null, slug: string) => {
  const encoded = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const quoted = contentDisposition?.match(/filename="([^"]+)"/i)?.[1]
  const plain = contentDisposition?.match(/filename=([^;]+)/i)?.[1]?.trim()
  let name = encoded ? decodeURIComponent(encoded) : quoted || plain || `${slug}.pdf`
  name = name.replace(/[\\/:*?"<>|]/g, '-').trim()
  return name.toLowerCase().endsWith('.pdf') ? name : `${name || slug}.pdf`
}

export async function downloadFormularioOficial(slug: string): Promise<string> {
  const response = await fetchRawWithAuth(`/solicitudes/${encodeURIComponent(slug)}/formulario-oficial`, {
    headers: { Accept: 'application/pdf' },
  })

  if (!response.ok) {
    const backendMessage = await readErrorMessage(response)
    if (response.status === 404) {
      throw new Error(backendMessage || 'El formulario oficial todavía no se encuentra disponible para descarga.')
    }
    throw new Error('No fue posible descargar el formulario oficial. Intenta nuevamente.')
  }

  const contentType = response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()
  if (contentType !== 'application/pdf') {
    throw new Error('La respuesta recibida no es un documento PDF válido.')
  }

  const blob = await response.blob()
  if (blob.size === 0) throw new Error('El formulario oficial recibido está vacío.')

  const filename = getDownloadFilename(response.headers.get('Content-Disposition'), slug)
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.hidden = true
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  return filename
}
