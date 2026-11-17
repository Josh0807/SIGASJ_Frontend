import { fetchRawWithAuth } from '../../../services/http/httpClient'
import { evidenciaActividadEndpoint } from '../utils/evidenciaActividadUrl'

export class EvidenciaActividadError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'EvidenciaActividadError'
  }
}

const messageForStatus = (status: number) => {
  if (status === 401) return 'La sesión venció. Iniciá sesión nuevamente.'
  if (status === 403) return 'No tenés permiso para ver esta fotografía.'
  if (status === 404) return 'La fotografía ya no está disponible.'
  return 'No se pudo cargar la fotografía.'
}

export const getEvidenciaActividadBlob = async (
  rutaReferenciaArchivo: string,
  actividadId: number,
  signal?: AbortSignal,
): Promise<Blob> => {
  const endpoint = evidenciaActividadEndpoint(rutaReferenciaArchivo, actividadId)
  if (!endpoint) throw new EvidenciaActividadError(0, 'La ruta de la fotografía no es válida.')
  const response = await fetchRawWithAuth(endpoint, { signal })
  if (!response.ok) {
    throw new EvidenciaActividadError(response.status, messageForStatus(response.status))
  }
  const blob = await response.blob()
  if (!blob.size) throw new EvidenciaActividadError(404, messageForStatus(404))
  if (!blob.type.toLowerCase().startsWith('image/')) {
    throw new EvidenciaActividadError(0, 'El servidor no devolvió una imagen válida.')
  }
  return blob
}
