import { fetchRawWithAuth, fetchWithAuth } from '../../../services/http/httpClient'

/** Modelo público: sin paths, storage keys ni auditoría. */
export type FormularioDescargablePublico = {
  id: number
  nombre: string
  descripcion: string | null
  nombreArchivoOriginal: string
  activo: boolean
}

const PUBLIC_PATH = '/public/formularios-descargables'

const readErrorMessage = async (response: Response) => {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message
      return Array.isArray(message)
        ? message.map(String).join('. ')
        : String(message || '')
    }
  } catch {
    // cuerpo no JSON
  }
  return ''
}

export const getDownloadFilenamePublico = (
  contentDisposition: string | null,
  fallback: string,
) => {
  const encoded = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const quoted = contentDisposition?.match(/filename="([^"]+)"/i)?.[1]
  const plain = contentDisposition?.match(/filename=([^;]+)/i)?.[1]?.trim()
  let name = encoded
    ? decodeURIComponent(encoded)
    : quoted || plain || fallback
  name = name.replace(/[\\/:*?"<>|]/g, '-').trim()
  return name.toLowerCase().endsWith('.pdf') ? name : `${name || fallback}.pdf`
}

/**
 * Lista formularios activos. Defensa: filtra activo !== true por si Backend fallara.
 * No usa endpoints /admin.
 */
export async function listFormulariosDescargablesPublicos(): Promise<
  FormularioDescargablePublico[]
> {
  const response = await fetchWithAuth<FormularioDescargablePublico[]>(
    PUBLIC_PATH,
  )
  if (!Array.isArray(response)) return []
  return response.filter((item) => item?.activo === true)
}

/**
 * Descarga PDF vía Blob (mismo patrón que formularios oficiales).
 * No crea Solicitud ni abre wizard.
 */
export async function downloadFormularioDescargablePublico(
  id: number,
  nombreFallback: string,
): Promise<string> {
  const response = await fetchRawWithAuth(
    `${PUBLIC_PATH}/${id}/descarga`,
    { headers: { Accept: 'application/pdf' } },
  )

  if (!response.ok) {
    const backendMessage = await readErrorMessage(response)
    if (response.status === 404) {
      throw new Error(
        backendMessage ||
          'El formulario ya no está disponible para descarga.',
      )
    }
    throw new Error(
      'No fue posible descargar el formulario. Intenta nuevamente.',
    )
  }

  const contentType = response.headers
    .get('Content-Type')
    ?.split(';')[0]
    .trim()
    .toLowerCase()
  if (contentType !== 'application/pdf') {
    throw new Error('La respuesta recibida no es un documento PDF válido.')
  }

  const blob = await response.blob()
  if (blob.size === 0) {
    throw new Error('El formulario recibido está vacío.')
  }

  const filename = getDownloadFilenamePublico(
    response.headers.get('Content-Disposition'),
    nombreFallback.endsWith('.pdf') ? nombreFallback : `${nombreFallback}.pdf`,
  )
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

export const toFormulariosDescargablesPublicError = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('HTTP 5') || message.includes('Failed to fetch')) {
    return 'No fue posible cargar los formularios disponibles.'
  }
  if (message.includes('HTTP 404')) {
    return 'No hay formularios adicionales disponibles en este momento.'
  }
  return message || 'No fue posible cargar los formularios disponibles.'
}
