export const GALLERY_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export const GALLERY_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export function validateGalleryImageFile(file: File): string | null {
  if (!GALLERY_ALLOWED_MIME_TYPES.includes(file.type as (typeof GALLERY_ALLOWED_MIME_TYPES)[number])) {
    return 'Solo se permiten imágenes JPG, PNG o WebP.'
  }

  if (file.size > GALLERY_MAX_IMAGE_SIZE_BYTES) {
    return 'La imagen no puede superar 5 MB.'
  }

  return null
}

export function formatGalleryMaxSizeLabel(): string {
  return '5 MB'
}
