import { fetchRawWithAuth, fetchWithAuth } from '../../../services/http/httpClient'
import type { DocumentoMovimiento } from './documentosTypes'

const documentosPath = (movimientoId: number) => `/inventario/entradas/${movimientoId}/documentos`

export function adjuntarDocumentoEntrada(movimientoId: number, file: File) {
  const body = new FormData()
  body.append('archivo', file)
  return fetchWithAuth<DocumentoMovimiento>(documentosPath(movimientoId), { method: 'POST', body })
}

export const getDocumentosEntrada = (movimientoId: number) => fetchWithAuth<DocumentoMovimiento[]>(documentosPath(movimientoId))

export async function abrirDocumentoEntrada(rutaReferenciaArchivo: string) {
  if (
    !/^\/api\/v1\/inventario\/(?:entradas|movimientos)\/\d+\/documentos\/[A-Za-z0-9._-]+$/.test(
      rutaReferenciaArchivo,
    ) ||
    rutaReferenciaArchivo.includes('..')
  ) {
    throw new Error('La referencia del documento no es válida.')
  }

  const endpoint = rutaReferenciaArchivo.replace(/^\/api\/v1/, '')
  const response = await fetchRawWithAuth(endpoint)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: No fue posible abrir el documento.`)
  }

  const blobUrl = URL.createObjectURL(await response.blob())
  window.open(blobUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
}
