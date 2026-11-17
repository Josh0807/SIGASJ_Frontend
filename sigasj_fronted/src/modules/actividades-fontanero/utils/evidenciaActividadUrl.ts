import type { DocumentoActividadRegistrado } from '../types/actividadFontaneroApi'

const SAFE_FILENAME = /^[^/?#\\]+$/

export const evidenciaActividadEndpoint = (
  rutaReferenciaArchivo: string,
  actividadId: number,
): string | null => {
  const value = rutaReferenciaArchivo.trim()
  if (!value || value.includes('..')) return null
  let path = value
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      path = `${url.pathname}${url.search}`
    } catch {
      return null
    }
  }
  path = `/${path.replace(/^\/+/, '')}`.replace(/^\/api\/v1(?=\/)/i, '')
  const barePath = path.split(/[?#]/, 1)[0]
  const route = barePath.match(
    /^\/(?:fontanero|admin)\/actividades(?:-fontanero)?\/(\d+)\/documentos\/([^/]+)$/i,
  )
  const upload = barePath.match(/^\/uploads\/actividades-fontanero\/(\d+)\/([^/]+)$/i)
  if (route && SAFE_FILENAME.test(route[2])) return path
  if (upload && SAFE_FILENAME.test(upload[2])) return path
  if (actividadId > 0 && SAFE_FILENAME.test(value)) {
    return `/fontanero/actividades/${actividadId}/documentos/${encodeURIComponent(value)}`
  }
  return null
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
