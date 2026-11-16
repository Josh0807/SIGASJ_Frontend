import { fetchWithAuth } from '../../services/http/httpClient'

export const TIPOS_DOCUMENTO_SOLICITUD = [
  'identificacion',
  'plano-catastrado',
  'poder',
  'plano-agrimensura',
  'comprobante-pago',
  'otro',
] as const

export type TipoDocumentoSolicitud = (typeof TIPOS_DOCUMENTO_SOLICITUD)[number]
export type EstadoDocumentoSolicitud = 'pendiente' | 'subiendo' | 'cargado' | 'error'

export type DocumentoSolicitudAdjunto = {
  localId: string
  archivo: File
  tipoDocumento: TipoDocumentoSolicitud
  nombreOriginal: string
  tamanio: number
  tipoArchivo: string
  estado: EstadoDocumentoSolicitud
  id?: number
  tokenReclamo?: string
  errorMessage?: string
}

export type DocumentoSolicitudReferencia = { id: number; tokenReclamo: string }

export type DocumentoSolicitudUploadResponse = {
  id: number
  tokenReclamo: string
  nombreOriginal: string
  tamanio: number
  tipoArchivo: string
}

export const nuevoDocumentoSolicitud = (
  archivo: File,
  tipoDocumento: TipoDocumentoSolicitud,
): DocumentoSolicitudAdjunto => ({
  localId: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  archivo,
  tipoDocumento,
  nombreOriginal: archivo.name,
  tamanio: archivo.size,
  tipoArchivo: archivo.type || 'application/octet-stream',
  estado: 'pendiente',
})

export async function subirDocumentoSolicitud(
  archivo: File,
  tipoDocumento: TipoDocumentoSolicitud,
): Promise<DocumentoSolicitudUploadResponse> {
  const body = new FormData()
  body.append('archivo', archivo)
  body.append('tipoDocumento', tipoDocumento)
  return fetchWithAuth<DocumentoSolicitudUploadResponse>('/solicitudes/documentos', {
    method: 'POST',
    body,
  })
}

export const referenciasDocumentosCargados = (
  documentos: DocumentoSolicitudAdjunto[],
): DocumentoSolicitudReferencia[] => documentos
  .filter(
    (documento): documento is DocumentoSolicitudAdjunto & DocumentoSolicitudReferencia =>
      documento.estado === 'cargado' &&
      typeof documento.id === 'number' &&
      Boolean(documento.tokenReclamo),
  )
  .map(({ id, tokenReclamo }) => ({ id, tokenReclamo }))

export const errorDocumentoSolicitud = (error: unknown) => {
  if (!(error instanceof Error)) return 'No fue posible cargar el archivo. Intenta nuevamente.'
  return error.message.replace(/^HTTP \d+:\s*/, '') || 'No fue posible cargar el archivo. Intenta nuevamente.'
}
