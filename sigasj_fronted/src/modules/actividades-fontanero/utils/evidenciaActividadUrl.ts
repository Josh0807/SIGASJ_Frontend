import { resolveBackendAssetUrl } from '../../../services/http/assetUrl'
import type { DocumentoActividadRegistrado } from '../types/actividadFontaneroApi'

const toUploadsPath = (ruta: string, actividadId: number) => {
  const trimmed = ruta.replace(/^\/+/, '')
  const storedApi = trimmed.match(
    /^(?:api\/v1\/)?fontanero\/actividades\/(\d+)\/documentos\/([^/?#]+)$/i,
  )
  if (storedApi) {
    return `/uploads/actividades-fontanero/${storedApi[1]}/${storedApi[2]}`
  }

  if (/^uploads\//i.test(trimmed) || /^api\/v1\/uploads\//i.test(trimmed)) {
    return `/${trimmed.replace(/^api\/v1\//i, '')}`
  }

  const filename = trimmed.split('/').pop()
  if (filename && actividadId > 0 && !trimmed.includes('/')) {
    return `/uploads/actividades-fontanero/${actividadId}/${filename}`
  }

  return `/${trimmed}`
}

export const evidenciaActividadPublicUrl = (
  rutaReferenciaArchivo: string,
  actividadId: number,
): string => {
  if (/^https?:\/\//i.test(rutaReferenciaArchivo)) {
    return rutaReferenciaArchivo
  }

  const uploadsPath = toUploadsPath(rutaReferenciaArchivo, actividadId)
  return resolveBackendAssetUrl(uploadsPath) ?? uploadsPath
}

export const esEvidenciaImagen = (
  documento: Pick<
    DocumentoActividadRegistrado,
    'tipoArchivo' | 'nombreOriginal' | 'rutaReferenciaArchivo'
  >,
): boolean => {
  if (/^image\//i.test(documento.tipoArchivo)) {
    return true
  }

  return /\.(jpe?g|png|webp|gif)$/i.test(
    `${documento.nombreOriginal} ${documento.rutaReferenciaArchivo}`,
  )
}
