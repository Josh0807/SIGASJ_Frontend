import type { TransparencyFileType } from '../types'

export const TRANSPARENCIA_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const TRANSPARENCIA_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const

const EXTENSION_TO_MIME: Record<string, (typeof TRANSPARENCIA_ALLOWED_MIME_TYPES)[number]> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export function validateTransparenciaFile(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeFromExtension = extension ? EXTENSION_TO_MIME[extension] : undefined
  const mime = TRANSPARENCIA_ALLOWED_MIME_TYPES.includes(
    file.type as (typeof TRANSPARENCIA_ALLOWED_MIME_TYPES)[number],
  )
    ? file.type
    : mimeFromExtension

  if (
    !mime ||
    !TRANSPARENCIA_ALLOWED_MIME_TYPES.includes(
      mime as (typeof TRANSPARENCIA_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return 'Solo se permiten archivos PDF, JPG, JPEG o PNG.'
  }

  if (file.size > TRANSPARENCIA_MAX_FILE_SIZE_BYTES) {
    return 'El archivo no puede superar 10 MB.'
  }

  return null
}

export function inferTransparenciaFileType(file: File): TransparencyFileType {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'pdf' || file.type === 'application/pdf') {
    return 'pdf'
  }

  if (extension === 'png' || file.type === 'image/png') {
    return 'png'
  }

  if (extension === 'jpeg') {
    return 'jpeg'
  }

  return 'jpg'
}

export function formatTransparenciaMaxSizeLabel(): string {
  return '10 MB'
}

export function describeTransparenciaFile(file: File): string {
  const extension = file.name.split('.').pop()?.toUpperCase() ?? 'ARCHIVO'
  return `${file.name} (${extension})`
}
