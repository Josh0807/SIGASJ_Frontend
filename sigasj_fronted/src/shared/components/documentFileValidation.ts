export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024

const ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg'])
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
])
const DANGEROUS_EXTENSIONS = new Set([
  'bat', 'cmd', 'com', 'exe', 'js', 'jar', 'msi', 'ps1', 'sh', 'vbs',
])

const readHeader = (file: File, length = 12) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No fue posible leer el archivo.'))
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.readAsArrayBuffer(file.slice(0, length))
  })

const hasPrefix = (bytes: Uint8Array, prefix: number[]) =>
  prefix.every((value, index) => bytes[index] === value)

const detectedMimeType = (bytes: Uint8Array) => {
  if (hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf'
  if (hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (hasPrefix(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  return null
}

export const formatDocumentSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function validateDocumentFile(file: File): Promise<string | null> {
  const nameParts = file.name.toLowerCase().split('.')
  const extension = nameParts.length > 1 ? nameParts.at(-1) ?? '' : ''

  if (file.size === 0) return `“${file.name}” está vacío.`
  if (file.size > DOCUMENT_MAX_BYTES) return `“${file.name}” supera el tamaño máximo de 10 MB.`
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return `“${file.name}” no tiene un formato permitido. Usa PDF, JPG, JPEG o PNG.`
  }
  if (nameParts.slice(0, -1).some((part) => DANGEROUS_EXTENSIONS.has(part))) {
    return `“${file.name}” contiene una extensión potencialmente peligrosa.`
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return `El tipo declarado de “${file.name}” no es PDF, JPG ni PNG.`
  }

  try {
    const actualType = detectedMimeType(await readHeader(file))
    const expectedType = extension === 'pdf'
      ? 'application/pdf'
      : extension === 'png'
        ? 'image/png'
        : 'image/jpeg'
    if (!actualType || actualType !== expectedType) {
      return `El contenido real de “${file.name}” no coincide con su extensión.`
    }
  } catch {
    return `No fue posible comprobar el contenido de “${file.name}”. Intenta seleccionarlo de nuevo.`
  }

  return null
}
