export const DOCUMENTO_ACTIVIDAD_MAX_BYTES = 10 * 1024 * 1024
export const DOCUMENTO_ACTIVIDAD_ACCEPT = '.pdf,.jpg,.jpeg,.png'
export const FOTO_EVIDENCIA_ACCEPT = '.jpg,.jpeg,.png'
export const FOTO_EVIDENCIA_MAX_FILES = 5

const MIME_TYPES_PERMITIDOS = new Set(['application/pdf', 'image/jpeg', 'image/png'])
const EXTENSIONES_PERMITIDAS = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const MIME_FOTOS_PERMITIDOS = new Set(['image/jpeg', 'image/png'])
const EXTENSIONES_FOTOS_PERMITIDAS = new Set(['jpg', 'jpeg', 'png'])

export const formatDocumentoSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const validateDocumentoActividad = (file: File): string | null => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!EXTENSIONES_PERMITIDAS.has(extension) || !MIME_TYPES_PERMITIDOS.has(file.type)) {
    return `“${file.name}” no es un archivo permitido. Use PDF, JPG, JPEG o PNG.`
  }
  if (file.size > DOCUMENTO_ACTIVIDAD_MAX_BYTES) return `“${file.name}” supera el tamaño máximo de 10 MB.`
  return null
}

export const validateFotoEvidencia = (file: File): string | null => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!EXTENSIONES_FOTOS_PERMITIDAS.has(extension) || !MIME_FOTOS_PERMITIDOS.has(file.type)) {
    return `“${file.name}” no es una foto permitida. Use JPG, JPEG o PNG.`
  }
  if (file.size > DOCUMENTO_ACTIVIDAD_MAX_BYTES) {
    return `“${file.name}” supera el tamaño máximo de 10 MB.`
  }
  return null
}
