import type { SelectedDocument } from './documentosTypes'

export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024
export const DOCUMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp'
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp'])
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])

export function validateDocumento(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) return 'Solo se permiten archivos PDF, JPG, JPEG, PNG o WebP.'
  if (file.size <= 0) return 'El archivo está vacío.'
  if (file.size > DOCUMENT_MAX_BYTES) return 'Cada archivo debe pesar como máximo 10 MB.'
  return null
}

export function appendValidDocuments(current: SelectedDocument[], files: File[]) {
  const accepted: SelectedDocument[] = []
  const errors: string[] = []
  for (const file of files) {
    const error = validateDocumento(file)
    if (error) errors.push(`${file.name}: ${error}`)
    else accepted.push({ id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`, file })
  }
  return { documents: [...current, ...accepted], errors }
}

export const formatDocumentSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
